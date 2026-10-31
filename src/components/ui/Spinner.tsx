import { LoaderCircle } from "lucide-react";
import styles from "./Spinner.module.css";

export function Spinner({ size = 16, label }: { size?: number; label?: string }) {
  return (
    <span className={styles.spinner} role={label ? "status" : undefined} aria-label={label}>
      <LoaderCircle size={size} strokeWidth={2} aria-hidden />
    </span>
  );
}
