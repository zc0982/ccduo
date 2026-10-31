/** Mirrors the serde models in `src-tauri/src/model.rs` (camelCase). */

export type ProxyMode = "system" | "custom" | "pool";
export type ProxyProtocol = "socks5" | "http" | "https";
export type IpVersion = "ipv4" | "ipv6";
export type IpChecker = "ip2location" | "ipinfo" | "ipapi";

export interface CustomProxy {
  protocol: ProxyProtocol;
  host: string;
  port: number | null;
  username: string;
  password: string;
  ipVersion: IpVersion;
  refreshUrl: string;
  checker: IpChecker;
}

export interface ProxyConfig {
  mode: ProxyMode;
  custom: CustomProxy | null;
  poolProxyId: string | null;
}

export interface PoolProxy {
  id: string;
  name: string;
  country: string;
  countryName: string;
  protocol: ProxyProtocol;
  host: string;
  port: number;
}

export type BrowserOs = "macos" | "windows" | "linux";
export type BrowserEngine = "chrome" | "firefox";
export type MatchMode = "ip" | "custom";
export type GeoPrompt = "ask" | "allow" | "block";

export interface BrowserProfile {
  name: string;
  os: BrowserOs;
  osVersion: string;
  engine: BrowserEngine;
  engineVersion: string;
  userAgent: string;
  startupUrls: string[];
  language: MatchMode;
  uiLanguage: MatchMode;
  timezone: MatchMode;
  geoPrompt: GeoPrompt;
  geolocation: MatchMode;
  sound: boolean;
}

export type AccountStatus = "empty" | "pendingLogin" | "active";

export interface Identity {
  label: string;
}

export interface Account {
  id: string;
  name: string;
  identity: Identity | null;
  proxy: ProxyConfig | null;
  browser: BrowserProfile | null;
  status: AccountStatus;
  createdAt: number;
}

export interface AccountInput {
  name: string;
  proxy: ProxyConfig;
  browser: BrowserProfile;
}

export interface AppSnapshot {
  accounts: Account[];
  currentAccountId: string;
  proxies: PoolProxy[];
}

export interface ConnectionResult {
  ok: boolean;
  latencyMs: number | null;
  /** Exit IP reported by the checker service, when reachable. */
  exitIp: string | null;
  country: string | null;
  message: string;
}

export interface WorkspaceSummary {
  /** Absolute path of the Claude Code config directory. */
  path: string;
  /** `~`-relative form for display. */
  displayPath: string;
  skills: number;
  plugins: number;
  mcpServers: number;
  projects: number;
  sessions: number;
  cacheBytes: number;
}
