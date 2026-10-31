import type {
  Account,
  AccountInput,
  AppSnapshot,
  ConnectionResult,
  ProxyConfig,
  WorkspaceSummary,
} from "./types";
import { mockBackend } from "./mock";

/** True inside the Tauri webview; false in a plain browser (`pnpm dev`). */
export const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

async function call<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri) return mockBackend(command, args) as Promise<T>;
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

export const api = {
  snapshot: () => call<AppSnapshot>("get_snapshot"),
  createAccount: (input: AccountInput) => call<Account>("create_account", { input }),
  updateAccount: (id: string, input: AccountInput) => call<Account>("update_account", { id, input }),
  switchAccount: (id: string) => call<AppSnapshot>("switch_account", { id }),
  /** Opens the account's browser window at its startup URLs. Rejects with a readable message. */
  launchBrowser: (id: string) => call<Account>("launch_browser", { id }),
  testConnection: (proxy: ProxyConfig) => call<ConnectionResult>("test_connection", { proxy }),
  /** Calls a dynamic proxy's refresh URL to rotate its exit IP; resolves with a status line. */
  refreshProxyIp: (url: string) => call<string>("refresh_proxy_ip", { url }),
  workspaceSummary: () => call<WorkspaceSummary>("workspace_summary"),
  /** Opens `~/.claude/<sub>` (or the directory itself) with the system default app. */
  openWorkspacePath: (sub = "") => call<void>("open_workspace_path", { sub }),
};

export function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "未知错误";
}
