import { useId, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./FormRow.module.css";

export interface FormRowProps {
  label: ReactNode;
  /** Renders `children(id)` so the control can carry the label association. */
  children: ReactNode | ((id: string) => ReactNode);
  hint?: ReactNode;
  error?: ReactNode;
  /** `inline` = label column on the left; `stacked` = label above control. */
  layout?: "inline" | "stacked";
  labelWidth?: number;
  className?: string;
}

export function FormRow({ label, children, hint, error, layout = "inline", labelWidth, className }: FormRowProps) {
  const id = useId();
  const messageId = `${id}-msg`;
  return (
    <div
      className={cx(styles.row, styles[layout], className)}
      style={labelWidth ? ({ "--label-width": `${labelWidth}px` } as CSSProperties) : undefined}
    >
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <div className={styles.control} aria-describedby={hint || error ? messageId : undefined}>
        {typeof children === "function" ? children(id) : children}
        {error ? (
          <p id={messageId} className={cx(styles.message, styles.error)} role="alert">
            {error}
          </p>
        ) : (
          hint && (
            <p id={messageId} className={styles.message}>
              {hint}
            </p>
          )
        )}
      </div>
    </div>
  );
}
