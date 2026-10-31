//! Opens an account's isolated browser window: a dedicated profile directory per account,
//! the account's proxy, user agent and startup pages.

use std::fs;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::thread;
use std::time::Duration;

use crate::model::{Account, BrowserEngine, BrowserProfile, GeoPrompt, ProxyProtocol};
use crate::network::ResolvedProxy;

/// A launch that exits within this window with a failure status is reported as an error.
const STARTUP_GRACE: Duration = Duration::from_millis(900);

pub fn launch(account: &Account, proxy: Option<&ResolvedProxy>, data_dir: &Path) -> Result<(), String> {
    let profile = account.browser.as_ref().ok_or("账号尚未关联浏览器窗口")?;
    let profile_dir = data_dir.join("profiles").join(&account.id);
    fs::create_dir_all(&profile_dir).map_err(|e| format!("无法创建窗口数据目录：{e}"))?;

    let (exe, args) = match profile.engine {
        BrowserEngine::Chrome => {
            let exe = find_executable(&chrome_candidates()).ok_or("未找到 Google Chrome，请确认已安装。")?;
            (exe, chrome_args(profile, proxy, &profile_dir)?)
        }
        BrowserEngine::Firefox => {
            let exe = find_executable(&firefox_candidates()).ok_or("未找到 Firefox，请确认已安装。")?;
            (exe, firefox_args(profile, proxy, &profile_dir)?)
        }
    };

    let mut child = Command::new(&exe)
        .args(&args)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| format!("无法启动浏览器（{}）：{e}", exe.display()))?;

    thread::sleep(STARTUP_GRACE);
    match child.try_wait() {
        Ok(Some(status)) if !status.success() => Err(format!("浏览器进程启动后立即退出（{status}）")),
        _ => {
            // Reap the process when it eventually exits.
            thread::spawn(move || {
                let _ = child.wait();
            });
            Ok(())
        }
    }
}

fn chrome_args(profile: &BrowserProfile, proxy: Option<&ResolvedProxy>, dir: &Path) -> Result<Vec<String>, String> {
    seed_chrome_preferences(profile, dir)?;
    let mut args = vec![
        format!("--user-data-dir={}", dir.display()),
        "--no-first-run".into(),
        "--no-default-browser-check".into(),
        "--new-window".into(),
    ];
    if !profile.user_agent.trim().is_empty() {
        args.push(format!("--user-agent={}", profile.user_agent.trim()));
    }
    if let Some(p) = proxy {
        // Chrome resolves hostnames on the proxy side for SOCKS5, so DNS stays on the proxy.
        args.push(format!("--proxy-server={}", p.chrome_arg()));
    }
    if !profile.sound {
        args.push("--mute-audio".into());
    }
    args.extend(profile.startup_urls.iter().cloned());
    Ok(args)
}

/// Writes geolocation defaults into a fresh profile; never touches an existing one.
fn seed_chrome_preferences(profile: &BrowserProfile, dir: &Path) -> Result<(), String> {
    let default_dir = dir.join("Default");
    let prefs = default_dir.join("Preferences");
    if prefs.exists() {
        return Ok(());
    }
    fs::create_dir_all(&default_dir).map_err(|e| e.to_string())?;
    let mut content = serde_json::json!({ "browser": { "check_default_browser": false } });
    let geo = match profile.geo_prompt {
        GeoPrompt::Allow => Some(1),
        GeoPrompt::Block => Some(2),
        GeoPrompt::Ask => None,
    };
    if let Some(value) = geo {
        content["profile"] = serde_json::json!({ "default_content_setting_values": { "geolocation": value } });
    }
    fs::write(prefs, content.to_string()).map_err(|e| e.to_string())
}

fn firefox_args(profile: &BrowserProfile, proxy: Option<&ResolvedProxy>, dir: &Path) -> Result<Vec<String>, String> {
    write_firefox_user_js(profile, proxy, dir)?;
    let mut args = vec![
        "-profile".to_string(),
        dir.display().to_string(),
        "-no-remote".into(),
        "-new-instance".into(),
    ];
    args.extend(profile.startup_urls.iter().cloned());
    Ok(args)
}

/// `user.js` is re-applied by Firefox on every start, so settings stay in sync with CCDuo.
fn write_firefox_user_js(profile: &BrowserProfile, proxy: Option<&ResolvedProxy>, dir: &Path) -> Result<(), String> {
    let mut prefs: Vec<(String, String)> = vec![
        ("browser.shell.checkDefaultBrowser".into(), "false".into()),
        ("browser.aboutwelcome.enabled".into(), "false".into()),
    ];
    let quote = |s: &str| serde_json::to_string(s).unwrap_or_else(|_| "\"\"".into());

    if !profile.user_agent.trim().is_empty() {
        prefs.push(("general.useragent.override".into(), quote(profile.user_agent.trim())));
    }
    match proxy {
        None => prefs.push(("network.proxy.type".into(), "5".into())), // system
        Some(p) => {
            prefs.push(("network.proxy.type".into(), "1".into()));
            match p.protocol {
                ProxyProtocol::Socks5 => {
                    prefs.push(("network.proxy.socks".into(), quote(&p.host)));
                    prefs.push(("network.proxy.socks_port".into(), p.port.to_string()));
                    prefs.push(("network.proxy.socks_version".into(), "5".into()));
                    prefs.push(("network.proxy.socks_remote_dns".into(), "true".into()));
                }
                ProxyProtocol::Http | ProxyProtocol::Https => {
                    for key in ["http", "ssl"] {
                        prefs.push((format!("network.proxy.{key}"), quote(&p.host)));
                        prefs.push((format!("network.proxy.{key}_port"), p.port.to_string()));
                    }
                }
            }
        }
    }
    let geo = match profile.geo_prompt {
        GeoPrompt::Ask => 0,
        GeoPrompt::Allow => 1,
        GeoPrompt::Block => 2,
    };
    prefs.push(("permissions.default.geo".into(), geo.to_string()));
    if !profile.sound {
        prefs.push(("media.volume_scale".into(), quote("0.0")));
    }

    let body: String = prefs.iter().map(|(k, v)| format!("user_pref(\"{k}\", {v});\n")).collect();
    fs::write(dir.join("user.js"), body).map_err(|e| format!("无法写入 Firefox 配置：{e}"))
}

fn find_executable(candidates: &[PathBuf]) -> Option<PathBuf> {
    candidates.iter().find(|p| p.is_file()).cloned()
}

fn in_path(names: &[&str]) -> Vec<PathBuf> {
    let Some(path) = std::env::var_os("PATH") else { return Vec::new() };
    std::env::split_paths(&path)
        .flat_map(|dir| names.iter().map(move |n| dir.join(n)))
        .collect()
}

fn home() -> Option<PathBuf> {
    std::env::var_os("HOME").or_else(|| std::env::var_os("USERPROFILE")).map(PathBuf::from)
}

fn chrome_candidates() -> Vec<PathBuf> {
    let mut list = Vec::new();
    if cfg!(target_os = "macos") {
        let app = "Google Chrome.app/Contents/MacOS/Google Chrome";
        list.push(PathBuf::from("/Applications").join(app));
        if let Some(h) = home() {
            list.push(h.join("Applications").join(app));
        }
        list.push(PathBuf::from("/Applications/Chromium.app/Contents/MacOS/Chromium"));
    } else if cfg!(target_os = "windows") {
        for var in ["ProgramFiles", "ProgramFiles(x86)", "LOCALAPPDATA"] {
            if let Some(base) = std::env::var_os(var) {
                list.push(PathBuf::from(base).join(r"Google\Chrome\Application\chrome.exe"));
            }
        }
    } else {
        list.extend(in_path(&["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]));
    }
    list
}

fn firefox_candidates() -> Vec<PathBuf> {
    let mut list = Vec::new();
    if cfg!(target_os = "macos") {
        let app = "Firefox.app/Contents/MacOS/firefox";
        list.push(PathBuf::from("/Applications").join(app));
        if let Some(h) = home() {
            list.push(h.join("Applications").join(app));
        }
    } else if cfg!(target_os = "windows") {
        for var in ["ProgramFiles", "ProgramFiles(x86)"] {
            if let Some(base) = std::env::var_os(var) {
                list.push(PathBuf::from(base).join(r"Mozilla Firefox\firefox.exe"));
            }
        }
    } else {
        list.extend(in_path(&["firefox"]));
    }
    list
}
