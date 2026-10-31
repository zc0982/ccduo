import { describe, expect, it } from "vitest";
import { isValidUrl, parseProxyString, proxyLabel } from "../proxy";
import { nextWindowName } from "../defaults";

describe("parseProxyString (智能识别)", () => {
  it("parses host:port", () => {
    expect(parseProxyString("198.51.100.20:1080")).toEqual({ host: "198.51.100.20", port: 1080 });
  });

  it("parses host:port:username:password", () => {
    expect(parseProxyString("proxy.example.com:8000:alice:s3cret")).toEqual({
      host: "proxy.example.com",
      port: 8000,
      username: "alice",
      password: "s3cret",
    });
  });

  it("parses username:password@host:port", () => {
    expect(parseProxyString("alice:s3cret@10.0.0.2:3128")).toEqual({
      host: "10.0.0.2",
      port: 3128,
      username: "alice",
      password: "s3cret",
    });
  });

  it("reads the scheme and keeps colons inside passwords", () => {
    expect(parseProxyString("socks5://bob:a:b:c@h.example:1080/")).toEqual({
      protocol: "socks5",
      host: "h.example",
      port: 1080,
      username: "bob",
      password: "a:b:c",
    });
    expect(parseProxyString("socks5h://h:1")?.protocol).toBe("socks5");
    expect(parseProxyString("http://h:80")?.protocol).toBe("http");
  });

  it("parses bracketed IPv6", () => {
    expect(parseProxyString("[2001:db8::1]:1080")).toEqual({ host: "2001:db8::1", port: 1080, ipVersion: "ipv6" });
  });

  it("rejects incomplete or out-of-range input", () => {
    expect(parseProxyString("")).toBeNull();
    expect(parseProxyString("just-a-host")).toBeNull();
    expect(parseProxyString("h:0")).toBeNull();
    expect(parseProxyString("h:70000")).toBeNull();
    expect(parseProxyString("h:port")).toBeNull();
  });
});

describe("isValidUrl", () => {
  it("accepts http(s) only", () => {
    expect(isValidUrl("https://claude.ai/")).toBe(true);
    expect(isValidUrl("http://localhost:3000")).toBe(true);
    expect(isValidUrl("claude.ai")).toBe(false);
    expect(isValidUrl("ftp://x.y")).toBe(false);
  });
});

describe("proxyLabel", () => {
  const pool = [{ id: "p1", name: "旅居网络", country: "US", countryName: "United States", protocol: "socks5" as const, host: "h", port: 1 }];
  it("labels each mode for the account table", () => {
    expect(proxyLabel(null, pool)).toBe("未选择");
    expect(proxyLabel({ mode: "system", custom: null, poolProxyId: null }, pool)).toBe("跟随系统");
    expect(proxyLabel({ mode: "pool", custom: null, poolProxyId: "p1" }, pool)).toBe("旅居网络");
    expect(proxyLabel({ mode: "pool", custom: null, poolProxyId: "gone" }, pool)).toBe("已移除的代理");
  });
});

describe("nextWindowName", () => {
  const day = new Date(2026, 9, 28);
  it("uses the date and the first free suffix", () => {
    expect(nextWindowName([], day)).toBe("20261028-01");
    expect(nextWindowName(["20261028-01", "20261028-02"], day)).toBe("20261028-03");
  });
});
