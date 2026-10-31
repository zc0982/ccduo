/**
 * In-browser stand-in for the Rust backend so the UI runs under `pnpm dev`
 * without Tauri. Seeded with the demo data from the Figma prototype.
 * Set `localStorage.ccduoMockLaunch = "fail"` to preview the launch-failure screen.
 */
import type { Account, AccountInput, AppSnapshot, ConnectionResult, ProxyConfig, WorkspaceSummary } from "./types";
import { defaultBrowserProfile } from "./defaults";

const state: AppSnapshot = {
  currentAccountId: "default",
  proxies: [
    { id: "px-travel", name: "旅居网络", country: "US", countryName: "United States", protocol: "socks5", host: "203.0.113.24", port: 1080 },
    { id: "px-bridge", name: "本地桥接", country: "JP", countryName: "Japan", protocol: "http", host: "127.0.0.1", port: 7890 },
  ],
  accounts: [
    { id: "default", name: "默认账号", identity: null, proxy: null, browser: null, status: "empty", createdAt: 0 },
    {
      id: "personal",
      name: "个人账号",
      identity: { label: "Personal" },
      proxy: { mode: "pool", custom: null, poolProxyId: "px-travel" },
      browser: defaultBrowserProfile("日常浏览"),
      status: "active",
      createdAt: 1,
    },
    {
      id: "backup",
      name: "备用账号",
      identity: null,
      proxy: { mode: "pool", custom: null, poolProxyId: "px-bridge" },
      browser: null,
      status: "empty",
      createdAt: 2,
    },
  ],
};
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T,>(value: T): T => structuredClone(value);

function upsert(id: string, input: AccountInput): Account {
  const existing = state.accounts.find((a) => a.id === id);
  const account: Account = {
    id,
    name: input.name.trim(),
    identity: existing?.identity ?? null,
    proxy: input.proxy,
    browser: input.browser,
    status: existing?.status ?? "empty",
    createdAt: existing?.createdAt ?? Date.now(),
  };
  if (existing) Object.assign(existing, account);
  else state.accounts.push(account);
  return account;
}

function testConnection(proxy: ProxyConfig): ConnectionResult {
  if (proxy.mode === "system") return { ok: true, latencyMs: 86, exitIp: "198.51.100.7", country: "SG", message: "出口 IP 198.51.100.7 · SG" };
  const host = proxy.mode === "custom" ? proxy.custom?.host : state.proxies.find((x) => x.id === proxy.poolProxyId)?.host;
  // 203.0.113.0/24 is TEST-NET-3: never routable, so the demo shows a failure.
  if (host?.startsWith("203.0.113.")) {
    return { ok: false, latencyMs: null, exitIp: null, country: null, message: "连接超时" };
  }
  return { ok: true, latencyMs: 142, exitIp: "192.0.2.15", country: "US", message: "出口 IP 192.0.2.15 · US" };
}

export async function mockBackend(command: string, args: Record<string, unknown> = {}): Promise<unknown> {
  await delay(command === "test_connection" || command === "launch_browser" ? 700 : 80);
  switch (command) {
    case "get_snapshot":
      return clone(state);
    case "create_account":
      return clone(upsert(`acc-${Date.now().toString(36)}`, args.input as AccountInput));
    case "update_account":
      return clone(upsert(args.id as string, args.input as AccountInput));
    case "switch_account":
      state.currentAccountId = args.id as string;
      return clone(state);
    case "launch_browser": {
      const account = state.accounts.find((a) => a.id === args.id);
      if (!account) throw "账号不存在";
      let fail = false;
      try {
        fail = localStorage.getItem("ccduoMockLaunch") === "fail";
      } catch {
        /* storage unavailable */
      }
      if (fail) throw "未找到 Google Chrome，请确认已安装。";
      account.status = account.status === "active" ? "active" : "pendingLogin";
      return clone(account);
    }
    case "test_connection":
      return testConnection(args.proxy as ProxyConfig);
    case "open_workspace_path":
      return undefined;
    case "refresh_proxy_ip":
      return "已请求刷新 · HTTP 200";
    case "workspace_summary":
      return {
        path: "/Users/demo/.claude",
        displayPath: "~/.claude",
        skills: 12,
        plugins: 4,
        mcpServers: 3,
        projects: 6,
        sessions: 28,
        cacheBytes: 128 * 1024 * 1024,
      } satisfies WorkspaceSummary;
    default:
      throw `未实现的命令：${command}`;
  }
}
