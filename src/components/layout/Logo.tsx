/** Marca "99" em SVG, no quadrado amarelo arredondado. */
export function Logo({ size = 40, decorative = true }: { size?: number; decorative?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : "99"}
      className="shrink-0"
    >
      <rect width="40" height="40" rx="11" fill="#FFDD00" />
      <text
        x="20"
        y="27.5"
        textAnchor="middle"
        fontFamily="var(--font-montserrat), Montserrat, ui-sans-serif, system-ui, sans-serif"
        fontSize="20"
        fontWeight="800"
        letterSpacing="-1"
        fill="#212121"
      >
        99
      </text>
    </svg>
  );
}
