import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  Sparkles,
  Smartphone,
  Tv,
  ExternalLink,
} from 'lucide-react';
import { CategoryVideoItem, PhotographerProfile } from '../types';
import { extractYouTubeId, parseAnyVideoUrl } from '../utils/categoryVideos';

interface VideoReelPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: CategoryVideoItem[];
  initialIndex?: number;
  photographer?: PhotographerProfile | null;
  onBookPhotographer?: (photographer: PhotographerProfile) => void;
}

export const VideoReelPlayerModal: React.FC<VideoReelPlayerModalProps> = ({
  isOpen,
  onClose,
  videos,
  initialIndex = 0,
  photographer,
  onBookPhotographer,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsPlaying(true);
    setProgress(0);
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrev();
      } else if (e.key === ' ' && videoRef.current) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, videos.length]);

  if (!isOpen || !videos || videos.length === 0) return null;

  const currentVideo = videos[currentIndex] || videos[0];
  if (!currentVideo) return null;

  const isReel = currentVideo.format === 'reel';
  const videoSourceUrl = currentVideo.youtubeId
    ? `https://www.youtube.com/watch?v=${currentVideo.youtubeId}`
    : currentVideo.url;
  const parsed = parseAnyVideoUrl(videoSourceUrl, currentVideo.format);
  const isEmbed = parsed.sourceType !== 'direct';

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setIsPlaying(true);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsPlaying(true);
    setProgress(0);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  return (
    <div
      id="video-reel-player-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs pointer-events-auto shadow-lg">
          {isReel ? (
            <span className="flex items-center gap-1.5 font-bold text-[#FF6A45]">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Reel</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <Tv className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </span>
          )}
          <span className="text-white/40">•</span>
          <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider">
            {parsed.platformLabel}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/80 font-medium">
            {currentIndex + 1} of {videos.length}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-white/90 font-bold truncate max-w-[100px] sm:max-w-[180px]">
            {currentVideo.category}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Direct link to open video externally if needed */}
          {currentVideo.url && (
            <a
              href={currentVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 transition border border-white/20 shadow-lg cursor-pointer"
              title="Open video in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Open Link</span>
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition border border-white/20 shadow-lg cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Close video player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container - Adjusted by format */}
      <div className="relative flex items-center justify-center max-w-full max-h-full">
        {/* Previous Video Arrow */}
        {videos.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition border border-white/20 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 z-20"
            aria-label="Previous Video"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* 9:16 Vertical Reel Player */}
        {isReel ? (
          <div className="relative w-full max-w-[380px] h-[78vh] sm:h-[84vh] max-h-[820px] rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/20 flex flex-col justify-between">
            {/* Reel Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-20 p-2.5 flex items-center gap-1">
              <div className="w-full bg-white/30 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Video Viewport / Embed for Reel */}
            <div
              className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden"
              onClick={!isEmbed ? togglePlay : undefined}
            >
              {parsed.sourceType === 'youtube' ? (
                <iframe
                  src={parsed.embedUrl}
                  title={currentVideo.title || 'Reel Video'}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : parsed.sourceType === 'drive' ? (
                <iframe
                  src={parsed.embedUrl}
                  title={currentVideo.title || 'Google Drive Video'}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : parsed.sourceType === 'instagram' ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <iframe
                    src={parsed.embedUrl}
                    title={currentVideo.title || 'Instagram Reel'}
                    className="w-full h-full border-0 bg-black"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                  <a
                    href={currentVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-lg z-30 transition"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Watch on Instagram</span>
                  </a>
                </div>
              ) : parsed.sourceType === 'vimeo' || parsed.sourceType === 'streamable' || parsed.sourceType === 'generic' ? (
                <iframe
                  src={parsed.embedUrl}
                  title={currentVideo.title || 'Video Reel'}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={parsed.embedUrl}
                    poster={currentVideo.thumbnailUrl}
                    className="w-full h-full object-cover cursor-pointer"
                    playsInline
                    autoPlay
                    loop
                    muted={isMuted}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Play / Pause Center Splash Indicator */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl animate-in zoom-in-75">
                        <Play className="w-8 h-8 fill-white translate-x-0.5" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Reel Bottom Details & Overlays */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-5 bg-gradient-to-t from-black via-black/80 to-transparent text-white space-y-3 pointer-events-auto">
              {photographer && (
                <div className="flex items-center gap-2.5">
                  {photographer.avatarUrl ? (
                    <img
                      src={photographer.avatarUrl}
                      alt={photographer.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-full object-cover border border-white/30"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#073B2F] text-white flex items-center justify-center font-bold text-xs border border-white/20">
                      {photographer.name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate leading-tight">
                      {photographer.name}
                    </p>
                    <p className="text-[11px] text-white/70 truncate">
                      {photographer.city}
                    </p>
                  </div>
                </div>
              )}

              {/* Title & Category */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#FF6A45] text-white text-[10px] font-bold tracking-wide uppercase">
                    {currentVideo.category}
                  </span>
                  <span className="inline-block px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px] font-semibold">
                    {parsed.platformLabel}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white leading-snug drop-shadow-md">
                  {currentVideo.title || `${currentVideo.category} Reel`}
                </h4>
              </div>

              {/* Reel Controls Toolbar */}
              <div className="flex items-center justify-between pt-1">
                {!isEmbed && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {photographer && onBookPhotographer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBookPhotographer(photographer);
                    }}
                    className="ml-auto px-3.5 py-1.5 rounded-full bg-[#FF6A45] hover:bg-[#e05835] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book Shoot</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* 16:9 Landscape Format Player */
          <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/20 flex flex-col">
            <div className="relative aspect-16/9 w-full bg-black flex items-center justify-center">
              {parsed.sourceType === 'youtube' ? (
                <iframe
                  src={parsed.embedUrl}
                  title={currentVideo.title || 'YouTube Video'}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : parsed.sourceType === 'drive' ? (
                <iframe
                  src={parsed.embedUrl}
                  title={currentVideo.title || 'Google Drive Video'}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : parsed.sourceType === 'instagram' ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <iframe
                    src={parsed.embedUrl}
                    title={currentVideo.title || 'Instagram Video'}
                    className="w-full h-full border-0 bg-black"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                  <a
                    href={currentVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg z-30 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Watch on Instagram</span>
                  </a>
                </div>
              ) : parsed.sourceType === 'vimeo' || parsed.sourceType === 'streamable' || parsed.sourceType === 'generic' ? (
                <iframe
                  src={parsed.embedUrl}
                  title={currentVideo.title || 'Video Player'}
                  className="w-full h-full object-cover border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={parsed.embedUrl}
                  poster={currentVideo.thumbnailUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Video Footer Info */}
            <div className="p-4 sm:p-5 bg-[#141A17] border-t border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold tracking-wide uppercase">
                    YouTube
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/90 text-[10px] font-bold">
                    {parsed.platformLabel}
                  </span>
                  <span className="text-xs text-white/60">
                    Category: {currentVideo.category}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {currentVideo.title || `${currentVideo.category} Cinematic Video`}
                </h3>
                {photographer && (
                  <p className="text-xs text-white/70">
                    Directed / Filmed by{' '}
                    <span className="font-semibold text-white">{photographer.name}</span> •{' '}
                    {photographer.city}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {currentVideo.url && (
                  <a
                    href={currentVideo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>Watch Full Source</span>
                  </a>
                )}

                {photographer && onBookPhotographer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBookPhotographer(photographer);
                    }}
                    className="px-5 py-2 rounded-xl bg-[#073B2F] hover:bg-[#0c4e3f] text-white text-xs sm:text-sm font-bold transition flex items-center gap-2 border border-white/20 shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    <Calendar className="w-4 h-4 text-[#FF6A45]" />
                    <span>Book {photographer.name}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Next Video Arrow */}
        {videos.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition border border-white/20 backdrop-blur-md cursor-pointer hover:scale-110 active:scale-95 z-20"
            aria-label="Next Video"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Mobile Bottom Thumbnails Navigation Strip */}
      {videos.length > 1 && (
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-center gap-2 z-20 sm:hidden">
          <button
            type="button"
            onClick={handlePrev}
            className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-white text-xs font-medium px-2">
            {currentIndex + 1} / {videos.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
