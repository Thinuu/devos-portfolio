interface TULogoProps {
  variant?: 'main' | 'compact' | 'footer';
  animated?: boolean;
  className?: string;
}

export default function TULogo({
  variant = 'main',
  animated = false,
  className = '',
}: TULogoProps) {
  return (
    <span className={`tu-logo ${variant}${animated ? ' is-animated' : ''} ${className}`.trim()}>
      <svg
        className="tu-monogram"
        viewBox="0 0 72 48"
        role="img"
        aria-label="TU"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path className="tu-letter" d="M4 6h25v6h-9.5v29h-6V12H4z" />
        <path className="tu-letter" d="M34 6h6v21c0 7.3 2.5 10.6 7.5 10.6S55 34.3 55 27V6h6v21c0 11-4.6 16.3-13.5 16.3S34 38 34 27z" />
        <circle className="tu-accent" cx="67" cy="38" r="3" />
      </svg>
    </span>
  );
}
