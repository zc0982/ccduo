/**
 * CCDuo 标志 · Duo Cards
 * 两张叠合的卡片，代表 Claude 与搭档；暖白、琥珀与深色交集。
 */
export function DuoCards({ size = 32, title }: { size?: number; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="23.784" height="23.784" rx="5.045" fill="var(--color-text)" />
      <rect x="8.216" y="8.216" width="23.784" height="23.784" rx="5.045" fill="var(--color-accent)" />
      <path
        d="M13.261 8.216H23.784V18.739A5.045 5.045 0 0 1 18.739 23.784H8.216V13.261A5.045 5.045 0 0 1 13.261 8.216Z"
        fill="var(--color-sunken)"
      />
    </svg>
  );
}

/** App icon：深色底板上的 Duo Cards，用于 128 / 64 / 32 / 16 px。 */
export function AppIcon({ size = 128, title = "CCDuo" }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128" fill="none" role="img" aria-label={title}>
      <rect x="12.5" y="12.5" width="103" height="103" rx="23.125" fill="var(--color-logo-plate)" />
      <rect x="36.25" y="36.25" width="41.25" height="41.25" rx="8.75" fill="var(--color-text)" />
      <rect x="50.5" y="50.5" width="41.25" height="41.25" rx="8.75" fill="var(--color-accent)" />
      <path
        d="M59.25 50.5H77.5V68.75A8.75 8.75 0 0 1 68.75 77.5H50.5V59.25A8.75 8.75 0 0 1 59.25 50.5Z"
        fill="var(--color-logo-plate)"
      />
    </svg>
  );
}
