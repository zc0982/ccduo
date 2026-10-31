import { cx } from "@/lib/cx";
import styles from "./Divider.module.css";

export function Divider({ vertical, className }: { vertical?: boolean; className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation={vertical ? "vertical" : "horizontal"}
      className={cx(vertical ? styles.vertical : styles.horizontal, className)}
    />
  );
}
