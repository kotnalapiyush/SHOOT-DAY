import React, { useState } from 'react';

export interface PartnerBrand {
  id: string;
  name: string;
  src: string;
  sizeClass?: string;
}

export const PARTNER_LOGOS: PartnerBrand[] = [
  {
    id: 'annapoorna-mithai',
    name: 'Annapoorna Mithai',
    src: '/client-logos/annapoorna-mithai-bw.png',
    sizeClass: 'h-16 sm:h-20 md:h-24 max-w-[190px]'
  },
  {
    id: 'meethi',
    name: 'Meethi',
    src: '/client-logos/meethi-bw.png',
    sizeClass: 'h-11 sm:h-13 md:h-15 max-w-[240px] sm:max-w-[280px]'
  },
  {
    id: 'paras-gallery',
    name: 'Paras Gallery Fabrics',
    src: '/client-logos/paras-gallery-bw.png',
    sizeClass: 'h-16 sm:h-20 md:h-24 max-w-[190px]'
  },
  {
    id: 'studio-ad',
    name: 'studio AD',
    src: '/client-logos/studio-ad-bw.png',
    sizeClass: 'h-14 sm:h-16 md:h-20 max-w-[210px]'
  },
  {
    id: 'wok-in-the-clouds',
    name: 'Wok in the Clouds',
    src: '/client-logos/wok-in-the-clouds-bw.png',
    sizeClass: 'h-16 sm:h-20 md:h-24 max-w-[230px]'
  },
  {
    id: 'anardana',
    name: 'Anardana',
    src: '/client-logos/anardana-bw.png',
    sizeClass: 'h-11 sm:h-13 md:h-15 max-w-[220px]'
  },
  {
    id: 'edforce',
    name: 'edForce',
    src: '/client-logos/edforce-bw.png',
    sizeClass: 'h-11 sm:h-13 md:h-15 max-w-[220px]'
  },
  {
    id: 'stryder',
    name: 'Stryder',
    src: '/client-logos/stryder-bw.png',
    sizeClass: 'h-10 sm:h-12 md:h-14 max-w-[210px]'
  },
  {
    id: 'pallavi-foley',
    name: 'Pallavi Foley',
    src: '/client-logos/pallavi-foley-bw.png',
    sizeClass: 'h-12 sm:h-14 md:h-17 max-w-[190px]'
  },
  {
    id: 'ogis',
    name: "Ogi's",
    src: '/client-logos/ogis-bw.png',
    sizeClass: 'h-15 sm:h-18 md:h-20 max-w-[180px]'
  },
  {
    id: 'krea-university',
    name: 'Krea University',
    src: '/client-logos/krea-university-bw.png',
    sizeClass: 'h-13 sm:h-16 md:h-18 max-w-[170px]'
  },
  {
    id: 'zip-filters',
    name: 'Zip Filters',
    src: '/client-logos/zip-filters-bw.png',
    sizeClass: 'h-13 sm:h-16 md:h-18 max-w-[180px]'
  },
  {
    id: 'byte',
    name: 'Byte',
    src: '/client-logos/byte-bw.png',
    sizeClass: 'h-11 sm:h-13 md:h-15 max-w-[170px]'
  },
  {
    id: 'bw-consulting',
    name: 'BW Consulting',
    src: '/client-logos/bw-consulting-bw.png',
    sizeClass: 'h-13 sm:h-16 md:h-18 max-w-[160px]'
  },
  {
    id: 'brandian-tree',
    name: 'Brandian Tree',
    src: '/client-logos/brandian-tree-bw.png',
    sizeClass: 'h-13 sm:h-16 md:h-18 max-w-[160px]'
  }
];

interface BrandLogosProps {
  className?: string;
}

export const BrandLogos: React.FC<BrandLogosProps> = ({ className = '' }) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // We duplicate the list to ensure a seamless, non-stop horizontal running marquee
  const marqueeItems = [...PARTNER_LOGOS, ...PARTNER_LOGOS];

  return (
    <div className={`relative w-full overflow-hidden py-6 sm:py-8 ${className}`}>
      {/* Soft edge gradient masks so running logos transition seamlessly */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-white via-white/80 to-transparent transition-colors duration-200" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-white via-white/80 to-transparent transition-colors duration-200" />

      {/* Infinite horizontal running logos in clean monochrome */}
      <div className="flex animate-marquee items-center will-change-transform">
        {marqueeItems.map((brand, index) => {
          const hasError = imageErrors[brand.id];
          if (hasError) return null;

          const size = brand.sizeClass || 'h-12 sm:h-14 md:h-16 max-w-[180px]';

          return (
            <div
              key={`${brand.id}-${index}`}
              className="flex items-center justify-center shrink-0 px-6 sm:px-8 md:px-10 select-none"
              title={brand.name}
            >
              <img
                src={brand.src}
                alt={brand.name}
                loading="lazy"
                onError={() => handleImageError(brand.id)}
                className={`w-auto object-contain block filter grayscale contrast-125 opacity-80 hover:opacity-100 transition-all duration-200 hover:scale-105 ${size}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
