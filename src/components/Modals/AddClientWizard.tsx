import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SessionType, TimeSlot, MembershipPlan, Gender, FeeType } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import { X, Check, ArrowRight, ArrowLeft, Sparkles, User, Calendar, Heart, CreditCard, FileText, Upload, Image as ImageIcon, Smile, Users, Clock, Trash2, Save, Loader2 } from 'lucide-react';

const REASONS_LIST = [
  'Weight Loss', 'Weight Gain', 'Back Pain', 'Neck Pain', 
  'General Fitness', 'Strength', 'Flexibility', 'Stress Relief', 
  'Meditation', 'PCOS', 'Lumbar Spondylitis', 'Insomnia', 'Other'
];

const DAYS_LIST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MORNING_TIMES = ['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'];
const EVENING_TIMES = ['04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'];

export const AddClientWizard: React.FC = () => {
  const { 
    isAddClientOpen, 
    setIsAddClientOpen, 
    addClient, 
    clients, 
    customGroupBatches, 
    addCustomGroupBatch, 
    deleteCustomGroupBatch 
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const [sessionType, setSessionType] = useState<SessionType>('Group');
  
  const [selectedBatchDropdown, setSelectedBatchDropdown] = useState(availableBatches[0] || 'CUSTOM');
  const [customGroupName, setCustomGroupName] = useState('');

  // Health Reasons & Goal State
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [currentProblems, setCurrentProblems] = useState<string>('');

  // Fee Type & Amount State (Monthly ₹10,000, Per Session ₹1,000)
  const [feeType, setFeeType] = useState<FeeType>('Monthly');
  const [perSessionFee, setPerSessionFee] = useState<number>(1000);
  const [monthlyFee, setMonthlyFee] = useState<number>(10000);
  const [feeDueDate, setFeeDueDate] = useState('5th');

  const [trainerNotes, setTrainerNotes] = useState('');
  const [goal, setGoal] = useState('');

  if (!isAddClientOpen) return null;

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

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
  };

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
    
    // Auto-save newly created custom group batch name
    if (selectedBatchDropdown === 'CUSTOM' && customGroupName.trim()) {
      addCustomGroupBatch(customGroupName.trim());
    }

    // Goal fallback if user didn't type a custom goal
    const effectiveGoal = goal.trim() || (selectedReasons.length > 0 ? selectedReasons.join(', ') : 'General Yoga & Wellness');
    const autoTimeSlot = (classTime || '').toUpperCase().includes('PM') ? 'Evening' : 'Morning';

    setIsSubmitting(true);
    try {
      await addClient({
        name: name.trim(),
        gender,
        phone: phone.trim(),
        whatsapp: sameAsPhone ? phone.trim() : ((whatsapp || phone).trim()),
        address: address.trim() || 'Local Studio',
        joiningDate,
        photoUrl: activePhotoUrl,
        classTime,
        days: selectedDays,
        timeSlot: autoTimeSlot,
        sessionType,
        groupName: sessionType === 'Personal' ? '' : (finalGroupName.trim() || 'General Yoga Batch'),
        reasonsForJoining: selectedReasons,
        currentProblems: currentProblems.split(',').map(s => s.trim()).filter(Boolean),
        feeType,
        perSessionFee: feeType === 'Per Session' ? Number(perSessionFee) : 0,
        monthlyFee: feeType === 'Per Session' ? 0 : Number(monthlyFee),
        feeDueDate: feeType === 'Per Session' ? 'N/A' : feeDueDate,
        membershipPlan: feeType === 'Per Session' ? 'Per Session' : 'Unlimited',
        totalClasses: 30,
        trainerNotes,
        goal: effectiveGoal
      });

      setIsAddClientOpen(false);
      setStep(1);
      setCustomPhotoUrl(null);
    } catch (err) {
      console.error('Failed to save client:', err);
      alert('Failed to save client. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white">
              {step}
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Add New Yoga Client</h3>
              <p className="text-xs text-purple-100">Step {step} of 5 — {
                step === 1 ? 'Basic Details & Avatar' :
                step === 2 ? 'Class & Group Batch' :
                step === 3 ? 'Health & Reasons' :
                step === 4 ? 'Fee & Billing Model' : 'Trainer Notes & Goal'
              }</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddClientOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
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
                {i === 1 ? 'Basic' : i === 2 ? 'Batch' : i === 3 ? 'Health' : i === 4 ? 'Fee' : 'Save'}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Form Body */}
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
                    onClick={() => handleGenderChange('Female')}
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
                    onClick={() => handleGenderChange('Male')}
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
                    aria-label="Select Monthly Fixed Fee billing"
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
                    aria-label="Select Per Session Pay-As-You-Go billing"
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
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPerSessionFee(val);
                      }}
                      placeholder="1000"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-emerald-300 text-xs font-extrabold text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-semibold flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span>
                      <strong>Per Session Pay-As-You-Go:</strong> Whenever this client is marked <strong>Present</strong>, <strong>₹{perSessionFee}</strong> will be automatically added to their fee total!
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Step 5: Trainer Notes & Save */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Main Health Goal (Optional)</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Weight reduction, back pain relief"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trainer Journal Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={trainerNotes}
                  onChange={(e) => setTrainerNotes(e.target.value)}
                  placeholder="Notes about spinal health, breathing posture, etc."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md hover:bg-purple-700 transition-all"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-extrabold text-xs shadow-lg transition-all ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving & Syncing to Cloud...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Save Yoga Client Profile</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
