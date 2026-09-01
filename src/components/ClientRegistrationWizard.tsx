import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SITE_CONFIG } from '../config/siteConfig';
import { SessionType, TimeSlot, Gender, FeeType } from '../types';
import { pushCloudSyncData } from '../utils/cloudSync';
import { compressImageFile } from '../utils/imageCompressor';
import { slugifyName } from '../utils/slugUtils';
import { 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  Users, 
  Clock, 
  Instagram, 
  Youtube, 
  MessageCircle, 
  Globe, 
  Loader2,
  ExternalLink,
  Copy
} from 'lucide-react';

const REASONS_LIST = [
  'Weight Loss', 'Weight Gain', 'Back Pain', 'Neck Pain', 
  'General Fitness', 'Strength', 'Flexibility', 'Stress Relief', 
  'Meditation', 'PCOS', 'Lumbar Spondylitis', 'Insomnia', 'Other'
];

const DAYS_LIST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MORNING_TIMES = ['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'];
const EVENING_TIMES = ['04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'];

export const ClientRegistrationWizard: React.FC = () => {
  const { addClient, clients, payments, trainerDreams, trainerLeaves, attendance, customGroupBatches, addCustomGroupBatch, showSuccessToast } = useApp();

  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedProfileUrl, setCopiedProfileUrl] = useState(false);

  // Dynamic Group Batches strictly created by trainer
  const availableBatches = (customGroupBatches && customGroupBatches.length > 0)
    ? customGroupBatches 
    : ['Personal class', 'Group Yoga Class'];

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Female');
  const [phone, setPhone] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Avatar Style State
  const [avatarStyle, setAvatarStyle] = useState<'notionist' | 'bottts' | 'initials' | 'custom'>('notionist');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);

  const [classTime, setClassTime] = useState('07:00 AM');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('Morning');
  const [sessionType, setSessionType] = useState<SessionType>('Personal');
  
  const [selectedBatchDropdown, setSelectedBatchDropdown] = useState(availableBatches[0] || 'Personal class');
  const [customGroupName, setCustomGroupName] = useState('');

  // Health Reasons & Goal State
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [currentProblems, setCurrentProblems] = useState<string>('');

  // Fee Type & Amount State
  const [feeType, setFeeType] = useState<FeeType>('Monthly');
  const [perSessionFee, setPerSessionFee] = useState<number>(1000);
  const [monthlyFee, setMonthlyFee] = useState<number>(10000);
  const [feeDueDate, setFeeDueDate] = useState('5th');

  const [trainerNotes, setTrainerNotes] = useState('');
  const [goal, setGoal] = useState('');

  // Phone number change handler with WhatsApp Auto-sync
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  // Helper to generate dynamic vector/illustrated avatars
  const getAvatarUrl = () => {
    if (avatarStyle === 'custom' && customPhotoUrl) {
      return customPhotoUrl;
    }
    const seed = encodeURIComponent(name.trim() || (gender === 'Female' ? 'Ananya' : 'Rohan'));
    const bg = gender === 'Female' ? 'f3e8ff' : 'eff6ff';

    if (avatarStyle === 'bottts') {
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=${bg}`;
    }
    if (avatarStyle === 'initials') {
      return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=${bg}`;
    }
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=${bg}`;
  };

  const activePhotoUrl = getAvatarUrl();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 400, 0.82);
      if (compressed) {
        setCustomPhotoUrl(compressed);
        setAvatarStyle('custom');
      }
    }
  };

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Effective final Group Name
  const finalGroupName = selectedBatchDropdown === 'CUSTOM' ? customGroupName : selectedBatchDropdown;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please fill out your Name and Phone number.');
      setStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveGoal = goal.trim() || (selectedReasons.length > 0 ? selectedReasons.join(', ') : 'General Yoga & Wellness');
      const autoTimeSlot = (classTime || '').toUpperCase().includes('PM') ? 'Evening' : 'Morning';

      let finalGroup = selectedBatchDropdown;
      if (selectedBatchDropdown === 'CUSTOM' && customGroupName.trim()) {
        finalGroup = customGroupName.trim();
        addCustomGroupBatch(finalGroup);
      }

      const isPersonal = finalGroup.toLowerCase().includes('personal');

      await addClient({
        name: name.trim(),
        gender,
        phone: phone.trim(),
        whatsapp: sameAsPhone ? phone.trim() : ((whatsapp || phone).trim()),
        address: address.trim() || 'Indiranagar, Bengaluru',
        joiningDate,
        photoUrl: activePhotoUrl,
        classTime,
        days: selectedDays,
        timeSlot: autoTimeSlot,
        sessionType: isPersonal ? 'Personal' : 'Group',
        groupName: isPersonal ? 'Personal class' : (finalGroup === 'CUSTOM' ? 'Group Yoga Class' : finalGroup),
        reasonsForJoining: selectedReasons,
        currentProblems: currentProblems.split(',').map(s => s.trim()).filter(Boolean),
        feeType,
        perSessionFee: feeType === 'Per Session' ? Number(perSessionFee) : 0,
        monthlyFee: feeType === 'Per Session' ? 0 : Number(monthlyFee),
        feeDueDate: feeType === 'Per Session' ? 'N/A' : feeDueDate,
        membershipPlan: (feeType === 'Per Session' ? 'Per Session' : 'Unlimited') as any,
        totalClasses: 30,
        trainerNotes,
        goal: effectiveGoal
      });
    } catch (err) {
      console.warn('Registration handled:', err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
      showSuccessToast(`🎉 Client Data fed successfully! Welcome ${name} to Yoganjali Studio.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-md py-8 px-4 flex items-center justify-center font-sans text-slate-900">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white text-lg">
              {submitted ? '✓' : step}
            </div>
            <div>
              <h3 className="font-extrabold text-lg">
                {submitted ? 'Registration Successful' : 'Add New Yoga Client'}
              </h3>
              <p className="text-xs text-purple-100">
                {submitted ? 'Yoganjali Studio Onboarding' : `Step ${step} of 5 — ${
                  step === 1 ? 'Basic Details & Avatar' :
                  step === 2 ? 'Class & Group Batch' :
                  step === 3 ? 'Health & Reasons' :
                  step === 4 ? 'Fee & Billing Model' : 'Review & Register'
                }`}
              </p>
            </div>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-1.5 cursor-pointer" onClick={() => i < step && setStep(i)}>
              <div className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center transition-all ${
                step === i 
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-200' 
                  : step > i 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {step > i ? <Check className="w-3.5 h-3.5" /> : i}
              </div>
              <span className="hidden sm:inline text-[11px] font-semibold text-slate-500">
                {i === 1 ? 'Basic' : i === 2 ? 'Batch' : i === 3 ? 'Health' : i === 4 ? 'Fee' : 'Register'}
              </span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        {submitted ? (
          <div className="p-8 sm:p-12 text-center space-y-7 animate-fadeIn">
            <div className="relative w-28 h-28 mx-auto mb-2">
              <img 
                src="/anjali_hero.jpg" 
                alt="Trainer Anjali Negi" 
                className="w-28 h-28 rounded-full object-cover ring-4 ring-purple-300 shadow-xl shadow-purple-950/20 bg-white"
              />
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-base shadow-md ring-2 ring-white">
                ✨
              </div>
            </div>
            
            <div className="space-y-3 max-w-lg mx-auto">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-200 inline-block">
                WELCOME TO YOGANJALI STUDIO
              </span>

              <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Registration Successful! 🎉
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Namaste <strong>{name}</strong>! Your client registration details have been saved directly into Trainer Anjali Negi's studio journal dashboard.
              </p>
            </div>

            {/* Quick Registration Summary Badge Card */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-5 sm:p-6 rounded-3xl border border-emerald-200 max-w-md mx-auto text-left space-y-3.5 shadow-sm">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-900 border-b border-emerald-200/80 pb-2 flex items-center justify-between">
                <span>📋 YOUR BATCH DETAILS</span>
                <span className="text-emerald-700 font-extrabold bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Active Yogi
                </span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-800">
                <p><span className="text-slate-500">Batch:</span> <strong>{selectedBatchDropdown}</strong></p>
                <p><span className="text-slate-500">Timing:</span> <strong>{classTime}</strong></p>
                <p><span className="text-slate-500">Days:</span> <strong>{selectedDays.join(', ')}</strong></p>
                <p><span className="text-slate-500">Billing:</span> <strong>{feeType}</strong></p>
              </div>

              {/* 🧘 Direct Yogi Profile Access inside Batch Details */}
              <div className="pt-2 border-t border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <span>🧘 YOUR OFFICIAL YOGI PROFILE LINK</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Live Portal
                  </span>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 shadow-2xs space-y-2.5">
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Track your daily attendance calendar, fee payment status & consistency score directly on your dedicated link.
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`/yogi/${slugifyName(name)}`}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 text-center"
                    >
                      <span>Open My Yogi Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        const url = typeof window !== 'undefined' 
                          ? `${window.location.origin}/yogi/${slugifyName(name)}` 
                          : `https://www.yoganjaliyoga.com/yogi/${slugifyName(name)}`;
                        navigator.clipboard.writeText(url);
                        setCopiedProfileUrl(true);
                        showSuccessToast('📋 Yogi Profile link copied to clipboard!');
                        setTimeout(() => setCopiedProfileUrl(false), 3000);
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 shrink-0"
                      title="Copy Profile URL"
                    >
                      {copiedProfileUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copiedProfileUrl ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Yogi Profile, WhatsApp & Website */}
            <div className="pt-2 max-w-md mx-auto space-y-3">
              
              {/* Primary Profile Access Button */}
              <a
                href={`/yogi/${slugifyName(name)}`}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 ring-2 ring-purple-400/30 text-center"
              >
                <span>🧘</span>
                <span>View My Yogi Profile & Attendance Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => {
                  const feeDetail = feeType === 'Monthly' ? `Monthly ₹${monthlyFee} (Due ${feeDueDate})` : `Per Session ₹${perSessionFee}/class`;
                  const reasonsText = selectedReasons.length > 0 ? selectedReasons.join(', ') : 'General Wellness';
                  const healthText = currentProblems.trim() ? currentProblems : 'None reported';
                  const daysText = selectedDays.join(', ');
                  const profileLink = typeof window !== 'undefined' 
                    ? `${window.location.origin}/yogi/${slugifyName(name)}` 
                    : `https://www.yoganjaliyoga.com/yogi/${slugifyName(name)}`;

                  const message = `Hi Anjali! 👋\n\nI have completed my Client Registration details for Yoganjali Studio.\n\n📌 REGISTRATION DETAILS:\n• Name: ${name} (${gender})\n• Phone/WhatsApp: ${phone}\n• Area/Address: ${address || 'Local Studio'}\n• Batch: ${selectedBatchDropdown}\n• Class Time: ${classTime} (${timeSlot})\n• Practice Days: ${daysText}\n• Reasons for Joining: ${reasonsText}\n• Health Notes: ${healthText}\n• Fee Billing Plan: ${feeDetail}\n• Joining Date: ${joiningDate}\n• My Yogi Profile Link: ${profileLink}\n\nPlease review my profile and confirm my class timings. 🧘🌿`;
                  
                  const waNumber = SITE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
                  window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 ring-2 ring-emerald-400/30"
              >
                <MessageCircle className="w-5 h-5 text-white" />
                <span>Message Anjali on WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  window.location.href = '/?view=website';
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4A5D3E] via-[#3F4D2A] to-[#2D3B27] hover:from-emerald-800 hover:to-[#2D3B27] text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5 border border-white/20"
              >
                <Globe className="w-4.5 h-4.5 text-amber-300" />
                <span>VISIT OUR WEBSITE</span>
              </button>
            </div>

            {/* Social Media Follow & Subscribe Section */}
            <div className="pt-6 border-t border-slate-200/80 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-800 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 inline-block">
                  ✨ STAY CONNECTED WITH ANJALI NEGI
                </span>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  Watch Daily Yoga Postures, Routines & Live Updates!
                </h4>
                <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                  Follow and subscribe to our official social media handles to practice along with Anjali Negi daily:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-1">
                {/* Instagram Button */}
                <a
                  href="https://instagram.com/yoganjali25"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2.5 text-center group"
                >
                  <Instagram className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="block text-[11px] font-bold text-amber-200">Follow on Instagram</span>
                    <span className="block text-xs font-black">@yoganjali25</span>
                  </div>
                </a>

                {/* YouTube Button */}
                <a
                  href="https://www.youtube.com/@Yoganjali25"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2.5 text-center group"
                >
                  <Youtube className="w-5 h-5 text-white shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="block text-[11px] font-bold text-red-100">Subscribe on YouTube</span>
                    <span className="block text-xs font-black">youtube.com/@Yoganjali25</span>
                  </div>
                </a>
              </div>
            </div>

          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Step 1: Basic Details & Gender & Avatar */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Vector Avatar Preview & Selector */}
                <div className="bg-purple-50/60 p-4 rounded-3xl border border-purple-100 flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={activePhotoUrl}
                    alt="Client Avatar Preview"
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                  />

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-0.5">Avatar Style</label>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Select modern vector illustration, initials badge, or custom upload.
                      </p>
                    </div>

                    {/* Avatar Style Choice Buttons */}
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setAvatarStyle('notionist')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          avatarStyle === 'notionist'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
                        }`}
                      >
                        🎨 Notion Illustration
                      </button>



                      <label className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 cursor-pointer text-xs font-bold transition-all shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        Custom
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Required Gender Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Gender *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender('Female')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        gender === 'Female'
                          ? 'border-purple-600 bg-purple-100 text-purple-900 shadow-sm ring-2 ring-purple-300'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">♀️</span>
                      Female Practitioner
                    </button>

                    <button
                      type="button"
                      onClick={() => setGender('Male')}
                      className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        gender === 'Male'
                          ? 'border-indigo-600 bg-indigo-100 text-indigo-900 shadow-sm ring-2 ring-indigo-300'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">♂️</span>
                      Male Practitioner
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Divya Sharma"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                {/* Phone & WhatsApp Sync Checkbox */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    />
                    
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sameAsPhone}
                        onChange={(e) => {
                          setSameAsPhone(e.target.checked);
                          if (e.target.checked) setWhatsapp(phone);
                        }}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                      />
                      <span className="text-xs font-medium text-slate-600">WhatsApp number is same as phone</span>
                    </label>
                  </div>

                  {!sameAsPhone && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number *</label>
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Indiranagar, Bengaluru"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 outline-none"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Step 2: Class & Group Batch Details */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* 0. Group Batch Selection */}
                <div className="bg-purple-50/60 p-4 rounded-3xl border border-purple-100 space-y-3">
                  <label className="block text-xs font-bold text-purple-950 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      Group Batch Assignment *
                    </span>
                    <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedBatchDropdown}
                      onChange={(e) => {
                        setSelectedBatchDropdown(e.target.value);
                        if (e.target.value.toLowerCase().includes('personal')) {
                          setSessionType('Personal');
                        } else {
                          setSessionType('Group');
                        }
                        if (e.target.value !== 'CUSTOM') {
                          setCustomGroupName('');
                        }
                      }}
                      className="flex-1 px-4 py-3 rounded-2xl bg-white border border-purple-200 text-xs font-bold text-purple-900 outline-none shadow-sm focus:ring-2 focus:ring-purple-500/20"
                    >
                      {availableBatches.map((batch) => (
                        <option key={batch} value={batch}>👥 {batch}</option>
                      ))}
                      <option value="CUSTOM">➕ + Create New Group Batch...</option>
                    </select>
                  </div>

                  {selectedBatchDropdown === 'CUSTOM' && (
                    <div className="pt-2 animate-fadeIn">
                      <input
                        type="text"
                        required
                        value={customGroupName}
                        onChange={(e) => setCustomGroupName(e.target.value)}
                        placeholder="Enter new batch name (e.g. Weekend Special, Prenatal)"
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-purple-200 text-xs font-bold outline-none placeholder:font-normal focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  )}
                </div>

                {/* 1. Class Time Selector - Compact Modern Design */}
                <div className="bg-gradient-to-br from-slate-50 to-purple-50/40 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-purple-600" />
                      Class Time Picker *
                    </label>
                    <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-lg border border-purple-200">
                      Selected: {classTime}
                    </span>
                  </div>

                  {/* Morning Batches */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                      <span>🌅 Morning Batches</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {MORNING_TIMES.map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => {
                            setClassTime(t);
                            setTimeSlot('Morning');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            classTime === t
                              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300 scale-105'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Evening Batches */}
                  <div className="space-y-1 pt-1 border-t border-slate-200/60">
                    <div className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                      <span>🌆 Evening Batches</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {EVENING_TIMES.map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => {
                            setClassTime(t);
                            setTimeSlot('Evening');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            classTime === t
                              ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300 scale-105'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Time */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Or Custom:</span>
                    <input
                      type="text"
                      value={classTime}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClassTime(val);
                        if (val.toUpperCase().includes('PM')) setTimeSlot('Evening');
                        else if (val.toUpperCase().includes('AM')) setTimeSlot('Morning');
                      }}
                      placeholder="07:00 AM"
                      className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>



                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value as TimeSlot)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* Days Multi-Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Class Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_LIST.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* Step 3: Health & Reasons */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Reasons for Joining Yoga (Select multiple)</label>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                    {REASONS_LIST.map((reason) => {
                      const isSel = selectedReasons.includes(reason);
                      return (
                        <button
                          type="button"
                          key={reason}
                          onClick={() => toggleReason(reason)}
                          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                            isSel
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {reason}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Medical Problems / Stiffness (Optional)</label>
                  <input
                    type="text"
                    value={currentProblems}
                    onChange={(e) => setCurrentProblems(e.target.value)}
                    placeholder="e.g. Neck stiffness, High BP, Knee pain"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Fee & Billing Model */}
            {step === 4 && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Fee Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Fee Billing Model *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    <button
                      type="button"
                      onClick={() => setFeeType('Monthly')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        feeType === 'Monthly'
                          ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-300 text-purple-950 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-extrabold text-xs flex items-center gap-1.5 text-purple-900">
                        💳 Monthly Subscription Fee
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Fixed monthly plan (e.g. ₹10,000 / month)
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeeType('Per Session')}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        feeType === 'Per Session'
                          ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-300 text-emerald-950 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-extrabold text-xs flex items-center gap-1.5 text-emerald-800">
                        🧘 Per Session Fee (Pay-As-You-Go)
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1">
                        Fee adds only on Present days (e.g. ₹1,000 / class)
                      </p>
                    </button>

                  </div>
                </div>

                {/* Input Fields Based on FeeType */}
                {feeType === 'Monthly' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Fee (₹) *</label>
                        <input
                          type="number"
                          required
                          value={monthlyFee}
                          onChange={(e) => setMonthlyFee(Number(e.target.value))}
                          placeholder="10000"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Fee Due Date Day</label>
                        <input
                          type="text"
                          value={feeDueDate}
                          onChange={(e) => setFeeDueDate(e.target.value)}
                          placeholder="5th"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50/80 p-5 rounded-3xl border border-emerald-200 space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-emerald-950 mb-1">Per Session Class Fee (₹) *</label>
                      <input
                        type="number"
                        required
                        value={perSessionFee}
                        onChange={(e) => setPerSessionFee(Number(e.target.value))}
                        placeholder="1000"
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-emerald-300 text-xs font-extrabold text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Step 5: Review Summary & Register (No extra input fields asked) */}
            {step === 5 && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-purple-50/50 p-5 sm:p-6 rounded-3xl border border-emerald-200/80 space-y-4 shadow-xs">
                  
                  {/* Yogi Profile Preview */}
                  <div className="flex items-center gap-4 pb-4 border-b border-emerald-200/60">
                    <img
                      src={activePhotoUrl}
                      alt={name || 'Client Avatar'}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-md bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-slate-900 text-lg">{name || 'Yoga Practitioner'}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-purple-100 text-purple-800">
                          {gender}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        📱 {phone} {whatsapp && whatsapp !== phone ? `• WA: ${whatsapp}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white/90 rounded-2xl border border-emerald-100 space-y-1 shadow-xs">
                      <span className="text-[10px] font-black uppercase text-slate-400">Batch & Format</span>
                      <p className="font-extrabold text-purple-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>{selectedBatchDropdown === 'CUSTOM' ? (customGroupName || 'Custom Batch') : selectedBatchDropdown}</span>
                      </p>
                      <p className="text-[11px] text-slate-600 font-semibold">{sessionType} Format</p>
                    </div>

                    <div className="p-3 bg-white/90 rounded-2xl border border-emerald-100 space-y-1 shadow-xs">
                      <span className="text-[10px] font-black uppercase text-slate-400">Class & Schedule</span>
                      <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{classTime} ({timeSlot})</span>
                      </p>
                      <p className="text-[11px] text-slate-600 font-semibold">Days: {selectedDays.join(' • ')}</p>
                    </div>

                    <div className="p-3 bg-white/90 rounded-2xl border border-emerald-100 space-y-1 shadow-xs">
                      <span className="text-[10px] font-black uppercase text-slate-400">Selected Fee Plan</span>
                      <p className="font-extrabold text-emerald-900 text-sm">
                        {feeType === 'Monthly' ? `₹${(monthlyFee || 0).toLocaleString()} / month` : `₹${perSessionFee || 800} / session`}
                      </p>
                      <p className="text-[11px] text-slate-600 font-semibold">
                        {feeType === 'Monthly' ? `Due on: ${feeDueDate}` : 'Pay-As-You-Go'}
                      </p>
                    </div>

                    <div className="p-3 bg-white/90 rounded-2xl border border-emerald-100 space-y-1 shadow-xs">
                      <span className="text-[10px] font-black uppercase text-slate-400">Health Focus</span>
                      <p className="font-bold text-slate-800 text-xs">
                        🎯 {selectedReasons.length > 0 ? selectedReasons.join(', ') : 'General Yoga & Wellness'}
                      </p>
                    </div>
                  </div>

                </div>

                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700">
                    Ready to complete registration? Click the button below to join.
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Your profile will be instantly synced to Trainer Anjali Negi's studio journal.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous Step
                </button>
              ) : <div />}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && (!name || !phone)) {
                      alert('Please enter your full Name and Mobile number.');
                      return;
                    }
                    setStep(step + 1);
                  }}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Registering & Syncing to Studio...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Register Yoga Profile 🚀</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
