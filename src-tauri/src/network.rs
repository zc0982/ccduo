//! Proxy resolution, connectivity checks and dynamic-IP refresh.

use std::net::{TcpStream, ToSocketAddrs};
use std::time::{Duration, Instant};

use crate::model::{ConnectionResult, IpChecker, PoolProxy, ProxyConfig, ProxyMode, ProxyProtocol};

const CONNECT_TIMEOUT: Duration = Duration::from_secs(5);
const REQUEST_TIMEOUT: Duration = Duration::from_secs(12);

/// A concrete upstream proxy, after looking up pool entries.
#[derive(Debug, Clone)]
pub struct ResolvedProxy {
    pub protocol: ProxyProtocol,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

impl ResolvedProxy {
    fn host_port(&self) -> String {
        if self.host.contains(':') {
            format!("[{}]:{}", self.host, self.port)
        } else {
            format!("{}:{}", self.host, self.port)
        }
    }

    /// `scheme://host:port` for Chrome's `--proxy-server`.
    pub fn chrome_arg(&self) -> String {
        let scheme = match self.protocol {
            ProxyProtocol::Socks5 => "socks5",
            ProxyProtocol::Http => "http",
            ProxyProtocol::Https => "https",
        };
        format!("{scheme}://{}", self.host_port())
    }

    fn ureq_url(&self) -> String {
        // ureq tunnels HTTPS through HTTP CONNECT, so both HTTP flavours use `http://`.
        let scheme = match self.protocol {
            ProxyProtocol::Socks5 => "socks5",
            ProxyProtocol::Http | ProxyProtocol::Https => "http",
        };
        if self.username.is_empty() {
            format!("{scheme}://{}", self.host_port())
        } else {
            format!("{scheme}://{}:{}@{}", self.username, self.password, self.host_port())
        }
    }
}

/// `Ok(None)` means "use the system network".
pub fn resolve(proxy: Option<&ProxyConfig>, pool: &[PoolProxy]) -> Result<Option<ResolvedProxy>, String> {
    let Some(proxy) = proxy else { return Ok(None) };
    match proxy.mode {
        ProxyMode::System => Ok(None),
        ProxyMode::Custom => {
            let c = proxy.custom.as_ref().ok_or("缺少代理配置")?;
            let port = c.port.filter(|p| *p > 0).ok_or("代理端口无效")?;
            if c.host.trim().is_empty() {
                return Err("请填写代理主机".into());
            }
            Ok(Some(ResolvedProxy {
                protocol: c.protocol,
                host: c.host.trim().to_string(),
                port,
                username: c.username.clone(),
                password: c.password.clone(),
            }))
        }
        ProxyMode::Pool => {
            let id = proxy.pool_proxy_id.as_deref().ok_or("请选择代理")?;
            let p = pool.iter().find(|p| p.id == id).ok_or("所选代理不在代理池中")?;
            Ok(Some(ResolvedProxy {
                protocol: p.protocol,
                host: p.host.clone(),
                port: p.port,
                username: p.username.clone(),
                password: p.password.clone(),
            }))
        }
    }
}

fn failure(message: impl Into<String>) -> ConnectionResult {
    ConnectionResult { ok: false, latency_ms: None, exit_ip: None, country: None, message: message.into() }
}

fn tcp_reachable(host: &str, port: u16) -> Result<(), String> {
    let addrs: Vec<_> = (host, port).to_socket_addrs().map_err(|_| format!("无法解析主机 {host}"))?.collect();
    let mut last = String::from("无可用地址");
    for addr in addrs {
        match TcpStream::connect_timeout(&addr, CONNECT_TIMEOUT) {
            Ok(_) => return Ok(()),
            Err(e) if e.kind() == std::io::ErrorKind::TimedOut => last = "连接超时".into(),
            Err(e) if e.kind() == std::io::ErrorKind::ConnectionRefused => last = "端口拒绝连接".into(),
            Err(e) => last = e.to_string(),
        }
    }
    Err(last)
}

fn agent(proxy: Option<&ResolvedProxy>) -> Result<ureq::Agent, String> {
    let mut builder = ureq::AgentBuilder::new()
        .timeout(REQUEST_TIMEOUT)
        .user_agent(concat!("CCDuo/", env!("CARGO_PKG_VERSION")));
    if let Some(p) = proxy {
        let upstream = ureq::Proxy::new(p.ureq_url()).map_err(|e| format!("代理地址无效：{e}"))?;
        builder = builder.proxy(upstream);
    }
    Ok(builder.build())
}

fn describe(err: ureq::Error) -> String {
    match err {
        ureq::Error::Status(code, _) => format!("HTTP {code}"),
        ureq::Error::Transport(t) => {
            let text = t.to_string();
            if text.contains("timed out") { "请求超时".into() } else { text }
        }
    }
}

/// Checks reachability (TCP to the proxy) and the exit IP reported by the checker service.
pub fn test(proxy: &ProxyConfig, pool: &[PoolProxy]) -> ConnectionResult {
    let resolved = match resolve(Some(proxy), pool) {
        Ok(r) => r,
        Err(e) => return failure(e),
    };
    let checker = proxy.custom.as_ref().map(|c| c.checker).unwrap_or(IpChecker::Ipinfo);

    let started = Instant::now();
    if let Some(p) = &resolved {
        if let Err(e) = tcp_reachable(&p.host, p.port) {
            return failure(e);
        }
    }

    let (url, ip_key, country_key) = match checker {
        IpChecker::Ipinfo => ("https://ipinfo.io/json", "ip", "country"),
        IpChecker::Ipapi => ("http://ip-api.com/json/?fields=status,query,countryCode", "query", "countryCode"),
        IpChecker::Ip2location => ("https://api.ip2location.io/", "ip", "country_code"),
    };
    let client = match agent(resolved.as_ref()) {
        Ok(a) => a,
        Err(e) => return failure(e),
    };
    let body = match client.get(url).call() {
        Ok(resp) => resp.into_string().unwrap_or_default(),
        Err(e) => {
            return failure(if resolved.is_some() {
                format!("代理可连接，但请求失败：{}", describe(e))
            } else {
                describe(e)
            })
        }
    };
    let latency = started.elapsed().as_millis() as u64;
    let json: serde_json::Value = serde_json::from_str(&body).unwrap_or_default();
    let exit_ip = json.get(ip_key).and_then(|v| v.as_str()).map(str::to_string);
    let country = json.get(country_key).and_then(|v| v.as_str()).map(str::to_string);
    let message = match (&exit_ip, &country) {
        (Some(ip), Some(c)) => format!("出口 IP {ip} · {c}"),
        (Some(ip), None) => format!("出口 IP {ip}"),
        _ => "连接正常".into(),
    };
    ConnectionResult { ok: true, latency_ms: Some(latency), exit_ip, country, message }
}

/// Calls a dynamic proxy provider's refresh URL (direct, not through the proxy).
pub fn refresh_ip(url: &str) -> Result<String, String> {
    if !(url.starts_with("http://") || url.starts_with("https://")) {
        return Err("刷新 URL 需以 http:// 或 https:// 开头".into());
    }
    match agent(None)?.get(url).call() {
        Ok(resp) => Ok(format!("已请求刷新 · HTTP {}", resp.status())),
        Err(e) => Err(format!("刷新失败 · {}", describe(e))),
    }
}
