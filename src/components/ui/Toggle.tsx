import { cx } from "@/lib/cx";
import styles from "./Toggle.module.css";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
  id?: string;
}

export function Toggle({ checked, onChange, disabled, id, ...aria }: ToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cx(styles.track, checked && styles.on)}
      onClick={() => onChange(!checked)}
      {...aria}
    >
      <span className={styles.thumb} />
    </button>
  );
}
