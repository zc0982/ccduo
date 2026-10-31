import { PanelsTopLeft, UserRound } from "lucide-react";
import { Button, Card, CardHeader, DescriptionList, Divider, FormRow, InlineNote, TextInput } from "@/components/ui";
import { ENGINE_LABEL, OS_LABEL, PROXY_MODE_LABEL } from "@/lib/defaults";
import { proxyLabel } from "@/lib/proxy";
import { toProxyConfig, type AddAccountFlow } from "./useAddAccountFlow";
import styles from "./AddAccount.module.css";

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/** Step 2 · 添加账号：账号名称 + 关联窗口摘要。 */
export function ConfirmStep({ flow }: { flow: AddAccountFlow }) {
  const { browser, proxy, proxies, accountName, setAccountName, accountNameError, startupUrlsText, submitError } = flow;
  const urls = startupUrlsText.split(/\r?\n/).map((u) => u.trim()).filter(Boolean);
  const config = toProxyConfig(proxy);
  const proxyDetail = proxy.mode === "system" ? PROXY_MODE_LABEL.system : `${PROXY_MODE_LABEL[proxy.mode]} · ${proxyLabel(config, proxies)}`;
  const matchByIp = browser.language === "ip" && browser.timezone === "ip";

  return (
    <div className={styles.confirm}>
      <Card className={styles.accountCard}>
        <CardHeader title="账号信息" description="账号身份与浏览器窗口一一关联。" />
        <FormRow layout="stacked" label="账号名称" error={accountNameError} className={styles.nameRow}>
          {(id) => (
            <TextInput
              id={id}
              size="lg"
              autoFocus
              maxLength={40}
              value={accountName}
              invalid={!!accountNameError}
              onChange={(e) => setAccountName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !flow.submitting) void flow.submit();
              }}
            />
          )}
        </FormRow>
        <Divider className={styles.accountDivider} />
        <div className={styles.feature}>
          <UserRound className={styles.featureIcon} size={24} strokeWidth={1.8} aria-hidden />
          <div>
            <p className={styles.featureTitle}>从空身份开始</p>
            <p className={styles.featureText}>登录成功后，关联本人的 Claude 身份。</p>
          </div>
        </div>
        <p className={styles.passwordNote}>无需在 CCDuo 中填写 Claude 密码。</p>
        {submitError && (
          <InlineNote tone="danger" className={styles.submitError}>
            保存失败：{submitError}
          </InlineNote>
        )}
      </Card>

      <aside className={styles.summary} aria-label="关联的浏览器窗口">
        <h2 className={styles.summaryTitle}>关联的浏览器窗口</h2>
        <p className={styles.windowName}>{browser.name}</p>
        <DescriptionList
          gap={29}
          items={[
            { label: "代理 IP", value: proxyDetail },
            { label: "系统 / 内核", value: `${OS_LABEL[browser.os]} / ${ENGINE_LABEL[browser.engine]}` },
            { label: "语言 / 时区", value: matchByIp ? "基于 IP 匹配" : "自定义" },
            { label: "启动网页", value: urls.length > 1 ? `${hostOf(urls[0])} 等 ${urls.length} 个` : hostOf(urls[0] ?? "") },
          ]}
        />
        <Divider className={styles.summaryDivider} />
        <p className={styles.summaryFeature}>
          <PanelsTopLeft size={22} strokeWidth={1.8} aria-hidden />
          在关联浏览器中完成登录
        </p>
        <p className={styles.featureText}>点击“添加账号”后，自动打开该窗口并跳转至 Claude 登录页。</p>
        <Button className={styles.editWindow} onClick={() => flow.editWindow()}>
          修改窗口设置
        </Button>
      </aside>
    </div>
  );
}
