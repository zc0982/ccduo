import { Monitor, RefreshCw } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  DescriptionList,
  Divider,
  FieldGroup,
  FormRow,
  Segmented,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui";
import { PROXY_MODE_LABEL } from "@/lib/defaults";
import type { IpChecker, IpVersion, ProxyMode, ProxyProtocol } from "@/lib/types";
import { ConnectionStatus, connectionText } from "./ConnectionStatus";
import type { AddAccountFlow } from "./useAddAccountFlow";
import styles from "./AddAccount.module.css";

const MODE_OPTIONS = (Object.keys(PROXY_MODE_LABEL) as ProxyMode[]).map((value) => ({ value, label: PROXY_MODE_LABEL[value] }));
const PROTOCOLS = [
  { value: "socks5", label: "SOCKS5" },
  { value: "http", label: "HTTP" },
  { value: "https", label: "HTTPS" },
];
const CHECKERS = [
  { value: "ip2location", label: "IP2Location" },
  { value: "ipinfo", label: "IPinfo" },
  { value: "ipapi", label: "ip-api" },
];

/** 窗口与代理：浏览器名称 + 代理 IP（跟随系统 / 添加代理IP / 选择代理）。 */
export function WindowProxyPanel({ flow }: { flow: AddAccountFlow }) {
  const { proxy, setProxy, browser, setBrowser, errors, test } = flow;

  return (
    <Card className={styles.panel}>
      <CardHeader title="窗口与代理" />

      <FormRow label="浏览器名称" hint="* 系统自动生成窗口名称，也可手动修改。" error={errors.name} className={styles.firstRow}>
        {(id) => (
          <TextInput
            id={id}
            value={browser.name}
            invalid={!!errors.name}
            maxLength={40}
            onChange={(e) => setBrowser((b) => ({ ...b, name: e.target.value }))}
          />
        )}
      </FormRow>

      <div className={styles.modeBlock}>
        <span id="proxy-mode-label" className={styles.stackLabel}>
          代理 IP
        </span>
        <Segmented
          size="md"
          aria-labelledby="proxy-mode-label"
          options={MODE_OPTIONS}
          value={proxy.mode}
          onChange={(mode) => setProxy((p) => ({ ...p, mode }))}
        />
      </div>

      <div key={proxy.mode} className={styles.modeBody}>
        {proxy.mode === "system" && <SystemMode flow={flow} />}
        {proxy.mode === "custom" && <CustomMode flow={flow} />}
        {proxy.mode === "pool" && <PoolMode flow={flow} />}
      </div>
      <span className="visually-hidden" aria-live="polite">
        {connectionText(test)}
      </span>
    </Card>
  );
}

function SystemMode({ flow }: { flow: AddAccountFlow }) {
  return (
    <>
      <div className={styles.feature}>
        <Monitor className={styles.featureIcon} size={24} strokeWidth={2} aria-hidden />
        <div>
          <p className={styles.featureTitle}>使用当前系统网络</p>
          <p className={styles.featureText}>浏览器窗口跟随系统连接，无需额外填写代理。</p>
        </div>
      </div>
      <Divider className={styles.modeDivider} />
      <DescriptionList
        gap={25}
        items={[
          { label: "代理来源", value: "系统网络设置" },
          { label: "语言与时区", value: "根据实际出口 IP 匹配" },
          { label: "连接检测", value: <ConnectionStatus test={flow.test} />, muted: flow.test.status === "idle" },
        ]}
      />
      <div className={styles.testRow}>
        <Button className={styles.w112} loading={flow.test.status === "testing"} onClick={() => void flow.runTest()}>
          测试连接
        </Button>
        <span className={styles.micro}>切换系统网络后，建议重新检测。</span>
      </div>
    </>
  );
}

function CustomMode({ flow }: { flow: AddAccountFlow }) {
  const { proxy, updateCustom, applyPaste, errors, test, refresh } = flow;
  const c = proxy.custom;
  const hostPortError = errors.host || errors.port;

  return (
    <div className={styles.customRows}>
      <FormRow label="智能识别" error={errors.paste}>
        {(id) => (
          <TextArea
            id={id}
            rows={2}
            className={styles.paste}
            value={proxy.paste}
            invalid={!!errors.paste}
            placeholder={"粘贴 host:port:username:password\n或 username:password@host:port"}
            onChange={(e) => applyPaste(e.target.value)}
          />
        )}
      </FormRow>

      <FormRow label="代理 IP 类型">
        <Segmented<IpVersion>
          aria-label="代理 IP 类型"
          className={styles.w216}
          options={[
            { value: "ipv4", label: "IPv4" },
            { value: "ipv6", label: "IPv6" },
          ]}
          value={c.ipVersion}
          onChange={(ipVersion) => updateCustom({ ipVersion })}
        />
      </FormRow>

      <FormRow label="代理 IP 信息" error={hostPortError}>
        {(id) => (
          <div className={styles.hostRow}>
            <Select
              aria-label="协议"
              options={PROTOCOLS}
              value={c.protocol}
              onChange={(e) => updateCustom({ protocol: e.target.value as ProxyProtocol })}
            />
            <TextInput
              id={id}
              placeholder="代理主机"
              value={c.host}
              invalid={!!errors.host}
              onChange={(e) => updateCustom({ host: e.target.value })}
            />
            <TextInput
              aria-label="端口"
              placeholder="端口"
              inputMode="numeric"
              value={c.port ?? ""}
              invalid={!!errors.port}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
                updateCustom({ port: digits ? Number(digits) : null });
              }}
            />
          </div>
        )}
      </FormRow>

      <FormRow label="代理 IP 用户名">
        {(id) => <TextInput id={id} placeholder="选填，输入代理账号" value={c.username} onChange={(e) => updateCustom({ username: e.target.value })} />}
      </FormRow>

      <FormRow label="代理 IP 密码">
        {(id) => (
          <TextInput id={id} type="password" placeholder="选填，输入代理密码" value={c.password} onChange={(e) => updateCustom({ password: e.target.value })} />
        )}
      </FormRow>

      <FormRow
        label="刷新 URL"
        error={errors.refreshUrl || (!refresh.ok ? refresh.message : undefined)}
        hint={refresh.ok && refresh.message ? refresh.message : undefined}
      >
        {(id) => (
          <FieldGroup>
            <TextInput
              id={id}
              placeholder="动态代理专用，静态代理无需填写"
              value={c.refreshUrl}
              invalid={!!errors.refreshUrl}
              onChange={(e) => updateCustom({ refreshUrl: e.target.value })}
            />
            <Button
              size="sm"
              iconOnly
              icon={<RefreshCw />}
              aria-label="立即刷新代理 IP"
              title="立即刷新代理 IP"
              disabled={!c.refreshUrl.trim()}
              loading={refresh.busy}
              onClick={() => void flow.refreshIp()}
            />
          </FieldGroup>
        )}
      </FormRow>

      <FormRow
        label="代理 IP 检测"
        hint={
          <span className={styles.checkHint}>
            支持 SOCKS5 / HTTP / HTTPS · <ConnectionStatusInline flow={flow} />
          </span>
        }
      >
        {(id) => (
          <div className={styles.checkRow}>
            <Select id={id} options={CHECKERS} value={c.checker} onChange={(e) => updateCustom({ checker: e.target.value as IpChecker })} />
            <Button size="sm" loading={test.status === "testing"} onClick={() => void flow.runTest()}>
              测试代理 IP
            </Button>
          </div>
        )}
      </FormRow>
    </div>
  );
}

function ConnectionStatusInline({ flow }: { flow: AddAccountFlow }) {
  const { test } = flow;
  if (test.status !== "done") return <>{connectionText(test)}</>;
  return <span className={test.result.ok ? styles.ok : styles.bad}>{connectionText(test)}</span>;
}

function PoolMode({ flow }: { flow: AddAccountFlow }) {
  const { proxy, setProxy, proxies, errors, test } = flow;
  const selected = proxies.find((p) => p.id === proxy.poolProxyId);

  return (
    <>
      <FormRow label="已有代理 IP" error={errors.pool} hint="来自代理池管理，沿用已保存的连接配置。" className={styles.poolRow}>
        {(id) => (
          <Select
            id={id}
            options={proxies.map((p) => ({ value: p.id, label: `${p.name} · ${p.country} · ${p.protocol.toUpperCase()}` }))}
            placeholder={proxies.length ? "选择代理" : "代理池暂无代理"}
            value={selected ? proxy.poolProxyId : ""}
            invalid={!!errors.pool}
            disabled={!proxies.length}
            onChange={(e) => setProxy((p) => ({ ...p, poolProxyId: e.target.value }))}
          />
        )}
      </FormRow>
      <Divider className={styles.poolDivider} />
      <DescriptionList
        gap={25}
        items={[
          { label: "代理地址", value: selected ? `${selected.host}:${selected.port}` : "—", mono: !!selected, muted: !selected },
          {
            label: "出口地区",
            value: test.status === "done" && test.result.country ? `${selected?.countryName ?? ""} · 实测 ${test.result.country}` : (selected?.countryName ?? "—"),
            muted: !selected,
          },
          { label: "连接检测", value: <ConnectionStatus test={test} />, muted: test.status === "idle" },
        ]}
      />
      <div className={styles.poolTest}>
        <Button className={styles.w148} disabled={!selected} loading={test.status === "testing"} onClick={() => void flow.runTest()}>
          测试代理 IP
        </Button>
        <p className={styles.micro}>代理列表为空时，可切换至“添加代理IP”。</p>
      </div>
    </>
  );
}
