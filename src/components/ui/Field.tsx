import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./Field.module.css";

type FieldSize = "md" | "lg";

interface FieldStyleProps {
  size?: FieldSize;
  invalid?: boolean;
  mono?: boolean;
}

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & FieldStyleProps;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { size = "md", invalid, mono, className, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cx(styles.field, styles[size], invalid && styles.invalid, mono && styles.mono, className)}
      aria-invalid={invalid || undefined}
      spellCheck={false}
      autoComplete="off"
      {...rest}
    />
  );
});

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & Omit<FieldStyleProps, "size">;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { invalid, mono, className, rows = 2, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cx(styles.field, styles.textarea, invalid && styles.invalid, mono && styles.mono, className)}
      aria-invalid={invalid || undefined}
      spellCheck={false}
      {...rest}
    />
  );
});

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> &
  FieldStyleProps & {
    options: readonly SelectOption[];
    placeholder?: string;
    wrapperClassName?: string;
  };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = "md", invalid, mono, options, placeholder, className, wrapperClassName, value, ...rest },
  ref,
) {
  return (
    <span className={cx(styles.selectWrap, wrapperClassName)}>
      <select
        ref={ref}
        value={value}
        className={cx(
          styles.field,
          styles.select,
          styles[size],
          invalid && styles.invalid,
          mono && styles.mono,
          value === "" && styles.placeholder,
          className,
        )}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className={styles.chevron} size={16} strokeWidth={2} aria-hidden />
    </span>
  );
});

/** Field with a trailing control (e.g. 刷新 URL + refresh button). */
export function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx(styles.group, className)}>{children}</div>;
}
