import React from 'react';

export interface ShootLobbyLogoProps {
  className?: string;
  variant?: 'exact' | 'wordmark' | 'stacked' | 'one-line' | 'transparent-white' | 'transparent-green' | 'camera' | 'icon' | 'app-icon';
  theme?: 'green' | 'white' | 'transparent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Shoot Lobby Official Brand Logo Component
 * Uses the exact official brand logo asset provided in Artboard 5 (/assets/aistudio/Artboard_5_75f46eec.png):
 * - "Shoot Lobby" as it is: official typography & camera mark on the Lobby Green rounded tile
 */
export const ShootLobbyLogo: React.FC<ShootLobbyLogoProps> = ({
  className = '',
  variant = 'exact',
  theme = 'green',
  size = 'md',
  showSubtitle = false,
}) => {
  // Height classes by size
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-14 sm:h-[68px]',
    xl: 'h-20 sm:h-24',
  }[size] || 'h-11 sm:h-12';

  // Standalone Camera Icon variant
  if (variant === 'camera' || variant === 'icon') {
    const iconHeights = {
      sm: 'h-6 w-6',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    }[size] || 'h-8 w-8';

    return (
      <img
        src="/assets/shoot-lobby-camera-mark.png"
        alt="Shoot Lobby Mark"
        className={`object-contain select-none inline-block shrink-0 ${iconHeights} ${className}`}
        draggable={false}
      />
    );
  }

  // App Icon variant (square tile)
  if (variant === 'app-icon') {
    const iconSizes = {
      sm: 'h-8 w-8 rounded-xl',
      md: 'h-11 w-11 rounded-2xl',
      lg: 'h-16 w-16 rounded-3xl',
      xl: 'h-24 w-24 rounded-3xl',
    }[size] || 'h-11 w-11 rounded-2xl';

    return (
      <div className={`bg-[#33684C] flex items-center justify-center p-2 shadow-xs select-none shrink-0 ${iconSizes} ${className}`}>
        <img
          src="/assets/shoot-lobby-camera-mark.png"
          alt="Shoot Lobby App Icon"
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
    );
  }

  // Transparent Green Letters variant
  if (variant === 'transparent-green') {
    return (
      <div className={`inline-flex flex-col select-none shrink-0 ${className}`}>
        <img
          src="/assets/shoot-lobby-logo-green-transparent.png"
          alt="Shoot Lobby"
          className={`${heightClasses} w-auto object-contain select-none shrink-0`}
          draggable={false}
        />
        {showSubtitle && (
          <span className="font-sans text-[11px] text-[#5C6E5E] font-medium tracking-normal mt-1 leading-tight">
            Photographer Availability & Shoot Booking
          </span>
        )}
      </div>
    );
  }

  // Transparent White Letters variant (for dark containers)
  if (variant === 'transparent-white') {
    return (
      <div className={`inline-flex flex-col select-none shrink-0 ${className}`}>
        <img
          src="/assets/shoot-lobby-logo-white-transparent.png"
          alt="Shoot Lobby"
          className={`${heightClasses} w-auto object-contain select-none shrink-0`}
          draggable={false}
        />
        {showSubtitle && (
          <span className="font-sans text-[11px] text-[#E3EEE7] font-medium tracking-normal mt-1 leading-tight">
            Photographer Availability & Shoot Booking
          </span>
        )}
      </div>
    );
  }

  // EXACT OFFICIAL LOGO ASSET AS IT IS (/assets/aistudio/Artboard_5_75f46eec.png) - Default
  return (
    <div className={`inline-flex flex-col select-none shrink-0 ${className}`}>
      <img
        src="/assets/aistudio/Artboard_5_75f46eec.png"
        alt="Shoot Lobby"
        className={`${heightClasses} w-auto object-contain select-none shrink-0 transition-opacity hover:opacity-95`}
        draggable={false}
      />
      {showSubtitle && (
        <span className="font-sans text-[11px] text-[#5C6E5E] font-medium tracking-normal mt-1 leading-tight">
          Photographer Availability & Shoot Booking
        </span>
      )}
    </div>
  );
};

export const ShootDayLogo = ShootLobbyLogo;
export default ShootLobbyLogo;
