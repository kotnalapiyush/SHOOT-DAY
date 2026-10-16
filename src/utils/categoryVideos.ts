import { CategoryVideoItem, PhotographerProfile, VideoFormat } from '../types';
import { normalizeCategoryKey } from './categoryGalleries';

/**
 * Extract YouTube ID from various YouTube URL formats including shorts, watch, embed, and youtu.be
 */
export function extractYouTubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch) return shortsMatch[1];

  // youtu.be/ID
  const shortUrlMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (shortUrlMatch) return shortUrlMatch[1];

  // youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) return watchMatch[1];

  // youtube.com/embed/ID
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) return embedMatch[1];

  // Pure 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Extract Google Drive file ID from standard sharing and view links
 */
export function extractDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // drive.google.com/file/d/FILE_ID/...
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileMatch) return fileMatch[1];

  // drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  const queryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (queryMatch && (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com'))) return queryMatch[1];

  // docs.google.com/file/d/FILE_ID
  const docsMatch = trimmed.match(/docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (docsMatch) return docsMatch[1];

  return null;
}

/**
 * Extract Instagram Reel or Post ID
 */
export function extractInstagramId(url: string): { id: string; isReel: boolean } | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  const reelMatch = trimmed.match(/instagram\.com\/(?:reel|reels)\/([a-zA-Z0-9_-]+)/i);
  if (reelMatch) return { id: reelMatch[1], isReel: true };

  const postMatch = trimmed.match(/instagram\.com\/(?:p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (postMatch) return { id: postMatch[1], isReel: false };

  return null;
}

/**
 * Extract Vimeo video ID
 */
export function extractVimeoId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/i);
  if (match && match[3]) return match[3];
  return null;
}

/**
 * Extract Streamable video ID
 */
export function extractStreamableId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(/streamable\.com\/([a-zA-Z0-9]+)/i);
  if (match) return match[1];
  return null;
}

/**
 * Extract Loom share ID
 */
export function extractLoomId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(/loom\.com\/share\/([a-zA-Z0-9_-]+)/i);
  if (match) return match[1];
  return null;
}

export type VideoSourceType = 'youtube' | 'drive' | 'instagram' | 'vimeo' | 'streamable' | 'direct' | 'generic';

export interface ParsedVideoResult {
  url: string;
  embedUrl: string;
  sourceType: VideoSourceType;
  platformLabel: string;
  thumbnailUrl?: string;
  youtubeId?: string;
  driveId?: string;
  instagramId?: string;
  format: VideoFormat;
}

/**
 * Detect platform name from URL
 */
export function detectVideoPlatformName(rawUrl: string): string {
  const url = (rawUrl || '').toLowerCase();
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) return 'Google Drive';
  if (url.includes('instagram.com') || url.includes('instagr.am')) return 'Instagram';
  if (url.includes('vimeo.com')) return 'Vimeo';
  if (url.includes('dropbox.com')) return 'Dropbox Video';
  if (url.includes('streamable.com')) return 'Streamable';
  if (url.includes('loom.com')) return 'Loom';
  if (url.startsWith('blob:') || url.startsWith('data:video/') || /\.(mp4|webm|mov|m4v)($|\?)/i.test(url)) return 'Direct Video';
  return 'Web Video Link';
}

/**
 * Parse ANY video URL into appropriate player embed, detected platform, and format
 * Supports YouTube, Google Drive, Instagram Reel/Post, Dropbox, Vimeo, Streamable, and any web video link!
 */
export function parseAnyVideoUrl(rawUrl: string, selectedFormat: VideoFormat = 'reel'): ParsedVideoResult {
  const url = (rawUrl || '').trim();

  // 1. YouTube
  const ytId = extractYouTubeId(url);
  if (ytId) {
    const isShorts = url.toLowerCase().includes('/shorts/');
    return {
      url,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`,
      sourceType: 'youtube',
      platformLabel: isShorts ? 'YouTube Shorts' : 'YouTube',
      youtubeId: ytId,
      thumbnailUrl: getYouTubeThumbnail(ytId),
      format: isShorts ? 'reel' : selectedFormat,
    };
  }

  // 2. Google Drive
  const driveId = extractDriveId(url);
  if (driveId) {
    return {
      url,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      sourceType: 'drive',
      platformLabel: 'Google Drive',
      driveId,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`,
      format: selectedFormat,
    };
  }

  // 3. Instagram
  const insta = extractInstagramId(url);
  if (insta) {
    return {
      url,
      embedUrl: `https://www.instagram.com/reel/${insta.id}/embed/`,
      sourceType: 'instagram',
      platformLabel: insta.isReel ? 'Instagram Reel' : 'Instagram Video',
      instagramId: insta.id,
      thumbnailUrl: `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80`,
      format: 'reel', // Instagram reels default to vertical 9:16
    };
  }

  // 4. Dropbox (Convert to raw streamable direct URL)
  if (url.includes('dropbox.com')) {
    const directDropboxUrl = url.replace(/([?&])dl=0/, '$1raw=1');
    const finalDropboxUrl = directDropboxUrl.includes('raw=1') ? directDropboxUrl : `${directDropboxUrl}${directDropboxUrl.includes('?') ? '&' : '?'}raw=1`;
    return {
      url,
      embedUrl: finalDropboxUrl,
      sourceType: 'direct',
      platformLabel: 'Dropbox Video',
      thumbnailUrl: selectedFormat === 'reel'
        ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
      format: selectedFormat,
    };
  }

  // 5. Vimeo
  const vimeoId = extractVimeoId(url);
  if (vimeoId) {
    return {
      url,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      sourceType: 'vimeo',
      platformLabel: 'Vimeo',
      thumbnailUrl: `https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800&auto=format&fit=crop&q=80`,
      format: selectedFormat,
    };
  }

  // 6. Streamable
  const streamableId = extractStreamableId(url);
  if (streamableId) {
    return {
      url,
      embedUrl: `https://streamable.com/e/${streamableId}?autoplay=1`,
      sourceType: 'streamable',
      platformLabel: 'Streamable',
      thumbnailUrl: `https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80`,
      format: selectedFormat,
    };
  }

  // 7. Loom
  const loomId = extractLoomId(url);
  if (loomId) {
    return {
      url,
      embedUrl: `https://www.loom.com/embed/${loomId}`,
      sourceType: 'generic',
      platformLabel: 'Loom Video',
      thumbnailUrl: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80`,
      format: selectedFormat,
    };
  }

  // 8. Direct video file (mp4, webm, mov, etc.) or blob / data
  const isDirectVideo =
    url.startsWith('blob:') ||
    url.startsWith('data:video/') ||
    /\.(mp4|webm|mov|m4v|ogv)($|\?)/i.test(url);

  if (isDirectVideo) {
    return {
      url,
      embedUrl: url,
      sourceType: 'direct',
      platformLabel: 'Direct Video (MP4)',
      thumbnailUrl: selectedFormat === 'reel'
        ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
      format: selectedFormat,
    };
  }

  // 9. Any generic video / cloud / web link
  return {
    url,
    embedUrl: url,
    sourceType: 'generic',
    platformLabel: 'Web Video Link',
    thumbnailUrl: selectedFormat === 'reel'
      ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
    format: selectedFormat,
  };
}

/**
 * Generate a poster thumbnail from an uploaded video file using HTML5 Video + Canvas
 */
export function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      video.onloadeddata = () => {
        // Seek to 0.8 second or 0.2 of duration
        video.currentTime = Math.min(1.0, video.duration > 1 ? 1.0 : 0.2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            URL.revokeObjectURL(objectUrl);
            resolve(dataUrl);
            return;
          }
        } catch (e) {
          console.warn('Canvas export error:', e);
        }
        URL.revokeObjectURL(objectUrl);
        resolve('');
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve('');
      };

      // Fallback timeout in case seeked doesn't fire
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        resolve('');
      }, 3000);
    } catch {
      resolve('');
    }
  });
}

/**
 * High-quality curated default videos for each specialization category:
 * Each category includes 5 to 6 videos in both:
 * 1. Reel format (9:16 vertical)
 * 2. YouTube format (16:9 widescreen)
 */
export const CATEGORY_DEFAULT_VIDEOS: Record<string, CategoryVideoItem[]> = {
  'Commercial Shoot': [
    {
      id: 'comm-v1',
      category: 'Commercial Shoot',
      format: 'reel',
      title: 'Commercial Brand Launch 9:16 Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-commercial-perfume-bottle-in-water-43340-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 15,
    },
    {
      id: 'comm-v2',
      category: 'Commercial Shoot',
      format: 'youtube',
      title: 'Luxury Brand Campaign (4K Cinematic)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'M7lc1UVf-VE',
      durationSeconds: 45,
    },
    {
      id: 'comm-v3',
      category: 'Commercial Shoot',
      format: 'reel',
      title: 'Beverage & Pour Cinematic Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-in-a-cafe-with-steam-43093-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 12,
    },
    {
      id: 'comm-v4',
      category: 'Commercial Shoot',
      format: 'youtube',
      title: 'Automotive & Lifestyle Commercial',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'EngW7tLk6R8',
      durationSeconds: 60,
    },
    {
      id: 'comm-v5',
      category: 'Commercial Shoot',
      format: 'reel',
      title: 'Behind The Scenes Commercial Shoot',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-neon-setting-42998-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 18,
    },
    {
      id: 'comm-v6',
      category: 'Commercial Shoot',
      format: 'youtube',
      title: 'Studio Lighting & Campaign Mastercut',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'L_LUpnjgPso',
      durationSeconds: 52,
    },
  ],

  'Product Shoot': [
    {
      id: 'prod-v1',
      category: 'Product Shoot',
      format: 'reel',
      title: 'Cosmetics & Skincare Macro Reel (9:16)',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-commercial-perfume-bottle-in-water-43340-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 15,
    },
    {
      id: 'prod-v2',
      category: 'Product Shoot',
      format: 'youtube',
      title: 'E-commerce Watch & Tech Spotlight',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'kJQP7kiw5Fk',
      durationSeconds: 38,
    },
    {
      id: 'prod-v3',
      category: 'Product Shoot',
      format: 'reel',
      title: 'Sneakers 360 Spin Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-jeweler-crafting-a-ring-41617-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 14,
    },
    {
      id: 'prod-v4',
      category: 'Product Shoot',
      format: 'youtube',
      title: 'Amazon & D2C Catalog Video Tour',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'q7o7R5BgWDY',
      durationSeconds: 42,
    },
    {
      id: 'prod-v5',
      category: 'Product Shoot',
      format: 'reel',
      title: 'Liquid Splash & Macro Detail Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-in-a-cafe-with-steam-43093-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 16,
    },
    {
      id: 'prod-v6',
      category: 'Product Shoot',
      format: 'youtube',
      title: 'Product Unboxing & Premium Packaging Cut',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'ysz5S6PUM-U',
      durationSeconds: 48,
    },
  ],

  'Interior Shoot': [
    {
      id: 'int-v1',
      category: 'Interior Shoot',
      format: 'reel',
      title: 'Luxury Villa Living Room Walkthrough Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-41586-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 15,
    },
    {
      id: 'int-v2',
      category: 'Interior Shoot',
      format: 'youtube',
      title: 'Architectural Digest Style Home Tour 4K',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'aqz-KE-bpKQ',
      durationSeconds: 65,
    },
    {
      id: 'int-v3',
      category: 'Interior Shoot',
      format: 'reel',
      title: 'Modern Minimalist Kitchen Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-41586-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 12,
    },
    {
      id: 'int-v4',
      category: 'Interior Shoot',
      format: 'youtube',
      title: 'Boutique Hotel Suite Cinematic Showcase',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'ysz5S6PUM-U',
      durationSeconds: 50,
    },
    {
      id: 'int-v5',
      category: 'Interior Shoot',
      format: 'reel',
      title: 'Lighting & Decor Transitions (9:16)',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-interior-41586-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 16,
    },
    {
      id: 'int-v6',
      category: 'Interior Shoot',
      format: 'youtube',
      title: 'Commercial Office Space & Studio Tour',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'kJQP7kiw5Fk',
      durationSeconds: 58,
    },
  ],

  'Fashion Shoot': [
    {
      id: 'fash-v1',
      category: 'Fashion Shoot',
      format: 'reel',
      title: 'Runway & Lookbook Vertical Reel (9:16)',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-neon-setting-42998-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 15,
    },
    {
      id: 'fash-v2',
      category: 'Fashion Shoot',
      format: 'youtube',
      title: 'Vogue-Style Studio Fashion Film',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'M7lc1UVf-VE',
      durationSeconds: 45,
    },
    {
      id: 'fash-v3',
      category: 'Fashion Shoot',
      format: 'reel',
      title: 'Streetwear Transition & Outfit Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-neon-setting-42998-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 14,
    },
    {
      id: 'fash-v4',
      category: 'Fashion Shoot',
      format: 'youtube',
      title: 'Autumn Winter Collection Showcase Film',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'EngW7tLk6R8',
      durationSeconds: 55,
    },
    {
      id: 'fash-v5',
      category: 'Fashion Shoot',
      format: 'reel',
      title: 'Editorial Slow-Motion Studio Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-neon-setting-42998-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 16,
    },
    {
      id: 'fash-v6',
      category: 'Fashion Shoot',
      format: 'youtube',
      title: 'Behind the Lens: Fashion Campaign Director Cut',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'L_LUpnjgPso',
      durationSeconds: 62,
    },
  ],

  'Jewellery Shoot': [
    {
      id: 'jewel-v1',
      category: 'Jewellery Shoot',
      format: 'reel',
      title: 'Diamond Sparkle & Ring Macro Reel (9:16)',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-jeweler-crafting-a-ring-41617-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 15,
    },
    {
      id: 'jewel-v2',
      category: 'Jewellery Shoot',
      format: 'youtube',
      title: 'Bridal Heritage Jewellery Film 4K',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'q7o7R5BgWDY',
      durationSeconds: 40,
    },
    {
      id: 'jewel-v3',
      category: 'Jewellery Shoot',
      format: 'reel',
      title: 'Gold Necklace Light Refraction Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-jeweler-crafting-a-ring-41617-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 13,
    },
    {
      id: 'jewel-v4',
      category: 'Jewellery Shoot',
      format: 'youtube',
      title: 'Artisan Craftsmanship & Workshop Story',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'ysz5S6PUM-U',
      durationSeconds: 48,
    },
    {
      id: 'jewel-v5',
      category: 'Jewellery Shoot',
      format: 'reel',
      title: 'Luxury Watch Detail & Crown Turn Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-jeweler-crafting-a-ring-41617-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1611591475825-961a666e5114?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 15,
    },
    {
      id: 'jewel-v6',
      category: 'Jewellery Shoot',
      format: 'youtube',
      title: 'Polki & Kundan Bridal Collection Feature',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'kJQP7kiw5Fk',
      durationSeconds: 50,
    },
  ],

  'F&B Shoot': [
    {
      id: 'fb-v1',
      category: 'F&B Shoot',
      format: 'reel',
      title: 'Artisan Coffee Sizzle & Pour Reel (9:16)',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-in-a-cafe-with-steam-43093-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 15,
    },
    {
      id: 'fb-v2',
      category: 'F&B Shoot',
      format: 'youtube',
      title: 'Michelin Chef Culinary Masterclass 4K',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-chef-plating-a-gourmet-dish-43360-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'M7lc1UVf-VE',
      durationSeconds: 45,
    },
    {
      id: 'fb-v3',
      category: 'F&B Shoot',
      format: 'reel',
      title: 'Cocktail Mixology & Smoke Bubble Reel',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-in-a-cafe-with-steam-43093-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 12,
    },
    {
      id: 'fb-v4',
      category: 'F&B Shoot',
      format: 'youtube',
      title: 'Fine Dining Restaurant Ambience & Menu Film',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'aqz-KE-bpKQ',
      durationSeconds: 52,
    },
    {
      id: 'fb-v5',
      category: 'F&B Shoot',
      format: 'reel',
      title: 'Gourmet Dessert Torch & Drizzle (9:16)',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-chef-plating-a-gourmet-dish-43360-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
      durationSeconds: 14,
    },
    {
      id: 'fb-v6',
      category: 'F&B Shoot',
      format: 'youtube',
      title: 'Bakery & Woodfired Oven Pizza Reel Mastercut',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
      youtubeId: 'EngW7tLk6R8',
      durationSeconds: 48,
    },
  ],
};

// Aliases
CATEGORY_DEFAULT_VIDEOS['Restaurant & Cafe Shoot'] = CATEGORY_DEFAULT_VIDEOS['F&B Shoot'];
CATEGORY_DEFAULT_VIDEOS['Hotel Shoot'] = CATEGORY_DEFAULT_VIDEOS['Interior Shoot'];
CATEGORY_DEFAULT_VIDEOS['One Day Shoot'] = CATEGORY_DEFAULT_VIDEOS['Commercial Shoot'];

/**
 * Retrieve videos for a category.
 * If photographer has custom videos in categoryVideos[categoryName], return them.
 * Otherwise, return the curated defaults (5 to 6 items).
 */
export function getCategoryVideos(
  photographer: PhotographerProfile | null | undefined,
  categoryName: string,
  maxCount: number = 6
): CategoryVideoItem[] {
  const normalized = normalizeCategoryKey(categoryName);
  const defaults =
    CATEGORY_DEFAULT_VIDEOS[categoryName] ||
    CATEGORY_DEFAULT_VIDEOS[normalized] ||
    CATEGORY_DEFAULT_VIDEOS['Commercial Shoot'] ||
    [];

  const custom =
    photographer?.categoryVideos?.[categoryName] ||
    photographer?.categoryVideos?.[normalized];

  if (custom && Array.isArray(custom) && custom.length > 0) {
    const valid = custom.filter((v) => v && v.url);
    if (valid.length > 0) {
      return valid.slice(0, maxCount);
    }
  }

  // Ensure 5 to 6 items
  const result: CategoryVideoItem[] = [];
  defaults.forEach((item, idx) => {
    result.push({
      ...item,
      id: `${photographer?.id || 'p'}-${normalized}-v${idx + 1}`,
      category: categoryName,
    });
  });

  return result.slice(0, maxCount);
}
