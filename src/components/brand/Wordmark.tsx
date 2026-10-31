import { DuoCards } from "./DuoCards";
import styles from "./Wordmark.module.css";

/** 侧栏品牌区：标志 + CCDuo 字标 + 副标题。 */
export function Wordmark({ tagline = "Claude Code Companion" }: { tagline?: string }) {
  return (
    <div className={styles.wordmark}>
      <div className={styles.lockup}>
        <DuoCards size={32} />
        <span className={styles.name}>CCDuo</span>
      </div>
      {tagline && <p className={styles.tagline}>{tagline}</p>}
    </div>
  );
}
