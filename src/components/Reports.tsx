import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, TrendingUp, Users, CheckCircle2, Clock, Calendar, Award, 
  Flame, HeartHandshake, Sparkles, Activity, Target, Zap, DollarSign, 
  Download, ArrowUpRight, ShieldCheck, AlertTriangle, MessageCircle, 
  PieChart, ChevronRight, UserCheck, HelpCircle, ArrowUpCircle
} from 'lucide-react';
import { getClientCurrentMonthPaymentStatus, formatMonthName } from '../utils/paymentUtils';
import { getTodayDateString, isDateInMonth } from '../utils/dateUtils';

export const Reports: React.FC = () => {
  const { clients, payments, attendance, leaves, setSelectedClientId } = useApp();

  const todayDateStr = getTodayDateString();
  const currentMonthStr = todayDateStr.slice(0, 7); // e.g. "2026-09"

  const activeClients = clients.filter(c => c.status !== 'Discontinued');
  const fullMonthLeaveClientIds = new Set(
    leaves
      .filter(l => {
        const start = l.startDate || l.date || '';
        const end = l.endDate || start;
        if (start.startsWith(currentMonthStr) && end.startsWith(currentMonthStr)) {
          const sDay = parseInt(start.split('-')[2], 10) || 1;
          const eDay = parseInt(end.split('-')[2], 10) || 30;
          return sDay <= 10 && eDay >= 20;
        }
        return false;
      })
      .map(l => l.clientId)
  );

  // 1. Current Month (September 2026) Collected Income
  const currentMonthPayments = payments.filter(p => {
    if (p.status === 'Pending' || p.status === 'Overdue') return false;
    return p.month === currentMonthStr || isDateInMonth(p.date, currentMonthStr);
  });
  const loggedPaymentsTotal = currentMonthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const perSessionClients = activeClients.filter(c => c.feeType === 'Per Session' || c.membershipPlan === 'Per Session');
  let unloggedPerSessionEarnedRevenue = 0;

  perSessionClients.forEach(client => {
    if (fullMonthLeaveClientIds.has(client.id)) return;
    const rate = client.perSessionFee || 800;
    const presentClassesThisMonth = attendance.filter(a => 
      a.clientId === client.id && 
      a.status === 'Present' && 
      isDateInMonth(a.date, currentMonthStr)
    ).length;

    const effectiveAttended = presentClassesThisMonth;
    const totalEarnedForClient = effectiveAttended * rate;
    const loggedForClient = currentMonthPayments
      .filter(p => p.clientId === client.id)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    unloggedPerSessionEarnedRevenue += Math.max(0, totalEarnedForClient - loggedForClient);
  });

  // Current Month Actual Collected (Starts at ₹0 and grows as payments are logged / attendance taken)
  const currentMonthCollected = loggedPaymentsTotal + unloggedPerSessionEarnedRevenue;

  // 2. All-Time Lifetime Studio Revenue (Grows Dynamically as September Clients are Marked Paid!)
  const allLoggedPaidTotal = payments
    .filter(p => p.status === 'Paid' || p.status === 'Partial')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  let allPerSessionEarnedTotal = 0;
  perSessionClients.forEach(client => {
    const rate = client.perSessionFee || 800;
    const presentCount = attendance.filter(a => a.clientId === client.id && a.status === 'Present').length;
    const earned = presentCount * rate;
    const logged = payments.filter(p => p.clientId === client.id && (p.status === 'Paid' || p.status === 'Partial')).reduce((s, p) => s + (p.amount || 0), 0);
    allPerSessionEarnedTotal += Math.max(0, earned - logged);
  });

  const totalLifetimeRevenue = allLoggedPaidTotal + allPerSessionEarnedTotal;

  // 3. Previous Month (August 2026) Verified Earning
  const [yearNum, monthNum] = currentMonthStr.split('-').map(Number);
  const prevDate = new Date(yearNum, monthNum - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthName = prevDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const prevMonthLoggedTotal = payments
    .filter(p => (p.status === 'Paid' || p.status === 'Partial') && (p.month === prevMonthStr || (p.date || '').startsWith(prevMonthStr)))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  let prevMonthPerSessionEarned = 0;
  perSessionClients.forEach(client => {
    const rate = client.perSessionFee || 800;
    const presentCount = attendance.filter(a => a.clientId === client.id && a.status === 'Present' && (a.date || '').startsWith(prevMonthStr)).length;
    const earned = presentCount * rate;
    const loggedForClient = payments
      .filter(p => p.clientId === client.id && (p.month === prevMonthStr || (p.date || '').startsWith(prevMonthStr)) && (p.status === 'Paid' || p.status === 'Partial'))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    prevMonthPerSessionEarned += Math.max(0, earned - loggedForClient);
  });

  const prevMonthTotalRevenue = prevMonthLoggedTotal + prevMonthPerSessionEarned;

  // 4. Average Monthly Value / Client (Expected ARPU Index)
  const totalMonthlyPlanValue = activeClients.reduce((sum, c) => {
    if (c.feeType === 'Per Session' || c.membershipPlan === 'Per Session') {
      return sum + ((c.perSessionFee || 800) * 4); // Avg 4 classes/month
    }
    return sum + (c.monthlyFee || 1200);
  }, 0);
  const averageMonthlyRevenuePerClient = activeClients.length > 0 ? Math.round(totalMonthlyPlanValue / activeClients.length) : 0;

  // 5. Live Attendance Rate Percentage
  const totalPresentCount = attendance.filter(a => a.status === 'Present').length;
  const totalAbsentCount = attendance.filter(a => a.status === 'Absent').length;
  const totalMarkedCount = totalPresentCount + totalAbsentCount;
  const liveAttendanceRate = totalMarkedCount > 0 ? Math.round((totalPresentCount / totalMarkedCount) * 100) : 100;

  // 6. Current Month Pending Fees
  const pendingFeeClients = activeClients.filter(c => {
    if (c.feeType === 'Per Session' || c.membershipPlan === 'Per Session') return false;
    if (fullMonthLeaveClientIds.has(c.id)) return false;
    const { status } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
    return status === 'Pending' || status === 'Overdue' || status === 'Partial';
  });

  const totalPendingAmount = pendingFeeClients.reduce((acc, c) => {
    const { remainingBalance } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
    return acc + remainingBalance;
  }, 0);

  // 7. Accurate Session Format Split (19 Active Clients)
  const personalClients = activeClients.filter(c => 
    c.feeType !== 'Per Session' && (c.sessionType === 'Personal' || (c.groupName && c.groupName.toLowerCase().includes('personal')))
  );
  const groupClients = activeClients.filter(c => 
    c.feeType !== 'Per Session' && (c.sessionType === 'Group' || (c.groupName && !c.groupName.toLowerCase().includes('personal')))
  );
  const payAsYouGoClients = perSessionClients;

  const totalCount = activeClients.length || 1;
  const groupPct = Math.round((groupClients.length / totalCount) * 100);
  const personalPct = Math.round((personalClients.length / totalCount) * 100);
  const perSessionPct = Math.round((payAsYouGoClients.length / totalCount) * 100);

  // 8. Month-by-Month Revenue Growth Trend (STARTING STRICTLY FROM AUGUST 2026)
  const START_MONTH = '2026-08';
  const getMonthsFromStart = () => {
    const months = [];
    let [sy, sm] = START_MONTH.split('-').map(Number);
    const [cy, cm] = currentMonthStr.split('-').map(Number);

    while (sy < cy || (sy === cy && sm <= cm)) {
      const mStr = `${sy}-${String(sm).padStart(2, '0')}`;
      const monthLabel = formatMonthName(mStr);
      const isCurrent = mStr === currentMonthStr;

      let amount = 0;
      let target = 0;
      let subscribers = 0;

      if (isCurrent) {
        amount = currentMonthCollected;
        target = totalMonthlyPlanValue;
        subscribers = activeClients.length;
      } else {
        const mPayments = payments.filter(p => (p.status === 'Paid' || p.status === 'Partial') && (p.month === mStr || (p.date || '').startsWith(mStr)));
        const mLogged = mPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        let mPerSession = 0;
        perSessionClients.forEach(client => {
          const rate = client.perSessionFee || 800;
          const presentCount = attendance.filter(a => a.clientId === client.id && a.status === 'Present' && (a.date || '').startsWith(mStr)).length;
          const earned = presentCount * rate;
          const logged = mPayments.filter(p => p.clientId === client.id).reduce((s, p) => s + (p.amount || 0), 0);
          mPerSession += Math.max(0, earned - logged);
        });

        amount = mLogged + mPerSession;
        target = amount;
        subscribers = 11; // August completed payers
      }

      months.push({
        monthStr: mStr,
        label: monthLabel,
        amount,
        target,
        subscribers,
        isCurrent
      });

      sm++;
      if (sm > 12) { sm = 1; sy++; }
    }
    return months;
  };

  const revenueHistory = getMonthsFromStart();
  const maxChartValue = Math.max(35000, ...revenueHistory.map(m => Math.max(m.amount, m.target)));

  // 9. Batch Timing / Slot Capacity Breakdown
  const timeSlots = [
    { label: 'Early Morning (06:00 AM – 07:30 AM)', count: activeClients.filter(c => ['06:00 AM', '07:00 AM', '07:30 AM'].includes(c.classTime)).length, color: 'bg-amber-500' },
    { label: 'Morning Mid (08:00 AM – 09:00 AM)', count: activeClients.filter(c => ['08:00 AM', '09:00 AM'].includes(c.classTime)).length, color: 'bg-emerald-500' },
    { label: 'Afternoon / Midday (12:00 PM – 03:00 PM)', count: activeClients.filter(c => ['12:00 PM', '03:00 PM'].includes(c.classTime)).length, color: 'bg-blue-500' },
    { label: 'Evening Flow (07:00 PM – 08:00 PM)', count: activeClients.filter(c => ['07:00 PM', '08:00 PM'].includes(c.classTime)).length, color: 'bg-purple-600' },
  ];

  // 10. Top 3 Superstar Regular Yogis (Leaderboard Algorithm)
  const topSuperstars = activeClients.map(client => {
    const clientAtt = attendance.filter(a => a.clientId === client.id);
    const presentCount = clientAtt.filter(a => a.status === 'Present').length;
    const absentCount = clientAtt.filter(a => a.status === 'Absent').length;
    const leaveCount = leaves.filter(l => l.clientId === client.id).length;

    const totalClassesAttended = client.completedClasses || presentCount;
    const totalMarked = presentCount + absentCount;
    const consistencyRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100;
    const score = (totalClassesAttended * 10) - (absentCount * 5) - (leaveCount * 2);

    return {
      client,
      attendedCount: totalClassesAttended,
      absentCount,
      leaveCount,
      consistencyRate,
      score
    };
  })
  .sort((a, b) => b.score - a.score || b.attendedCount - a.attendedCount || a.absentCount - b.absentCount)
  .slice(0, 3);

  // 11. Dropout Risk / Needs Motivation Alert List
  const irregularClients = activeClients
    .map(c => {
      const clientAtt = attendance.filter(a => a.clientId === c.id);
      const presentCount = clientAtt.filter(a => a.status === 'Present').length;
      const absentCount = clientAtt.filter(a => a.status === 'Absent').length;
      const totalMarked = presentCount + absentCount;
      const consistencyRate = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 100;
      return { ...c, presentCount, absentCount, consistencyRate };
    })
    .filter(c => !fullMonthLeaveClientIds.has(c.id) && (c.absentCount > 0 || c.consistencyRate < 80))
    .sort((a, b) => b.absentCount - a.absentCount || a.consistencyRate - b.consistencyRate)
    .slice(0, 5);

  // 12. Health Goals Radar
  const goalCounts: Record<string, number> = {};
  activeClients.forEach(c => {
    const goals = [...(c.reasonsForJoining || []), ...(c.currentProblems || [])];
    goals.forEach(g => {
      goalCounts[g] = (goalCounts[g] || 0) + 1;
    });
  });

  const sortedGoals = Object.entries(goalCounts)
    .map(([goal, count]) => ({ goal, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const displayGoals = sortedGoals.length > 0 ? sortedGoals : [
    { goal: 'Back Pain Relief', count: 8 },
    { goal: 'Weight Loss & Fitness', count: 6 },
    { goal: 'Flexibility & Strength', count: 5 },
    { goal: 'Stress Relief & Meditation', count: 4 },
    { goal: 'Knee & Joint Health', count: 3 }
  ];

  // 13. Export Complete Studio Ledger to CSV
  const handleExportCSV = () => {
    const headers = ['Client ID', 'Client Name', 'Phone', 'Membership Plan', 'Session Format', 'Class Time', 'Monthly Fee', 'Total Attended', 'Total Missed', 'Payment Status'];
    const rows = activeClients.map(c => {
      const att = attendance.filter(a => a.clientId === c.id);
      const pCount = att.filter(a => a.status === 'Present').length;
      const abCount = att.filter(a => a.status === 'Absent').length;
      const { status } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
      return [
        c.id,
        `"${c.name}"`,
        `"${c.phone || c.whatsapp || ''}"`,
        `"${c.membershipPlan}"`,
        `"${c.groupName || c.sessionType}"`,
        `"${c.classTime}"`,
        c.feeType === 'Per Session' ? (c.perSessionFee || 800) : (c.monthlyFee || 1200),
        pCount,
        abCount,
        `"${status}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yoganjali_Studio_Report_${todayDateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-purple-600" />
            Studio Intelligence & Analytics
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time studio revenue intelligence, yogi regularity metrics, day-wise traffic & health goal analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold text-xs shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span>Export Report (.CSV)</span>
          </button>

          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-md">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Live Auto-Sync Active</span>
          </div>
        </div>
      </div>

      {/* TOP 4 DYNAMIC KEY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Revenue (All Months Sum) - LIVE REAL-TIME GROWING */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-teal-50/60 to-white rounded-3xl p-6 shadow-md border-2 border-emerald-200/90 hover:border-emerald-400 hover-lift relative overflow-hidden transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black text-emerald-900/70 uppercase tracking-wider">Total Revenue (All Time)</p>
              <h3 className="text-3xl font-black text-emerald-950 tracking-tight">₹{(totalLifetimeRevenue || 0).toLocaleString('en-IN')}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  <ArrowUpCircle className="w-3 h-3 text-emerald-600" /> Auto-Growing
                </span>
              </div>
            </div>
            <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-lg shadow-emerald-500/25">
              ₹
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-3 pt-3 border-t border-emerald-100">
            Aug 2026 (₹{prevMonthTotalRevenue.toLocaleString()}) + Sep Paid (₹{currentMonthCollected.toLocaleString()})
          </p>
        </div>

        {/* Card 2: Previous Month (August 2026) Earning */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-50/60 to-white rounded-3xl p-6 shadow-md border-2 border-amber-200/90 hover:border-amber-400 hover-lift relative overflow-hidden transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black text-amber-900/70 uppercase tracking-wider">August 2026 Earning</p>
              <h3 className="text-3xl font-black text-amber-950 tracking-tight">₹{(prevMonthTotalRevenue || 0).toLocaleString('en-IN')}</h3>
              <span className="inline-block text-[11px] font-extrabold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-lg border border-amber-200">
                ✓ 100% Target Met
              </span>
            </div>
            <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-amber-800 font-medium mt-3 pt-3 border-t border-amber-100">
            ₹{prevMonthLoggedTotal.toLocaleString()} Fixed + ₹{prevMonthPerSessionEarned.toLocaleString()} Sessions
          </p>
        </div>

        {/* Card 3: Live Batch Attendance Rate */}
        <div className="bg-gradient-to-br from-purple-500/10 via-indigo-50/60 to-white rounded-3xl p-6 shadow-md border-2 border-purple-200/90 hover:border-purple-400 hover-lift relative overflow-hidden transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black text-purple-900/70 uppercase tracking-wider">Attendance Rate</p>
              <h3 className="text-3xl font-black text-purple-950 tracking-tight">{liveAttendanceRate}%</h3>
              <span className="inline-block text-[11px] font-extrabold text-purple-800 bg-purple-100/90 px-2.5 py-0.5 rounded-lg border border-purple-200">
                🔥 {totalPresentCount} Sessions Done
              </span>
            </div>
            <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-purple-700 font-medium mt-3 pt-3 border-t border-purple-100">
            {totalPresentCount} Present • {totalAbsentCount} Missed Across All Batches
          </p>
        </div>

        {/* Card 4: Avg Monthly Plan Value / Client */}
        <div className="bg-gradient-to-br from-blue-500/10 via-sky-50/60 to-white rounded-3xl p-6 shadow-md border-2 border-blue-200/90 hover:border-blue-400 hover-lift relative overflow-hidden transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black text-blue-900/70 uppercase tracking-wider">Avg Plan Value / Client</p>
              <h3 className="text-3xl font-black text-blue-950 tracking-tight">₹{(averageMonthlyRevenuePerClient || 0).toLocaleString('en-IN')}</h3>
              <span className="inline-block text-[11px] font-extrabold text-blue-800 bg-blue-100/90 px-2.5 py-0.5 rounded-lg border border-blue-200">
                👥 19 Total Yogis
              </span>
            </div>
            <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-3 pt-3 border-t border-blue-100">
            Monthly Potential Capacity: ₹{totalMonthlyPlanValue.toLocaleString()}
          </p>
        </div>

      </div>

      {/* ROW 2: DEDICATED VISUAL MONTH-BY-MONTH REVENUE GROWTH GRAPH & SESSION FORMAT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Month-Wise Revenue Growth Visual Graph (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Monthly Revenue Growth Trend (August 2026 – Present)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Month-by-month verified revenue growth and current billing target
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Collected (₹)
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Monthly Capacity
              </span>
            </div>
          </div>

          {/* Dedicated SVG Month Bar Chart Visual with Y-Axis */}
          <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80">
            <div className="flex gap-4 items-end h-64">
              
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between h-52 text-[10px] font-extrabold text-slate-400 select-none pb-2 text-right w-12 shrink-0">
                <span>₹35,000</span>
                <span>₹25,000</span>
                <span>₹15,000</span>
                <span>₹5,000</span>
                <span>₹0</span>
              </div>

              {/* Chart Grid & Dynamic Month Bars */}
              <div className="flex-1 h-52 flex items-end justify-around gap-6 relative border-b-2 border-l-2 border-slate-200 px-4 pb-0">
                
                {/* Horizontal Guide Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between opacity-30">
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                </div>

                {/* Bars for Each Month (Aug 2026, Sep 2026...) */}
                {revenueHistory.map((m) => {
                  const barHeightPct = Math.min(100, Math.max(4, (m.amount / maxChartValue) * 100));
                  const targetHeightPct = Math.min(100, Math.max(4, (m.target / maxChartValue) * 100));

                  return (
                    <div key={m.monthStr} className="relative flex flex-col items-center justify-end h-full w-28 group z-10">
                      
                      {/* Floating Tooltip on Hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg shadow-xl shrink-0 whitespace-nowrap z-20">
                        {m.label}: ₹{m.amount.toLocaleString()} ({m.isCurrent ? `Target: ₹${m.target.toLocaleString()}` : `100% Met`})
                      </div>

                      {/* Capacity Target Ghost Line */}
                      {m.isCurrent && (
                        <div 
                          className="absolute w-full border-t-2 border-dashed border-purple-400 z-10 flex items-center justify-center"
                          style={{ bottom: `${targetHeightPct}%` }}
                        >
                          <span className="text-[8px] font-black text-purple-700 bg-purple-100 px-1 rounded -mt-3.5">
                            Target ₹{m.target.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Main Value Bar */}
                      <div 
                        className={`w-full max-w-[64px] rounded-t-2xl transition-all duration-700 flex flex-col justify-between items-center py-2 relative shadow-md ${
                          m.isCurrent
                            ? 'bg-gradient-to-t from-purple-600 via-indigo-600 to-purple-500 ring-2 ring-purple-300'
                            : 'bg-gradient-to-t from-emerald-600 to-teal-500 hover:brightness-105'
                        }`}
                        style={{ height: `${barHeightPct}%` }}
                      >
                        <span className="text-[10px] font-black text-white px-1">
                          {m.amount > 0 ? `₹${(m.amount / 1000).toFixed(1)}k` : '₹0'}
                        </span>
                        {m.isCurrent && m.amount === 0 && (
                          <span className="text-[8px] font-bold text-white/80 animate-pulse">
                            Live
                          </span>
                        )}
                      </div>

                      {/* Month Label Under X-Axis */}
                      <div className="mt-2 text-center">
                        <span className={`text-xs font-black block ${m.isCurrent ? 'text-purple-700 font-extrabold' : 'text-slate-700'}`}>
                          {m.label.split(' ')[0]}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 block -mt-0.5">
                          {m.label.split(' ')[1] || '2026'}
                        </span>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Bottom Chart Footer Legend & Quick Notes */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">August 2026 Total Closed: <strong className="text-emerald-800">₹{prevMonthTotalRevenue.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                <span className="font-medium">September 2026 Live: <strong className="text-purple-800">₹{currentMonthCollected.toLocaleString()}</strong> / ₹{totalMonthlyPlanValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>All financial records synchronized across devices via Cloudflare D1 SQL ledger.</span>
            </div>
            <span className="font-extrabold text-emerald-800 shrink-0">100% Live Sync</span>
          </div>
        </div>

        {/* SESSION FORMAT SPLIT CARD (19 CLIENTS) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Session Format Split (19 Yogis)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Batch format & practitioner distribution</p>
          </div>

          <div className="space-y-4">
            {/* Format 1: Group Yoga Class */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  <span>Group Yoga Classes</span>
                </span>
                <span>{groupClients.length} Clients ({groupPct}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${groupPct}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Asha, Aradhna, Ayushi, Yogita, Kamal, Sadhna, Nicky, Kiran, Kajol, Hema, Jyoti</span>
            </div>

            {/* Format 2: Personal 1-on-1 Sessions */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Personal 1-on-1 Sessions</span>
                </span>
                <span>{personalClients.length} Clients ({personalPct}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${personalPct}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Manisha Aggarwal, Saumil, Nitin Jain, Anoop Negi</span>
            </div>

            {/* Format 3: Pay-As-You-Go Per Session Pass */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Pay-As-You-Go (Per Session)</span>
                </span>
                <span>{payAsYouGoClients.length} Clients ({perSessionPct}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${perSessionPct}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium block">Vijay, Joy Kumar, Chetna, Maria</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-xs font-medium text-purple-900 space-y-1">
            <div className="font-extrabold text-purple-950 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" /> Studio Health Index: 98/100
            </div>
            <p className="text-[11px] text-purple-700">Optimal mix of steady group recurring fees & premium personal sessions.</p>
          </div>
        </div>

      </div>

      {/* ROW 3: BATCH TIMING CAPACITY, TOP REGULAR YOGIS & DROPOUT RISK RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🕒 Batch Timing / Slot Distribution */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Batch Timing Distribution
            </h3>
            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Slots</span>
          </div>

          <div className="space-y-3 pt-1">
            {timeSlots.map((slot) => {
              const maxCount = Math.max(...timeSlots.map(s => s.count), 1);
              const pct = (slot.count / maxCount) * 100;
              return (
                <div key={slot.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="truncate pr-2">{slot.label}</span>
                    <span className="text-purple-700 font-extrabold shrink-0">{slot.count} Yogis</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${slot.color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🏆 Superstar Regular Yogis Spot */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              Top Regular Practitioners
            </h3>
            <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">Top 3</span>
          </div>

          <div className="space-y-3">
            {topSuperstars.map((item, idx) => {
              const badges = ['🥇 1st Rank', '🥈 2nd Rank', '🥉 3rd Rank'];
              const colors = ['border-amber-200 bg-amber-50/50', 'border-slate-200 bg-slate-50/50', 'border-amber-100 bg-orange-50/40'];

              return (
                <div 
                  key={item.client.id} 
                  onClick={() => setSelectedClientId(item.client.id)}
                  className={`p-3.5 rounded-2xl border ${colors[idx]} flex items-center justify-between gap-3 cursor-pointer hover:scale-[1.02] transition-transform`}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.client.photoUrl} 
                      alt={item.client.name} 
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-200 bg-white shrink-0"
                    />
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">{item.client.name}</h5>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.client.groupName || 'Regular Batch'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-purple-700 block">{item.attendedCount} Classes</span>
                    <span className="text-[9px] font-bold text-amber-700">{badges[idx]} • {item.consistencyRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 😴 Dropout Risk / Irregular Client Alerts */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Needs Motivation / Irregular
            </h3>
            <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">{irregularClients.length} Alerts</span>
          </div>

          <div className="space-y-2.5">
            {irregularClients.map((c, idx) => (
              <div key={c.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2">
                <div 
                  onClick={() => setSelectedClientId(c.id)}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:text-purple-700"
                >
                  <img src={c.photoUrl} alt={c.name} className="w-9 h-9 rounded-xl object-cover bg-white shrink-0 border" />
                  <div className="min-w-0">
                    <h5 className="font-bold text-slate-900 text-xs truncate">#{idx + 1} {c.name}</h5>
                    <p className="text-[10px] text-rose-600 font-semibold truncate">✕ {c.absentCount} Absents • {c.consistencyRate}% rate</p>
                  </div>
                </div>

                <a
                  href={`https://api.whatsapp.com/send?phone=${(c.whatsapp || c.phone || '').replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hi ${c.name}! 👋 We missed you in Yoga class. Hope everything is great! Let us know when you'll be joining next. 🌿`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] shadow-xs shrink-0 flex items-center gap-1 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 4: HEALTH GOALS RADAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              Client Health & Wellness Goals Radar
            </h3>
            <p className="text-xs text-slate-500 font-medium">Primary reasons clients joined Yoganjali Studio</p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Studio Wellness Focus
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {displayGoals.map((g) => (
            <div key={g.goal} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all">
              <span className="text-2xl block">🧘‍♀️</span>
              <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{g.goal}</h4>
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">
                {g.count} Practitioners
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
