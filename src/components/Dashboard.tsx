import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getTodayDateString, isDateInMonth } from '../utils/dateUtils';
import { getClientCurrentMonthPaymentStatus } from '../utils/paymentUtils';
import { EditClientModal } from './Modals/EditClientModal';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  AlertCircle, 
  UserPlus, 
  CreditCard, 
  CalendarX, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  ArrowUpRight,
  Trash2,
  UserX,
  X,
  ChevronRight,
  Trophy,
  Activity,
  AlertTriangle,
  PieChart,
  Zap,
  Flame,
  Award,
  Users2,
  Medal,
  Star,
  TrendingUp,
  Globe,
  Share2,
  Pencil,
  PlusCircle
} from 'lucide-react';
import { ShareLinkModal } from './Modals/ShareLinkModal';
import { Client, PaymentRecord } from '../types';

interface TopEntity {
  type: 'Group' | 'Personal';
  id: string;
  name: string;
  classTime: string;
  days: string[];
  completedClasses: number;
  members: Client[];
}

const parseTimeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const clean = timeStr.trim();
  
  // 12-hour format with AM/PM: e.g. "03:00 PM", "03.00PM", "03.00 PM", "7:30am", "7pm"
  const match12 = clean.match(/^(\d{1,2})(?:[:.](\d{1,2}))?\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const period = match12[3].toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // 24-hour format: e.g. "15:00", "07:30", "15.00"
  const match24 = clean.match(/^(\d{1,2})[:.](\d{1,2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  // General fallback regex (handles any string with numbers and AM/PM)
  const matchGeneral = clean.match(/(\d{1,2})[:.](\d{1,2})\s*(AM|PM)?/i);
  if (matchGeneral) {
    let hours = parseInt(matchGeneral[1], 10);
    const minutes = parseInt(matchGeneral[2], 10);
    const period = matchGeneral[3]?.toUpperCase();
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  return 0;
};

export const formatClassTime = (timeStr: string): string => {
  if (!timeStr) return '';
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2})[:.](\d{1,2})\s*(AM|PM)?$/i);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2].padStart(2, '0');
    const period = match[3] ? match[3].toUpperCase() : (parseInt(hh, 10) >= 12 ? 'PM' : 'AM');
    return `${hh}:${mm} ${period}`;
  }
  return clean;
};

// Check if class duration (60 mins) has fully completed compared to current local time (i.e. after 1 hr of start time)
const isClassCompleted = (timeStr: string, durationMinutes = 60): boolean => {
  const classStartMins = parseTimeToMinutes(timeStr);
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  return currentMins >= (classStartMins + durationMinutes);
};

// Check if class is currently live/in session right now (within its 60 min duration)
const isClassLive = (timeStr: string, durationMinutes = 60): boolean => {
  const classStartMins = parseTimeToMinutes(timeStr);
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  return currentMins >= classStartMins && currentMins < (classStartMins + durationMinutes);
};

export const Dashboard: React.FC = () => {
  const { 
    clients, 
    payments, 
    leaves, 
    attendance, 
    trainerProfile,
    trainerLeaves,
    trainerDreams,
    setActiveTab,
    setIsAddClientOpen, 
    setIsAddPaymentOpen, 
    setIsAddLeaveOpen,
    setIsAddTrainerLeaveOpen,
    setIsClientWebsiteMode,
    setSelectedClientId,
    quickMarkPaid,
    markAttendance,
    deleteLeave,
    deleteTrainerLeave,
    setPaymentModalDefaultClientId
  } = useApp();

  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedGroupModal, setSelectedGroupModal] = useState<{ groupName: string; members: Client[] } | null>(null);
  const [editingClientModal, setEditingClientModal] = useState<Client | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  const todayObj = new Date();
  const todayDateStr = getTodayDateString();
  const currentMonthStr = todayDateStr.slice(0, 7);
  const currentMonthShortUpper = new Date(currentMonthStr + '-01').toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const todayDayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][todayObj.getDay()];

  const todayDateString = todayObj.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const activeClients = clients.filter(c => c.status !== 'Discontinued');

  // Clients on full month leave this month — exclude from fee reminders & pending fees
  // Matches: (1) isFullMonthLeave flag, OR (2) leave range covers entire current month
  const currentMonthStart = `${currentMonthStr}-01`;
  const currentMonthEnd = new Date(new Date(currentMonthStart).getFullYear(), new Date(currentMonthStart).getMonth() + 1, 0)
    .toISOString().slice(0, 10);

  const fullMonthLeaveClientIds = new Set(
    leaves
      .filter(l => {
        const start = l.startDate || l.date || '';
        const end = l.endDate || start;
        // Flag-based: explicitly marked full month leave
        if (l.isFullMonthLeave && (start.slice(0, 7) === currentMonthStr || end.slice(0, 7) === currentMonthStr)) return true;
        // Range-based: leave covers the entire current month
        if (start <= currentMonthStart && end >= currentMonthEnd) return true;
        return false;
      })
      .map(l => l.clientId)
  );

  // Filter leaves that actively cover today's date
  const activeLeaves = leaves.filter(l => {
    const isClientActive = activeClients.some(c => c.id === l.clientId);
    const start = l.startDate || l.date || '';
    const end = l.endDate || start;
    return isClientActive && todayDateStr >= start && todayDateStr <= end;
  });

  const totalClients = activeClients.length;

  const todaysTrainerLeave = trainerLeaves.find(l => {
    const start = l.startDate || l.date || '';
    const end = l.endDate || start;
    return todayDateStr >= start && todayDateStr <= end;
  });

  const todaysScheduledClients = activeClients.filter(c => {
    const hasJoined = !c.joiningDate || c.joiningDate <= todayDateStr;
    const isScheduledToday = Array.isArray(c.days) && c.days.includes(todayDayShort);
    
    // Check if client is currently on leave today (in leaves array OR marked as 'Leave' in attendance)
    const todayAtt = attendance.find(a => a.clientId === c.id && a.date === todayDateStr);
    const isMarkedLeaveInAtt = todayAtt?.status === 'Leave';
    
    const isOnLeaveToday = isMarkedLeaveInAtt || leaves.some(l => {
      if (l.clientId !== c.id) return false;
      const start = l.startDate || l.date || '';
      const end = l.endDate || start;
      return todayDateStr >= start && todayDateStr <= end;
    });

    const hasExplicitPresentOrAbsent = todayAtt && (todayAtt.status === 'Present' || todayAtt.status === 'Absent');

    // Exclude client if they are currently on leave today or not scheduled today!
    return hasJoined && !isOnLeaveToday && (isScheduledToday || hasExplicitPresentOrAbsent);
  });

  // Grouped Sort:
  todaysScheduledClients.sort((a, b) => {
    const attA = attendance.find(x => x.clientId === a.id && x.date === todayDateStr);
    const attB = attendance.find(x => x.clientId === b.id && x.date === todayDateStr);

    const isMarkedA = !!attA && (attA.status === 'Present' || attA.status === 'Absent');
    const isMarkedB = !!attB && (attB.status === 'Present' || attB.status === 'Absent');

    const isLiveA = !isMarkedA && isClassLive(a.classTime);
    const isLiveB = !isMarkedB && isClassLive(b.classTime);

    const isCompletedA = isMarkedA || isClassCompleted(a.classTime);
    const isCompletedB = isMarkedB || isClassCompleted(b.classTime);

    // Live ongoing classes come very first so trainer can mark them!
    if (isLiveA && !isLiveB) return -1;
    if (!isLiveA && isLiveB) return 1;

    // Upcoming unmarked classes come before completed/marked classes
    if (!isCompletedA && isCompletedB) return -1;
    if (isCompletedA && !isCompletedB) return 1;

    return parseTimeToMinutes(a.classTime) - parseTimeToMinutes(b.classTime);
  });

  const todaysClasses = todaysScheduledClients.length;

  // Payments received in current month (robust date format parsing)
  const currentMonthPayments = payments.filter(p => {
    if (p.status === 'Pending' || p.status === 'Overdue') return false;
    return p.month === currentMonthStr || isDateInMonth(p.date, currentMonthStr);
  });
  const loggedPaymentsTotal = currentMonthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Also include monthly fee for clients who are fully Paid for current month without explicit payment log
  const paidClientsWithoutLog = activeClients.filter(c => {
    if (c.feeType === 'Per Session' || c.membershipPlan === 'Per Session') return false;
    const { status } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
    if (status !== 'Paid') return false;
    const hasLog = currentMonthPayments.some(p => p.clientId === c.id);
    return !hasLog;
  });

  const implicitPaidRevenue = paidClientsWithoutLog.reduce((acc, c) => {
    const fee = c.feeType === 'Per Session' ? (c.perSessionFee || 1000) * (c.completedClasses || 1) : (c.monthlyFee || 1200);
    return acc + fee;
  }, 0);

  // Synthesize payment records for any active client marked 'Paid' on profile card without explicit log
  const synthesizedCurrentMonthPayments: PaymentRecord[] = paidClientsWithoutLog.map(c => ({
    id: `syn-dash-${c.id}`,
    clientId: c.id,
    clientName: c.name,
    amount: c.feeType === 'Per Session' ? (c.perSessionFee || 1000) * (c.completedClasses || 1) : (c.monthlyFee || 1200),
    date: c.joiningDate || todayDateStr,
    month: currentMonthStr,
    paymentMode: 'UPI',
    status: c.paymentStatus as any,
    notes: 'Paid status on client profile'
  }));

  // Per Session (Pay-As-You-Go) Auto-Earned Revenue on Class Days
  const perSessionClients = activeClients.filter(c => c.feeType === 'Per Session' || c.membershipPlan === 'Per Session');
  let unloggedPerSessionEarnedRevenue = 0;
  const perSessionSyntheticPayments: PaymentRecord[] = [];

  perSessionClients.forEach(client => {
    // Skip if on full month leave
    if (fullMonthLeaveClientIds.has(client.id)) return;

    const rate = client.perSessionFee || 1000;
    const presentClassesThisMonth = attendance.filter(a => 
      a.clientId === client.id && 
      a.status === 'Present' && 
      isDateInMonth(a.date, currentMonthStr)
    ).length;

    const effectiveAttended = presentClassesThisMonth > 0 ? presentClassesThisMonth : (client.completedClasses || 0);
    const totalEarnedForClient = effectiveAttended * rate;
    const loggedForClient = currentMonthPayments
      .filter(p => p.clientId === client.id)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const unloggedAmount = Math.max(0, totalEarnedForClient - loggedForClient);
    unloggedPerSessionEarnedRevenue += unloggedAmount;

    // If client has earned sessions not already in explicit logs, add to displayable payments for Income Breakdown
    if (unloggedAmount > 0 || (effectiveAttended > 0 && loggedForClient === 0)) {
      const sessionCount = effectiveAttended > 0 ? effectiveAttended : 1;
      perSessionSyntheticPayments.push({
        id: `syn-persession-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        amount: unloggedAmount > 0 ? unloggedAmount : (sessionCount * rate),
        date: todayDateStr,
        month: currentMonthStr,
        paymentMode: 'UPI',
        status: 'Paid',
        notes: `Pay-As-You-Go (${sessionCount} ${sessionCount === 1 ? 'session' : 'sessions'} completed @ ₹${rate}/session)`
      });
    }
  });

  const allDisplayableMonthPayments = [
    ...currentMonthPayments, 
    ...synthesizedCurrentMonthPayments,
    ...perSessionSyntheticPayments
  ];

  const monthlyIncome = loggedPaymentsTotal + implicitPaidRevenue + unloggedPerSessionEarnedRevenue;

  // Clients with pending fees in current month (Excluding Per Session clients like Chetna)
  const pendingFeeClients = activeClients.filter(c => {
    if (c.feeType === 'Per Session' || c.membershipPlan === 'Per Session') return false;
    // Skip clients on full month leave this month
    if (fullMonthLeaveClientIds.has(c.id)) return false;
    const { status } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
    return status === 'Pending' || status === 'Overdue' || status === 'Partial';
  });

  const pendingFees = pendingFeeClients.reduce((acc, c) => {
    const { remainingBalance } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
    return acc + remainingBalance;
  }, 0);

  // 🏆 TOP 5 YOGIS DISCIPLINE & REGULARITY LEADERBOARD CALCULATION
  const rankedTop5Yogis = activeClients.map(client => {
    const clientAtt = attendance.filter(a => a.clientId === client.id);
    const presentCount = clientAtt.filter(a => a.status === 'Present').length;
    const absentCount = clientAtt.filter(a => a.status === 'Absent').length;
    const leaveCount = leaves.filter(l => l.clientId === client.id).length;

    const totalClassesAttended = client.completedClasses || presentCount;

    const score = (totalClassesAttended * 10) - (absentCount * 5) - (leaveCount * 2);
    const totalMarked = presentCount + absentCount;
    const consistencyRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100;

    return {
      client,
      completedClasses: totalClassesAttended,
      absentCount,
      leaveCount,
      consistencyRate,
      score
    };
  })
  .sort((a, b) => b.score - a.score || b.completedClasses - a.completedClasses || a.absentCount - b.absentCount)
  .slice(0, 5);

  // 2. Inactive / Low Attendance Clients (Excluding Personal 1-on-1 clients & clients currently on leave or on month leave)
  const lowAttendanceClients = activeClients
    .filter(c => {
      // Exclude Personal 1-on-1 session clients
      const isPersonalClient = c.sessionType === 'Personal' || (c.groupName && c.groupName.toLowerCase().includes('personal'));
      if (isPersonalClient) return false;

      // Exclude clients who are currently on leave or have an active month leave
      const isOnLeave = leaves.some(l => {
        if (l.clientId !== c.id) return false;
        const start = l.startDate || l.date || '';
        const end = l.endDate || start;
        const currentMonth = todayDateStr.substring(0, 7);
        const startMonth = start.substring(0, 7);
        const endMonth = end.substring(0, 7);
        const isCurrentDate = todayDateStr >= start && todayDateStr <= end;
        const isCurrentMonth = currentMonth >= startMonth && currentMonth <= endMonth;
        return isCurrentDate || isCurrentMonth;
      });
      return !isOnLeave;
    })
    .sort((a, b) => a.completedClasses - b.completedClasses)
    .slice(0, 5);

  // 3. Collection Efficiency %
  const totalExpectedRevenue = monthlyIncome + pendingFees;
  const collectionRatePercent = totalExpectedRevenue > 0 ? Math.round((monthlyIncome / totalExpectedRevenue) * 100) : 100;
  const avgRevenuePerClient = totalClients > 0 ? Math.round(totalExpectedRevenue / totalClients) : 0;

  // 4. Fee Plan Split
  const monthlySubscribersCount = activeClients.filter(c => c.feeType !== 'Per Session').length;
  const perSessionCount = activeClients.filter(c => c.feeType === 'Per Session').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white p-7 sm:p-9 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-slate-700/80 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{todayDateString}</span>
            </div>
            
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-sans">
                {getGreeting()}, <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{trainerProfile.name}</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1 max-w-xl">
                Welcome to <strong className="text-white">{trainerProfile.studioName}</strong>. You have <strong className="text-emerald-300 font-bold">{todaysClasses} active sessions</strong> scheduled for today and <strong className="text-amber-300 font-bold">{activeLeaves.length} clients on leave</strong>.
              </p>
            </div>

            {/* Quick Micro Stat Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-bold">
                🟢 {todaysClasses} Classes Today
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-300 text-[11px] font-bold">
                👥 {activeClients.length} Active Yogis
              </span>
              {activeLeaves.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-300 text-[11px] font-bold">
                  🏖️ {activeLeaves.length} on Leave
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Trainer Absent Alert Banner */}
      {todaysTrainerLeave && (
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-amber-300">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg">🧘 Instructor / Trainer On Leave Today</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-rose-800 font-extrabold text-xs">
                  {todaysTrainerLeave.status}
                </span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Leave Period: <strong>{todaysTrainerLeave.startDate || todaysTrainerLeave.date} {todaysTrainerLeave.endDate && todaysTrainerLeave.endDate !== (todaysTrainerLeave.startDate || todaysTrainerLeave.date) ? `to ${todaysTrainerLeave.endDate}` : ''}</strong> • Reason: <strong>{todaysTrainerLeave.reason}</strong> {todaysTrainerLeave.notes ? `• "${todaysTrainerLeave.notes}"` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => deleteTrainerLeave(todaysTrainerLeave.id)}
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition-colors"
          >
            Remove Instructor Leave
          </button>
        </div>
      )}

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Active Clients (Purple / Indigo Theme) */}
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-50/60 to-white rounded-3xl p-6 shadow-md border-2 border-purple-200/90 hover:border-purple-400 hover-lift relative overflow-hidden group flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs font-black text-purple-900/70 uppercase tracking-wider">Total Active Clients</p>
              <h3 className="text-3xl font-black text-purple-950 tracking-tight">{totalClients}</h3>
              <span className="inline-block text-[11px] font-extrabold text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-lg border border-purple-200">
                Active Practitioners 🧘
              </span>
            </div>
            <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Today's Classes (Sky / Blue Theme) */}
        <div className="bg-gradient-to-br from-sky-500/10 via-blue-50/60 to-white rounded-3xl p-6 shadow-md border-2 border-sky-200/90 hover:border-sky-400 hover-lift relative overflow-hidden group flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs font-black text-sky-900/70 uppercase tracking-wider">Today's Classes</p>
              <h3 className="text-3xl font-black text-sky-950 tracking-tight">{todaysClasses}</h3>
              <span className="inline-block text-[11px] font-extrabold text-sky-800 bg-sky-100/90 px-2.5 py-0.5 rounded-lg border border-sky-200">
                Scheduled for {todayDayShort} ⏰
              </span>
            </div>
            <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/25 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* CLICKABLE Card 3: Dynamic Month Income (Emerald / Teal Theme) */}
        <div 
          onClick={() => setShowIncomeModal(true)}
          className="bg-gradient-to-br from-emerald-500/15 via-teal-50/70 to-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-emerald-300 hover:border-emerald-500 hover-lift relative overflow-hidden group cursor-pointer ring-2 ring-emerald-500/10 hover:ring-emerald-500/30 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-emerald-900/80 uppercase tracking-wider whitespace-nowrap">{currentMonthShortUpper} INCOME</p>
                <span className="text-[9px] sm:text-[10px] font-black text-white bg-emerald-600 px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs">Click list ↗</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">₹{(monthlyIncome || 0).toLocaleString()}</h3>
              <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                <span>View {allDisplayableMonthPayments.length} payment records</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
              </p>
            </div>
            <div className="w-12 h-12 p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/25 group-hover:scale-110 transition-transform self-center">
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* CLICKABLE Card 4: Pending Fees (Rose / Red Theme) */}
        <div 
          onClick={() => setShowPendingModal(true)}
          className="bg-gradient-to-br from-rose-500/15 via-amber-50/60 to-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-rose-300 hover:border-rose-500 hover-lift relative overflow-hidden group cursor-pointer ring-2 ring-rose-500/10 hover:ring-rose-500/30 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-rose-900/80 uppercase tracking-wider whitespace-nowrap">Pending Fees</p>
                <span className="text-[9px] sm:text-[10px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs">Click list ↗</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">₹{(pendingFees || 0).toLocaleString()}</h3>
              <p className="text-xs font-extrabold text-rose-600 flex items-center gap-1">
                <span>View {pendingFeeClients.length} pending clients</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
              </p>
            </div>
            <div className="w-12 h-12 p-3 rounded-2xl bg-gradient-to-br from-rose-600 to-red-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/25 group-hover:scale-110 transition-transform self-center">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Schedule Timeline & Sidebar Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Today's Schedule Timeline (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Today's Class Schedule ({todayDayShort})
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {todaysTrainerLeave 
                  ? `🧘 Studio Holiday today (${todaysTrainerLeave.reason}). You can still mark attendance if any client attended.`
                  : 'Upcoming classes shown in Red box at top'}
              </p>
            </div>
            {todaysTrainerLeave ? (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 shadow-xs flex items-center gap-1.5">
                <span>🧘</span>
                <span>Studio Holiday: {todaysTrainerLeave.reason}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                {todaysClasses} Active Sessions Today
              </span>
            )}
          </div>

          {todaysScheduledClients.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-100 text-center text-xs font-medium text-slate-400">
              No active sessions scheduled for today ({todayDayShort}).
            </div>
          ) : (
            <div className="space-y-4">
              {todaysScheduledClients.map((client) => {
                const todayAtt = attendance.find(a => a.clientId === client.id && a.date === todayDateStr);
                const isMarked = !!todayAtt && (todayAtt.status === 'Present' || todayAtt.status === 'Absent');
                const hasCompleted = isClassCompleted(client.classTime);
                const isLive = !todaysTrainerLeave && isClassLive(client.classTime);
                const isUpcoming = !todaysTrainerLeave && !hasCompleted && !isLive;

                const isPast = isMarked || hasCompleted;

                return (
                  <div 
                    key={client.id}
                    className={`rounded-3xl p-5 border transition-all group ${
                      !isMarked && todaysTrainerLeave
                        ? 'bg-purple-50/30 border-purple-200/80 shadow-xs hover:border-purple-300'
                        : !isMarked && isLive
                        ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300 shadow-md'
                        : !isMarked && isUpcoming
                        ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-200/80 shadow-md'
                        : 'bg-white border-slate-200/80 shadow-soft opacity-85 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                        <img
                          src={client.photoUrl}
                          alt={client.name}
                          className={`w-14 h-14 rounded-2xl object-cover ring-2 group-hover:scale-105 transition-transform ${
                            !isMarked && todaysTrainerLeave
                              ? 'ring-purple-200'
                              : !isMarked && isLive
                              ? 'ring-amber-500'
                              : !isPast
                              ? 'ring-rose-400'
                              : 'ring-purple-100'
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 
                              onClick={() => setSelectedClientId(client.id)}
                              className="font-bold text-slate-900 text-base hover:text-purple-600 cursor-pointer transition-colors"
                            >
                              {client.name}
                            </h4>
                            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {client.gender === 'Female' ? '♀️' : '♂️'}
                            </span>
                            
                            {/* Dynamic Status Badges */}
                            {todayAtt?.status === 'Present' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✓ Present Today
                              </span>
                            ) : todayAtt?.status === 'Absent' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                                ✕ Absent Today
                              </span>
                            ) : todaysTrainerLeave ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-200">
                                🧘 Holiday (No Regular Class)
                              </span>
                            ) : isLive ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-sm border border-amber-600 animate-pulse flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />
                                🔴 Live in Session
                              </span>
                            ) : hasCompleted ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                                ✓ Class Completed
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-sm border border-rose-700 animate-pulse">
                                ⏰ Upcoming Class
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-2">
                            <span className={`font-bold px-2.5 py-0.5 rounded-md ${
                              !isMarked && todaysTrainerLeave
                                ? 'bg-purple-100 text-purple-900 font-bold'
                                : !isMarked && isLive
                                ? 'bg-amber-200 text-amber-950 font-extrabold'
                                : !isPast
                                ? 'bg-rose-200/80 text-rose-950 font-extrabold'
                                : 'bg-slate-200 text-slate-800'
                            }`}>
                              ⏰ {formatClassTime(client.classTime)}
                            </span>
                            <span>• {client.days.join(', ')}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                              🎯 {client.goal}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${client.phone}`}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors"
                            title="Call Client"
                          >
                            <Phone className="w-4 h-4" />
                          </a>

                          <a
                            href={`https://api.whatsapp.com/send?phone=${client.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center gap-1 text-xs font-semibold px-3"
                            title="Message on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            onClick={() => setSelectedClientId(client.id)}
                            className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs transition-colors flex items-center gap-1"
                          >
                            Profile
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Mark:</span>
                          <button
                            onClick={() => markAttendance(client.id, 'Present')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              todayAtt?.status === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Present
                          </button>
                          <button
                            onClick={() => markAttendance(client.id, 'Absent')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              todayAtt?.status === 'Absent'
                                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Absent
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Leaves & Fee Reminders */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CalendarX className="w-5 h-5 text-rose-500" />
                Today's Leave ({activeLeaves.length})
              </h3>
              <button 
                onClick={() => setIsAddLeaveOpen(true)}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                + Log Leave
              </button>
            </div>

            {activeLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">No leaves logged for today 👍</p>
            ) : (
              <div className="space-y-3">
                {activeLeaves.map((leave) => (
                  <div key={leave.id} className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={leave.photoUrl} 
                        alt={leave.clientName} 
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-rose-200"
                      />
                      <div className="flex-1">
                        <h5 className="font-bold text-slate-900 text-xs">{leave.clientName}</h5>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">{leave.reason}</p>
                        <span className="text-[10px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-md inline-block mt-1">
                          {leave.duration}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteLeave(leave.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-200 text-rose-400 hover:text-rose-700 transition-colors"
                      title="Remove Leave Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                Fee Reminders ({pendingFeeClients.length})
              </h3>
              <button
                onClick={() => {
                  setPaymentModalDefaultClientId(null);
                  setIsAddPaymentOpen(true);
                }}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                + Add Fee
              </button>
            </div>

            {pendingFeeClients.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">All active clients paid for this month! 🎉</p>
            ) : (
              <div className="space-y-3">
                {pendingFeeClients.map((client) => {
                  const { remainingBalance } = getClientCurrentMonthPaymentStatus(client, payments, currentMonthStr, leaves);
                  return (
                    <div 
                      key={client.id}
                      className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center justify-between gap-3 hover:bg-amber-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={client.photoUrl} 
                          alt={client.name} 
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs">{client.name}</h5>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Due: {client.feeDueDate} • <span className="text-amber-700 font-bold">₹{remainingBalance}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => quickMarkPaid(client.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Mark Paid
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 🌟 TRAINER FINANCIAL VISION & DREAMS WIDGET */}
      {trainerDreams && trainerDreams.length > 0 && (
        <div 
          onClick={() => setActiveTab('dreams')}
          className="bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-purple-500/30 cursor-pointer hover:border-purple-400/60 transition-all group"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 font-black text-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform shrink-0">
                🏆
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-extrabold text-lg sm:text-xl text-white">Anjali's Future Dreams & Revenue Goals</h4>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-300/40 px-2.5 py-0.5 rounded-full font-black uppercase">
                    VISION BOARD
                  </span>
                </div>
                <p className="text-xs text-purple-200 font-medium mt-0.5">
                  Top Goal: <strong className="text-white">{trainerDreams[0]?.title || 'Financial Vision Goal'}</strong> (Target: ₹{(trainerDreams[0]?.targetAmount || 0).toLocaleString('en-IN')})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-xs text-purple-200 font-bold block">Funded</span>
                <span className="text-amber-300 font-black text-base sm:text-lg">
                  ₹{(trainerDreams[0]?.savedAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <button className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md transition-all flex items-center gap-1 group-hover:translate-x-1">
                <span>View All Dreams</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW RICH FEATURE: 3 EQUAL-SIZE ANALYTICS & LEADERBOARD CARDS */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/40 backdrop-blur-md flex items-center justify-center text-yellow-300 border border-purple-400/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold tracking-tight">Studio Performance Analytics & Leaderboard</h3>
              <p className="text-xs text-purple-200/80 font-medium">Top 5 Regular Yogis, Irregular Client Alerts & Fee Collection Health</p>
            </div>
          </div>

          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-bold border border-white/15">
            ⚡ Live Studio Insights
          </span>
        </div>

        {/* EQUAL 3-COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: TOP 5 REGULAR YOGIS LEADERBOARD */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 hover:bg-white/15 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-extrabold tracking-wider text-yellow-300 uppercase bg-yellow-400/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> 🏆 Top 5 Regular Yogis
                </span>
                <span className="text-[10px] font-bold text-yellow-200">
                  Disciplined
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {rankedTop5Yogis.map((item, idx) => {
                  const { client, completedClasses, absentCount, leaveCount, consistencyRate } = item;
                  const rankBadges = ['🥇 #1', '🥈 #2', '🥉 #3', '4️⃣ #4', '5️⃣ #5'];
                  const rankColors = [
                    'bg-yellow-400 text-slate-950 ring-yellow-400',
                    'bg-slate-200 text-slate-950 ring-slate-300',
                    'bg-amber-600 text-white ring-amber-500',
                    'bg-purple-800 text-white ring-purple-400',
                    'bg-purple-900 text-white ring-purple-500'
                  ];

                  return (
                    <div 
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between gap-2 hover:bg-white/20 cursor-pointer transition-all group/item"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative shrink-0">
                          <img
                            src={client.photoUrl}
                            alt={client.name}
                            className={`w-9 h-9 rounded-xl object-cover ring-2 bg-white ${
                              idx === 0 ? 'ring-yellow-400' : 'ring-purple-300'
                            }`}
                          />
                          <span className={`absolute -top-1.5 -left-1.5 text-[8px] font-black px-1.5 py-0.2 rounded-full shadow-md ${rankColors[idx]}`}>
                            {rankBadges[idx]}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-white text-xs group-hover/item:text-yellow-300 transition-colors">
                            {client.name}
                          </h4>
                          <p className="text-[10px] text-purple-200 font-medium">
                            ✓ {completedClasses} Attended • {absentCount} Abs
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-black text-emerald-400 block">
                          🔥 {consistencyRate}%
                        </span>
                        <span className="text-[9px] font-bold text-purple-200 bg-purple-900/60 px-1.5 py-0.2 rounded inline-block">
                          {item.score} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-purple-300/80 border-t border-white/10 font-medium">
              Calculated by Presents, Absences & Leaves
            </div>
          </div>

          {/* Card 2: TOP 5 IRREGULAR CLIENTS ALERT */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 hover:bg-white/15 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-extrabold tracking-wider text-rose-300 uppercase bg-rose-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> 😴 Needs Motivation ({lowAttendanceClients.length})
                </span>
                <span className="text-[10px] font-bold text-rose-200">Irregular</span>
              </div>

              {lowAttendanceClients.length === 0 ? (
                <p className="text-xs text-purple-200 py-6 text-center">All active clients are regularly attending sessions! 🎉</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {lowAttendanceClients.slice(0, 5).map((c, idx) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img src={c.photoUrl} alt={c.name} className="w-8 h-8 rounded-xl object-cover bg-white shrink-0" />
                        <div>
                          <h5 
                            onClick={() => setSelectedClientId(c.id)}
                            className="font-bold text-white text-xs hover:text-yellow-300 cursor-pointer"
                          >
                            #{idx + 1} {c.name}
                          </h5>
                          <p className="text-[10px] text-purple-200">{c.completedClasses} classes attended</p>
                        </div>
                      </div>

                      <a
                        href={`https://api.whatsapp.com/send?phone=${c.whatsapp.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hi ${c.name}! 👋 We missed you in Yoga class today. Hope everything is well! 🌿`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] shadow-sm shrink-0 flex items-center gap-1"
                      >
                        💬 Remind
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-center text-[10px] text-purple-300/80 border-t border-white/10 font-medium">
              Showing top 5 clients needing motivation
            </div>
          </div>

          {/* Card 3: FEE COLLECTION HEALTH & FINANCIAL QUICK INSIGHTS */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 hover:bg-white/15 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-extrabold tracking-wider text-emerald-300 uppercase bg-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <PieChart className="w-3.5 h-3.5" /> 📈 Fee Collection Health
                </span>
                <span className="text-xs font-black text-emerald-400">{collectionRatePercent}% Collected</span>
              </div>

              <div className="space-y-3 pt-1">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-purple-200 mb-1.5">
                    <span>Collected: ₹{(monthlyIncome || 0).toLocaleString()}</span>
                    <span>Pending: ₹{(pendingFees || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden flex p-0.5">
                    <div style={{ width: `${collectionRatePercent}%` }} className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm" />
                  </div>
                </div>

                {/* Membership Plan split */}
                <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-2">
                  <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Membership Plan Ratio</span>
                  <div className="flex items-center justify-between text-xs font-semibold text-purple-200">
                    <span className="flex items-center gap-1">
                      📅 Monthly: <strong className="text-white">{monthlySubscribersCount} Clients</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      🧘 Per Session: <strong className="text-white">{perSessionCount} Clients</strong>
                    </span>
                  </div>
                </div>

                {/* Financial Quick Insights Box */}
                <div className="p-3 rounded-xl bg-purple-900/40 border border-purple-400/20 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-200">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Avg Revenue / Client:
                    </span>
                    <strong className="text-emerald-300 font-extrabold">₹{(avgRevenuePerClient || 0).toLocaleString()}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-purple-200">
                    <span>Collection Status:</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      collectionRatePercent >= 75
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                        : collectionRatePercent >= 50
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                    }`}>
                      {collectionRatePercent >= 75 ? '🟢 Healthy Collection' : collectionRatePercent >= 50 ? '🟡 Moderate Collection' : '🔴 Action Required'}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Action Button */}
            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setPaymentModalDefaultClientId(null);
                  setIsAddPaymentOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                + Record Fee Payment
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Group Batch Members Popup Modal */}
      {selectedGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Users2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">{selectedGroupModal.groupName}</h3>
                  <p className="text-xs text-amber-100">
                    👥 Group Batch • {selectedGroupModal.members.length} Active Members
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedGroupModal(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Group Members List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {selectedGroupModal.members.map((m) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={m.photoUrl} 
                      alt={m.name} 
                      className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-200 bg-white"
                    />
                    <div>
                      <h5 
                        onClick={() => {
                          setSelectedGroupModal(null);
                          setSelectedClientId(m.id);
                        }}
                        className="font-bold text-slate-900 text-xs sm:text-sm hover:text-purple-600 cursor-pointer"
                      >
                        {m.name}
                      </h5>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        📞 {m.phone} • Plan: <strong className="text-purple-700">{m.feeType === 'Per Session' ? 'Per Session' : 'Monthly'}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGroupModal(null);
                      setSelectedClientId(m.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs transition-colors flex items-center gap-1"
                  >
                    View Profile
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedGroupModal(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-all"
              >
                Close Members List
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: THIS MONTH INCOME BREAKDOWN POPUP */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">{currentMonthShortUpper} Income Breakdown</h3>
                  <p className="text-xs text-emerald-100">Received fee payments for current month cycle</p>
                </div>
              </div>

              <button
                onClick={() => setShowIncomeModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Income Summary */}
            {(() => {
              const monthlySubCollected = allDisplayableMonthPayments
                .filter(p => {
                  const c = clients.find(cl => cl.id === p.clientId);
                  return c?.feeType !== 'Per Session';
                })
                .reduce((acc, p) => acc + (p.amount || 0), 0);

              const perSessionCollected = allDisplayableMonthPayments
                .filter(p => {
                  const c = clients.find(cl => cl.id === p.clientId);
                  return c?.feeType === 'Per Session';
                })
                .reduce((acc, p) => acc + (p.amount || 0), 0);

              return (
                <div className="p-5 bg-emerald-50/80 border-b border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Received Income (This Month)</p>
                    <h4 className="text-2xl font-black text-emerald-950">₹{(monthlyIncome || 0).toLocaleString()}</h4>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] sm:text-[11px] font-bold">
                      <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                        💳 Monthly Fixed: ₹{(monthlySubCollected || 0).toLocaleString()}
                      </span>
                      <span className="bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
                        🧘 Per Session (Pay-As-You-Go): ₹{(perSessionCollected || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs self-start sm:self-auto">
                    {allDisplayableMonthPayments.length} Transactions
                  </span>
                </div>
              );
            })()}

            {/* Payments List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {allDisplayableMonthPayments.length === 0 ? (
                <div className="text-center py-8 text-xs font-medium text-slate-400">
                  No payments recorded for this month yet.
                </div>
              ) : (
                allDisplayableMonthPayments.map((p) => {
                  const client = clients.find(c => c.id === p.clientId);
                  return (
                    <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={client?.photoUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=Yoga'} 
                          alt={p.clientName} 
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-200 bg-white"
                        />
                        <div>
                          <h5 
                            onClick={() => {
                              setShowIncomeModal(false);
                              setSelectedClientId(p.clientId);
                            }}
                            className="font-bold text-slate-900 text-xs sm:text-sm hover:text-purple-600 cursor-pointer"
                          >
                            {p.clientName}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            📅 {p.date} • <strong className="text-purple-700">{p.paymentMode}</strong> {p.notes ? `• "${p.notes}"` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-extrabold text-emerald-700 block">
                          +₹{(p.amount || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          ✓ Paid
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setShowIncomeModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-all"
              >
                Close List
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: PENDING FEES BREAKDOWN POPUP */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Pending Fees Breakdown</h3>
                  <p className="text-xs text-rose-100">Clients with unpaid or partial fees for current month</p>
                </div>
              </div>

              <button
                onClick={() => setShowPendingModal(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Pending Summary */}
            <div className="p-5 bg-rose-50/80 border-b border-rose-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Uncollected Pending Fee</p>
                <h4 className="text-2xl font-black text-rose-950">₹{(pendingFees || 0).toLocaleString()}</h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-extrabold text-xs">
                {pendingFeeClients.length} Pending Clients
              </span>
            </div>

            {/* Pending Clients List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {pendingFeeClients.length === 0 ? (
                <div className="text-center py-8 text-xs font-medium text-slate-400">
                  All active clients have cleared their fee payments for this month! 🎉
                </div>
              ) : (
                pendingFeeClients.map((client) => {
                  const { remainingBalance, status, unpaidMonthsCount, unpaidMonthsNames } = getClientCurrentMonthPaymentStatus(client, payments, currentMonthStr, leaves);
                  return (
                    <div key={client.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={client.photoUrl} 
                          alt={client.name} 
                          className="w-11 h-11 rounded-xl object-cover ring-2 ring-rose-200 bg-white shrink-0"
                        />
                        <div>
                          <h5 
                            onClick={() => {
                              setShowPendingModal(false);
                              setSelectedClientId(client.id);
                            }}
                            className="font-bold text-slate-900 text-xs sm:text-sm hover:text-purple-600 cursor-pointer"
                          >
                            {client.name}
                          </h5>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Due Date: <strong className="text-slate-800">{client.feeDueDate}</strong> • Fee Mode: <strong className="text-purple-700">{client.feeType === 'Per Session' ? 'Per Session' : 'Monthly'}</strong>
                          </p>
                          {unpaidMonthsCount > 1 && (
                            <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-1">
                              ⚠️ {unpaidMonthsCount} Months Unpaid ({unpaidMonthsNames.join(', ')})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                        <div className="text-left sm:text-right pr-2">
                          <span className="text-sm font-extrabold text-rose-600 block">
                            ₹{(remainingBalance || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            {status}
                          </span>
                        </div>

                        {/* Quick Mark Paid Button */}
                        <button
                          onClick={() => {
                            quickMarkPaid(client.id);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setShowPendingModal(false)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-all"
              >
                Close List
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Edit Client Modal from Pending Checklist */}
      <EditClientModal
        client={editingClientModal}
        isOpen={!!editingClientModal}
        onClose={() => setEditingClientModal(null)}
      />

    </div>
  );
};
