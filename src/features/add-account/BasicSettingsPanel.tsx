import { ShieldCheck } from "lucide-react";
import { Button, Card, CardHeader, FormRow, InlineNote, Segmented, Select, TextArea, TextInput } from "@/components/ui";
import { ENGINE_LABEL, OS_LABEL, randomUserAgent, userAgentFor } from "@/lib/defaults";
import type { BrowserEngine, BrowserOs, BrowserProfile, GeoPrompt, MatchMode } from "@/lib/types";
import type { AddAccountFlow } from "./useAddAccountFlow";
import styles from "./AddAccount.module.css";

const OS_OPTIONS = (Object.keys(OS_LABEL) as BrowserOs[]).map((value) => ({ value, label: OS_LABEL[value] }));
const OS_VERSIONS: Record<BrowserOs, string[]> = {
  macos: ["macOS 15", "macOS 14", "macOS 13"],
  windows: ["Windows 11", "Windows 10"],
  linux: ["Ubuntu 24.04", "Debian 12"],
};
const ENGINE_OPTIONS = (Object.keys(ENGINE_LABEL) as BrowserEngine[]).map((value) => ({ value, label: ENGINE_LABEL[value] }));
const MATCH_OPTIONS = [
  { value: "ip", label: "基于 IP 匹配" },
  { value: "custom", label: "自定义" },
] as const satisfies readonly { value: MatchMode; label: string }[];
const GEO_OPTIONS = [
  { value: "ask", label: "询问" },
  { value: "allow", label: "允许" },
  { value: "block", label: "禁止" },
] as const satisfies readonly { value: GeoPrompt; label: string }[];

type MatchKey = "language" | "uiLanguage" | "timezone" | "geolocation";
const MATCH_ROWS: { key: MatchKey; label: string }[] = [
  { key: "language", label: "语言" },
  { key: "uiLanguage", label: "界面语言" },
  { key: "timezone", label: "时区" },
];

/** 基础设置：系统、内核、UA、启动网页与指纹匹配项。 */
export function BasicSettingsPanel({ flow }: { flow: AddAccountFlow }) {
  const { browser, setBrowser, startupUrlsText, setStartupUrlsText, errors } = flow;
  const set = (patch: Partial<BrowserProfile>) => setBrowser((b) => ({ ...b, ...patch }));

  return (
    <Card className={styles.panel}>
      <CardHeader title="基础设置" aside="默认随代理匹配，可按需调整" />

      <div className={styles.settings}>
        <FormRow label="系统">
          {(id) => (
            <div className={styles.pair}>
              <Select
                id={id}
                options={OS_OPTIONS}
                value={browser.os}
                onChange={(e) => {
                  const os = e.target.value as BrowserOs;
                  set({ os, osVersion: "host", userAgent: userAgentFor(os, browser.engine) });
                }}
              />
              <Select
                aria-label="系统版本"
                options={[{ value: "host", label: "跟随本机版本" }, ...OS_VERSIONS[browser.os].map((v) => ({ value: v, label: v }))]}
                value={browser.osVersion}
                onChange={(e) => set({ osVersion: e.target.value })}
              />
            </div>
          )}
        </FormRow>

        <FormRow label="内核">
          <div className={styles.enginePair}>
            <Segmented<BrowserEngine>
              size="md"
              aria-label="内核"
              options={ENGINE_OPTIONS}
              value={browser.engine}
              onChange={(engine) => set({ engine, userAgent: userAgentFor(browser.os, engine) })}
            />
            <Select
              aria-label="内核版本"
              options={[{ value: "installed", label: "已安装版本" }]}
              value={browser.engineVersion}
              onChange={(e) => set({ engineVersion: e.target.value })}
            />
          </div>
        </FormRow>

        <FormRow label="User-Agent">
          {(id) => (
            <div className={styles.uaRow}>
              <TextInput id={id} value={browser.userAgent} title={browser.userAgent} onChange={(e) => set({ userAgent: e.target.value })} />
              <Button size="sm" className={styles.w82} onClick={() => set({ userAgent: randomUserAgent(browser.os, browser.engine, browser.userAgent) })}>
                随机
              </Button>
            </div>
          )}
        </FormRow>

        <FormRow label="启动网页" hint="每行一个 URL，以 http:// 或 https:// 开头" error={errors.startupUrls} className={styles.urlRow}>
          {(id) => (
            <TextArea
              id={id}
              rows={Math.min(Math.max(startupUrlsText.split("\n").length, 1), 4)}
              value={startupUrlsText}
              invalid={!!errors.startupUrls}
              onChange={(e) => setStartupUrlsText(e.target.value)}
              className={styles.urls}
            />
          )}
        </FormRow>

        <div className={styles.matchRows}>
          {MATCH_ROWS.map(({ key, label }) => (
            <FormRow key={key} label={label}>
              <Segmented<MatchMode> aria-label={label} className={styles.w300} options={MATCH_OPTIONS} value={browser[key]} onChange={(v) => set({ [key]: v })} />
            </FormRow>
          ))}
          <FormRow label="地理位置提示">
            <Segmented<GeoPrompt> aria-label="地理位置提示" className={styles.w300} options={GEO_OPTIONS} value={browser.geoPrompt} onChange={(geoPrompt) => set({ geoPrompt })} />
          </FormRow>
          <FormRow label="地理位置">
            <Segmented<MatchMode> aria-label="地理位置" className={styles.w300} options={MATCH_OPTIONS} value={browser.geolocation} onChange={(geolocation) => set({ geolocation })} />
          </FormRow>
          <FormRow label="声音">
            <Segmented<"on" | "off">
              aria-label="声音"
              className={styles.w180}
              options={[
                { value: "on", label: "开启" },
                { value: "off", label: "关闭" },
              ]}
              value={browser.sound ? "on" : "off"}
              onChange={(v) => set({ sound: v === "on" })}
            />
          </FormRow>
        </div>
      </div>

      <InlineNote size="micro" icon={<ShieldCheck size={15} strokeWidth={2} />} className={styles.fingerprint}>
        真实指纹默认开启 · 稳定种子随窗口保存
      </InlineNote>
    </Card>
  );
}
