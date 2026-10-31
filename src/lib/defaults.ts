import type { BrowserEngine, BrowserOs, BrowserProfile, CustomProxy, ProxyConfig } from "./types";

const UA: Record<BrowserOs, Record<BrowserEngine, string[]>> = {
  macos: {
    chrome: [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    ],
    firefox: [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:143.0) Gecko/20100101 Firefox/143.0",
    ],
  },
  windows: {
    chrome: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    ],
    firefox: ["Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0"],
  },
  linux: {
    chrome: ["Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"],
    firefox: ["Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0"],
  },
};

export function userAgentFor(os: BrowserOs, engine: BrowserEngine): string {
  return UA[os][engine][0];
}

export function randomUserAgent(os: BrowserOs, engine: BrowserEngine, current?: string): string {
  const pool = UA[os][engine].filter((ua) => ua !== current);
  return pool[Math.floor(Math.random() * pool.length)] ?? userAgentFor(os, engine);
}

export function hostOs(): BrowserOs {
  const platform = navigator.userAgent;
  if (/Windows/i.test(platform)) return "windows";
  if (/Linux/i.test(platform) && !/Android/i.test(platform)) return "linux";
  return "macos";
}

/** `20261028-01`, incrementing the suffix past names already in use. */
export function nextWindowName(taken: readonly string[], now = new Date()): string {
  const day = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  for (let n = 1; n < 100; n++) {
    const name = `${day}-${String(n).padStart(2, "0")}`;
    if (!taken.includes(name)) return name;
  }
  return `${day}-${Date.now() % 1000}`;
}

export function defaultBrowserProfile(name: string): BrowserProfile {
  const os = hostOs();
  return {
    name,
    os,
    osVersion: "host",
    engine: "chrome",
    engineVersion: "installed",
    userAgent: userAgentFor(os, "chrome"),
    startupUrls: ["https://claude.ai/"],
    language: "ip",
    uiLanguage: "ip",
    timezone: "ip",
    geoPrompt: "block",
    geolocation: "ip",
    sound: true,
  };
}

export function emptyCustomProxy(): CustomProxy {
  return {
    protocol: "socks5",
    host: "",
    port: null,
    username: "",
    password: "",
    ipVersion: "ipv4",
    refreshUrl: "",
    checker: "ip2location",
  };
}

export function systemProxy(): ProxyConfig {
  return { mode: "system", custom: null, poolProxyId: null };
}

export const OS_LABEL: Record<BrowserOs, string> = { macos: "macOS", windows: "Windows", linux: "Linux" };
export const ENGINE_LABEL: Record<BrowserEngine, string> = { chrome: "Chrome", firefox: "Firefox" };
export const PROXY_MODE_LABEL = { system: "跟随系统", custom: "添加代理IP", pool: "选择代理" } as const;
