//! Serde models shared with the frontend (`src/lib/types.ts`). Field names are camelCase on the wire.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProxyMode {
    System,
    Custom,
    Pool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ProxyProtocol {
    Socks5,
    Http,
    Https,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IpVersion {
    Ipv4,
    Ipv6,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum IpChecker {
    Ip2location,
    Ipinfo,
    Ipapi,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomProxy {
    pub protocol: ProxyProtocol,
    pub host: String,
    pub port: Option<u16>,
    #[serde(default)]
    pub username: String,
    #[serde(default)]
    pub password: String,
    pub ip_version: IpVersion,
    #[serde(default)]
    pub refresh_url: String,
    pub checker: IpChecker,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProxyConfig {
    pub mode: ProxyMode,
    pub custom: Option<CustomProxy>,
    pub pool_proxy_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PoolProxy {
    pub id: String,
    pub name: String,
    pub country: String,
    pub country_name: String,
    pub protocol: ProxyProtocol,
    pub host: String,
    pub port: u16,
    #[serde(default)]
    pub username: String,
    #[serde(default)]
    pub password: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum BrowserOs {
    Macos,
    Windows,
    Linux,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum BrowserEngine {
    Chrome,
    Firefox,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum MatchMode {
    Ip,
    Custom,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GeoPrompt {
    Ask,
    Allow,
    Block,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BrowserProfile {
    pub name: String,
    pub os: BrowserOs,
    pub os_version: String,
    pub engine: BrowserEngine,
    pub engine_version: String,
    pub user_agent: String,
    pub startup_urls: Vec<String>,
    pub language: MatchMode,
    pub ui_language: MatchMode,
    pub timezone: MatchMode,
    pub geo_prompt: GeoPrompt,
    pub geolocation: MatchMode,
    pub sound: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum AccountStatus {
    Empty,
    PendingLogin,
    Active,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Identity {
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub id: String,
    pub name: String,
    pub identity: Option<Identity>,
    pub proxy: Option<ProxyConfig>,
    pub browser: Option<BrowserProfile>,
    pub status: AccountStatus,
    pub created_at: u64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountInput {
    pub name: String,
    pub proxy: ProxyConfig,
    pub browser: BrowserProfile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSnapshot {
    pub accounts: Vec<Account>,
    pub current_account_id: String,
    pub proxies: Vec<PoolProxy>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionResult {
    pub ok: bool,
    pub latency_ms: Option<u64>,
    pub exit_ip: Option<String>,
    pub country: Option<String>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceSummary {
    /// Absolute path, used for opening.
    pub path: String,
    /// `~`-relative path for display.
    pub display_path: String,
    pub skills: u32,
    pub plugins: u32,
    pub mcp_servers: u32,
    pub projects: u32,
    pub sessions: u32,
    pub cache_bytes: u64,
}
