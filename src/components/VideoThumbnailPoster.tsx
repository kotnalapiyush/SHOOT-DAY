import React, { useState } from 'react';
import { CategoryVideoItem } from '../types';
import {
  extractInstagramId,
  extractYouTubeId,
  extractDriveId,
  isFigmaPlaceholder,
} from '../utils/categoryVideos';

interface VideoThumbnailPosterProps {
  video: CategoryVideoItem;
  className?: string;
  alt?: string;
  isReel?: boolean;
}

export const VideoThumbnailPoster: React.FC<VideoThumbnailPosterProps> = ({
  video,
  className = 'w-full h-full object-cover',
  alt = 'Video thumbnail',
  isReel = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const rawThumb = video.thumbnailUrl;
  const hasValidCustomThumb = Boolean(
    rawThumb &&
    typeof rawThumb === 'string' &&
    rawThumb.trim().length > 0 &&
    !isFigmaPlaceholder(rawThumb) &&
    !imgError
  );

  // 1. If photographer provided a custom uploaded cover or valid image
  if (hasValidCustomThumb && rawThumb) {
    return (
      <img
        src={rawThumb}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={className}
      />
    );
  }

  // 2. Instagram: Render authentic Instagram embed iframe from source link
  const insta = extractInstagramId(video.url);
  if (insta) {
    const embedUrl = `https://www.instagram.com/reel/${insta.id}/embed/`;
    return (
      <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
        <iframe
          src={embedUrl}
          className="w-full h-full object-cover pointer-events-none border-0 scale-105"
          scrolling="no"
          allow="encrypted-media"
          title={video.title || 'Instagram Reel'}
        />
      </div>
    );
  }

  // 3. YouTube: Real video thumbnail from YouTube
  const ytId = video.youtubeId || extractYouTubeId(video.url);
  if (ytId) {
    return (
      <img
        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={className}
      />
    );
  }

  // 4. Google Drive: Real video preview thumbnail from Drive
  const driveId = extractDriveId(video.url);
  if (driveId) {
    return (
      <img
        src={`https://drive.google.com/thumbnail?id=${driveId}&sz=w800`}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={className}
      />
    );
  }

  // 5. Clean, professional photography fallback (never the Figma/Twitter stock photo)
  const fallback = isReel
    ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80';

  return (
    <img
      src={fallback}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
    />
  );
};
