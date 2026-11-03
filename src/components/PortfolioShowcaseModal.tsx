import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  ArrowRight,
  Sparkles,
  Maximize2,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Play,
  Film,
  Smartphone,
  Tv,
} from 'lucide-react';
import { PhotographerProfile, CategoryVideoItem } from '../types';
import { getCategoryPhotos, normalizeCategoryKey } from '../utils/categoryGalleries';
import { getCategoryVideos, detectVideoPlatformName } from '../utils/categoryVideos';
import { VideoReelPlayerModal } from './VideoReelPlayerModal';

interface PortfolioShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographer: PhotographerProfile | null;
  initialCategory?: string;
  onBookPhotographer: (photographer: PhotographerProfile) => void;
}

export const PortfolioShowcaseModal: React.FC<PortfolioShowcaseModalProps> = ({
  isOpen,
  onClose,
  photographer,
  initialCategory,
  onBookPhotographer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'videos'>('photos');
  const [videoFilter, setVideoFilter] = useState<'reel' | 'youtube'>('reel');
  const [activeVideoModal, setActiveVideoModal] = useState<{
    videos: CategoryVideoItem[];
    index: number;
  } | null>(null);

  useEffect(() => {
    if (photographer) {
      if (initialCategory && photographer.specialties.includes(initialCategory)) {
        setSelectedCategory(initialCategory);
      } else if (photographer.specialties.length > 0) {
        setSelectedCategory(photographer.specialties[0]);
      } else {
        setSelectedCategory('Commercial Shoot');
      }
      setSelectedPhotoIndex(null);
    }
  }, [photographer, initialCategory, isOpen]);

  if (!isOpen || !photographer) return null;

  const categories = photographer.specialties && photographer.specialties.length > 0
    ? photographer.specialties
    : ['Fashion Shoot', 'Jewellery Shoot', 'Commercial Shoot', 'One Day Shoot'];

  const activeCategory = selectedCategory || categories[0];
  // 15 photos for this category (displayed as 5 rows in 3 columns)
  const categoryPhotos = getCategoryPhotos(photographer, activeCategory, 15);
  // 5-6 curated or custom videos/reels for this category
  const categoryVideos = getCategoryVideos(photographer, activeCategory, 6);
  const filteredVideos = categoryVideos.filter((v) => v.format === videoFilter);

  return (
    <div
      id="portfolio-showcase-modal"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#DCE7D4] rounded-3xl max-w-5xl w-full text-[#073B2F] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Strip */}
        <div className="px-5 sm:px-7 py-4 border-b border-[#DCE7D4] bg-[#F6F3EC] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {photographer.avatarUrl ? (
              <img
                src={photographer.avatarUrl}
                alt={photographer.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border border-[#DCE7D4] shrink-0"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${
                  photographer.avatarColor || 'from-[#073B2F] to-[#04241d]'
                } text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
              >
                {photographer.name[0]}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#073B2F] truncate font-['Space_Grotesk',sans-serif]">
                  {photographer.name}
                </h2>
                <span className="bg-[#F0FFDA] text-[#073B2F] border border-[#DCE7D4] text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#073B2F]" />
                  <span>Available</span>
                </span>
              </div>
              <p className="text-xs text-[#5C6E5E] truncate">
                {photographer.city} • {photographer.experienceYears}+ years experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-close-portfolio-showcase"
              onClick={onClose}
              className="w-9 h-9 rounded-xl hover:bg-stone-200/60 text-[#5C6E5E] hover:text-[#073B2F] flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          {/* Photographer Bio */}
          <div>
            <h3 className="text-sm font-bold text-[#073B2F] mb-1">
              {photographer.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#5C6E5E] leading-relaxed">
              {photographer.bio}
            </p>
          </div>

          {/* Tappable Specialization Categories */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FF6A45]" />
                <h4 className="text-xs sm:text-sm font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
                  Select Specialization Category
                </h4>
              </div>
            </div>

            {/* Clickable category pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedPhotoIndex(null);
                    }}
                    className={`group px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-[#073B2F] text-white shadow-xs'
                        : 'bg-[#F6F3EC] text-[#073B2F] hover:bg-[#ECE7DC] border border-[#DCE7D4]'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Media Type Switcher: Photos vs Reels & Videos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-[#F6F3EC] rounded-2xl border border-[#DCE7D4]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveMediaTab('photos')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeMediaTab === 'photos'
                    ? 'bg-[#073B2F] text-white shadow-xs'
                    : 'bg-white text-[#073B2F] hover:bg-[#ECE7DC] border border-[#DCE7D4]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photos ({categoryPhotos.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('videos')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeMediaTab === 'videos'
                    ? 'bg-[#073B2F] text-white shadow-xs'
                    : 'bg-white text-[#073B2F] hover:bg-[#ECE7DC] border border-[#DCE7D4]'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-[#FF6A45]" />
                <span>Reels & Videos</span>
              </button>
            </div>

            {activeMediaTab === 'videos' && (
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setVideoFilter('reel')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    videoFilter === 'reel'
                      ? 'bg-[#073B2F] text-white shadow-xs'
                      : 'bg-white text-[#073B2F] hover:bg-[#ECE7DC] border border-[#DCE7D4]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#FF6A45]" />
                  <span>Reel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoFilter('youtube')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    videoFilter === 'youtube'
                      ? 'bg-[#073B2F] text-white shadow-xs'
                      : 'bg-white text-[#073B2F] hover:bg-[#ECE7DC] border border-[#DCE7D4]'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5 text-amber-500" />
                  <span>YouTube</span>
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: CATEGORY PHOTOS GRID */}
          {activeMediaTab === 'photos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#DCE7D4]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#073B2F]">
                    {activeCategory} — Photo Collection ({categoryPhotos.length} high-res photos)
                  </span>
                </div>
                <span className="text-[11px] text-[#5C6E5E]">Click photo to enlarge</span>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                {categoryPhotos.map((imgUrl, idx) => {
                  const isLast = idx === categoryPhotos.length - 1;
                  const isOddOnMobile = categoryPhotos.length % 2 !== 0 && isLast;
                  const isSingleRemainderOnDesktop = categoryPhotos.length % 3 === 1 && isLast;

                  return (
                    <div
                      key={`${imgUrl}-${idx}`}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`group relative rounded-2xl overflow-hidden bg-stone-100 border border-[#DCE7D4] cursor-pointer hover:border-[#073B2F] transition-all shadow-2xs hover:shadow-md active:scale-[0.98] ${
                        isOddOnMobile ? 'col-span-2 aspect-16/9' : 'aspect-4/3'
                      } ${
                        isSingleRemainderOnDesktop
                          ? 'sm:col-span-3 sm:aspect-21/9'
                          : 'sm:col-span-1 sm:aspect-4/3'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${photographer.name} - ${activeCategory} sample ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-2 rounded-xl bg-white/95 text-[#073B2F] text-xs font-bold flex items-center gap-1 shadow-md">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>View</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: REELS & VIDEOS GRID */}
          {activeMediaTab === 'videos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#DCE7D4]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#073B2F]">
                    {activeCategory} — {videoFilter === 'reel' ? 'Reel' : 'YouTube'} Videos ({filteredVideos.length} videos)
                  </span>
                </div>
                <span className="text-[11px] text-[#5C6E5E]">Click to play full-screen</span>
              </div>

              {filteredVideos.length === 0 ? (
                <div className="p-8 text-center bg-[#F6F3EC] rounded-2xl border border-[#DCE7D4]">
                  <Film className="w-8 h-8 text-[#FF6A45] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#073B2F]">No {videoFilter === 'reel' ? 'Reel' : 'YouTube'} videos in this category.</p>
                  <button
                    type="button"
                    onClick={() => setVideoFilter(videoFilter === 'reel' ? 'youtube' : 'reel')}
                    className="text-xs text-[#FF6A45] font-bold mt-2 hover:underline cursor-pointer"
                  >
                    Switch to {videoFilter === 'reel' ? 'YouTube' : 'Reel'} videos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredVideos.map((video, vIdx) => {
                    const isReel = video.format === 'reel';
                    return (
                      <div
                        key={video.id || vIdx}
                        onClick={() => {
                          setActiveVideoModal({
                            videos: filteredVideos,
                            index: vIdx,
                          });
                        }}
                        className="group relative rounded-2xl overflow-hidden bg-white border border-[#DCE7D4] hover:border-[#073B2F] transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                      >
                        {/* Video Thumbnail */}
                        <div
                          className={`relative overflow-hidden bg-stone-900 ${
                            isReel ? 'aspect-9/14 sm:aspect-9/16' : 'aspect-16/9'
                          }`}
                        >
                          <img
                            src={
                              video.thumbnailUrl ||
                              'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'
                            }
                            alt={video.title || 'Video'}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-85"
                          />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                            {isReel ? (
                              <span className="px-2.5 py-1 rounded-md bg-[#FF6A45] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                                <Smartphone className="w-3 h-3" />
                                <span>Reel</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md bg-amber-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                                <Tv className="w-3 h-3" />
                                <span>YouTube</span>
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-semibold backdrop-blur-xs">
                              {detectVideoPlatformName(video.url)}
                            </span>
                          </div>

                          {/* Center Play Icon */}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md border border-white/60 flex items-center justify-center text-white shadow-xl group-hover:scale-115 transition-transform">
                              <Play className="w-6 h-6 fill-white translate-x-0.5" />
                            </div>
                          </div>
                        </div>

                        {/* Video Details */}
                        <div className="p-3.5 bg-white space-y-1">
                          <h4 className="text-xs font-bold text-[#073B2F] truncate">
                            {video.title || `${activeCategory} Video`}
                          </h4>
                          <div className="flex items-center justify-between text-[11px] text-[#5C6E5E]">
                            <span>{activeCategory}</span>
                            <span className="text-[#FF6A45] font-bold group-hover:underline">
                              Watch Now →
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action Strip */}
        <div className="px-5 sm:px-7 py-3.5 bg-[#F6F3EC] border-t border-[#DCE7D4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#5C6E5E]">
            Selected Category:{' '}
            <strong className="text-[#073B2F]">{activeCategory}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6E5E] hover:bg-stone-200/60 transition"
            >
              Close
            </button>
            <button
              type="button"
              id="btn-modal-book-photographer"
              onClick={() => {
                onClose();
                onBookPhotographer(photographer);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#073B2F] hover:bg-[#0c4e3f] active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#FF6A45]" />
              <span>Book {photographer.name.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Enlarged Photo View with Next/Prev among the 6 photos */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white text-xs font-bold mb-3 px-2">
              <div className="flex items-center gap-2">
                <span>{activeCategory}</span>
                <span className="text-stone-400 font-normal">•</span>
                <span>Photo {selectedPhotoIndex + 1}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Container */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black">
              <img
                src={categoryPhotos[selectedPhotoIndex]}
                alt=""
                referrerPolicy="no-referrer"
                className="max-h-[75vh] max-w-full object-contain rounded-xl"
              />

              {/* Prev Button */}
              <button
                type="button"
                onClick={() =>
                  setSelectedPhotoIndex((prev) =>
                    prev !== null ? (prev === 0 ? categoryPhotos.length - 1 : prev - 1) : 0
                  )
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={() =>
                  setSelectedPhotoIndex((prev) =>
                    prev !== null ? (prev === categoryPhotos.length - 1 ? 0 : prev + 1) : 0
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* 6 Thumbnail Navigation strip below */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto p-1">
              {categoryPhotos.map((thumbUrl, tIdx) => (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(tIdx)}
                  className={`w-14 h-11 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                    tIdx === selectedPhotoIndex
                      ? 'border-[#FF6A45] scale-105'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video & Reel Player Modal */}
      {activeVideoModal && (
        <VideoReelPlayerModal
          isOpen={Boolean(activeVideoModal)}
          onClose={() => setActiveVideoModal(null)}
          videos={activeVideoModal.videos}
          initialIndex={activeVideoModal.index}
          photographer={photographer}
          onBookPhotographer={onBookPhotographer}
        />
      )}
    </div>
  );
};
