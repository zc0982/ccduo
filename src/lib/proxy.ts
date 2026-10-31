import type { CustomProxy, PoolProxy, ProxyConfig, ProxyProtocol } from "./types";
import { PROXY_MODE_LABEL } from "./defaults";

/**
 * 智能识别：parses pasted proxy strings.
 *   host:port
 *   host:port:username:password
 *   username:password@host:port
 *   socks5://username:password@host:port
 */
export function parseProxyString(raw: string): Partial<CustomProxy> | null {
  let text = raw.trim();
  if (!text) return null;
  const result: Partial<CustomProxy> = {};

  const scheme = /^(socks5h?|https?):\/\//i.exec(text);
  if (scheme) {
    const s = scheme[1].toLowerCase();
    result.protocol = (s.startsWith("socks") ? "socks5" : s) as ProxyProtocol;
    text = text.slice(scheme[0].length);
  }
  text = text.replace(/\/+$/, "");

  let hostPart = text;
  const at = text.lastIndexOf("@");
  if (at >= 0) {
    const [username, ...password] = text.slice(0, at).split(":");
    result.username = username;
    result.password = password.join(":");
    hostPart = text.slice(at + 1);
  }

  // [ipv6]:port
  const bracket = /^\[([^\]]+)\]:(\d+)(?::(.*))?$/.exec(hostPart);
  if (bracket) {
    result.host = bracket[1];
    result.port = Number(bracket[2]);
    result.ipVersion = "ipv6";
    if (bracket[3] && at < 0) {
      const [u, ...p] = bracket[3].split(":");
      result.username = u;
      result.password = p.join(":");
    }
  } else {
    const parts = hostPart.split(":");
    if (parts.length < 2) return null;
    result.host = parts[0];
    result.port = Number(parts[1]);
    if (parts.length >= 4 && at < 0) {
      result.username = parts[2];
      result.password = parts.slice(3).join(":");
    }
  }

  if (!result.host || !isValidPort(result.port)) return null;
  return result;
}

export function isValidPort(port: unknown): port is number {
  return typeof port === "number" && Number.isInteger(port) && port > 0 && port < 65536;
}

export function isValidHost(host: string): boolean {
  const h = host.trim();
  return h.length > 0 && !/\s/.test(h) && !h.includes("/");
}

export function isValidUrl(url: string): boolean {
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url.trim());
}

/** Label for the 账号列表「代理配置」column and the summary panel. */
export function proxyLabel(proxy: ProxyConfig | null, pool: readonly PoolProxy[]): string {
  if (!proxy) return "未选择";
  if (proxy.mode === "pool") return pool.find((p) => p.id === proxy.poolProxyId)?.name ?? "已移除的代理";
  if (proxy.mode === "custom" && proxy.custom) return `${proxy.custom.host}:${proxy.custom.port ?? ""}`;
  return PROXY_MODE_LABEL[proxy.mode];
}
