import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Card.module.css";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "article";
  /** Amber bar on the leading edge — marks the current item. */
  accent?: boolean;
  padding?: "none" | "md" | "lg";
}

/** 卡片：surface 底色，1 px 描边，12 px 圆角。 */
export function Card({ as: Tag = "section", accent, padding = "md", className, children, ...rest }: CardProps) {
  return (
    <Tag className={cx(styles.card, styles[`pad-${padding}`], accent && styles.accent, className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  aside,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx(styles.header, className)}>
      <div className={styles.headerText}>
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {aside && <div className={styles.aside}>{aside}</div>}
    </header>
  );
}
