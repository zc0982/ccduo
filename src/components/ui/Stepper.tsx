import { Check } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./Stepper.module.css";

export interface StepperProps {
  steps: readonly string[];
  /** Zero-based index of the active step. */
  current: number;
  className?: string;
}

/** 分步指示：完成（绿色对勾）· 进行中（琥珀）· 未开始（灰）。 */
export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol className={cx(styles.stepper, className)}>
      {steps.map((label, index) => {
        const state = index < current ? "done" : index === current ? "current" : "upcoming";
        return (
          <li key={label} className={cx(styles.step, styles[state])} aria-current={state === "current" ? "step" : undefined}>
            <span className={styles.marker}>
              {state === "done" ? <Check size={16} strokeWidth={2.4} aria-label="已完成" /> : index + 1}
            </span>
            <span className={styles.label}>{label}</span>
            {index < steps.length - 1 && <span className={styles.connector} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
