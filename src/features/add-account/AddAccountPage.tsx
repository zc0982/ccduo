import { useNavigate } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Button, Stepper } from "@/components/ui";
import { BasicSettingsPanel } from "./BasicSettingsPanel";
import { ConfirmStep } from "./ConfirmStep";
import { LaunchFailed, WaitingLogin } from "./LaunchStatus";
import { useAddAccountFlow } from "./useAddAccountFlow";
import { WindowProxyPanel } from "./WindowProxyPanel";
import styles from "./AddAccount.module.css";

const STEPS = ["关联浏览器窗口", "添加账号"] as const;

/** 06 · 分步添加账号：关联窗口 → 确认 → 等待登录 / 打开失败 */
export function AddAccountPage() {
  const navigate = useNavigate();
  const flow = useAddAccountFlow();
  const { phase } = flow;

  const footer =
    phase === "window"
      ? {
          divider: true,
          note: "窗口设置将随账号保留。",
          actions: (
            <>
              <Button className={styles.w112} onClick={() => navigate("/accounts")}>
                取消
              </Button>
              <Button variant="primary" className={styles.w152} onClick={flow.goConfirm}>
                下一步
              </Button>
            </>
          ),
        }
      : phase === "confirm"
        ? {
            divider: true,
            note: "添加后将自动打开关联浏览器，前往 Claude 登录。",
            actions: (
              <>
                <Button className={styles.w112} disabled={flow.submitting} onClick={() => flow.editWindow()}>
                  上一步
                </Button>
                <Button variant="primary" className={styles.w152} loading={flow.submitting} onClick={() => void flow.submit()}>
                  添加账号
                </Button>
              </>
            ),
          }
        : phase === "waiting"
          ? { note: "当前展示等待登录状态，不代表已登录成功。" }
          : undefined;

  return (
    <Page
      crumbs={[{ label: "个人工作区", to: "/workspace" }, { label: "账号管理", to: "/accounts" }, { label: "添加账号" }]}
      title="添加账号"
      subtitle="先关联浏览器窗口，再登录本人的 Claude 账号。"
      footer={footer}
    >
      <Stepper steps={STEPS} current={phase === "window" ? 0 : 1} className={styles.stepper} />

      <div key={phase} className={styles.stage}>
        {phase === "window" && (
          <form
            className={styles.windowGrid}
            onSubmit={(e) => {
              e.preventDefault();
              flow.goConfirm();
            }}
            noValidate
          >
            <WindowProxyPanel flow={flow} />
            <BasicSettingsPanel flow={flow} />
          </form>
        )}
        {phase === "confirm" && <ConfirmStep flow={flow} />}
        {phase === "waiting" && <WaitingLogin flow={flow} />}
        {phase === "failed" && <LaunchFailed flow={flow} />}
      </div>
    </Page>
  );
}
