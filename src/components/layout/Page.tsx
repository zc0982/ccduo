import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { isTauri } from "@/lib/api";
import { cx } from "@/lib/cx";
import styles from "./Page.module.css";

export interface Crumb {
  label: string;
  to?: string;
}

export interface PageProps {
  crumbs: Crumb[];
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Bottom bar: note on the left, actions on the right. */
  footer?: { note?: ReactNode; actions?: ReactNode; divider?: boolean };
  children: ReactNode;
  className?: string;
}

/** Page frame: top bar with breadcrumbs, page header, scrollable body and footer bar. */
export function Page({ crumbs, title, subtitle, actions, footer, children, className }: PageProps) {
  return (
    <div className={styles.frame}>
      <header className={styles.topbar} data-tauri-drag-region>
        <nav aria-label="面包屑" className={styles.crumbs}>
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <Fragment key={crumb.label}>
                {index > 0 && (
                  <span className={styles.sep} aria-hidden>
                    /
                  </span>
                )}
                {crumb.to && !last ? (
                  <Link to={crumb.to} className={styles.crumb}>
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cx(styles.crumb, last && styles.current)} aria-current={last ? "page" : undefined}>
                    {crumb.label}
                  </span>
                )}
              </Fragment>
            );
          })}
        </nav>
        <span className={styles.env} title={isTauri ? "CCDuo 桌面端" : "浏览器预览（演示数据）"}>
          {isTauri ? "本机环境" : "预览环境"}
        </span>
      </header>

      <div className={styles.scroll}>
        <div className={cx(styles.page, className)}>
          <div className={styles.header}>
            <div className={styles.headings}>
              <h1 className={styles.title}>{title}</h1>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {actions && <div className={styles.actions}>{actions}</div>}
          </div>

          <div className={styles.body}>{children}</div>

          {footer && (
            <footer className={cx(styles.footer, footer.divider && styles.footerDivider)}>
              <p className={styles.footerNote}>{footer.note}</p>
              {footer.actions && <div className={styles.footerActions}>{footer.actions}</div>}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
