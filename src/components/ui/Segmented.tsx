import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Segmented.module.css";

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "md" | "sm";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  style?: CSSProperties;
}

/** 分段选择：等宽选项，选中项使用琥珀描边与文字。 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
  className,
  style,
  ...aria
}: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (event: KeyboardEvent, from: number) => {
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    for (let step = 1; step <= options.length; step++) {
      const next = (from + delta * step + options.length) % options.length;
      if (!options[next].disabled) {
        onChange(options[next].value);
        refs.current[next]?.focus();
        return;
      }
    }
  };

  return (
    <div role="radiogroup" className={cx(styles.group, styles[size], className)} style={style} {...aria}>
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            disabled={option.disabled}
            className={cx(styles.option, selected && styles.selected)}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => move(event, index)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
