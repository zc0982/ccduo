import { PanelsTopLeft, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, DescriptionList, Divider } from "@/components/ui";
import { PROXY_MODE_LABEL } from "@/lib/defaults";
import type { ProxyMode } from "@/lib/types";
import type { AddAccountFlow } from "./useAddAccountFlow";
import styles from "./AddAccount.module.css";

/** 25 · 等待浏览器登录 */
export function WaitingLogin({ flow }: { flow: AddAccountFlow }) {
  const navigate = useNavigate();
  return (
    <Card padding="lg" className={styles.status}>
      <PanelsTopLeft className={styles.statusIcon} size={36} strokeWidth={1.6} aria-hidden />
      <h2 className={styles.statusTitle}>请在浏览器中完成登录</h2>
      <p className={styles.statusText}>已请求打开关联窗口 {flow.browser.name}，前往 Claude 登录页。</p>
      <Divider className={styles.statusDivider} />
      <DescriptionList
        labelWidth={164}
        gap={26}
        valueSize="subtitle"
        items={[
          { label: "关联窗口", value: flow.browser.name },
          { label: "账号状态", value: <Badge tone="accent">等待登录</Badge> },
        ]}
      />
      <p className={styles.statusNote}>完成登录后，CCDuo 将更新此账号的身份状态。</p>
      <div className={styles.statusActions}>
        <Button variant="primary" className={styles.w176} loading={flow.submitting} onClick={flow.relaunch}>
          重新打开浏览器
        </Button>
        <button type="button" className={styles.textLink} onClick={flow.showFailure}>
          浏览器未打开？
        </button>
        <Button className={styles.backButton} onClick={() => navigate("/accounts")}>
          返回账号管理
        </Button>
      </div>
    </Card>
  );
}

/** 26 · 浏览器打开失败 */
export function LaunchFailed({ flow }: { flow: AddAccountFlow }) {
  const modes = Object.keys(PROXY_MODE_LABEL) as ProxyMode[];
  return (
    <Card padding="lg" className={styles.status}>
      <TriangleAlert className={styles.statusIconDanger} size={36} strokeWidth={1.6} aria-hidden />
      <h2 className={styles.statusTitle}>未能打开关联浏览器</h2>
      <p className={styles.statusText}>
        {flow.launchError && <span className={styles.errorText}>{flow.launchError}</span>}
        {flow.launchError && " "}
        账号信息和窗口配置已保留，可重试打开。
      </p>
      <Divider className={styles.statusDivider} />
      <DescriptionList
        labelWidth={164}
        gap={26}
        valueSize="subtitle"
        items={[
          { label: "关联窗口", value: flow.browser.name },
          { label: "排查建议", value: <span className={styles.adviceValue}>检查浏览器内核是否已安装，以及代理连接是否可用。</span> },
        ]}
      />
      <div className={styles.retry}>
        <Button variant="primary" className={styles.w176} loading={flow.submitting} onClick={flow.relaunch}>
          重试打开浏览器
        </Button>
      </div>
      <p className={styles.modeHint}>检查窗口设置 · 选择添加时使用的代理方式</p>
      <div className={styles.modeButtons}>
        {modes.map((mode) => (
          <Button key={mode} className={styles.w160} onClick={() => flow.editWindow(mode)}>
            {PROXY_MODE_LABEL[mode]}
          </Button>
        ))}
      </div>
    </Card>
  );
}
