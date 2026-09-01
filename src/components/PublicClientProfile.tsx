import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Client } from '../types';
import { slugifyName } from '../utils/slugUtils';
import { getClientCurrentMonthPaymentStatus, getClientBillingCycles } from '../utils/paymentUtils';
import { 
  Award, 
  Flame, 
  Star, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Sparkles, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Activity, 
  HeartHandshake, 
  Globe, 
  Lock,
  Zap,
  CreditCard,
  Camera,
  CalendarDays,
  CalendarX,
  XCircle,
  Instagram,
  Youtube
} from 'lucide-react';
import { PaymentCheckoutModal } from './Modals/PaymentCheckoutModal';
import { ClientLeaveRequestModal } from './Modals/ClientLeaveRequestModal';

interface PublicClientProfileProps {
  clientSlug?: string;
  clientId?: string;
  onBackToDirectory?: () => void;
}

export const PublicClientProfile: React.FC<PublicClientProfileProps> = ({ 
  clientSlug, 
  clientId,
  onBackToDirectory 
}) => {
  const { clients, updateClient, attendance, leaves, trainerLeaves, payments, addPayment, showSuccessToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [isPaymentCheckoutOpen, setIsPaymentCheckoutOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [calDate, setCalDate] = useState(() => new Date()); // Dynamic current month (e.g. September 2026)

  // Find target client by slug or ID
  const cleanSlug = (clientSlug || '').toLowerCase().trim();
  const activeClients = clients.filter(c => c.status !== 'Discontinued');
  const targetClient: Client | undefined = activeClients.find(c => {
    if (clientId && c.id === clientId) return true;
    if (cleanSlug && slugifyName(c.name) === cleanSlug) return true;
    if (cleanSlug && slugifyName(c.name.trim()) === cleanSlug) return true;
    return false;
  }) || (cleanSlug ? clients.find(c => slugifyName(c.name) === cleanSlug || slugifyName(c.name.trim()) === cleanSlug) : undefined) || activeClients[0];

  useEffect(() => {
    if (targetClient?.name) {
      document.title = `🧘 ${targetClient.name.trim()} • Official Yogi Profile | Yoganjali`;
    }
  }, [targetClient]);

  if (!targetClient) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mx-auto">
            🧘
          </div>
          <h3 className="font-serif font-extrabold text-2xl text-slate-900">Yogi Profile Not Found</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            The requested member profile could not be found or has been updated.
          </p>
          <a
            href="/members"
            className="inline-block px-6 py-3 rounded-2xl bg-emerald-800 text-white font-extrabold text-xs shadow-md hover:bg-emerald-900 transition-all"
          >
            Explore Member Directory
          </a>
        </div>
      </div>
    );
  }

  // 📊 CALCULATE PUBLIC PERFORMANCE METRICS WITH DATE-LEVEL DEDUPLICATION
  const clientLeaves = leaves.filter(l => l.clientId === targetClient.id);
  const clientAttRaw = attendance.filter(a => a.clientId === targetClient.id);

  // Map each unique date to its effective status
  const dateStatusMap = new Map<string, string>();
  clientAttRaw.forEach(a => {
    if (a.date && a.status) {
      dateStatusMap.set(a.date, a.status);
    }
  });
  // Approved leaves take precedence for leave dates
  clientLeaves.forEach(l => {
    const start = l.startDate || l.date || '';
    if (start) {
      dateStatusMap.set(start, 'Leave');
    }
  });

  let presentCount = 0;
  let absentCount = 0;
  let leavesCount = clientLeaves.length;

  dateStatusMap.forEach((status) => {
    if (status === 'Present') presentCount++;
    else if (status === 'Absent') absentCount++;
    else if (status === 'Leave' && leavesCount === 0) leavesCount++;
  });

  const classesAttended = presentCount > 0 ? presentCount : (targetClient.completedClasses || 0);
  const totalClassesTarget = targetClient.totalClasses || 30;
  const attendanceRate = Math.min(100, Math.round((classesAttended / Math.max(1, classesAttended + absentCount)) * 100));

  // Active Practice Streak: Counts continuous Present classes from latest record backward
  // If the latest class was Absent, the current active streak is 0 (broken streak)
  const clientAtt = Array.from(dateStatusMap.entries())
    .map(([date, status]) => ({ date, status }))
    .sort((a, b) => b.date.localeCompare(a.date));

  let currentActiveStreak = 0;
  for (const a of clientAtt) {
    if (a.status === 'Present') {
      currentActiveStreak++;
    } else if (a.status === 'Absent') {
      break; // Absent breaks the streak!
    }
    // Note: Approved leave pauses the streak without adding or breaking
  }

  const displayStreak = currentActiveStreak;
  const isNewYogi = classesAttended === 0 && absentCount === 0;

  // Consistency Score
  let consistencyScore = 'New Yogi 🌱';
  if (isNewYogi) {
    consistencyScore = 'New Yogi 🌱';
  } else if (attendanceRate >= 90) {
    consistencyScore = 'Outstanding 🏆';
  } else if (attendanceRate >= 80) {
    consistencyScore = 'Excellent ⭐';
  } else if (attendanceRate >= 70) {
    consistencyScore = 'Strong 💪';
  } else {
    consistencyScore = 'Regular 🌱';
  }

  // Badges Earned
  const achievements = [
    {
      id: 'top',
      title: 'Top Performer',
      icon: '🏆',
      earned: attendanceRate >= 85,
      desc: 'Ranked in top studio regularity percentile'
    },
    {
      id: 'warrior',
      title: 'Attendance Warrior',
      icon: '🔥',
      earned: displayStreak >= 3 || classesAttended >= 5,
      desc: 'Maintained consecutive attended yoga classes'
    },
    {
      id: 'champion',
      title: 'Consistency Champion',
      icon: '⭐',
      earned: attendanceRate >= 80,
      desc: 'Demonstrated high discipline & commitment'
    },
    {
      id: 'star',
      title: 'Monthly Star',
      icon: '🥇',
      earned: classesAttended >= 8,
      desc: 'Completed regular guided yoga sessions'
    },
    {
      id: 'yogi',
      title: 'Dedicated Yogi',
      icon: '🧘',
      earned: true,
      desc: 'Official active practitioner at Yoganjali Studio'
    }
  ];

  // Real August 2026 Leaderboard Rankings (with unique date deduplication)
  const rankedClients = [...activeClients].map(c => {
    const clientAttRaw = attendance.filter(a => a.clientId === c.id);
    const uniquePresentDates = new Set(clientAttRaw.filter(a => a.status === 'Present').map(a => a.date));
    const presentCount = uniquePresentDates.size;
    const completedClasses = typeof c.completedClasses === 'number' ? c.completedClasses : 0;
    const effectiveAtt = presentCount > 0 ? presentCount : completedClasses;
    return {
      ...c,
      attendedClasses: effectiveAtt
    };
  }).sort((a, b) => b.attendedClasses - a.attendedClasses);

  const top3Yogis = rankedClients.slice(0, 3);
  const clientRankIndex = rankedClients.findIndex(c => c.id === targetClient.id);
  const currentRank = clientRankIndex >= 0 ? clientRankIndex + 1 : 1;
  const rankMedal = currentRank === 1 ? '🥇' : currentRank === 2 ? '🥈' : currentRank === 3 ? '🥉' : '⭐';

  // Profile URL & Sharing
  const currentSlug = slugifyName(targetClient.name);
  const publicProfileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/yogi/${currentSlug}`
    : `https://www.yoganjaliyoga.com/yogi/${currentSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    setCopied(true);
    showSuccessToast('📋 Yogi Profile Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const message = `Namaste ${targetClient.name}! 🙏\n\nHere is your personal Yoganjali Yoga Profile & Progress Portal link:\n${publicProfileUrl}\n\nIn this link, you can track:\n✨ Monthly Attendance & Regularity Record\n💳 Fee Payment Status & Billing History\n🧘 Batch Schedule & Personal Health Goals\n\nKeep up your dedication and practice on the mat! 🌿🧘‍♀️\n— Trainer Anjali Negi, Yoganjali Yoga Studio`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url && targetClient) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 600;
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
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
            updateClient({
              ...targetClient,
              photoUrl: compressedUrl
            });
            showSuccessToast('📸 Profile picture updated successfully!');
          }
          setIsUploadingPhoto(false);
        };
        img.onerror = () => {
          updateClient({
            ...targetClient,
            photoUrl: base64Url
          });
          showSuccessToast('📸 Profile picture updated successfully!');
          setIsUploadingPhoto(false);
        };
        img.src = base64Url;
      } else {
        setIsUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const isPerSession = targetClient.feeType === 'Per Session' || targetClient.membershipPlan === 'Per Session';
  const { status: currentMonthStatus, dueAmount, paidAmount } = getClientCurrentMonthPaymentStatus(targetClient, payments, undefined, leaves);
  const isPaid = isPerSession ? true : currentMonthStatus === 'Paid';

  // Multi-month continuous billing cycles calculation
  const billingCycles = getClientBillingCycles(targetClient, payments, leaves);
  const pendingCycles = isPerSession ? [] : billingCycles.filter(c => c.status === 'Pending' || c.status === 'Overdue' || c.status === 'Partial');
  const totalOutstandingDue = isPerSession ? 0 : pendingCycles.reduce((sum, c) => sum + Math.max(0, c.dueAmount - c.paidAmount), 0);
  const hasOutstandingDue = !isPerSession && totalOutstandingDue > 0;

  const scrollToBilling = () => {
    const el = document.getElementById('billing-cycle-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-amber-400', 'transition-all', 'duration-500');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-amber-400');
      }, 2500);
    }
  };

  // --- MONTHLY ATTENDANCE & LEAVE CALENDAR STATE & DATA ---
  const calYear = calDate.getFullYear();
  const calMonth = calDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const calDaysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calMonthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;

  const handlePrevCalMonth = () => {
    setCalDate(new Date(calYear, calMonth - 1, 1));
  };
  const handleNextCalMonth = () => {
    setCalDate(new Date(calYear, calMonth + 1, 1));
  };
  const handleCurrentCalMonth = () => {
    setCalDate(new Date());
  };

  // Month Statistics for selected calendar month
  const calMonthPresent = clientAtt.filter(a => a.date.startsWith(calMonthPrefix) && a.status === 'Present').length;
  const calMonthAbsent = clientAtt.filter(a => a.date.startsWith(calMonthPrefix) && a.status === 'Absent').length;
  const calMonthLeaves = leaves.filter(l => l.clientId === targetClient.id && ((l.startDate && l.startDate.startsWith(calMonthPrefix)) || (l.date && l.date.startsWith(calMonthPrefix)))).length;
  const calMonthPayments = payments.filter(p => p.clientId === targetClient.id && p.date.startsWith(calMonthPrefix) && p.status === 'Paid');
  const calMonthPaidTotal = calMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Real Instructor Leave Days (Deduplicated)
  const uniqueTrainerLeaves = Array.from(
    new Map(
      trainerLeaves.map(tl => {
        const key = `${tl.startDate || tl.date || ''}_${tl.endDate || tl.startDate || tl.date || ''}_${tl.reason || ''}`;
        return [key, tl];
      })
    ).values()
  );

  const instructorLeavesCount = uniqueTrainerLeaves.reduce((acc, leave) => {
    if (leave.startDate && leave.endDate) {
      const s = new Date(leave.startDate);
      const e = new Date(leave.endDate);
      const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      return acc + diff;
    }
    return acc + 1;
  }, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans pb-20 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Banner Navigation */}
      <header className="bg-gradient-to-r from-[#1E3A2B] via-[#2A4D3B] to-[#1E3A2B] text-white py-4 px-4 sm:px-8 border-b border-emerald-800/40 sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {onBackToDirectory ? (
              <button
                onClick={onBackToDirectory}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Directory</span>
              </button>
            ) : (
              <a
                href="https://www.yoganjaliyoga.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:opacity-95 transition-all group cursor-pointer"
                title="Visit Yoganjali Yoga Studio Website"
              >
                <img
                  src="/yoganjali-logo.png"
                  alt="Yoganjali Logo"
                  className="w-9 h-9 rounded-full bg-white object-contain p-0.5 shadow-md ring-2 ring-amber-400 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h2 className="font-serif font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight group-hover:text-amber-300 transition-colors">
                    Yoganjali Studio
                  </h2>
                  <p className="text-[10px] text-emerald-200 font-medium leading-none mt-0.5">
                    Official Member Practice Portal
                  </p>
                </div>
              </a>
            )}
            <div className="hidden sm:block h-4 w-px bg-emerald-700/60" />
            <span className="hidden sm:inline text-xs font-bold text-amber-300 tracking-wider uppercase">
              {targetClient.name}'s Profile
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm"
              title="Inform Trainer Anjali of upcoming leave"
            >
              <span>🏖️</span>
              <span className="hidden sm:inline">Inform Leave</span>
              <span className="sm:hidden">Leave</span>
            </button>

            <button
              onClick={scrollToBilling}
              className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95 ${
                (isPerSession ? !isPaid : hasOutstandingDue)
                  ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 ring-2 ring-amber-300/80 animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white border border-emerald-400/40'
              }`}
            >
              <CreditCard className={`w-4 h-4 ${(isPerSession ? !isPaid : hasOutstandingDue) ? 'text-slate-950' : 'text-white'}`} />
              <span>
                {isPerSession
                  ? (isPaid ? '✓ Session Pass Active' : `💳 Pay Session Fee (₹${targetClient.perSessionFee || 800})`)
                  : (hasOutstandingDue 
                    ? `💳 Pay Pending Fee (₹${totalOutstandingDue.toLocaleString()})` 
                    : '✓ Fee Paid • View Status')}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 space-y-8 animate-fadeIn">
        
        {/* 1. PUBLIC PROFILE HEADER CARD (Forest Green & Soft Gold Theme) */}
        <div className="bg-gradient-to-br from-[#1E3A2B] via-[#2D4F3C] to-[#162E22] rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-emerald-700/50">
          
          {/* Subtle Background Pattern Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 text-center md:text-left">
            
            {/* Yogi Avatar with Ring & Interactive DP Change Option */}
            <div className="relative shrink-0 group">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer rounded-full"
                title="Click to change profile picture / DP"
              >
                <img
                  src={targetClient.photoUrl}
                  alt={targetClient.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover ring-4 ring-amber-400 shadow-2xl bg-white transition-all group-hover:brightness-90"
                />
                
                {/* Hover / Touch Camera Overlay on DP */}
                <div className="absolute inset-0 rounded-full bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] sm:text-xs font-extrabold backdrop-blur-[2px]">
                  <Camera className="w-6 h-6 text-amber-300 mb-0.5 animate-bounce" />
                  <span>{isUploadingPhoto ? 'Updating...' : 'Change DP'}</span>
                </div>

                {/* Floating Action Button at bottom-right corner of DP */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="absolute -bottom-1 -right-1 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 flex items-center justify-center shadow-xl ring-2 ring-emerald-950 transition-transform active:scale-90 hover:scale-110"
                  title="Upload / Update Profile Photo"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
                </button>
              </div>

              {/* Hidden File Input for DP */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Yogi Info */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Active Studio Yogi
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold">
                  Member Since {targetClient.joiningDate || 'July 2026'}
                </span>
              </div>

              <div>
                <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                  {targetClient.name}
                </h1>
                <p className="text-xs sm:text-sm text-emerald-200 font-medium mt-1">
                  🧘 {targetClient.groupName || 'Group Yoga Batch'} • Class Slot: <strong className="text-amber-300">{targetClient.classTime} ({targetClient.timeSlot || 'Morning'})</strong>
                </p>
              </div>

              {/* Main Health Goal */}
              <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-xs font-bold text-slate-300">Health Focus Goal:</span>
                <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs font-extrabold text-amber-300">
                  {targetClient.goal || 'Flexibility, Back Pain Relief & Posture'}
                </span>
              </div>

              {/* Action Bar inside card — Prominent Payment & Leave Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={scrollToBilling}
                  className={`w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 ${
                    (isPerSession ? !isPaid : hasOutstandingDue)
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-slate-950 ring-4 ring-amber-400/40 hover:ring-amber-300'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white ring-2 ring-emerald-400/30'
                  }`}
                >
                  <CreditCard className={`w-5 h-5 ${(isPerSession ? !isPaid : hasOutstandingDue) ? 'text-slate-950' : 'text-white'}`} />
                  <span>
                    {isPerSession
                      ? (isPaid 
                        ? `✓ Pay-As-You-Go Session Pass (₹${targetClient.perSessionFee || 800}/Class)` 
                        : `💳 Pay Per-Session Fee (₹${targetClient.perSessionFee || 800})`)
                      : (hasOutstandingDue 
                        ? `💳 Pay Pending Fee (₹${totalOutstandingDue.toLocaleString()})` 
                        : '✓ Studio Fee Paid • View Billing Records')}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-75" />
                </button>

                <button
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-md"
                >
                  <span>🏖️ Inform Class Leave</span>
                </button>
              </div>

            </div>

          </div>
        </div>


        {/* 2. MONTHLY PERFORMANCE METRICS GRID */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-700" />
              Monthly Practice Performance
            </h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              {consistencyScore}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            
            {/* Box 1: Attendance Rate */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 rounded-3xl text-white text-center space-y-2 shadow-lg shadow-emerald-900/20 border border-emerald-500/40 hover:scale-[1.03] transition-all">
              <span className="text-[10px] font-extrabold text-emerald-200 uppercase tracking-wider block">Attendance Rate</span>
              <p className="text-2xl sm:text-3xl font-black text-white">{attendanceRate}%</p>
              <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden p-0.5">
                <div className="bg-gradient-to-r from-amber-300 to-yellow-400 h-full rounded-full" style={{ width: `${attendanceRate}%` }} />
              </div>
            </div>

            {/* Box 2: Classes Attended */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-5 rounded-3xl text-white text-center space-y-1 shadow-lg shadow-indigo-900/20 border border-indigo-400/40 hover:scale-[1.03] transition-all">
              <span className="text-[10px] font-extrabold text-indigo-200 uppercase tracking-wider block">Attended</span>
              <p className="text-2xl sm:text-3xl font-black text-white">{classesAttended}</p>
              <span className="text-[10px] text-indigo-200 font-bold block">Classes Done ✓</span>
            </div>

            {/* Box 3: Leaves Taken */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-5 rounded-3xl text-white text-center space-y-1 shadow-lg shadow-amber-900/20 border border-amber-400/40 hover:scale-[1.03] transition-all">
              <span className="text-[10px] font-extrabold text-amber-100 uppercase tracking-wider block">Leaves</span>
              <p className="text-2xl sm:text-3xl font-black text-white">{leavesCount}</p>
              <span className="text-[10px] text-amber-100 font-bold block">Approved Leaves</span>
            </div>

            {/* Box 4: Absences */}
            <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 p-5 rounded-3xl text-white text-center space-y-1 shadow-lg shadow-rose-900/20 border border-rose-400/40 hover:scale-[1.03] transition-all">
              <span className="text-[10px] font-extrabold text-rose-200 uppercase tracking-wider block">Absences</span>
              <p className="text-2xl sm:text-3xl font-black text-white">{absentCount}</p>
              <span className="text-[10px] text-rose-200 font-bold block">Missed Classes</span>
            </div>

            {/* Box 5: Attendance Streak */}
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-fuchsia-800 p-5 rounded-3xl text-white text-center space-y-1 shadow-lg shadow-purple-900/20 border border-purple-400/40 hover:scale-[1.03] transition-all">
              <span className="text-[10px] font-extrabold text-purple-200 uppercase tracking-wider block">Practice Streak</span>
              <p className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-1">
                <span>{displayStreak}</span>
                <span className="text-xl animate-pulse">🔥</span>
              </p>
              <span className="text-[10px] text-purple-200 font-bold block">Days Continuous</span>
            </div>

            {/* Box 6: Consistency Score */}
            <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 p-5 rounded-3xl text-slate-950 text-center space-y-1 shadow-lg shadow-amber-500/20 border border-yellow-300 hover:scale-[1.03] transition-all">
              <span className="text-[10px] font-black text-amber-950 uppercase tracking-wider block">Consistency</span>
              <p className="text-sm font-black text-slate-950 bg-white/70 py-1 px-2 rounded-xl shadow-inner mt-1">
                {isNewYogi ? 'New Yogi 🌱' : `${consistencyScore.split(' ')[0]} ⭐`}
              </p>
              <span className="text-[10px] text-amber-950 font-black block">
                {isNewYogi ? 'Welcome to Studio' : 'Studio Rating'}
              </span>
            </div>

          </div>
        </div>


        {/* 3. INTERACTIVE MONTHLY ATTENDANCE & LEAVE CALENDAR */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          
          {/* Header & Month Navigator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-emerald-700" />
                <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-slate-900">
                  Monthly Attendance & Leave Calendar
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Check daily practice attendance, absences, approved leaves, and studio holidays.
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
                <button
                  onClick={handlePrevCalMonth}
                  className="p-1.5 rounded-xl hover:bg-white text-slate-700 transition-all shadow-sm"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-xs font-black text-slate-900 min-w-[125px] text-center">
                  {monthNames[calMonth]} {calYear}
                </span>
                <button
                  onClick={handleNextCalMonth}
                  className="p-1.5 rounded-xl hover:bg-white text-slate-700 transition-all shadow-sm"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleCurrentCalMonth}
                className="px-3.5 py-2 rounded-2xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-extrabold transition-colors border border-emerald-200"
              >
                Current Month
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase tracking-wider py-1">
              {calDaysOfWeek.map((d, i) => (
                <span key={i} className={i === 0 ? 'text-rose-400' : ''}>{d}</span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Empty padding days for month start */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[56px] sm:min-h-[68px] rounded-2xl bg-slate-50/40 border border-transparent" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                
                const att = clientAtt.find(a => a.date === dateStr);
                const isPresent = att?.status === 'Present';
                const isAbsent = att?.status === 'Absent';
                
                const clientLeave = leaves.find(l => {
                  if (l.clientId !== targetClient.id) return false;
                  if (l.startDate) return dateStr >= l.startDate && dateStr <= (l.endDate || l.startDate);
                  return l.date === dateStr;
                });
                
                const trainerLeave = trainerLeaves.find(tl => {
                  const s = tl.startDate || tl.date || '';
                  const e = tl.endDate || s;
                  return dateStr >= s && dateStr <= e;
                });

                // Client fee payment check for this date (Only for monthly batch subscriptions)
                const clientPaymentsOnDate = payments.filter(p => p.clientId === targetClient.id && p.date === dateStr && p.status === 'Paid');
                const totalPaidOnDate = clientPaymentsOnDate.reduce((sum, p) => sum + (p.amount || 0), 0);
                const hasPayment = !isPerSession && clientPaymentsOnDate.length > 0;

                const isToday = new Date().toISOString().slice(0, 10) === dateStr;

                return (
                  <div
                    key={dateStr}
                    className={`min-h-[60px] sm:min-h-[72px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                      hasPayment && isPresent
                        ? 'bg-gradient-to-br from-emerald-50 via-emerald-100/40 to-amber-50/80 border-amber-400 ring-2 ring-amber-400 shadow-md'
                        : hasPayment && isAbsent
                        ? 'bg-gradient-to-br from-rose-50 via-rose-100/40 to-amber-50/80 border-amber-400 ring-2 ring-amber-400 shadow-md'
                        : hasPayment && clientLeave
                        ? 'bg-gradient-to-br from-amber-50 via-amber-100/60 to-amber-50 border-amber-400 ring-2 ring-amber-400 shadow-md'
                        : hasPayment
                        ? 'bg-gradient-to-br from-amber-50 to-amber-100/70 border-amber-400 ring-2 ring-amber-400 shadow-md'
                        : isPresent
                        ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-200'
                        : isAbsent
                        ? 'bg-rose-50/90 border-rose-300 ring-1 ring-rose-200'
                        : clientLeave
                        ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-200'
                        : trainerLeave
                        ? 'bg-purple-50/90 border-purple-300'
                        : isToday
                        ? 'bg-slate-50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${
                        hasPayment
                          ? 'w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] shadow-sm ring-1 ring-amber-500'
                          : isToday 
                          ? 'w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[10px]' 
                          : 'text-slate-700'
                      }`}>
                        {dayNum}
                      </span>
                      {hasPayment ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs shrink-0" title={`Payment Paid ₹${totalPaidOnDate.toLocaleString()}`}>💰</span>
                          {isPresent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {isAbsent && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                          {clientLeave && <span className="text-xs">🌴</span>}
                        </div>
                      ) : (
                        <>
                          {isPresent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {isAbsent && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                          {clientLeave && <span className="text-xs">🌴</span>}
                          {trainerLeave && <span className="text-xs">🧘‍♀️</span>}
                        </>
                      )}
                    </div>

                    <div className="pt-1 space-y-0.5">
                      {hasPayment ? (
                        <>
                          <span className="text-[8px] sm:text-[9px] font-black text-amber-950 bg-amber-300/90 px-1 py-0.5 rounded-md block text-center truncate shadow-xs">
                            💳 Paid ₹{totalPaidOnDate.toLocaleString()}
                          </span>
                          {isPresent && (
                            <span className="text-[8px] sm:text-[9px] font-black text-emerald-900 bg-emerald-200/80 px-1 py-0.5 rounded-md block text-center truncate">
                              Present
                            </span>
                          )}
                          {isAbsent && (
                            <span className="text-[8px] sm:text-[9px] font-black text-rose-900 bg-rose-200/80 px-1 py-0.5 rounded-md block text-center truncate">
                              Absent
                            </span>
                          )}
                          {clientLeave && (
                            <span className="text-[8px] sm:text-[9px] font-bold text-amber-900 bg-amber-200/80 px-1 py-0.5 rounded-md block text-center truncate">
                              Leave
                            </span>
                          )}
                        </>
                      ) : isPresent ? (
                        <span className="text-[9px] font-black text-emerald-800 bg-emerald-200/60 px-1 py-0.5 rounded-md block text-center truncate">
                          Present
                        </span>
                      ) : isAbsent ? (
                        <span className="text-[9px] font-black text-rose-800 bg-rose-200/60 px-1 py-0.5 rounded-md block text-center truncate">
                          Absent
                        </span>
                      ) : clientLeave ? (
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-200/60 px-1 py-0.5 rounded-md block text-center truncate">
                          Leave
                        </span>
                      ) : trainerLeave ? (
                        <span className="text-[9px] font-bold text-purple-800 bg-purple-200/60 px-1 py-0.5 rounded-md block text-center truncate" title={trainerLeave.reason || 'Instructor Rest Day'}>
                          Studio Off
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Legend */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600">
            {!isPerSession && (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 ring-2 ring-amber-300 flex items-center justify-center text-[8px] shadow-sm">💰</span>
                <span className="text-amber-950 font-black">Fee Paid Date</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Attended (Present)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Missed (Absent)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Client Leave</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Studio / Instructor Leave</span>
            </span>
          </div>

        </div>


        {/* 4. LEADERBOARD HISTORY & ACHIEVEMENTS BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Leaderboard History */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  🏆
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Studio Leaderboard</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Monthly Regularity & Hall of Fame</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs border border-amber-200">
                August 2026
              </span>
            </div>

            <div className="space-y-3">
              {/* 1. TOP CARD: Current Yogi's Position */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/90 via-indigo-50/60 to-white border-2 border-purple-300 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={targetClient.photoUrl}
                    alt={targetClient.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-400 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-black text-slate-900 truncate">{targetClient.name}</p>
                      <span className="px-1.5 py-0.5 rounded-md bg-purple-700 text-white text-[9px] font-black shrink-0">
                        This Yogi
                      </span>
                    </div>
                    <span className="text-[11px] text-purple-700 font-bold block">
                      {classesAttended} Sessions Attended
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-950 font-black text-xs border border-purple-200 shrink-0">
                  Rank #{currentRank} {rankMedal}
                </span>
              </div>

              {/* Sub-heading for Top 3 */}
              <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Top 3 Regularity Performers
                </span>
              </div>

              {/* 2. Top 3 Studio Performers (1st, 2nd, 3rd - Clean Non-clickable) */}
              <div className="space-y-2">
                {top3Yogis.map((yogi, idx) => {
                  const rankNum = idx + 1;
                  const medal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : '🥉';
                  const isCurrent = yogi.id === targetClient.id;

                  return (
                    <div 
                      key={yogi.id} 
                      className={`p-3 rounded-2xl border flex items-center justify-between cursor-default transition-all ${
                        isCurrent 
                          ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200' 
                          : 'bg-slate-50 border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-white text-slate-800 font-black text-xs flex items-center justify-center border border-slate-200 shadow-2xs shrink-0">
                          #{rankNum}
                        </span>
                        <img
                          src={yogi.photoUrl}
                          alt={yogi.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                            <span>{yogi.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-1 py-0.2 rounded">
                                (You)
                              </span>
                            )}
                          </p>
                          <span className="text-[10px] text-slate-500 font-semibold block">
                            {yogi.attendedClasses} Classes Done
                          </span>
                        </div>
                      </div>
                      <span className="text-base shrink-0">
                        {medal}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Earned Badges & Achievements */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  🎖️
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Earned Yoga Badges</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Recognitions achieved for regularity & dedication</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 font-black text-xs border border-purple-200">
                {achievements.filter(a => a.earned).length} Badges
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    badge.earned 
                      ? 'bg-gradient-to-br from-amber-50/80 to-purple-50/50 border-amber-200 shadow-sm' 
                      : 'bg-slate-50/50 border-slate-200/60 opacity-50 grayscale'
                  }`}
                >
                  <span className="text-2xl shrink-0">{badge.icon}</span>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-900">{badge.title}</h5>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>


        {/* 5. PAYMENT STATUS & INSTRUCTOR INFO SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Payment & Fee Status Card (Strict Privacy Enforced!) */}
          <div id="billing-cycle-section" className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 transition-all scroll-mt-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {isPerSession ? 'Pay-As-You-Go Session Pass' : 'Billing Cycle & Fee Status'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isPerSession ? 'Per Session Pass verified by Studio Ledger' : 'Monthly fee records verified by Studio Journal'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> Private
              </span>
            </div>

            {/* Total Balance / Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {isPerSession ? 'Session Plan Rate & Balance' : 'Total Outstanding Balance'}
                </span>
                <div className="flex items-center gap-2">
                  <strong className="text-xl font-black text-slate-900">
                    {isPerSession 
                      ? '₹0 Due (All Classes Paid)'
                      : (hasOutstandingDue ? `₹${totalOutstandingDue.toLocaleString()}` : '₹0 (All Clear)')}
                  </strong>
                  {isPerSession ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-200">
                      ₹{targetClient.perSessionFee || 800} / Class • Up to Date ✓
                    </span>
                  ) : hasOutstandingDue ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200">
                      {pendingCycles.length} {pendingCycles.length === 1 ? 'Cycle Pending' : 'Cycles Pending'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-200">
                      Up to Date ✓
                    </span>
                  )}
                </div>
              </div>

              {isPerSession ? (
                <button
                  onClick={() => setIsPaymentCheckoutOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Pay For Next Session (₹{targetClient.perSessionFee || 800})</span>
                </button>
              ) : hasOutstandingDue ? (
                <button
                  onClick={() => setIsPaymentCheckoutOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Pay Online (₹{totalOutstandingDue.toLocaleString()})</span>
                </button>
              ) : (
                <span className="px-3.5 py-2 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300 flex items-center gap-1.5 self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Verified by Studio Journal</span>
                </span>
              )}
            </div>

            {/* Per Session Pass Breakdown vs Monthly Cycles Breakdown */}
            {isPerSession ? (
              <div className="space-y-4 pt-1">
                {(() => {
                  const directPaid = payments.filter(p => p.clientId === targetClient.id && p.status === 'Paid').reduce((sum, p) => sum + (p.amount || 0), 0);
                  const rate = targetClient.perSessionFee || 800;
                  const consumedCost = classesAttended * rate;
                  const isPrepaid = directPaid > consumedCost;
                  const advanceCredit = Math.max(0, directPaid - consumedCost);
                  const remainingClassesInPass = rate > 0 ? Math.floor(advanceCredit / rate) : 0;
                  const totalPassClasses = targetClient.totalClasses || (rate > 0 && directPaid > 0 ? Math.floor(directPaid / rate) : classesAttended);
                  const progressPct = totalPassClasses > 0 ? Math.min(100, Math.round((classesAttended / totalPassClasses) * 100)) : 100;

                  return (
                    <div className="space-y-4">
                      {/* Top Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Completed Sessions</span>
                          <strong className="text-xl font-black text-slate-900">{classesAttended} Attended</strong>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">₹{consumedCost.toLocaleString()} fee utilized</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Fees Paid</span>
                          <strong className="text-xl font-black text-emerald-900">₹{Math.max(directPaid, paidAmount).toLocaleString()}</strong>
                          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">{isPrepaid ? 'Advance Package' : 'Verified Paid ✓'}</span>
                        </div>

                        <div className={`p-3.5 rounded-2xl border text-center col-span-2 sm:col-span-1 ${
                          isPrepaid ? 'bg-gradient-to-br from-emerald-100 to-teal-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                            {isPrepaid ? 'Remaining in Pass' : 'Pass Status'}
                          </span>
                          <strong className="text-xl font-black text-emerald-950 block">
                            {isPrepaid ? `${remainingClassesInPass} Classes Left` : 'Active Pass'}
                          </strong>
                          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                            {isPrepaid ? `₹${advanceCredit.toLocaleString()} credit available` : `Rate: ₹${rate}/class`}
                          </span>
                        </div>
                      </div>

                      {/* Package Pass Progress Bar if Prepaid */}
                      {isPrepaid && (
                        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                              <span>10-Class Package Pass Progress</span>
                            </span>
                            <span className="font-black text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                              {classesAttended} / {totalPassClasses} Completed ({progressPct}%)
                            </span>
                          </div>
                          
                          <div className="w-full h-3 bg-emerald-200/70 rounded-full overflow-hidden p-0.5">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 pt-0.5">
                            <span>August 2026: {classesAttended} Classes (₹{consumedCost.toLocaleString()} used)</span>
                            <span className="text-purple-700">September 2026: {remainingClassesInPass} Classes Remaining (₹{advanceCredit.toLocaleString()})</span>
                          </div>
                        </div>
                      )}

                      {/* Payment History List */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Pass & Payment Records:
                        </span>
                        {payments.filter(p => p.clientId === targetClient.id && p.status === 'Paid').length > 0 ? (
                          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                            {payments.filter(p => p.clientId === targetClient.id && p.status === 'Paid').map((p) => (
                              <div key={p.id} className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-slate-900 block">📅 {p.date} • {p.paymentMode || 'UPI'}</span>
                                  <span className="text-[10px] text-slate-500">{p.notes || 'Session Fee'}</span>
                                </div>
                                <span className="font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200">
                                  ₹{p.amount.toLocaleString()} PAID ✓
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs flex items-center justify-between">
                            <div>
                              <span className="font-bold text-emerald-950 block">✓ Pay-as-you-go session pass active</span>
                              <span className="text-[11px] text-emerald-800">Fee collected per attended session (₹{targetClient.perSessionFee || 800} × {classesAttended} classes)</span>
                            </div>
                            <span className="font-black text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300">
                              ₹{paidAmount.toLocaleString()} PAID ✓
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Monthly Billing History:
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {billingCycles.map((cycle) => (
                    <div
                      key={cycle.monthStr}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                        cycle.status === 'Paid'
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : cycle.status === 'Leave Waived'
                          ? 'bg-slate-50 border-slate-200 opacity-80'
                          : 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-200/50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">
                            {cycle.monthName}
                          </span>
                          {cycle.isCurrentMonth && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-extrabold">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {cycle.status === 'Paid'
                            ? `₹${cycle.paidAmount.toLocaleString()} Paid on ${cycle.paidDate || 'Monthly Cycle'}`
                            : cycle.status === 'Leave Waived'
                            ? 'Full Month Approved Leave • Fee Waived'
                            : `Due Amount: ₹${cycle.dueAmount.toLocaleString()}`}
                        </p>
                      </div>

                      <div>
                        {cycle.status === 'Paid' ? (
                          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300 flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>PAID</span>
                          </span>
                        ) : cycle.status === 'Leave Waived' ? (
                          <span className="px-3 py-1 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs">
                            Leave Waived 🌴
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-950 font-black text-xs border border-amber-300 flex items-center gap-1 shadow-sm">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>PENDING</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400 font-medium italic text-center pt-1 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> All fee transactions are securely recorded in Yoganjali Studio ledger.
            </p>
          </div>

          {/* Instructor Information Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 p-6 rounded-3xl text-white shadow-md border border-emerald-800/40 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-white text-sm">Guided Studio Instructor</h4>
              </div>
              <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full">
                Lead Trainer
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src="/anjali_hero.jpg"
                alt="Trainer Anjali Negi"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shrink-0 bg-white"
              />
              <div>
                <h5 className="font-extrabold text-white text-sm">Trainer Anjali Negi</h5>
                <p className="text-[11px] text-emerald-200 font-medium">Founder & Certified Senior Yoga Instructor</p>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 text-emerald-200 font-medium">
                🌿 Vinyasa, Hatha, Flexibility & Posture Correction
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/30">
                Certified Senior Yoga Instructor
              </span>
            </div>

            {/* Instructor Leave Schedule */}
            <div className="pt-3 border-t border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-200 font-bold flex items-center gap-1.5">
                  <CalendarX className="w-3.5 h-3.5 text-amber-300" />
                  <span>Instructor Leave Schedule:</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-xs border border-amber-400/30">
                  {instructorLeavesCount} {instructorLeavesCount === 1 ? 'Day' : 'Days'} Total
                </span>
              </div>
              
              {uniqueTrainerLeaves.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {uniqueTrainerLeaves.slice(0, 3).map((tl) => (
                    <div key={tl.id || `${tl.startDate}_${tl.endDate}`} className="p-2 rounded-xl bg-white/10 border border-white/10 text-xs flex items-center justify-between">
                      <span className="text-slate-200 font-medium">
                        📅 {tl.startDate || tl.date} {tl.endDate && tl.endDate !== (tl.startDate || tl.date) ? `to ${tl.endDate}` : ''}
                      </span>
                      <span className="text-amber-300 font-bold">
                        {tl.reason || 'Personal / Rest Day'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-300/80 italic pt-0.5">
                  ✓ No studio leaves scheduled. All guided classes running as per regular slots.
                </p>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Studio & Social Connect Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-12 px-4 sm:px-8 text-center space-y-6 shadow-sm">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Connect with Yoganjali & Trainer Anjali Negi</span>
          </div>

          <h4 className="font-serif font-extrabold text-xl sm:text-2xl text-slate-900">
            Official Studio & Social Channels
          </h4>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Follow our daily yoga flows, posture correction tips, student transformations and holistic wellness guides.
          </p>

          {/* Social Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <a
              href="https://www.yoganjaliyoga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Official Website</span>
            </a>

            <a
              href="https://instagram.com/yoganjali25"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all"
            >
              <Instagram className="w-4 h-4 text-white" />
              <span>@Yoganjali25</span>
            </a>

            <a
              href="https://www.youtube.com/@Yoganjali25"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all"
            >
              <Youtube className="w-4 h-4 text-white" />
              <span>YouTube Channel</span>
            </a>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 max-w-md mx-auto">
          <p className="text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} Yoganjali Yoga Studio • Guided by Anjali Negi • Official Member Progress Portal
          </p>
        </div>
      </footer>

      {/* Razorpay Online Payment Modal */}
      <PaymentCheckoutModal
        isOpen={isPaymentCheckoutOpen}
        onClose={() => setIsPaymentCheckoutOpen(false)}
        clientName={targetClient.name}
        clientPhone={targetClient.whatsapp || targetClient.phone || ''}
        amount={hasOutstandingDue ? totalOutstandingDue : Math.max(dueAmount - paidAmount, dueAmount || (targetClient.monthlyFee || 0))}
        purpose={`${isPerSession ? 'Per Session Fee' : 'Yoga Studio Fee'} — ${targetClient.name}`}
        onPaymentSuccess={(paymentId, paidAmt) => {
          const today = new Date().toISOString().slice(0, 10);
          addPayment({
            clientId: targetClient.id,
            clientName: targetClient.name,
            amount: paidAmt,
            date: today,
            month: today.slice(0, 7),
            paymentMode: 'UPI',
            status: 'Paid',
            notes: `Online Payment via Razorpay (Ref: ${paymentId})`,
          });
          setIsPaymentCheckoutOpen(false);
          showSuccessToast(`🎉 Payment of ₹${paidAmt.toLocaleString()} completed successfully! Verified as PAID.`);
        }}
      />

      {/* 🏖️ 1-Click Client Leave Request Modal */}
      <ClientLeaveRequestModal
        client={targetClient}
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
      />
    </div>
  );
};
