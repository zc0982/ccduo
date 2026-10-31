import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Spinner } from "./Spinner";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon, rendered at 16 px. */
  icon?: ReactNode;
  /** Square button that only shows `icon`; pass `aria-label`. */
  iconOnly?: boolean;
  loading?: boolean;
  block?: boolean;
}

/** 主要操作 / 次要操作 / 轻量操作 / 破坏性操作 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "secondary",
    size = "md",
    icon,
    iconOnly = false,
    loading = false,
    block = false,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        iconOnly && styles.iconOnly,
        block && styles.block,
        loading && styles.loading,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : icon && <span className={styles.icon}>{icon}</span>}
      {!iconOnly && children}
    </button>
  );
});
