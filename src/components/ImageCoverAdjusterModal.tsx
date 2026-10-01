import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Maximize2,
  Sparkles,
  Crop,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface ImageCoverAdjusterModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onSave: (adjustedDataUrl: string) => void;
  title?: string;
  categoryName?: string;
  photoSlotNumber?: number;
}

export const ImageCoverAdjusterModal: React.FC<ImageCoverAdjusterModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  title = 'Adjust Photo Cover & Main Subject',
  categoryName,
  photoSlotNumber,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const positionStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset transforms whenever modal opens with a new image
  useEffect(() => {
    if (isOpen && imageSrc) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsLoaded(false);
    }
  }, [isOpen, imageSrc]);

  // Handle Drag Start
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = { ...position };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Handle Drag Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: positionStartRef.current.x + dx,
      y: positionStartRef.current.y + dy,
    });
  };

  // Handle Drag End
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0015;
    setScale((prev) => Math.min(Math.max(1, prev + zoomDelta), 3.5));
  };

  // Presets
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleCenter = () => {
    setPosition({ x: 0, y: 0 });
  };

  const handleFocusTop = () => {
    // Shifts image down so top part (faces/portraits) is centered in the 4:3 frame
    if (containerRef.current) {
      const h = containerRef.current.clientHeight;
      setPosition((prev) => ({ x: prev.x, y: h * 0.22 * scale }));
    }
  };

  const handleFocusBottom = () => {
    // Shifts image up so bottom part (shoes, plates, table details) is centered in the 4:3 frame
    if (containerRef.current) {
      const h = containerRef.current.clientHeight;
      setPosition((prev) => ({ x: prev.x, y: -h * 0.22 * scale }));
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Crop & Export via Canvas
  const handleExport = useCallback(() => {
    // If no adjustments were made, keep the original image intact with zero compression loss
    if (scale === 1 && position.x === 0 && position.y === 0 && rotation === 0) {
      onSave(imageSrc);
      onClose();
      return;
    }

    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) {
      onSave(imageSrc);
      onClose();
      return;
    }

    const imgNaturalW = img.naturalWidth || 1600;
    const imgNaturalH = img.naturalHeight || 1200;

    // Use full high-resolution for photography showcase (up to 2400x1800)
    const outputWidth = Math.min(2400, Math.max(1600, imgNaturalW));
    const outputHeight = Math.round(outputWidth * (3 / 4)); // Standard 4:3 showcase aspect

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onSave(imageSrc);
      onClose();
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Uniform scaling factor from on-screen preview pixels to high-res canvas pixels
    const factor = outputWidth / containerWidth;

    // Calculate base object-cover dimensions strictly preserving image aspect ratio
    const imgAspect = imgNaturalW / imgNaturalH;
    const containerAspect = containerWidth / containerHeight;

    const baseDisplayW = imgAspect > containerAspect ? containerHeight * imgAspect : containerWidth;
    const baseDisplayH = imgAspect > containerAspect ? containerHeight : containerWidth / imgAspect;

    const drawW = baseDisplayW * factor;
    const drawH = baseDisplayH * factor;

    // Fill background with clean studio neutral
    ctx.fillStyle = '#151E1A';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    ctx.save();
    // Center of canvas
    ctx.translate(outputWidth / 2, outputHeight / 2);

    // Apply exact user drag offset scaled to high-res canvas
    ctx.translate(position.x * factor, position.y * factor);

    // Apply rotation and zoom
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image maintaining exact un-stretched aspect ratio
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    try {
      const croppedUrl = canvas.toDataURL('image/jpeg', 0.94);
      onSave(croppedUrl);
      onClose();
    } catch (err) {
      console.error('Error exporting cropped image:', err);
      // Fallback: pass raw url if canvas tainted by CORS
      onSave(imageSrc);
      onClose();
    }
  }, [imageSrc, position, rotation, scale, onSave, onClose]);

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      id="image-cover-adjuster-modal"
      className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#1C2621] text-white border border-[#2D4537] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2D4537] flex items-center justify-between bg-[#151E1A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#073B2F] border border-[#2D4537] flex items-center justify-center text-[#FF6A45]">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                {photoSlotNumber && (
                  <span className="text-[10px] bg-[#FF6A45] text-white px-2 py-0.5 rounded-full font-bold">
                    Photo {photoSlotNumber}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-stone-300">
                Drag to position & zoom to set the focal cover of this image.
                {categoryName ? ` Category: ${categoryName}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Framing Canvas & Viewport Area */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Main 4:3 Interactive Framing Box */}
          <div className="relative mx-auto max-w-lg aspect-4/3 rounded-2xl overflow-hidden bg-black/90 border-2 border-[#073B2F] shadow-inner select-none">
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onWheel={handleWheel}
              className={`w-full h-full relative overflow-hidden flex items-center justify-center ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Adjust cover"
                referrerPolicy="no-referrer"
                onLoad={() => setIsLoaded(true)}
                draggable={false}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'cover',
                  width: '100%',
                  height: '100%',
                }}
                className="pointer-events-none select-none"
              />

              {/* Rule of Thirds Grid Guidelines */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-r border-b border-white/15" />
                <div className="border-b border-white/15" />
                <div className="border-r border-white/15" />
                <div className="border-r border-white/15" />
                <div />
              </div>

              {/* Drag indicator overlay */}
              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10 pointer-events-none">
                <Move className="w-3 h-3 text-[#FF6A45]" />
                <span>Drag to align cover</span>
              </div>

              {/* 4:3 Card Ratio Tag */}
              <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white/90 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-white/10 pointer-events-none">
                4:3 Cover Frame
              </div>
            </div>
          </div>

          {/* Controls: Zoom slider + Alignment Presets */}
          <div className="bg-[#151E1A] border border-[#2D4537] rounded-2xl p-3.5 space-y-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScale((prev) => Math.max(1, +(prev - 0.1).toFixed(2)))}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full accent-[#FF6A45] cursor-pointer h-1.5 bg-stone-700 rounded-lg"
                />
                <span className="text-[11px] font-mono text-stone-300 w-12 text-right">
                  {Math.round(scale * 100)}%
                </span>
              </div>

              <button
                type="button"
                onClick={() => setScale((prev) => Math.min(3, +(prev + 0.1).toFixed(2)))}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Alignment Presets */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-[#2D4537]">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCenter}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 transition cursor-pointer"
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={handleFocusTop}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 transition cursor-pointer"
                  title="Focus on top (face, headwear, model portraits)"
                >
                  Top / Face
                </button>
                <button
                  type="button"
                  onClick={handleFocusBottom}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 transition cursor-pointer"
                  title="Focus on bottom (footwear, table plates, textures)"
                >
                  Bottom / Detail
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 transition flex items-center gap-1 cursor-pointer"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-3 h-3 text-[#FF6A45]" />
                  <span>Rotate</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-stone-400 hover:text-white hover:bg-white/5 transition flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#2D4537] bg-[#151E1A] flex items-center justify-between">
          <p className="text-[11px] text-stone-400 hidden sm:block">
            High-res 4:3 cover crop will be applied to this photo slot.
          </p>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:bg-white/10 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(imageSrc);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/10 border border-white/10 transition cursor-pointer"
              title="Keep the full original photo without any crop"
            >
              Keep Original (No Crop)
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FF6A45] hover:bg-[#ff7b5a] active:scale-95 text-white transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Use As Photo Cover</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
