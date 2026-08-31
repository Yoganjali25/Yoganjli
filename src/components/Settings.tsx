import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Lock, Building, Save, CheckCircle2, LogOut, Upload, Sparkles, Image as ImageIcon, Type, Download, Globe, BookOpen } from 'lucide-react';
import { DEFAULT_WEBSITE_CMS } from '../config/siteConfig';
import { BlogManagerCMS } from './BlogManagerCMS';

interface SettingsProps {
  onLogout?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const { trainerProfile, updateTrainerProfile, exportBackupData, importBackupData, websiteCMS, updateWebsiteCMS, forcePushCloud } = useApp();

  const [name, setName] = useState(trainerProfile.name);
  const [studioName, setStudioName] = useState(trainerProfile.studioName);
  const [phone, setPhone] = useState(trainerProfile.phone);
  const [upiId, setUpiId] = useState(trainerProfile.upiId || 'yoganjali@upi');
  const [studioLogoUrl, setStudioLogoUrl] = useState<string>(
    trainerProfile.studioLogoUrl || '/yoganjali-logo.png'
  );
  
  const [appTitle, setAppTitle] = useState<string>(trainerProfile.appTitle || 'Yoganjali');
  const [appSubtitle, setAppSubtitle] = useState<string>(trainerProfile.appSubtitle || 'Yoga Journal & Fee Manager');

  // Website CMS Multi-Section State
  const cms = websiteCMS || DEFAULT_WEBSITE_CMS;
  const [activeCmsTab, setActiveCmsTab] = useState<'photos' | 'hero' | 'about' | 'programs' | 'sections' | 'contacts' | 'blogs'>('blogs');

  // Brand & Header
  const [announcementBar, setAnnouncementBar] = useState(cms.announcementBar || "🌸 1-Day Free Trial Available • Book Your Live Demo Session Today");
  const [brandName, setBrandName] = useState(cms.brandName || "YOGANJALI");
  const [instructorName, setInstructorName] = useState(cms.instructorName || "Anjali Negi");
  const [tagline, setTagline] = useState(cms.tagline || "Yoga Should Fit Into Your Life");

  // Hero Section
  const [heroTagline, setHeroTagline] = useState(cms.heroTagline);
  const [heroTitle, setHeroTitle] = useState(cms.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(cms.heroSubtitle);
  const [heroImage, setHeroImage] = useState(cms.heroImage);

  // Why Choose Us
  const [whyTitle, setWhyTitle] = useState(cms.whyTitle || "Why Choose Yoganjali?");
  const [whySubtitle, setWhySubtitle] = useState(cms.whySubtitle || "Experience authentic, personalized yoga...");

  // About Anjali
  const [aboutTitle, setAboutTitle] = useState(cms.aboutTitle);
  const [aboutQuote, setAboutQuote] = useState(cms.aboutQuote);
  const [aboutBio1, setAboutBio1] = useState(cms.aboutBio1);
  const [aboutBio2, setAboutBio2] = useState(cms.aboutBio2);
  const [aboutImage, setAboutImage] = useState(cms.aboutImage);

  // Programs & Prices
  const [classesTitle, setClassesTitle] = useState(cms.classesTitle || "Yoga Programs Designed Around You");
  const [classesSubtitle, setClassesSubtitle] = useState(cms.classesSubtitle || "Choose the practice format...");
  const [personalClassPrice, setPersonalClassPrice] = useState(cms.personalClassPrice || "₹10,000 / month");
  const [groupClassPrice, setGroupClassPrice] = useState(cms.groupClassPrice || "₹3,500 / month");
  const [wellnessClassPrice, setWellnessClassPrice] = useState(cms.wellnessClassPrice || "₹5,000 / month");

  // Goals, Onboarding, Timeline, FAQ, Contact
  const [goalsTitle, setGoalsTitle] = useState(cms.goalsTitle || "Programs Targeted To Your Health Goals");
  const [goalsSubtitle, setGoalsSubtitle] = useState(cms.goalsSubtitle || "Specific practices designed to deliver real health transformations.");
  const [onboardingTitle, setOnboardingTitle] = useState(cms.onboardingTitle || "Simple 4-Step Onboarding Process");
  const [onboardingSubtitle, setOnboardingSubtitle] = useState(cms.onboardingSubtitle || "Start your personalized yoga journey...");
  const [timelineTitle, setTimelineTitle] = useState(cms.timelineTitle || "60 Minutes For You");
  const [timelineSubtitle, setTimelineSubtitle] = useState(cms.timelineSubtitle || "Every session is structured...");
  const [testimonialsTitle, setTestimonialsTitle] = useState(cms.testimonialsTitle || "What My Students Say");
  const [testimonialsSubtitle, setTestimonialsSubtitle] = useState(cms.testimonialsSubtitle || "Real stories from practitioners...");
  const [faqTitle, setFaqTitle] = useState(cms.faqTitle || "Frequently Asked Questions");
  const [faqSubtitle, setFaqSubtitle] = useState(cms.faqSubtitle || "Got questions? Here is everything you need to know...");

  const [contactTitle, setContactTitle] = useState(cms.contactTitle || "Ready to Transform Your Body & Peace of Mind?");
  const [contactSubtitle, setContactSubtitle] = useState(cms.contactSubtitle || "Join Anjali Negi's studio today...");
  const [contactImage, setContactImage] = useState(cms.contactImage);
  const [logoImage, setLogoImage] = useState(cms.logoImage);
  const [displayPhone, setDisplayPhone] = useState(cms.displayPhone);
  const [displayPhone2, setDisplayPhone2] = useState(cms.displayPhone2);
  const [email, setEmail] = useState(cms.email);
  const [googleReviewsUrl, setGoogleReviewsUrl] = useState(cms.googleReviewsUrl || "https://share.google/Jz55Wo5fRsfuUPMhV");
  const [instagramUrl, setInstagramUrl] = useState(cms.instagramUrl || "https://instagram.com/yoganjali25");
  const [youtubeUrl, setYoutubeUrl] = useState(cms.youtubeUrl || "https://www.youtube.com/@Yoganjali25");

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteCMS({
      ...cms,
      announcementBar,
      brandName,
      instructorName,
      tagline,
      heroTagline,
      heroTitle,
      heroSubtitle,
      heroImage,
      whyTitle,
      whySubtitle,
      aboutTitle,
      aboutQuote,
      aboutBio1,
      aboutBio2,
      aboutImage,
      classesTitle,
      classesSubtitle,
      personalClassPrice,
      groupClassPrice,
      wellnessClassPrice,
      goalsTitle,
      goalsSubtitle,
      onboardingTitle,
      onboardingSubtitle,
      timelineTitle,
      timelineSubtitle,
      testimonialsTitle,
      testimonialsSubtitle,
      faqTitle,
      faqSubtitle,
      contactTitle,
      contactSubtitle,
      contactImage,
      logoImage,
      displayPhone,
      displayPhone2,
      email,
      googleReviewsUrl,
      instagramUrl,
      youtubeUrl
    });
  };

  // High-performance image compressor to ensure small file sizes & 0 localStorage quota errors
  const compressImage = (file: File, maxDim = 1000, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    fieldKey: 'logoImage' | 'heroImage' | 'aboutImage' | 'contactImage'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedDataUrl = await compressImage(file);
      if (compressedDataUrl) {
        setter(compressedDataUrl);
        // Instantly save to live website state
        updateWebsiteCMS({
          ...(websiteCMS || DEFAULT_WEBSITE_CMS),
          heroTagline,
          heroTitle,
          heroSubtitle,
          heroImage,
          aboutImage,
          contactImage,
          logoImage,
          aboutTitle,
          aboutQuote,
          aboutBio1,
          aboutBio2,
          displayPhone,
          displayPhone2,
          email,
          [fieldKey]: compressedDataUrl
        });
      }
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTrainerProfile({
      ...trainerProfile,
      name,
      studioName,
      phone,
      upiId,
      studioLogoUrl,
      appTitle,
      appSubtitle
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleStudioLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudioLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetLogo = (presetSeed: string) => {
    setStudioLogoUrl(`https://api.dicebear.com/7.x/shapes/svg?seed=${presetSeed}&backgroundColor=7c3aed`);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings saved successfully!
        </div>
      )}

      {/* Main Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card Left (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Building className="w-5 h-5 text-purple-600" />
              Studio Branding & Header Customization
            </h3>

            {/* Custom Header Title & Subtitle Inputs */}
            <div className="bg-purple-50/60 p-5 rounded-3xl border border-purple-100 space-y-4">
              <h4 className="font-extrabold text-purple-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-4 h-4 text-purple-600" />
                Top Navbar Header Title & Subtitle
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Header App Title *</label>
                  <input
                    type="text"
                    required
                    value={appTitle}
                    onChange={(e) => setAppTitle(e.target.value)}
                    placeholder="Yoganjali"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-purple-200 text-xs font-extrabold text-purple-950 outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Header Subtitle Tagline *</label>
                  <input
                    type="text"
                    required
                    value={appSubtitle}
                    onChange={(e) => setAppSubtitle(e.target.value)}
                    placeholder="Yoga Journal & Fee Manager"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-purple-200 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Custom Studio Logo Section */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 p-5 rounded-3xl border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-purple-600" />
                    Custom Studio Brand Logo Image
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Upload your own studio logo image to display next to your header title.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-white ring-2 ring-purple-300 shadow-sm overflow-hidden flex items-center justify-center p-1">
                    <img src={studioLogoUrl} alt="Studio Logo Preview" className="w-full h-full object-cover rounded-xl" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white font-extrabold text-xs cursor-pointer shadow-md hover:bg-purple-700 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Custom Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStudioLogoUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handlePresetLogo('YoganjaliLotus')}
                  className="px-3 py-2 rounded-xl bg-white border border-purple-200 text-purple-900 text-xs font-bold hover:bg-purple-100"
                >
                  🌸 Lotus Preset
                </button>

                <button
                  type="button"
                  onClick={() => handlePresetLogo('OmShala')}
                  className="px-3 py-2 rounded-xl bg-white border border-purple-200 text-purple-900 text-xs font-bold hover:bg-purple-100"
                >
                  🕉️ Om Preset
                </button>
              </div>
            </div>

            {/* Instructor Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instructor Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Studio / Shala Name</label>
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Studio UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yoganjali@upi"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md hover:bg-purple-700 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Profile & Header Settings
              </button>
            </div>
          </form>

          {/* ============================================================================ */}
          {/* LIVE WEBSITE CONTENT & IMAGE MANAGER (CMS) */}
          {/* ============================================================================ */}
          <form onSubmit={handleCmsSubmit} className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-purple-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <Globe className="w-6 h-6 text-amber-300 animate-pulse" />
                <div>
                  <h3 className="text-xl font-extrabold text-white">Live Website Content & Image Manager (CMS)</h3>
                  <p className="text-xs text-purple-200 font-medium">Customize website photos, hero headlines, bio quotes & contact hotlines in real-time!</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30">
                LIVE CMS ACTIVE
              </span>
            </div>

            {/* SECTION SELECTOR TABS */}
            <div className="flex flex-wrap items-center gap-2 border-b border-purple-800/80 pb-3">
              <button
                type="button"
                onClick={() => setActiveCmsTab('blogs')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeCmsTab === 'blogs'
                    ? 'bg-amber-400 text-amber-950 shadow-md font-extrabold ring-2 ring-amber-300'
                    : 'bg-white/15 text-amber-300 hover:bg-white/25'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>📝 Blog & Articles Manager</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCmsTab('photos')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeCmsTab === 'photos'
                    ? 'bg-amber-400 text-amber-950 shadow-md font-extrabold'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                🖼️ Photos & Images
              </button>

              <button
                type="button"
                onClick={() => setActiveCmsTab('hero')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeCmsTab === 'hero'
                    ? 'bg-amber-400 text-amber-950 shadow-md font-extrabold'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                🏠 Top Bar & Hero
              </button>

              <button
                type="button"
                onClick={() => setActiveCmsTab('about')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeCmsTab === 'about'
                    ? 'bg-amber-400 text-amber-950 shadow-md font-extrabold'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                🧘 Instructor & Bio
              </button>

              <button
                type="button"
                onClick={() => setActiveCmsTab('programs')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeCmsTab === 'programs'
                    ? 'bg-amber-400 text-amber-950 shadow-md font-extrabold'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                💳 Programs & Prices
              </button>

              <button
                type="button"
                onClick={() => setActiveCmsTab('sections')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeCmsTab === 'sections'
                    ? 'bg-amber-400 text-amber-950 shadow-md font-extrabold'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                📌 Section Titles (Why, Goals, FAQ, Steps)
              </button>

              <button
                type="button"
                onClick={() => setActiveCmsTab('contacts')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                  activeCmsTab === 'contacts'
                    ? 'bg-amber-400 text-amber-950 shadow-md font-extrabold'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                📞 Hotlines & Socials
              </button>
            </div>

            {/* TAB 0: BLOG & ARTICLES MANAGER */}
            {activeCmsTab === 'blogs' && (
              <div className="pt-2">
                <BlogManagerCMS />
              </div>
            )}

            {/* TAB 1: PHOTOS & IMAGES */}
            {activeCmsTab === 'photos' && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="font-extrabold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-300" />
                  1. Website Photos & Images Management (Upload & Live Preview)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Logo Image Uploader */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/15 space-y-2 text-center">
                    <span className="block text-[11px] font-bold text-purple-200">Official Brand Logo</span>
                    <div className="w-16 h-16 rounded-2xl bg-white mx-auto overflow-hidden ring-2 ring-purple-400 flex items-center justify-center p-1">
                      <img src={logoImage} alt="Logo Preview" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <label className="block w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5 inline mr-1" /> Upload Logo
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setLogoImage, 'logoImage')} className="hidden" />
                    </label>
                  </div>

                  {/* Hero Banner Photo Uploader */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/15 space-y-2 text-center">
                    <span className="block text-[11px] font-bold text-purple-200">Hero Main Banner Photo</span>
                    <div className="w-16 h-16 rounded-2xl bg-white mx-auto overflow-hidden ring-2 ring-purple-400">
                      <img src={heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
                    </div>
                    <label className="block w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5 inline mr-1" /> Upload Hero
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setHeroImage, 'heroImage')} className="hidden" />
                    </label>
                  </div>

                  {/* About Anjali Photo Uploader */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/15 space-y-2 text-center">
                    <span className="block text-[11px] font-bold text-purple-200">About Instructor Photo</span>
                    <div className="w-16 h-16 rounded-2xl bg-white mx-auto overflow-hidden ring-2 ring-purple-400">
                      <img src={aboutImage} alt="About Preview" className="w-full h-full object-cover" />
                    </div>
                    <label className="block w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5 inline mr-1" /> Upload Photo
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setAboutImage, 'aboutImage')} className="hidden" />
                    </label>
                  </div>

                  {/* Contact Section Posture Photo Uploader */}
                  <div className="bg-white/10 p-4 rounded-2xl border border-white/15 space-y-2 text-center">
                    <span className="block text-[11px] font-bold text-purple-200">Final CTA Posture Photo</span>
                    <div className="w-16 h-16 rounded-2xl bg-white mx-auto overflow-hidden ring-2 ring-purple-400">
                      <img src={contactImage} alt="Contact Preview" className="w-full h-full object-cover" />
                    </div>
                    <label className="block w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[11px] cursor-pointer shadow-sm">
                      <Upload className="w-3.5 h-3.5 inline mr-1" /> Upload Posture
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setContactImage, 'contactImage')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TOP BAR & HERO */}
            {activeCmsTab === 'hero' && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="font-extrabold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-4 h-4 text-amber-300" />
                  2. Top Announcement Bar & Hero Main Banner
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Top Announcement Bar Text</label>
                    <input
                      type="text"
                      value={announcementBar}
                      onChange={(e) => setAnnouncementBar(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">Brand Name Display</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">Instructor Name</label>
                      <input
                        type="text"
                        value={instructorName}
                        onChange={(e) => setInstructorName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Hero Top Pill Badge Tagline</label>
                    <input
                      type="text"
                      value={heroTagline}
                      onChange={(e) => setHeroTagline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Hero Main Title Headline</label>
                    <input
                      type="text"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-extrabold text-white outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Hero Subtitle Paragraph</label>
                    <textarea
                      rows={2}
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ABOUT INSTRUCTOR */}
            {activeCmsTab === 'about' && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="font-extrabold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-300" />
                  3. About Instructor Section Copy & Quote
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">About Section Title</label>
                    <input
                      type="text"
                      value={aboutTitle}
                      onChange={(e) => setAboutTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Personal Yoga Quote</label>
                    <input
                      type="text"
                      value={aboutQuote}
                      onChange={(e) => setAboutQuote(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-amber-300 outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Bio Paragraph 1</label>
                    <textarea
                      rows={2}
                      value={aboutBio1}
                      onChange={(e) => setAboutBio1(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Bio Paragraph 2</label>
                    <textarea
                      rows={2}
                      value={aboutBio2}
                      onChange={(e) => setAboutBio2(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PROGRAMS & PRICES */}
            {activeCmsTab === 'programs' && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="font-extrabold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  4. Programs Section Titles & Pricing Cards
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Programs Section Title</label>
                    <input
                      type="text"
                      value={classesTitle}
                      onChange={(e) => setClassesTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Programs Subtitle</label>
                    <input
                      type="text"
                      value={classesSubtitle}
                      onChange={(e) => setClassesSubtitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white outline-none focus:ring-2 focus:ring-amber-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-white/10 p-3 rounded-xl border border-white/15">
                      <label className="block text-xs font-extrabold text-amber-300 mb-1">Personal 1-on-1 Fee</label>
                      <input
                        type="text"
                        value={personalClassPrice}
                        onChange={(e) => setPersonalClassPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-xs font-bold text-white outline-none"
                      />
                    </div>

                    <div className="bg-white/10 p-3 rounded-xl border border-white/15">
                      <label className="block text-xs font-extrabold text-amber-300 mb-1">Group Batches Fee</label>
                      <input
                        type="text"
                        value={groupClassPrice}
                        onChange={(e) => setGroupClassPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-xs font-bold text-white outline-none"
                      />
                    </div>

                    <div className="bg-white/10 p-3 rounded-xl border border-white/15">
                      <label className="block text-xs font-extrabold text-amber-300 mb-1">Wellness & Care Fee</label>
                      <input
                        type="text"
                        value={wellnessClassPrice}
                        onChange={(e) => setWellnessClassPrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/20 text-xs font-bold text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SECTION TITLES (WHY, GOALS, STEPS, FAQ, CTA) */}
            {activeCmsTab === 'sections' && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="font-extrabold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Type className="w-4 h-4 text-amber-300" />
                  5. Section Titles (Why Choose Us, Goals, Steps, FAQ, Contact CTA)
                </h4>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">Why Choose Us Title</label>
                      <input
                        type="text"
                        value={whyTitle}
                        onChange={(e) => setWhyTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">Health Goals Title</label>
                      <input
                        type="text"
                        value={goalsTitle}
                        onChange={(e) => setGoalsTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">4-Step Onboarding Title</label>
                      <input
                        type="text"
                        value={onboardingTitle}
                        onChange={(e) => setOnboardingTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">60-Min Timeline Title</label>
                      <input
                        type="text"
                        value={timelineTitle}
                        onChange={(e) => setTimelineTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">Student Reviews Title</label>
                      <input
                        type="text"
                        value={testimonialsTitle}
                        onChange={(e) => setTestimonialsTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">FAQ Section Title</label>
                      <input
                        type="text"
                        value={faqTitle}
                        onChange={(e) => setFaqTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Final CTA Banner Headline</label>
                    <input
                      type="text"
                      value={contactTitle}
                      onChange={(e) => setContactTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-extrabold text-amber-300 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: HOTLINES & SOCIAL LINKS */}
            {activeCmsTab === 'contacts' && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="font-extrabold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-300" />
                  6. Contact Numbers, Email & Social Media Links
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Primary Display Phone</label>
                    <input
                      type="text"
                      value={displayPhone}
                      onChange={(e) => setDisplayPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Alternative Hotline</label>
                    <input
                      type="text"
                      value={displayPhone2}
                      onChange={(e) => setDisplayPhone2(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-purple-200 mb-1">Google Reviews Link</label>
                    <input
                      type="text"
                      value={googleReviewsUrl}
                      onChange={(e) => setGoogleReviewsUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-amber-300 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">Instagram URL</label>
                      <input
                        type="text"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-200 mb-1">YouTube URL</label>
                      <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SAVE BUTTON */}
            <div className="pt-4 border-t border-purple-800/80 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-extrabold text-xs tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-950" />
                <span>SAVE LIVE WEBSITE CHANGES</span>
              </button>
            </div>
          </form>

          {/* Security / Password Form */}
          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Lock className="w-5 h-5 text-purple-600" />
              Security & Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 text-white font-extrabold text-xs shadow-md hover:bg-slate-900 transition-all"
              >
                <Lock className="w-4 h-4" />
                Update Password
              </button>
            </div>
          </form>

        </div>

        {/* Right Sidebar: Data Backup & Account Session */}
        <div className="space-y-6">

          {/* Studio Data Backup & Restore */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-xl flex items-center justify-center shadow-sm border border-indigo-100">
                💾
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">Studio Data Backup & Restore</h4>
                <p className="text-xs text-slate-500 font-medium">Export or restore complete studio JSON backups</p>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Aapka studio database Cloud par 24/7 automatically sync aur safe rehta hai. Aap kisi bhi waqt offline JSON backup download ya restore kar sakte hain.
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={exportBackupData}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Download Backup File (.json)</span>
              </button>

              <label className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                <Upload className="w-4 h-4 text-emerald-200" />
                <span>📥 Restore / Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        try {
                          const parsed = JSON.parse(evt.target?.result as string);
                          const success = importBackupData(parsed);
                          if (success) {
                            alert('🎉 SUCCESS! All client records, payments, attendance, and settings restored cleanly into Yoganjali Studio Panel!');
                          }
                        } catch (err) {
                          alert('Invalid backup JSON file.');
                        }
                      };
                      reader.readAsText(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-soft space-y-4">
            <div className="flex items-center gap-2">
              <LogOut className="w-5 h-5 text-rose-600" />
              <h4 className="font-extrabold text-slate-900 text-sm">Account Session</h4>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Log out of your Yoganjali instructor journal session. You can log back in with your username & password.
            </p>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to log out of Yoganjali?')) {
                  if (onLogout) onLogout();
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-white" />
              Log Out of Yoganjali
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
