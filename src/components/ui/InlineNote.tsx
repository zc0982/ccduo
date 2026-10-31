import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./InlineNote.module.css";

/** 带图标的单行说明（安全提示、清理警告等）。 */
export function InlineNote({
  icon,
  tone = "muted",
  size = "small",
  children,
  className,
}: {
  icon?: ReactNode;
  tone?: "muted" | "accent" | "danger" | "success";
  size?: "small" | "micro";
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx(styles.note, styles[tone], styles[size], className)}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </p>
  );
}
