import { UserRound } from "lucide-react";
import { Badge, Button, IconTile, Spinner } from "@/components/ui";
import { proxyLabel } from "@/lib/proxy";
import type { Account, PoolProxy } from "@/lib/types";
import { cx } from "@/lib/cx";
import styles from "./AccountTable.module.css";

function identityLabel(account: Account): string {
  return account.identity ? `身份 · ${account.identity.label}` : account.status === "pendingLogin" ? "等待登录" : "空身份";
}

export function AccountTable({
  accounts,
  proxies,
  currentId,
  busyId,
  loading,
  onSwitch,
}: {
  accounts: readonly Account[];
  proxies: readonly PoolProxy[];
  currentId: string;
  busyId: string | null;
  loading: boolean;
  onSwitch: (id: string) => void;
}) {
  return (
    <div className={styles.table} role="table" aria-label="我的账号">
      <div className={cx(styles.row, styles.head)} role="row">
        <span role="columnheader">账号 / 独立身份</span>
        <span role="columnheader">代理配置</span>
        <span role="columnheader">浏览器窗口</span>
        <span role="columnheader">操作</span>
      </div>

      {loading && (
        <div className={styles.placeholder}>
          <Spinner label="正在读取账号" />
        </div>
      )}

      {accounts.map((account) => {
        const current = account.id === currentId;
        return (
          <div key={account.id} className={styles.row} role="row" aria-current={current || undefined}>
            <div className={styles.account} role="cell">
              <IconTile tone={current ? "accent" : "neutral"}>
                <UserRound size={18} strokeWidth={1.6} />
              </IconTile>
              <div className={styles.accountText}>
                <span className={styles.name}>{account.name}</span>
                <span className={cx(styles.sub, account.status === "pendingLogin" && styles.pending)}>{identityLabel(account)}</span>
              </div>
            </div>
            <span role="cell" className={styles.value}>
              {proxyLabel(account.proxy, proxies)}
            </span>
            <span role="cell" className={cx(styles.value, styles.muted)}>
              {account.browser?.name ?? "未创建"}
            </span>
            <span role="cell" className={styles.action}>
              {current ? (
                <Badge tone="accent">当前使用</Badge>
              ) : (
                <Button variant="ghost" className={styles.switch} loading={busyId === account.id} disabled={!!busyId} onClick={() => onSwitch(account.id)}>
                  切换
                </Button>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
