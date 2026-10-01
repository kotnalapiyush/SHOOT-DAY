import React from 'react';

export interface ShootLobbyLogoProps {
  className?: string;
  variant?: 'lockup' | 'icon' | 'wordmark' | 'app-icon';
  theme?: 'green' | 'cream' | 'white' | 'coral';
  iconTheme?: 'green' | 'cream' | 'white' | 'coral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Shoot Lobby Official Brand Logo Component
 * Adheres strictly to the Shoot Lobby Brand Guidelines:
 * - Wordmark: "Shoot Lobby" set in Space Grotesk, weight 600, letter-spacing -0.01em.
 * - "Shoot" is plain. In "Lobby", the "o" is replaced by the aperture ring + center dot icon.
 * - Primary Brand Color: Forest Green #073B2F
 * - Secondary Dominant Neutral: Cream #F6F3EC / White #FFFFFF
 * - Accent: Coral Ember #FF6A45
 */
export const ShootLobbyLogo: React.FC<ShootLobbyLogoProps> = ({
  className = '',
  variant = 'lockup',
  theme = 'green',
  iconTheme = 'green',
  size = 'md',
  showSubtitle = false,
}) => {
  // Determine color hex
  const getColorHex = (t: string) => {
    switch (t) {
      case 'cream':
        return '#F6F3EC';
      case 'white':
        return '#FFFFFF';
      case 'coral':
        return '#FF6A45';
      case 'green':
      default:
        return '#073B2F';
    }
  };

  const textColor = getColorHex(theme);
  const markColor = getColorHex(iconTheme);

  // Sizing definitions
  const iconPixelSize =
    size === 'sm' ? 26 : size === 'lg' ? 44 : size === 'xl' ? 56 : 34;

  const wordmarkFontSize =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
      ? 'text-2xl sm:text-3xl'
      : size === 'xl'
      ? 'text-3xl sm:text-4xl'
      : 'text-xl sm:text-2xl';

  const ringInWordmarkSize =
    size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 17;

  // Standalone Icon Mark (32x32 viewBox from brand spec)
  const IconMark = (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: iconPixelSize, height: iconPixelSize }}
      className="shrink-0 select-none block transition-transform hover:scale-105"
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke={markColor}
        strokeWidth="3.4"
        strokeDasharray="1.2 4.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3.4" fill={markColor} />
    </svg>
  );

  // Wordmark without dot icon in the letter
  const Wordmark = (
    <span
      className={`inline-flex items-center font-['Space_Grotesk',sans-serif] font-bold tracking-tight select-none leading-none ${wordmarkFontSize}`}
      style={{ color: textColor }}
    >
      <span>Shoot&nbsp;Lobby</span>
    </span>
  );

  // App Icon variant: Forest Green rounded square with Cream ring + dot
  if (variant === 'app-icon') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 rounded-2xl bg-[#073B2F] p-2 shadow-xs select-none ${className}`}
        style={{ width: iconPixelSize + 10, height: iconPixelSize + 10 }}
        title="Shoot Lobby App Icon"
      >
        <svg
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
          aria-hidden="true"
        >
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="#F6F3EC"
            strokeWidth="3.4"
            strokeDasharray="1.2 4.2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="16" r="3.4" fill="#F6F3EC" />
        </svg>
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {IconMark}
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex flex-col leading-none select-none ${className}`}>
        {Wordmark}
        {showSubtitle && (
          <span className="font-sans text-[11px] text-[#5C6E5E] font-medium mt-1">
            Photographer Availability & Shoot Booking
          </span>
        )}
      </div>
    );
  }

  // Full Lockup: Icon mark on left, Wordmark on right
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none shrink-0 min-w-max ${className}`}
      title="Shoot Lobby"
    >
      <div className="shrink-0">{IconMark}</div>
      <div className="flex flex-col justify-center leading-none shrink-0 min-w-max">
        {Wordmark}
        {showSubtitle && (
          <span className="font-sans text-[11px] text-[#5C6E5E] font-medium mt-1">
            Photographer Availability & Shoot Booking
          </span>
        )}
      </div>
    </div>
  );
};

// Backwards compatibility alias
export const ShootDayLogo = ShootLobbyLogo;
export default ShootLobbyLogo;
