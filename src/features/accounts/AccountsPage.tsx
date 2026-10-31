import { useState } from "react";
import { Check, CircleSlash, Folder, Plus, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Page } from "@/components/layout/Page";
import { Badge, Button, Card, IconTile, InlineNote } from "@/components/ui";
import { api, errorMessage, isTauri } from "@/lib/api";
import { proxyLabel } from "@/lib/proxy";
import { useAppData } from "@/lib/store";
import { AccountTable } from "./AccountTable";
import styles from "./AccountsPage.module.css";

export function AccountsPage() {
  const navigate = useNavigate();
  const { snapshot, currentAccount, setSnapshot, putAccount, loadError, refresh } = useAppData();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const switchTo = async (id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      setSnapshot(await api.switchAccount(id));
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  /** 关联本人身份：open the current account's window at the Claude login page. */
  const linkIdentity = async () => {
    if (!currentAccount) return;
    if (!currentAccount.browser) {
      navigate("/accounts/new");
      return;
    }
    setBusyId(currentAccount.id);
    setActionError(null);
    try {
      putAccount(await api.launchBrowser(currentAccount.id));
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const accounts = snapshot?.accounts ?? [];

  return (
    <Page
      crumbs={[{ label: "个人工作区", to: "/workspace" }, { label: "账号管理" }]}
      title="账号管理"
      subtitle="每个账号使用独立身份，工作区内容持续保留。"
      actions={
        <Button variant="primary" icon={<Plus strokeWidth={2} />} onClick={() => navigate("/accounts/new")} className={styles.addButton}>
          添加账号
        </Button>
      }
      footer={{ note: isTauri ? "账号数据仅保存在本机。" : "所有账号与检测数值均为设计演示" }}
    >
      {loadError && (
        <Card className={styles.loadError}>
          <InlineNote tone="danger">读取账号失败：{loadError}</InlineNote>
          <Button size="sm" onClick={() => void refresh()}>
            重试
          </Button>
        </Card>
      )}

      {/* 当前身份 */}
      <Card className={styles.current} aria-label="当前账号">
        <IconTile size={56} bordered tone={currentAccount?.identity ? "accent" : "neutral"}>
          {currentAccount?.identity ? <UserRound size={28} strokeWidth={1.6} /> : <CircleSlash size={28} strokeWidth={1.6} />}
        </IconTile>
        <div className={styles.currentText}>
          <p className={styles.eyebrow}>当前账号 · {currentAccount?.name ?? "—"}</p>
          <p className={styles.identityName}>{currentAccount?.identity?.label ?? "空身份"}</p>
          <p className={styles.identityHint}>
            {currentAccount?.identity
              ? `已关联 Claude 身份 · 代理：${proxyLabel(currentAccount.proxy, snapshot?.proxies ?? [])}`
              : currentAccount?.status === "pendingLogin"
                ? "等待在关联浏览器中完成 Claude 登录。"
                : "尚未关联 Claude 身份；新的账号从空身份开始。"}
          </p>
        </div>
        <Badge tone="accent" className={styles.currentBadge}>
          当前使用
        </Badge>
        {!currentAccount?.identity && (
          <Button className={styles.linkButton} loading={busyId === currentAccount?.id} onClick={() => void linkIdentity()}>
            关联本人身份
          </Button>
        )}
      </Card>

      {/* 我的账号 */}
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>我的账号</h2>
        <span className={styles.count}>{accounts.length} 个账号</span>
      </div>
      {actionError && (
        <InlineNote tone="danger" className={styles.actionError}>
          {actionError}
        </InlineNote>
      )}
      <AccountTable
        accounts={accounts}
        proxies={snapshot?.proxies ?? []}
        currentId={snapshot?.currentAccountId ?? ""}
        busyId={busyId}
        loading={!snapshot && !loadError}
        onSwitch={(id) => void switchTo(id)}
      />

      {/* 工作区保持不变 */}
      <section className={styles.workspace} aria-label="工作区">
        <div className={styles.workspaceIntro}>
          <h2 className={styles.workspaceTitle}>
            <Folder size={26} strokeWidth={1.6} aria-hidden />
            个人工作区
          </h2>
          <p className={styles.workspaceHint}>身份切换后，仍保留熟悉的工具和记录。</p>
        </div>
        <ul className={styles.keeps}>
          {["Skills 与命令 · 插件 · MCP", "个人设置 · 项目记录 · 会话历史", "缓存与日志"].map((item) => (
            <li key={item}>
              <Check size={16} strokeWidth={2} aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <Button className={styles.workspaceButton} onClick={() => navigate("/workspace")}>
          查看工作区
        </Button>
      </section>

      <InlineNote icon={<ShieldCheck size={20} strokeWidth={1.6} />} className={styles.note}>
        身份与工作区分开管理。切换账号前，可先检查对应的网络与浏览器窗口。
      </InlineNote>
    </Page>
  );
}
