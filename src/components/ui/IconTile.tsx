import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./IconTile.module.css";

/** 图标底座：账号头像（36 px）与身份图块（56 px）。 */
export function IconTile({
  size = 36,
  tone = "neutral",
  bordered,
  children,
  className,
}: {
  size?: 36 | 56;
  tone?: "neutral" | "accent";
  bordered?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx(styles.tile, styles[`s${size}`], styles[tone], bordered && styles.bordered, className)} aria-hidden>
      {children}
    </span>
  );
}
