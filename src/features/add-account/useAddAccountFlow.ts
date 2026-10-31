import { useCallback, useEffect, useMemo, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { defaultBrowserProfile, emptyCustomProxy, nextWindowName } from "@/lib/defaults";
import { isValidHost, isValidPort, isValidUrl, parseProxyString } from "@/lib/proxy";
import { useAppData } from "@/lib/store";
import type { BrowserProfile, ConnectionResult, CustomProxy, ProxyConfig, ProxyMode } from "@/lib/types";

export type Phase = "window" | "confirm" | "waiting" | "failed";

export interface ProxyDraft {
  mode: ProxyMode;
  custom: CustomProxy;
  poolProxyId: string;
  /** 智能识别 raw text. */
  paste: string;
}

export type TestState = { status: "idle" } | { status: "testing" } | { status: "done"; result: ConnectionResult };

export type WindowErrors = Partial<Record<"name" | "host" | "port" | "refreshUrl" | "pool" | "startupUrls" | "paste", string>>;

export function toProxyConfig(draft: ProxyDraft): ProxyConfig {
  switch (draft.mode) {
    case "custom":
      return {
        mode: "custom",
        custom: {
          ...draft.custom,
          host: draft.custom.host.trim(),
          username: draft.custom.username.trim(),
          refreshUrl: draft.custom.refreshUrl.trim(),
        },
        poolProxyId: null,
      };
    case "pool":
      return { mode: "pool", custom: null, poolProxyId: draft.poolProxyId || null };
    default:
      return { mode: "system", custom: null, poolProxyId: null };
  }
}

function parseUrls(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function useAddAccountFlow() {
  const { snapshot, putAccount } = useAppData();
  const proxies = snapshot?.proxies ?? [];

  const takenNames = useMemo(
    () => (snapshot?.accounts ?? []).map((a) => a.browser?.name).filter((n): n is string => !!n),
    [snapshot],
  );

  const [phase, setPhase] = useState<Phase>("window");
  const [proxy, setProxy] = useState<ProxyDraft>(() => ({
    mode: "system",
    custom: emptyCustomProxy(),
    poolProxyId: "",
    paste: "",
  }));
  const [browser, setBrowser] = useState<BrowserProfile>(() => defaultBrowserProfile(nextWindowName(takenNames)));
  const [startupUrlsText, setStartupUrlsText] = useState("https://claude.ai/");
  const [accountName, setAccountName] = useState(() => `新账号 ${(snapshot?.accounts.length ?? 0) + 1}`);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [test, setTest] = useState<TestState>({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Defaults computed before the snapshot loaded may collide; refresh them until the user edits.
  const [seeded, setSeeded] = useState(!!snapshot);
  useEffect(() => {
    if (seeded || !snapshot) return;
    setSeeded(true);
    setBrowser((b) => ({ ...b, name: nextWindowName(takenNames) }));
    setAccountName(`新账号 ${snapshot.accounts.length + 1}`);
  }, [seeded, snapshot, takenNames]);

  // Pick the first pool proxy once the list is known.
  useEffect(() => {
    if (!proxy.poolProxyId && proxies.length) setProxy((p) => ({ ...p, poolProxyId: proxies[0].id }));
  }, [proxies, proxy.poolProxyId]);

  // A test result only describes the proxy it was run against.
  const proxyKey = JSON.stringify(toProxyConfig(proxy));
  useEffect(() => {
    setTest({ status: "idle" });
  }, [proxyKey]);

  const errors = useMemo<WindowErrors>(() => {
    const e: WindowErrors = {};
    if (!browser.name.trim()) e.name = "请填写浏览器名称";
    if (proxy.mode === "custom") {
      if (!isValidHost(proxy.custom.host)) e.host = "请填写代理主机";
      if (!isValidPort(proxy.custom.port)) e.port = "端口应为 1–65535";
      if (proxy.custom.refreshUrl.trim() && !isValidUrl(proxy.custom.refreshUrl)) e.refreshUrl = "刷新 URL 需以 http:// 或 https:// 开头";
      if (proxy.paste.trim() && !parseProxyString(proxy.paste)) e.paste = "无法识别，请检查格式";
    }
    if (proxy.mode === "pool" && !proxies.some((p) => p.id === proxy.poolProxyId)) {
      e.pool = proxies.length ? "请选择代理" : "代理池为空，可切换至“添加代理IP”";
    }
    const urls = parseUrls(startupUrlsText);
    if (!urls.length) e.startupUrls = "至少填写一个启动网页";
    else if (urls.some((u) => !isValidUrl(u))) e.startupUrls = "每行一个 URL，需以 http:// 或 https:// 开头";
    return e;
  }, [browser.name, proxy, proxies, startupUrlsText]);

  const visibleErrors = showErrors ? errors : {};
  const hasProxyError = Boolean(errors.host || errors.port || errors.pool);

  const updateCustom = useCallback((patch: Partial<CustomProxy>) => {
    setProxy((p) => ({ ...p, custom: { ...p.custom, ...patch } }));
  }, []);

  const applyPaste = useCallback((text: string) => {
    setProxy((p) => {
      const parsed = parseProxyString(text);
      return { ...p, paste: text, custom: parsed ? { ...p.custom, ...parsed } : p.custom };
    });
  }, []);

  const runTest = useCallback(async () => {
    if (hasProxyError) {
      setShowErrors(true);
      return;
    }
    setTest({ status: "testing" });
    try {
      setTest({ status: "done", result: await api.testConnection(toProxyConfig(proxy)) });
    } catch (error) {
      setTest({ status: "done", result: { ok: false, latencyMs: null, exitIp: null, country: null, message: errorMessage(error) } });
    }
  }, [proxy, hasProxyError]);

  const [refresh, setRefresh] = useState<{ busy: boolean; message: string | null; ok: boolean }>({ busy: false, message: null, ok: true });
  const refreshIp = useCallback(async () => {
    const url = proxy.custom.refreshUrl.trim();
    if (!isValidUrl(url)) {
      setShowErrors(true);
      return;
    }
    setRefresh({ busy: true, message: null, ok: true });
    try {
      setRefresh({ busy: false, message: await api.refreshProxyIp(url), ok: true });
      setTest({ status: "idle" });
    } catch (error) {
      setRefresh({ busy: false, message: errorMessage(error), ok: false });
    }
  }, [proxy.custom.refreshUrl]);

  const goConfirm = useCallback(() => {
    setShowErrors(true);
    if (Object.values(errors).some(Boolean)) return false;
    setShowErrors(false);
    setPhase("confirm");
    return true;
  }, [errors]);

  const editWindow = useCallback((mode?: ProxyMode) => {
    if (mode) setProxy((p) => ({ ...p, mode }));
    setPhase("window");
  }, []);

  const launch = useCallback(
    async (id: string) => {
      setSubmitting(true);
      setLaunchError(null);
      try {
        putAccount(await api.launchBrowser(id));
        setPhase("waiting");
      } catch (error) {
        setLaunchError(errorMessage(error));
        setPhase("failed");
      } finally {
        setSubmitting(false);
      }
    },
    [putAccount],
  );

  /** 添加账号: save (create or update) then open the linked browser. */
  const submit = useCallback(async () => {
    if (!accountName.trim()) {
      setShowErrors(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const input = {
      name: accountName.trim(),
      proxy: toProxyConfig(proxy),
      browser: { ...browser, name: browser.name.trim(), startupUrls: parseUrls(startupUrlsText) },
    };
    try {
      const account = accountId ? await api.updateAccount(accountId, input) : await api.createAccount(input);
      putAccount(account);
      setAccountId(account.id);
      await launch(account.id);
    } catch (error) {
      setSubmitError(errorMessage(error));
      setSubmitting(false);
    }
  }, [accountId, accountName, browser, launch, proxy, putAccount, startupUrlsText]);

  return {
    phase,
    proxies,
    proxy,
    setProxy,
    updateCustom,
    applyPaste,
    browser,
    setBrowser,
    startupUrlsText,
    setStartupUrlsText,
    accountName,
    setAccountName,
    accountNameError: showErrors && !accountName.trim() ? "请填写账号名称" : undefined,
    errors: visibleErrors,
    test,
    runTest,
    refresh,
    refreshIp,
    goConfirm,
    editWindow,
    submit,
    submitting,
    submitError,
    relaunch: () => accountId && void launch(accountId),
    launchError,
    showFailure: () => {
      setLaunchError(null);
      setPhase("failed");
    },
  };
}

export type AddAccountFlow = ReturnType<typeof useAddAccountFlow>;
