import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Badge.module.css";

export type BadgeTone = "accent" | "success" | "neutral" | "danger";

/** 状态标签：同时使用文字与颜色表达状态（检测通过 / 需要处理 / 未运行）。 */
export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx(styles.badge, styles[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
