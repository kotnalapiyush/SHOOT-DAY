import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Shield,
  User,
  MapPin,
  Layers,
  RotateCcw,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown,
  Crop,
  Undo2,
  GripVertical,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { PhotographerProfile, ShootType } from '../types';
import {
  getCategoryPhotos,
  CATEGORY_DEFAULT_GALLERIES,
  normalizeCategoryKey,
} from '../utils/categoryGalleries';
import { compressImageFile } from '../utils/imageCompressor';
import { ImageCoverAdjusterModal } from './ImageCoverAdjusterModal';

interface PhotographerSelfEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographer: PhotographerProfile;
  onSaveProfile: (updated: PhotographerProfile, passwordChanged: boolean, newPassword?: string) => void;
}

const INDIAN_CITIES = [
  'Delhi NCR',
  'Mumbai',
  'Jaipur & Udaipur',
  'Bengaluru',
  'Goa',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Chandigarh',
  'Ahmedabad',
  'Dehradun & Rishikesh',
  'Lucknow',
];

const AVAILABLE_SPECIALTIES: ShootType[] = [
  'Commercial Shoot',
  'One Day Shoot',
  'Fashion Shoot',
  'Jewellery Shoot',
  'Product Shoot',
  'F&B Shoot',
  'Restaurant & Cafe Shoot',
  'Interior Shoot',
  'Hotel Shoot',
  'Other / Custom',
];

export const PhotographerSelfEditModal: React.FC<PhotographerSelfEditModalProps> = ({
  isOpen,
  onClose,
  photographer,
  onSaveProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'showcase' | 'password'>('profile');

  // Basic Info State
  const [name, setName] = useState(photographer.name);
  const [title, setTitle] = useState(photographer.title);
  const [city, setCity] = useState(photographer.city);
  const [phone, setPhone] = useState(photographer.phone);
  const [email, setEmail] = useState(photographer.email);
  const [experienceYears, setExperienceYears] = useState(String(photographer.experienceYears));
  const [bio, setBio] = useState(photographer.bio);
  const [specialties, setSpecialties] = useState<string[]>(photographer.specialties || []);

  // Avatar / Profile Picture State
  const [avatarUrl, setAvatarUrl] = useState(photographer.avatarUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category Galleries State: map of categoryName -> string[] (array of photos)
  const [categoryGalleries, setCategoryGalleries] = useState<Record<string, string[]>>({});
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('Commercial Shoot');
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);
  const [replaceUrlInput, setReplaceUrlInput] = useState<string>('');
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetSlotRef = useRef<number | null>(null);
  const directAddPhotoFileInputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop reordering state
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);
  const [dragOverPhotoIndex, setDragOverPhotoIndex] = useState<number | null>(null);
  const [touchedPhotoIndex, setTouchedPhotoIndex] = useState<number | null>(null);

  // Selection Bar State
  const [isCategoryBarOpen, setIsCategoryBarOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const [showOtherCustomInput, setShowOtherCustomInput] = useState(false);
  const [otherCustomInputValue, setOtherCustomInputValue] = useState('');
  const otherCustomInputRef = useRef<HTMLInputElement>(null);

  // Showcase section ref for smooth scroll
  const showcaseSectionRef = useRef<HTMLDivElement>(null);

  // Delete & Undo Photo State
  const [lastDeletedPhoto, setLastDeletedPhoto] = useState<{
    category: string;
    index: number;
    url: string;
  } | null>(null);

  // Image Cover Adjuster State
  const [adjustingPhoto, setAdjustingPhoto] = useState<{
    url: string;
    slotIndex: number | null;
    category: string;
    slotNumber?: number;
  } | null>(null);

  // Multi-photo upload & Dropzone
  const multiUploadFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingMultiple, setIsUploadingMultiple] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showUrlInputBar, setShowUrlInputBar] = useState(false);
  const [batchUrlInput, setBatchUrlInput] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Close category selection bar dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryBarRef.current && !categoryBarRef.current.contains(e.target as Node)) {
        setIsCategoryBarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setName(photographer.name);
      setTitle(photographer.title);
      setCity(photographer.city);
      setPhone(photographer.phone);
      setEmail(photographer.email);
      setExperienceYears(String(photographer.experienceYears));
      setBio(photographer.bio);
      const specs = photographer.specialties && photographer.specialties.length > 0
        ? photographer.specialties
        : ['Commercial Shoot', 'Fashion Shoot', 'Jewellery Shoot', 'One Day Shoot'];
      setSpecialties(specs);
      setAvatarUrl(photographer.avatarUrl || '');

      // Initialize category galleries with photos each, preserving existing custom galleries
      const initialGalleries: Record<string, string[]> = { ...(photographer.categoryGalleries || {}) };
      specs.forEach((cat) => {
        if (!initialGalleries[cat] || initialGalleries[cat].length === 0) {
          initialGalleries[cat] = getCategoryPhotos(photographer, cat, 15);
        }
      });
      setCategoryGalleries(initialGalleries);
      setActiveCategoryTab(specs[0] || 'Commercial Shoot');

      setNewPassword('');
      setSavedSuccess(false);
      setEditingPhotoIndex(null);
      setReplaceUrlInput('');
      setIsCategoryBarOpen(false);
      setCategorySearchQuery('');
      setShowOtherCustomInput(false);
      setOtherCustomInputValue('');
      setLastDeletedPhoto(null);
      setTouchedPhotoIndex(null);
      setAdjustingPhoto(null);
      setUploadStatusMsg(null);
      setShowUrlInputBar(false);
      setBatchUrlInput('');
    }
  }, [isOpen, photographer]);

  if (!isOpen) return null;

  // Toggle a category specialty from the selection bar
  const toggleSpecialty = (spec: string) => {
    if (spec === 'Other / Custom') {
      setShowOtherCustomInput((prev) => !prev);
      setTimeout(() => {
        otherCustomInputRef.current?.focus();
      }, 100);
      return;
    }

    let nextSpecs: string[];
    if (specialties.includes(spec)) {
      if (specialties.length <= 1) {
        alert('Please keep at least one specialization category selected.');
        return;
      }
      nextSpecs = specialties.filter((s) => s !== spec);
    } else {
      nextSpecs = [...specialties, spec];
      // Ensure the new category has photos initialized
      if (!categoryGalleries[spec]) {
        setCategoryGalleries((prev) => ({
          ...prev,
          [spec]: getCategoryPhotos(photographer, spec, 15),
        }));
      }
    }
    setSpecialties(nextSpecs);

    if (!nextSpecs.includes(activeCategoryTab)) {
      setActiveCategoryTab(nextSpecs[0] || spec);
    }
  };

  // Add custom shoot specialization (unifies Other and Custom into one seamless action)
  const handleAddCustomShoot = (customName?: string) => {
    const raw = customName !== undefined ? customName : otherCustomInputValue;
    const trimmed = raw.trim();
    if (!trimmed) return;

    if (!specialties.includes(trimmed)) {
      const nextSpecs = [...specialties, trimmed];
      setSpecialties(nextSpecs);
      if (!categoryGalleries[trimmed]) {
        setCategoryGalleries((prev) => ({
          ...prev,
          [trimmed]: getCategoryPhotos(photographer, trimmed, 15),
        }));
      }
    }

    setActiveCategoryTab(trimmed);
    setOtherCustomInputValue('');
    setShowOtherCustomInput(false);
    setIsCategoryBarOpen(false);
    setCategorySearchQuery('');
    setUploadStatusMsg(`✨ Added category "${trimmed}"! Upload or adjust your work images below.`);

    // Smooth scroll down to the clickable category showcase
    setTimeout(() => {
      showcaseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // Remove a specialty category chip
  const handleRemoveSpecialty = (catToRemove: string) => {
    if (specialties.length <= 1) {
      alert('Please keep at least one specialization category.');
      return;
    }
    const nextSpecs = specialties.filter((s) => s !== catToRemove);
    setSpecialties(nextSpecs);
    if (activeCategoryTab === catToRemove) {
      setActiveCategoryTab(nextSpecs[0] || 'Commercial Shoot');
    }
    setUploadStatusMsg(`Removed "${catToRemove}" from active categories.`);
  };

  // Get current photos for the active category
  const currentCategoryPhotos = categoryGalleries[activeCategoryTab] ||
    getCategoryPhotos(photographer, activeCategoryTab, 15);

  // Delete a photo from the active category gallery (allows deleting any photo down to 0)
  const handleDeleteCategoryPhoto = (slotIndex: number) => {
    const currentList = [...currentCategoryPhotos];
    if (slotIndex < 0 || slotIndex >= currentList.length) return;
    const removedUrl = currentList[slotIndex];
    currentList.splice(slotIndex, 1);
    setCategoryGalleries((prev) => ({
      ...prev,
      [activeCategoryTab]: currentList,
    }));
    setLastDeletedPhoto({
      category: activeCategoryTab,
      index: slotIndex,
      url: removedUrl,
    });
    setEditingPhotoIndex(null);
    setUploadStatusMsg(`🗑️ Photo ${slotIndex + 1} deleted from "${activeCategoryTab}".`);
  };

  // Undo delete photo
  const handleUndoDelete = () => {
    if (!lastDeletedPhoto) return;
    const currentList = [...(categoryGalleries[lastDeletedPhoto.category] || currentCategoryPhotos)];
    currentList.splice(lastDeletedPhoto.index, 0, lastDeletedPhoto.url);
    setCategoryGalleries((prev) => ({
      ...prev,
      [lastDeletedPhoto.category]: currentList,
    }));
    setUploadStatusMsg(`↺ Restored photo in "${lastDeletedPhoto.category}".`);
    setLastDeletedPhoto(null);
  };

  // Open Image Cover Adjuster for an existing photo in the gallery
  const handleOpenAdjusterForExisting = (slotIndex: number) => {
    const url = currentCategoryPhotos[slotIndex];
    if (!url) return;
    setAdjustingPhoto({
      url,
      slotIndex,
      category: activeCategoryTab,
      slotNumber: slotIndex + 1,
    });
  };

  // Open Image Cover Adjuster for a newly selected file (replace or add)
  const handlePhotoFileForAdjustment = async (file: File, targetSlotIndex: number | null = null) => {
    try {
      const compressed = await compressImageFile(file, 1600, 1600, 0.90);
      setAdjustingPhoto({
        url: compressed,
        slotIndex: targetSlotIndex,
        category: activeCategoryTab,
        slotNumber: targetSlotIndex !== null ? targetSlotIndex + 1 : currentCategoryPhotos.length + 1,
      });
    } catch (err) {
      console.error('Error preparing image for cover adjustment:', err);
      alert('Failed to read image file.');
    }
  };

  // Save adjusted cover image back to active category gallery
  const handleSaveAdjustedCover = (adjustedDataUrl: string) => {
    if (!adjustingPhoto) return;
    const targetCategory = adjustingPhoto.category;
    const currentList = [...(categoryGalleries[targetCategory] || currentCategoryPhotos)];

    if (adjustingPhoto.slotIndex !== null && adjustingPhoto.slotIndex < currentList.length) {
      // Replaced existing slot
      currentList[adjustingPhoto.slotIndex] = adjustedDataUrl;
      setUploadStatusMsg(`✅ Adjusted cover saved for Photo ${adjustingPhoto.slotIndex + 1} in "${targetCategory}"!`);
    } else {
      // Added new slot
      if (currentList.length < 15) {
        currentList.push(adjustedDataUrl);
      } else {
        currentList[currentList.length - 1] = adjustedDataUrl;
      }
      setUploadStatusMsg(`✅ Added new photo with adjusted cover to "${targetCategory}"!`);
    }

    setCategoryGalleries((prev) => ({
      ...prev,
      [targetCategory]: currentList,
    }));
    setEditingPhotoIndex(null);
    setAdjustingPhoto(null);
  };

  // Reorder photos within the active category gallery (drag and drop or arrow click)
  const handleReorderPhotos = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return;
    const currentList = [...(categoryGalleries[activeCategoryTab] || currentCategoryPhotos)];
    if (fromIdx >= currentList.length || toIdx >= currentList.length) return;
    const [movedItem] = currentList.splice(fromIdx, 1);
    currentList.splice(toIdx, 0, movedItem);
    setCategoryGalleries((prev) => ({
      ...prev,
      [activeCategoryTab]: currentList,
    }));
    setSavedSuccess(false);
  };

  // Update a specific photo in the active category gallery (at slot 0..14)
  const handleUpdateCategoryPhoto = (slotIndex: number, newUrl: string) => {
    if (!newUrl.trim()) return;
    const currentList = [...currentCategoryPhotos];
    currentList[slotIndex] = newUrl.trim();
    setCategoryGalleries((prev) => ({
      ...prev,
      [activeCategoryTab]: currentList,
    }));
    setEditingPhotoIndex(null);
    setReplaceUrlInput('');
    setUploadStatusMsg(`✅ Updated photo ${slotIndex + 1} for ${activeCategoryTab}.`);
  };

  // Reset active category gallery to default 15 photos
  const handleResetCategoryPhotos = () => {
    const defaults = CATEGORY_DEFAULT_GALLERIES[normalizeCategoryKey(activeCategoryTab)] ||
      CATEGORY_DEFAULT_GALLERIES['Commercial Shoot'];
    setCategoryGalleries((prev) => ({
      ...prev,
      [activeCategoryTab]: defaults.slice(0, 15),
    }));
    setUploadStatusMsg(`↺ Reset ${activeCategoryTab} photos to studio defaults.`);
  };

  // Handle local file upload for Profile Picture
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, 600, 600, 0.85);
      setAvatarUrl(compressed);
    } catch {
      alert('Error reading avatar image file.');
    }
  };

  // Handle direct file upload for gallery (appends new photos directly to gallery)
  const handleMultiUploadFiles = async (files: FileList | File[], appendToGallery = true) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      alert('Please select valid image files (PNG, JPG, WEBP).');
      return;
    }

    const currentList = [...currentCategoryPhotos];
    const remainingSlots = 15 - currentList.length;
    if (appendToGallery && remainingSlots <= 0) {
      alert('This gallery has already reached the maximum of 15 photos. Delete or replace existing photos to add new ones.');
      return;
    }

    setIsUploadingMultiple(true);
    setUploadStatusMsg(null);

    try {
      const filesToProcess = appendToGallery ? fileArray.slice(0, remainingSlots) : fileArray.slice(0, 15);
      const compressedUrls: string[] = [];

      for (const file of filesToProcess) {
        // High quality photo compression preserving crisp studio detail
        const compressed = await compressImageFile(file, 2400, 2400, 0.92);
        compressedUrls.push(compressed);
      }

      let updatedList: string[];
      if (appendToGallery) {
        updatedList = [...currentList, ...compressedUrls].slice(0, 15);
      } else {
        updatedList = [...currentList];
        compressedUrls.forEach((url, i) => {
          if (i < 15) updatedList[i] = url;
        });
      }

      setCategoryGalleries((prev) => ({
        ...prev,
        [activeCategoryTab]: updatedList,
      }));

      setUploadStatusMsg(
        `✅ Directly uploaded ${compressedUrls.length} photo(s) to "${activeCategoryTab}"! Hover any photo to adjust cover framing or delete.`
      );
    } catch (err) {
      console.error('Error uploading photos:', err);
      alert('Failed to process uploaded photos. Please try again.');
    } finally {
      setIsUploadingMultiple(false);
      if (multiUploadFileInputRef.current) {
        multiUploadFileInputRef.current.value = '';
      }
      if (directAddPhotoFileInputRef.current) {
        directAddPhotoFileInputRef.current.value = '';
      }
    }
  };

  // Direct replace for a specific photo slot from file picker
  const handleDirectReplacePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetSlot = replaceTargetSlotRef.current;
    if (targetSlot === null || targetSlot < 0) return;

    try {
      const compressed = await compressImageFile(file, 2400, 2400, 0.92);
      const currentList = [...currentCategoryPhotos];
      currentList[targetSlot] = compressed;
      setCategoryGalleries((prev) => ({
        ...prev,
        [activeCategoryTab]: currentList,
      }));
      setUploadStatusMsg(`✅ Photo ${targetSlot + 1} updated directly for "${activeCategoryTab}".`);
    } catch (err) {
      console.error('Failed to replace photo:', err);
      alert('Failed to process image file.');
    } finally {
      replaceTargetSlotRef.current = null;
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = '';
      }
    }
  };

  // Handle URL batch apply
  const handleApplyBatchUrls = () => {
    const trimmed = batchUrlInput.trim();
    if (!trimmed) return;

    const urls = trimmed
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image/'));

    if (urls.length === 0) {
      alert('Please enter valid image URLs starting with http:// or https://');
      return;
    }

    const currentList = [...currentCategoryPhotos];
    urls.slice(0, 15).forEach((url, i) => {
      currentList[i] = url;
    });

    setCategoryGalleries((prev) => ({
      ...prev,
      [activeCategoryTab]: currentList,
    }));

    setBatchUrlInput('');
    setShowUrlInputBar(false);
    setUploadStatusMsg(
      `✅ Added ${urls.length} image URL(s) to "${activeCategoryTab}"! Click "Adjust Cover" to frame the main focal subject.`
    );
  };

  // Handle local file upload for replacing or adding a specific photo with cover adjustment
  const handleReplacePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || editingPhotoIndex === null) return;

    try {
      await handlePhotoFileForAdjustment(file, editingPhotoIndex);
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Failed to process photo.');
    } finally {
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = '';
      }
    }
  };

  // Submit and Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const passwordWillChange = Boolean(newPassword && newPassword.trim().length >= 4);
    const finalPassword = passwordWillChange ? newPassword.trim() : photographer.loginPassword;

    const updatedProfile: PhotographerProfile = {
      ...photographer,
      name: name.trim() || photographer.name,
      title: title.trim() || photographer.title,
      city,
      phone: phone.trim() || photographer.phone,
      email: email.trim() || photographer.email,
      experienceYears: parseInt(experienceYears, 10) || photographer.experienceYears,
      bio: bio.trim() || photographer.bio,
      specialties: specialties.length > 0 ? specialties : photographer.specialties,
      avatarUrl: avatarUrl.trim() || photographer.avatarUrl,
      categoryGalleries,
      loginPassword: finalPassword,
    };

    onSaveProfile(updatedProfile, passwordWillChange, passwordWillChange ? finalPassword : undefined);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div
      id="photographer-self-edit-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-[#DCE7D4] rounded-3xl max-w-3xl w-full text-[#073B2F] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-[#DCE7D4] bg-[#F6F3EC] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#073B2F] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Camera className="w-5 h-5 text-[#FF6A45]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#073B2F] font-['Space_Grotesk',sans-serif]">
                My Profile & Portfolio Settings
              </h2>
              <p className="text-xs text-[#5C6E5E]">
                Update your profile picture, 6-photo category showcase, and account security
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-stone-200/60 text-[#5C6E5E] hover:text-[#073B2F] flex items-center justify-center transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#DCE7D4] bg-[#FAF8F5] px-5 sm:px-7 gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#073B2F] text-[#073B2F]'
                : 'border-transparent text-[#5C6E5E] hover:text-[#073B2F]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Photo & Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('showcase')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'showcase'
                ? 'border-[#073B2F] text-[#073B2F]'
                : 'border-transparent text-[#5C6E5E] hover:text-[#073B2F]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Category Showcase (6 Photos Each)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'password'
                ? 'border-[#073B2F] text-[#073B2F]'
                : 'border-transparent text-[#5C6E5E] hover:text-[#073B2F]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-900 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile, categories, and showcase updated successfully!</span>
            </div>
          )}

          {/* TAB 1: PROFILE PHOTO & DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Profile Image Upload & Preview */}
              <div className="p-4 rounded-2xl bg-[#F6F3EC] border border-[#DCE7D4] space-y-3">
                <label className="text-xs font-bold text-[#073B2F] block">
                  Profile Picture
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group">
                    <img
                      src={avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'}
                      alt="Avatar Preview"
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-stone-200"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-[10px] font-bold mt-0.5">Upload</span>
                    </button>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleAvatarFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#073B2F] border border-[#DCE7D4] hover:bg-stone-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#073B2F]" />
                        <span>Upload Photo</span>
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl('')}
                          className="px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-[#073B2F] block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white border border-[#DCE7D4] rounded-xl px-3 py-2 text-xs font-bold text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#073B2F] block mb-1">Base City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-[#DCE7D4] rounded-xl px-3 py-2 text-xs font-bold text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#073B2F] block mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-white border border-[#DCE7D4] rounded-xl px-3 py-2 text-xs text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#073B2F] block mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full bg-white border border-[#DCE7D4] rounded-xl px-3 py-2 text-xs text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#073B2F] block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#DCE7D4] rounded-xl px-3 py-2 text-xs text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#073B2F] block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#DCE7D4] rounded-xl px-3 py-2 text-xs text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-bold text-[#073B2F] block mb-1">Bio / Story</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white border border-[#DCE7D4] rounded-xl p-3 text-xs text-[#073B2F] focus:outline-none focus:border-[#073B2F] resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: SPECIALIZATION SHOWCASE (15 PHOTOS PER CATEGORY) */}
          {activeTab === 'showcase' && (
            <div className="space-y-6">
              {/* Category Selection Bar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F3EC] border border-[#DCE7D4] space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#073B2F] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#FF6A45]" />
                    <span>Specialization Category Selection Bar</span>
                  </label>
                  <span className="text-[11px] font-bold text-[#073B2F] bg-[#F0FFDA] px-2.5 py-0.5 rounded-full border border-[#DCE7D4]">
                    {specialties.length} active
                  </span>
                </div>
                <p className="text-[11px] text-[#5C6E5E]">
                  Choose your shoot categories or type custom shoots in the selection bar below. Other and Custom are seamlessly unified.
                </p>

                {/* Combobox Selection Bar */}
                <div ref={categoryBarRef} className="relative">
                  <div
                    onClick={() => {
                      setIsCategoryBarOpen(true);
                      categoryInputRef.current?.focus();
                    }}
                    className={`w-full bg-white border rounded-xl px-3 py-2 flex flex-wrap items-center gap-1.5 transition cursor-pointer shadow-2xs min-h-[46px] ${
                      isCategoryBarOpen
                        ? 'border-[#073B2F] ring-2 ring-[#073B2F]/15'
                        : 'border-[#DCE7D4] hover:border-[#073B2F]'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-[#FF6A45] shrink-0 mr-1" />

                    {/* Active Categories as Chips INSIDE the selection bar */}
                    {specialties.map((spec) => {
                      const isCurrentShowcase = activeCategoryTab === spec;
                      return (
                        <span
                          key={spec}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCategoryTab(spec);
                            showcaseSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer select-none active:scale-95 ${
                            isCurrentShowcase
                              ? 'bg-[#073B2F] text-white border-[#073B2F] shadow-xs'
                              : 'bg-[#F0FFDA] text-[#073B2F] border-[#DCE7D4] hover:border-[#073B2F]'
                          }`}
                        >
                          <Check className={`w-3 h-3 ${isCurrentShowcase ? 'text-[#FF6A45]' : 'text-[#073B2F]'}`} />
                          <span>{spec}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSpecialty(spec);
                            }}
                            className={`p-0.5 rounded-full transition cursor-pointer ml-0.5 ${
                              isCurrentShowcase
                                ? 'hover:bg-white/20 text-white/80 hover:text-white'
                                : 'hover:bg-stone-200 text-[#5C6E5E] hover:text-[#073B2F]'
                            }`}
                            title={`Remove ${spec}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}

                    {/* Integrated search / custom input right inside the bar */}
                    <input
                      ref={categoryInputRef}
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => {
                        setCategorySearchQuery(e.target.value);
                        setIsCategoryBarOpen(true);
                      }}
                      onFocus={() => setIsCategoryBarOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const q = categorySearchQuery.trim();
                          if (q) {
                            handleAddCustomShoot(q);
                          }
                        }
                      }}
                      placeholder={specialties.length === 0 ? "Select categories or type custom shoot..." : "+ Add shoot category..."}
                      className="min-w-[130px] flex-1 text-xs font-medium text-[#073B2F] placeholder-[#5C6E5E]/70 bg-transparent focus:outline-none py-1"
                    />

                    <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                      {categorySearchQuery && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategorySearchQuery('');
                          }}
                          className="text-stone-400 hover:text-stone-600 p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="text-[10px] font-bold text-[#073B2F] bg-[#F0FFDA] px-2 py-0.5 rounded-full border border-[#DCE7D4] shrink-0">
                        {specialties.length} active
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#5C6E5E] transition-transform duration-200 ${
                          isCategoryBarOpen ? 'rotate-180 text-[#073B2F]' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Dropdown Options Menu */}
                  {isCategoryBarOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#DCE7D4] rounded-2xl shadow-xl p-3 z-40 max-h-80 overflow-y-auto space-y-2 animate-in fade-in zoom-in-95 duration-150">
                      {/* Dropdown Top Bar */}
                      <div className="flex items-center justify-between pb-2 border-b border-[#DCE7D4]">
                        <div className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#FF6A45]" />
                          <span className="text-xs font-bold text-[#073B2F]">Select Shoot Categories</span>
                        </div>
                        <span className="text-[11px] font-semibold text-[#5C6E5E]">
                          {specialties.length} selected
                        </span>
                      </div>

                      {/* Dynamic Custom Add Prompt if user typed something not in standard list */}
                      {categorySearchQuery.trim() &&
                        !AVAILABLE_SPECIALTIES.some(
                          (s) => s.toLowerCase() === categorySearchQuery.trim().toLowerCase()
                        ) &&
                        !specialties.some(
                          (s) => s.toLowerCase() === categorySearchQuery.trim().toLowerCase()
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleAddCustomShoot(categorySearchQuery)}
                            className="w-full text-left p-2.5 rounded-xl bg-[#F0FFDA] hover:bg-[#e4fabf] text-[#073B2F] text-xs font-bold transition flex items-center justify-between border border-[#073B2F]/20 cursor-pointer shadow-xs"
                          >
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#FF6A45]" />
                              <span>Add Custom Shoot: "{categorySearchQuery.trim()}"</span>
                            </span>
                            <span className="text-[10px] bg-[#073B2F] text-white px-2 py-0.5 rounded-md font-semibold">
                              Add & Open
                            </span>
                          </button>
                        )}

                      <div className="text-[10px] font-bold text-[#5C6E5E] uppercase tracking-wider px-1 pt-1">
                        Standard Shoot Categories
                      </div>

                      <div className="space-y-1">
                        {AVAILABLE_SPECIALTIES.filter((s) => s !== 'Other / Custom')
                          .filter((s) =>
                            categorySearchQuery.trim()
                              ? s.toLowerCase().includes(categorySearchQuery.trim().toLowerCase())
                              : true
                          )
                          .map((spec) => {
                            const isSelected = specialties.includes(spec);
                            return (
                              <button
                                key={spec}
                                type="button"
                                onClick={() => toggleSpecialty(spec)}
                                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between cursor-pointer hover:bg-[#F6F3EC] text-[#073B2F]"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                                      isSelected
                                        ? 'border-[#FF6A45] bg-[#FF6A45] text-white'
                                        : 'border-[#DCE7D4] bg-white'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-3" />}
                                  </div>
                                  <span className={isSelected ? 'font-bold text-[#073B2F]' : 'text-[#073B2F]'}>{spec}</span>
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-[#FF6A45]">Selected</span>
                                )}
                              </button>
                            );
                          })}
                      </div>

                      {/* Unified Other / Custom in the Selection Bar */}
                      <div className="pt-2 mt-2 border-t border-[#DCE7D4]">
                        <div className="text-[10px] font-bold text-[#5C6E5E] uppercase tracking-wider px-1 mb-1">
                          Other / Custom Specialization
                        </div>

                        {!showOtherCustomInput ? (
                          <button
                            type="button"
                            onClick={() => {
                              setShowOtherCustomInput(true);
                              setTimeout(() => otherCustomInputRef.current?.focus(), 50);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#073B2F] hover:bg-[#F6F3EC] transition flex items-center justify-between cursor-pointer group"
                          >
                            <span className="flex items-center gap-2">
                              <Plus className="w-3.5 h-3.5 text-[#FF6A45] group-hover:scale-110 transition" />
                              <span>+ Add Custom Shoot Type</span>
                            </span>
                            <span className="text-[10px] text-[#5C6E5E]">Specify custom name</span>
                          </button>
                        ) : (
                          <div className="p-2.5 bg-[#F6F3EC] rounded-xl border border-[#DCE7D4] space-y-2 mt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-[#073B2F] flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-[#FF6A45]" />
                                <span>Write custom shoot name:</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowOtherCustomInput(false)}
                                className="text-stone-400 hover:text-stone-700 p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                ref={otherCustomInputRef}
                                type="text"
                                value={otherCustomInputValue}
                                onChange={(e) => setOtherCustomInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustomShoot();
                                  }
                                }}
                                placeholder="e.g. Drone Photography, Maternity Shoot..."
                                className="flex-1 bg-white border border-[#DCE7D4] rounded-lg px-2.5 py-1.5 text-xs text-[#073B2F] font-semibold focus:outline-none focus:border-[#073B2F]"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddCustomShoot()}
                                disabled={!otherCustomInputValue.trim()}
                                className="px-3 py-1.5 bg-[#073B2F] hover:bg-[#0c4e3f] disabled:opacity-40 text-white text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sticky Bottom Done Button */}
                      <div className="pt-2 mt-2 border-t border-[#DCE7D4] sticky bottom-0 bg-white">
                        <button
                          type="button"
                          onClick={() => setIsCategoryBarOpen(false)}
                          className="w-full py-2 bg-[#073B2F] hover:bg-[#0c4e3f] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs active:scale-98"
                        >
                          <Check className="w-4 h-4 text-[#FF6A45]" />
                          <span>Done</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Clickable Category Showcase Section */}
              <div ref={showcaseSectionRef} className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#073B2F] flex items-center gap-1.5 font-['Space_Grotesk',sans-serif]">
                      <Layers className="w-4 h-4 text-[#FF6A45]" />
                      <span>Clickable Category Showcase</span>
                    </h4>
                    <p className="text-[11px] text-[#5C6E5E]">
                      Click any category below to manage and upload your work photos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetCategoryPhotos}
                    className="px-2.5 py-1.5 text-xs font-semibold text-[#5C6E5E] hover:text-[#073B2F] bg-white border border-[#DCE7D4] rounded-lg transition flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    title="Reset to default gallery photos for this category"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Category Photos</span>
                  </button>
                </div>

                {/* Clickable category pills */}
                <div className="flex flex-wrap gap-2">
                  {specialties.map((cat) => {
                    const isSelected = cat === activeCategoryTab;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setActiveCategoryTab(cat);
                          setEditingPhotoIndex(null);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95 ${
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

                {/* Active Category Work & Upload Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DCE7D4] space-y-4 shadow-xs">
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE7D4]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#073B2F]">
                          {activeCategoryTab} Portfolio
                        </span>
                        <span className="text-[11px] font-bold text-[#073B2F] bg-[#F0FFDA] px-2.5 py-0.5 rounded-full border border-[#DCE7D4]">
                          {currentCategoryPhotos.length} Photos Showcase
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5C6E5E] mt-0.5">
                        Photos 1–6 appear in the card preview strip. All 15 photos appear when clients click "{activeCategoryTab} see more".
                      </p>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {uploadStatusMsg && (
                    <div className="p-3 bg-[#F0FFDA] border border-[#DCE7D4] rounded-xl flex items-center justify-between text-xs text-[#073B2F] animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#073B2F] shrink-0" />
                        <span className="font-semibold">{uploadStatusMsg}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadStatusMsg(null)}
                        className="text-[#5C6E5E] hover:text-[#073B2F] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Upload Work Images Dropzone & Action Bar */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleMultiUploadFiles(e.dataTransfer.files);
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all ${
                      isDraggingOver
                        ? 'border-[#073B2F] bg-[#F0FFDA]/60 scale-[1.01]'
                        : 'border-[#DCE7D4] bg-[#F6F3EC]/50 hover:bg-[#F6F3EC] hover:border-[#073B2F]/40'
                    }`}
                  >
                    <input
                      type="file"
                      ref={multiUploadFileInputRef}
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleMultiUploadFiles(e.target.files);
                        }
                      }}
                      className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#073B2F]/10 flex items-center justify-center text-[#073B2F]">
                        <Upload className="w-5 h-5" />
                      </div>

                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-[#073B2F]">
                          Upload Images for {activeCategoryTab}
                        </h5>
                        <p className="text-[11px] text-[#5C6E5E] max-w-md mx-auto mt-0.5">
                          Drag and drop photos here, or browse from your phone/computer. Supports selecting multiple photos at once.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => multiUploadFileInputRef.current?.click()}
                          disabled={isUploadingMultiple}
                          className="px-4 py-2 bg-[#073B2F] text-white text-xs font-bold rounded-xl hover:bg-[#0c4e3f] transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          {isUploadingMultiple ? (
                            <span>Optimizing & Loading Photos...</span>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5 text-[#FF6A45]" />
                              <span>Upload Work Photos</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 15 Photos Grid */}
                  <div className="space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-[#073B2F] flex items-center gap-1.5">
                        <span>{activeCategoryTab} Gallery ({currentCategoryPhotos.length} Photos)</span>
                        <span className="text-[10px] text-[#5C6E5E] font-normal">Up to 15 photos</span>
                      </span>
                      <span className="text-[11px] text-[#5C6E5E] flex items-center gap-1 font-medium">
                        <GripVertical className="w-3.5 h-3.5 text-[#073B2F]" />
                        <span>Touch photo to delete/change • Drag to reorder</span>
                      </span>
                    </div>

                    {/* Undo delete banner */}
                    {lastDeletedPhoto && lastDeletedPhoto.category === activeCategoryTab && (
                      <div className="p-2.5 bg-[#FFF4EE] border border-[#FF6A45]/40 rounded-xl flex items-center justify-between gap-2 text-xs animate-in fade-in">
                        <span className="text-[#073B2F] flex items-center gap-1.5 font-medium">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          <span>Deleted photo (Slot {lastDeletedPhoto.index + 1})</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleUndoDelete}
                          className="px-2.5 py-1 bg-white hover:bg-stone-50 border border-[#DCE7D4] text-[#073B2F] font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                        >
                          <Undo2 className="w-3 h-3 text-[#073B2F]" />
                          <span>Undo Delete</span>
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      {currentCategoryPhotos.map((imgUrl, idx) => {
                        const isDragging = draggedPhotoIndex === idx;
                        const isDragOver = dragOverPhotoIndex === idx;
                        const isTouched = touchedPhotoIndex === idx;

                        return (
                          <div
                            key={`${imgUrl}-${idx}`}
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', String(idx));
                              e.dataTransfer.effectAllowed = 'move';
                              setDraggedPhotoIndex(idx);
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              if (dragOverPhotoIndex !== idx) {
                                setDragOverPhotoIndex(idx);
                              }
                            }}
                            onDragLeave={() => {
                              if (dragOverPhotoIndex === idx) {
                                setDragOverPhotoIndex(null);
                              }
                            }}
                            onDragEnd={() => {
                              setDraggedPhotoIndex(null);
                              setDragOverPhotoIndex(null);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const fromStr = e.dataTransfer.getData('text/plain');
                              const from = draggedPhotoIndex !== null ? draggedPhotoIndex : parseInt(fromStr, 10);
                              if (!isNaN(from) && from !== idx) {
                                handleReorderPhotos(from, idx);
                              }
                              setDraggedPhotoIndex(null);
                              setDragOverPhotoIndex(null);
                            }}
                            onClick={() => {
                              setTouchedPhotoIndex(isTouched ? null : idx);
                            }}
                            onTouchStart={() => {
                              if (touchedPhotoIndex !== idx) {
                                setTouchedPhotoIndex(idx);
                              }
                            }}
                            className={`group relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border transition cursor-pointer select-none ${
                              isDragging
                                ? 'opacity-35 scale-95 border-2 border-dashed border-[#073B2F]'
                                : isDragOver
                                ? 'ring-3 ring-[#073B2F] ring-offset-2 scale-102 border-[#073B2F]'
                                : isTouched
                                ? 'ring-2 ring-[#FF6A45] ring-offset-1 border-[#FF6A45] shadow-md'
                                : 'border-[#DCE7D4] hover:border-[#073B2F]'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${activeCategoryTab} slot ${idx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover select-none pointer-events-none"
                            />

                            {/* Top badge indicator: Position number + Grip Icon */}
                            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10 pointer-events-none">
                              <span
                                className="px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 shadow-xs"
                                title="Position number"
                              >
                                <GripVertical className="w-3 h-3 text-amber-300" />
                                <span>{idx + 1}</span>
                              </span>
                            </div>

                            {/* Direct Delete button in top-right - small icon of delete visible when touched or hovered */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategoryPhoto(idx);
                                setTouchedPhotoIndex(null);
                              }}
                              onTouchEnd={(e) => {
                                e.stopPropagation();
                                handleDeleteCategoryPhoto(idx);
                                setTouchedPhotoIndex(null);
                              }}
                              title={`Delete Photo ${idx + 1}`}
                              className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 active:scale-90 text-white flex items-center justify-center shadow-md transition-all cursor-pointer z-30 ${
                                isTouched
                                  ? 'opacity-100 scale-110 ring-2 ring-white shadow-lg'
                                  : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>

                            {/* Quick shift arrows on bottom left */}
                            <div className={`absolute bottom-1.5 left-1.5 flex items-center gap-1 z-20 transition-opacity ${
                              isTouched ? 'opacity-100' : 'opacity-0 sm:group-hover:opacity-100'
                            }`}>
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReorderPhotos(idx, idx - 1);
                                  }}
                                  title={`Move to slot ${idx}`}
                                  className="w-6 h-6 rounded-md bg-black/75 hover:bg-black text-white flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                </button>
                              )}
                              {idx < currentCategoryPhotos.length - 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReorderPhotos(idx, idx + 1);
                                  }}
                                  title={`Move to slot ${idx + 2}`}
                                  className="w-6 h-6 rounded-md bg-black/75 hover:bg-black text-white flex items-center justify-center transition cursor-pointer shadow-xs active:scale-95"
                                >
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Touch & Hover overlay with Change Photo, Reorder and Delete */}
                            <div className={`absolute inset-0 bg-black/65 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 z-15 ${
                              isTouched ? 'opacity-100 pointer-events-auto' : 'opacity-0 sm:group-hover:opacity-100 pointer-events-none sm:pointer-events-auto'
                            }`}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  replaceTargetSlotRef.current = idx;
                                  replaceFileInputRef.current?.click();
                                }}
                                className="w-full max-w-[130px] px-2.5 py-1.5 rounded-lg bg-white text-[#073B2F] text-[11px] font-bold shadow-xs hover:bg-[#F0FFDA] transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#073B2F]" />
                                <span>Change Photo</span>
                              </button>

                              {/* Slot navigation buttons inside overlay */}
                              <div className="flex items-center gap-1 w-full max-w-[130px]">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReorderPhotos(idx, idx - 1);
                                  }}
                                  className="flex-1 py-1 px-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-900 disabled:opacity-30 disabled:hover:bg-stone-800/90 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                                  title="Move earlier"
                                >
                                  <ArrowLeft className="w-2.5 h-2.5" />
                                  <span>Slot {idx}</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === currentCategoryPhotos.length - 1}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReorderPhotos(idx, idx + 1);
                                  }}
                                  className="flex-1 py-1 px-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-900 disabled:opacity-30 disabled:hover:bg-stone-800/90 text-white text-[10px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                                  title="Move later"
                                >
                                  <span>Slot {idx + 2}</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategoryPhoto(idx);
                                  setTouchedPhotoIndex(null);
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategoryPhoto(idx);
                                  setTouchedPhotoIndex(null);
                                }}
                                className="w-full max-w-[130px] px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs active:scale-95"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete Photo</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Photo Slot Button if gallery has fewer than 15 photos */}
                      {currentCategoryPhotos.length < 15 && (
                        <button
                          type="button"
                          onClick={() => directAddPhotoFileInputRef.current?.click()}
                          className="aspect-4/3 rounded-xl border-2 border-dashed border-[#DCE7D4] hover:border-[#073B2F] bg-white hover:bg-[#F0FFDA]/30 transition flex flex-col items-center justify-center gap-1.5 text-xs text-[#5C6E5E] hover:text-[#073B2F] cursor-pointer p-3 group"
                        >
                          <div className="w-9 h-9 rounded-full bg-[#F6F3EC] group-hover:bg-[#073B2F] flex items-center justify-center transition shadow-2xs">
                            <Plus className="w-5 h-5 text-[#FF6A45] group-hover:text-[#F0FFDA]" />
                          </div>
                          <span className="font-bold text-xs text-[#073B2F]">+ Add Photo</span>
                          <span className="text-[10px] text-[#5C6E5E]">Slot {currentCategoryPhotos.length + 1} of 15 (Direct)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Hidden file inputs for direct device selection */}
                  <input
                    type="file"
                    ref={directAddPhotoFileInputRef}
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultiUploadFiles(e.target.files, true);
                      }
                    }}
                    className="hidden"
                  />

                  <input
                    type="file"
                    ref={replaceFileInputRef}
                    accept="image/*"
                    onChange={handleDirectReplacePhoto}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHANGE PASSWORD & ADMIN SYNC */}
          {activeTab === 'password' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F0FFDA] border border-[#DCE7D4] flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#073B2F] shrink-0 mt-0.5" />
                <div className="text-xs text-[#073B2F] leading-relaxed">
                  <p className="font-bold mb-1">Admin Master Password Protection</p>
                  <p className="text-[#5C6E5E]">
                    When you update your password here, your new password is automatically updated and synced with the
                    <strong> Studio Admin Master Control</strong> so administrators can assist you with account recovery and bookings.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F6F3EC] border border-[#DCE7D4] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#5C6E5E] font-medium">Your Current Password:</span>
                  <span className="text-xs font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-[#DCE7D4] text-[#073B2F]">
                    {photographer.loginPassword || `${photographer.name.split(' ')[0].toLowerCase()}123`}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#073B2F] block mb-1">
                    Set New Portal Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-[#5C6E5E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new secure password (leave empty to keep current)"
                      className="w-full bg-white border border-[#DCE7D4] rounded-xl pl-9 pr-10 py-2 text-xs font-mono text-[#073B2F] focus:outline-none focus:border-[#073B2F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5C6E5E] hover:text-[#073B2F] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5C6E5E] mt-1.5">
                    Tip: Minimum 4 characters. Use letters, numbers or symbols.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#DCE7D4] flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C6E5E] hover:text-[#073B2F] bg-white border border-[#DCE7D4] hover:bg-stone-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#073B2F] hover:bg-[#0c4e3f] text-white transition flex items-center gap-1.5 shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#F0FFDA]" />
              <span>Save & Sync Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Image Cover Adjuster Modal for Cropping and Setting Focal Subject */}
      {adjustingPhoto && (
        <ImageCoverAdjusterModal
          isOpen={Boolean(adjustingPhoto)}
          imageSrc={adjustingPhoto.url}
          title="Adjust Photo Cover & Main Subject"
          categoryName={adjustingPhoto.category}
          photoSlotNumber={adjustingPhoto.slotNumber}
          onClose={() => setAdjustingPhoto(null)}
          onSave={handleSaveAdjustedCover}
        />
      )}
    </div>
  );
};
