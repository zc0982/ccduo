import type { LucideIcon } from "lucide-react";
import { CircleHelp, Folder, Globe, Monitor, Network, PanelsTopLeft, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Wordmark } from "@/components/brand/Wordmark";
import { isTauri } from "@/lib/api";
import { cx } from "@/lib/cx";
import styles from "./Sidebar.module.css";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const ENVIRONMENT: NavItem[] = [
  { to: "/accounts", label: "账号管理", icon: UserRound },
  { to: "/proxies", label: "代理池管理", icon: Network },
  { to: "/network", label: "网络环境", icon: Globe },
  { to: "/windows", label: "浏览器窗口", icon: PanelsTopLeft },
  { to: "/system", label: "系统环境", icon: Monitor },
];

const GENERAL: NavItem[] = [
  { to: "/workspace", label: "工作区", icon: Folder },
  { to: "/help", label: "使用说明", icon: CircleHelp },
];

function NavList({ items }: { items: NavItem[] }) {
  return (
    <ul className={styles.list}>
      {items.map(({ to, label, icon: Icon }) => (
        <li key={to}>
          <NavLink to={to} className={({ isActive }) => cx(styles.item, isActive && styles.active)}>
            <Icon className={styles.icon} size={20} strokeWidth={1.6} aria-hidden />
            <span>{label}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* macOS draws native traffic lights here in Tauri (titleBarStyle: Overlay). */}
      <div className={styles.titlebar} data-tauri-drag-region>
        {!isTauri && (
          <span className={styles.lights} aria-hidden>
            <i />
            <i />
            <i />
          </span>
        )}
      </div>

      <div className={styles.brand} data-tauri-drag-region>
        <Wordmark />
      </div>

      <nav className={styles.nav} aria-label="主导航">
        <div className={styles.divider} />
        <p className={styles.sectionLabel}>环境管理</p>
        <NavList items={ENVIRONMENT} />
        <div className={cx(styles.divider, styles.dividerGap)} />
        <NavList items={GENERAL} />
      </nav>

      <footer className={styles.footer}>
        <div className={styles.workspace}>
          <p className={styles.workspaceName}>
            <Folder size={18} strokeWidth={1.6} aria-hidden />
            个人工作区
          </p>
          <p className={styles.meta}>本地保存 · 始终保留</p>
        </div>
        <NavLink to="/design" className={styles.meta}>
          CCDuo&nbsp;&nbsp;/&nbsp;&nbsp;Desktop
        </NavLink>
      </footer>
    </aside>
  );
}
