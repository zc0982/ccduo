import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./DescriptionList.module.css";

export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
  /** Value not yet known (e.g. 尚未检测). */
  muted?: boolean;
  mono?: boolean;
}

/** 键值列表：左侧灰色标签，右侧正文。 */
export function DescriptionList({
  items,
  labelWidth = 144,
  gap = 26,
  valueSize = "body",
  className,
}: {
  items: readonly DescriptionItem[];
  labelWidth?: number;
  gap?: number;
  valueSize?: "body" | "subtitle";
  className?: string;
}) {
  return (
    <dl
      className={cx(styles.list, styles[valueSize], className)}
      style={{ "--dl-label": `${labelWidth}px`, "--dl-gap": `${gap}px` } as CSSProperties}
    >
      {items.map((item, index) => (
        <div key={index} className={styles.row}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={cx(styles.value, item.muted && styles.muted, item.mono && styles.mono)}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
