import React from 'react';

interface SocialBaeLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'lime';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
}

export const SocialBaeLogo: React.FC<SocialBaeLogoProps> = ({
  className = '',
  variant = 'light',
  size = 'md',
  showBadge = false,
}) => {
  const fillColor =
    variant === 'light'
      ? '#ffffff'
      : variant === 'lime'
      ? '#d4f770'
      : '#0a152e';

  const scale =
    size === 'sm'
      ? 'h-7'
      : size === 'md'
      ? 'h-9'
      : size === 'lg'
      ? 'h-12'
      : 'h-16';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Precision Vector SVG of Social Bae Logo */}
      <svg
        viewBox="0 0 236 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${scale} w-auto select-none`}
        aria-label="Social Bae"
        shapeRendering="geometricPrecision"
      >
        <g fill={fillColor}>
          {/* 's' */}
          <path
            d="M 12 25 C 12 18, 19 14, 28 14 C 37 14, 44 18, 44 26 C 44 32, 40 35, 31 37 C 22 39, 15 41, 15 47 C 15 52, 20 55, 29 55 C 39 55, 45 50, 45 44 L 37 44 C 37 47, 34 49, 29 49 C 24 49, 21 47, 21 44 C 21 40, 25 38, 34 36 C 43 34, 50 30, 50 23 C 50 14, 41 8, 28 8 C 14 8, 6 15, 6 25 Z"
            fillRule="evenodd"
          />

          {/* 'o' with Smiling Crescent bottom and Sunburst top rays */}
          {/* Smiling lower crescent */}
          <path
            d="M 60 33 C 60 43, 69 52, 80 52 C 91 52, 100 43, 100 33 L 93 33 C 93 40, 87 46, 80 46 C 73 46, 67 40, 67 33 Z"
          />

          {/* Sunburst rays on top of 'o' */}
          <g stroke={fillColor} strokeWidth="2.8" strokeLinecap="round">
            <line x1="63" y1="30" x2="57" y2="28" />
            <line x1="66" y1="23" x2="61" y2="19" />
            <line x1="71" y1="18" x2="67" y2="13" />
            <line x1="77" y1="15" x2="75" y2="9" />
            <line x1="83" y1="15" x2="85" y2="9" />
            <line x1="89" y1="18" x2="93" y2="13" />
            <line x1="94" y1="23" x2="99" y2="19" />
            <line x1="97" y1="30" x2="103" y2="28" />
          </g>

          {/* 'c' */}
          <path
            d="M 124 24 L 117 27 C 115 21, 111 18, 106 18 C 98 18, 93 25, 93 33 C 93 41, 98 48, 106 48 C 111 48, 115 45, 117 39 L 124 42 C 121 50, 114 54, 106 54 C 94 54, 86 45, 86 33 C 86 21, 94 12, 106 12 C 114 12, 121 16, 124 24 Z"
            fillRule="evenodd"
          />

          {/* 'i' */}
          <circle cx="132" cy="12" r="4.2" />
          <rect x="128" y="19" width="8" height="34" rx="2" />

          {/* 'a' */}
          <path
            d="M 160 19 L 160 53 L 153 53 L 153 49 C 150 53, 145 55, 140 55 C 131 55, 125 48, 125 39 C 125 30, 132 25, 143 25 L 153 25 L 153 24 C 153 19, 149 16, 143 16 C 138 16, 134 18, 133 22 L 126 19 C 129 13, 135 10, 143 10 C 154 10, 160 16, 160 25 Z M 153 31 L 144 31 C 137 31, 133 34, 133 39 C 133 44, 137 47, 143 47 C 149 47, 153 42, 153 37 Z"
            fillRule="evenodd"
          />

          {/* 'l' */}
          <rect x="166" y="5" width="8" height="48" rx="2" />

          {/* 'b' in 'bae' - positioned under 'i' / 'a' */}
          <path
            d="M 112 48 L 120 48 L 120 58 C 123 54, 128 51, 135 51 C 146 51, 154 60, 154 73 C 154 86, 145 95, 135 95 C 128 95, 123 92, 120 88 L 120 95 L 112 95 Z M 133 59 C 126 59, 120 65, 120 73 C 120 81, 126 87, 133 87 C 140 87, 146 81, 146 73 C 146 65, 140 59, 133 59 Z"
            fillRule="evenodd"
          />

          {/* 'a' in 'bae' */}
          <path
            d="M 183 58 L 183 95 L 175 95 L 175 91 C 172 95, 167 97, 161 97 C 152 97, 145 90, 145 81 C 145 72, 152 67, 163 67 L 175 67 L 175 65 C 175 60, 170 57, 164 57 C 159 57, 155 59, 153 63 L 146 60 C 149 54, 155 51, 164 51 C 176 51, 183 58, 183 67 Z M 175 73 L 164 73 C 158 73, 153 76, 153 81 C 153 86, 158 89, 164 89 C 170 89, 175 84, 175 79 Z"
            fillRule="evenodd"
          />

          {/* 'e' in 'bae' */}
          <path
            d="M 191 73 C 191 60, 200 51, 212 51 C 224 51, 233 60, 233 74 L 199 74 C 200 82, 206 88, 213 88 C 219 88, 224 85, 226 79 L 233 82 C 230 91, 222 96, 212 96 C 199 96, 191 86, 191 73 Z M 212 59 C 205 59, 201 64, 200 69 L 225 69 C 224 64, 219 59, 212 59 Z"
            fillRule="evenodd"
          />
        </g>
      </svg>

      {showBadge && (
        <span className="text-[10px] tracking-[0.25em] font-extrabold uppercase px-2 py-0.5 rounded-sm bg-[#d4f770] text-[#0d1d3a] leading-none font-mono">
          SHOOT
        </span>
      )}
    </div>
  );
};
