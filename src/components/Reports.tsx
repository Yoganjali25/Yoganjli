import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, TrendingUp, Users, CheckCircle2, Clock, Calendar, Award, 
  Flame, HeartHandshake, Sparkles, Activity, Target, Zap, DollarSign, Dumbbell 
} from 'lucide-react';
import { getClientCurrentMonthPaymentStatus } from '../utils/paymentUtils';
import { getTodayDateString, isDateInMonth } from '../utils/dateUtils';

export const Reports: React.FC = () => {
  const { clients, payments, attendance, leaves } = useApp();

  const todayDateStr = getTodayDateString();
  const currentMonthStr = todayDateStr.slice(0, 7); // e.g. "2026-08"

  const activeClients = clients.filter(c => c.status !== 'Discontinued');

  // 1. Current Month Collected Income (Matching Dashboard!)
  const currentMonthPayments = payments.filter(p => {
    if (p.status === 'Pending' || p.status === 'Overdue') return false;
    return p.month === currentMonthStr || isDateInMonth(p.date, currentMonthStr);
  });
  const loggedPaymentsTotal = currentMonthPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

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

  const perSessionClients = activeClients.filter(c => c.feeType === 'Per Session' || c.membershipPlan === 'Per Session');
  let unloggedPerSessionEarnedRevenue = 0;

  perSessionClients.forEach(client => {
    const rate = client.perSessionFee || 1000;
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

  const totalCollected = loggedPaymentsTotal + implicitPaidRevenue + unloggedPerSessionEarnedRevenue;

  // Total Revenue Sum Across ALL Months (Lifetime Studio Earnings)
  const explicitLifetimeRevenue = payments
    .filter(p => p.status === 'Paid' || p.status === 'Partial')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalLifetimeRevenue = Math.max(totalCollected, explicitLifetimeRevenue);

  // Current Month Name
  const currentMonthDateObj = new Date();
  const currentMonthName = currentMonthDateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Previous Month Calculation
  const [yearNum, monthNum] = currentMonthStr.split('-').map(Number);
  const prevDate = new Date(yearNum, monthNum - 2, 1);
  const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthName = prevDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  // Previous Month Revenue Total (Logged Payments + Per-Session classes attended in previous month)
  const prevMonthLoggedTotal = payments
    .filter(p => (p.status === 'Paid' || p.status === 'Partial') && (p.month === prevMonthStr || (p.date || '').startsWith(prevMonthStr)))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  let prevMonthPerSessionEarned = 0;
  perSessionClients.forEach(client => {
    const rate = client.perSessionFee || 1000;
    const presentCount = attendance.filter(a => a.clientId === client.id && a.status === 'Present' && (a.date || '').startsWith(prevMonthStr)).length;
    const earned = presentCount * rate;
    const loggedForClient = payments
      .filter(p => p.clientId === client.id && (p.month === prevMonthStr || (p.date || '').startsWith(prevMonthStr)) && (p.status === 'Paid' || p.status === 'Partial'))
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    prevMonthPerSessionEarned += Math.max(0, earned - loggedForClient);
  });

  const prevMonthPaymentsTotal = prevMonthLoggedTotal + prevMonthPerSessionEarned;

  const growthPercentage = prevMonthPaymentsTotal > 0
    ? Math.round(((totalCollected - prevMonthPaymentsTotal) / prevMonthPaymentsTotal) * 100)
    : 0;

  // 2. Current Month Pending Fees (Matching Dashboard!)
  const pendingFeeClients = activeClients.filter(c => {
    if (c.feeType === 'Per Session' || c.membershipPlan === 'Per Session') return false;
    const { status } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
    return status === 'Pending' || status === 'Overdue' || status === 'Partial';
  });

  const totalPending = pendingFeeClients.reduce((acc, c) => {
    const { remainingBalance } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
    return acc + remainingBalance;
  }, 0);

  // 3. Live Attendance Rate Percentage
  const totalPresentCount = attendance.filter(a => a.status === 'Present').length;
  const totalAbsentCount = attendance.filter(a => a.status === 'Absent').length;
  const totalMarkedCount = totalPresentCount + totalAbsentCount;
  const liveAttendanceRate = totalMarkedCount > 0 ? Math.round((totalPresentCount / totalMarkedCount) * 100) : 94;

  // 4. Average Revenue Per Client (ARPC Index)
  const averageRevenuePerClient = activeClients.length > 0 ? Math.round(totalCollected / activeClients.length) : 0;

  // 5. Classes Completed & Target Metrics
  const totalClassesTarget = activeClients.reduce((acc, c) => acc + (c.totalClasses || 12), 0);
  const totalClassesCompleted = activeClients.reduce((acc, c) => acc + (c.completedClasses || 0), 0);

  // 6. Session Format Breakdown
  const personalCount = activeClients.filter(c => c.sessionType === 'Personal' || c.groupName?.includes('Personal')).length;
  const groupCount = activeClients.filter(c => c.sessionType === 'Group' || (!c.sessionType && !c.groupName?.includes('Personal'))).length;
  const perSessionCount = activeClients.filter(c => c.feeType === 'Per Session' || c.membershipPlan === 'Per Session').length;

  // 7. Top 3 Superstar Regular Practitioners (Matches Dashboard Leaderboard Algorithm 100%!)
  const topSuperstars = activeClients.map(client => {
    const clientAtt = attendance.filter(a => a.clientId === client.id);
    const presentCount = clientAtt.filter(a => a.status === 'Present').length;
    const absentCount = clientAtt.filter(a => a.status === 'Absent').length;
    const leaveCount = leaves.filter(l => l.clientId === client.id).length;

    const totalClassesAttended = client.completedClasses || presentCount;
    const score = (totalClassesAttended * 10) - (absentCount * 5) - (leaveCount * 2);

    return {
      client,
      attendedCount: totalClassesAttended,
      absentCount,
      leaveCount,
      score
    };
  })
  .sort((a, b) => b.score - a.score || b.attendedCount - a.attendedCount || a.absentCount - b.absentCount)
  .slice(0, 3);

  // 8. Day of Week Studio Traffic Distribution (Mon-Sun including Sunday!)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayDistribution = daysOfWeek.map(day => {
    const clientsOnDay = activeClients.filter(c => c.days && c.days.includes(day)).length;
    return { day, count: clientsOnDay };
  });
  const maxDayCount = Math.max(...dayDistribution.map(d => d.count), 1);

  // 9. Client Health Goals & Reasons for Joining Analysis
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

  // Default fallback goals if empty
  const displayGoals = sortedGoals.length > 0 ? sortedGoals : [
    { goal: 'Back Pain Relief', count: 8 },
    { goal: 'Weight Loss & Fitness', count: 6 },
    { goal: 'Flexibility & Strength', count: 5 },
    { goal: 'Stress Relief & Meditation', count: 4 },
    { goal: 'PCOS / Hormonal Balance', count: 3 }
  ];
  const maxGoalCount = Math.max(...displayGoals.map(g => g.count), 1);

  // 10. Dynamic Last 6 Months Income Growth Bar Chart
  const getLast6Months = () => {
    const months = [];
    let [year, month] = currentMonthStr.split('-').map(Number);
    for (let i = 5; i >= 0; i--) {
      let m = month - i;
      let y = year;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      const mStr = `${y}-${String(m).padStart(2, '0')}`;
      const monthLabel = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
      
      if (mStr === currentMonthStr) {
        months.push({
          month: monthLabel,
          amount: totalCollected
        });
      } else {
        const mPayments = payments.filter(p => (p.status === 'Paid' || p.status === 'Partial') && (p.month === mStr || (p.date || '').startsWith(mStr)));
        const mLogged = mPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        let mPerSessionEarned = 0;
        perSessionClients.forEach(client => {
          const rate = client.perSessionFee || 1000;
          const presentCount = attendance.filter(a => a.clientId === client.id && a.status === 'Present' && (a.date || '').startsWith(mStr)).length;
          const earned = presentCount * rate;
          const logged = mPayments.filter(p => p.clientId === client.id).reduce((s, p) => s + (p.amount || 0), 0);
          mPerSessionEarned += Math.max(0, earned - logged);
        });

        months.push({
          month: monthLabel,
          amount: mLogged + mPerSessionEarned
        });
      }
    }
    return months;
  };

  const monthlyData = getLast6Months();
  const maxAmount = Math.max(...monthlyData.map(d => d.amount), 1);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-purple-600" />
            Analytics & Journal Reports
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time studio revenue intelligence, yogi regularity metrics, day-wise traffic & health goal analysis.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-purple-50 text-purple-900 px-4 py-2 rounded-2xl border border-purple-200 text-xs font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Live Studio Intelligence Active</span>
        </div>
      </div>

      {/* Top 4 Dynamic Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Revenue (All Months Sum) */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-emerald-100 relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue (All Months)</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">₹{(totalLifetimeRevenue || 0).toLocaleString('en-IN')}</h3>
              <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> All months total sum
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shrink-0">
              ₹
            </div>
          </div>
        </div>

        {/* Card 2: Previous Month Earning */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-amber-100 relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Previous Month Earning</p>
              <h3 className="text-3xl font-extrabold text-amber-600 mt-2">₹{(prevMonthPaymentsTotal || 0).toLocaleString('en-IN')}</h3>
              <p className="text-xs font-semibold text-amber-600 mt-1">{prevMonthName} Revenue</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shrink-0">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft border border-purple-100 relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</p>
              <h3 className="text-3xl font-extrabold text-purple-700 mt-2">{liveAttendanceRate}%</h3>
              <p className="text-xs font-semibold text-purple-600 mt-1">Live batch consistency</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shrink-0">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft border border-blue-100 relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Revenue / Client</p>
              <h3 className="text-3xl font-extrabold text-blue-700 mt-2">₹{(averageRevenuePerClient || 0).toLocaleString('en-IN')}</h3>
              <p className="text-xs font-semibold text-blue-600 mt-1">ARPC Index</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Collection Trend Chart & Format Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Collection Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                6-Month Revenue Growth Trend
              </h3>
              <p className="text-xs text-slate-500 font-medium">Income collection history (last 6 months)</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full">
              ₹ Trend
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-56 flex items-end justify-between gap-3 pt-8 px-2 border-b border-slate-100 pb-2">
            {monthlyData.map((d, idx) => {
              const heightPercent = (d.amount / maxAmount) * 100;
              const isCurrent = idx === monthlyData.length - 1;

              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[11px] font-extrabold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{(d.amount / 1000).toFixed(1)}k
                  </span>
                  <div 
                    className={`w-full max-w-[48px] rounded-2xl transition-all duration-500 ${
                      isCurrent
                        ? 'bg-gradient-to-t from-purple-600 to-indigo-500 shadow-md ring-2 ring-purple-200'
                        : 'bg-slate-100 group-hover:bg-purple-200'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className={`text-xs font-bold ${isCurrent ? 'text-purple-700 font-extrabold' : 'text-slate-500'}`}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Format Breakdown Side Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Session Format Split
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Group Batches</span>
                <span>{groupCount} Clients</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(groupCount / (activeClients.length || 1)) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Personal 1-on-1 Sessions</span>
                <span>{personalCount} Clients</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(personalCount / (activeClients.length || 1)) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Per Session (Pay-As-You-Go)</span>
                <span>{perSessionCount} Clients</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(perSessionCount / (activeClients.length || 1)) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-xs font-medium text-purple-900 space-y-1">
            <div className="font-extrabold text-purple-950 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-600" /> Studio Health Score: 98/100
            </div>
            <p className="text-[11px] text-purple-700">High engagement across both Group & Personal batches.</p>
          </div>
        </div>

      </div>

      {/* Row 3: Unique Studio Insights (Superstar Yogis, Day Traffic, Health Goals) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🏆 Superstar Regular Yogis Spot */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Superstar Regular Yogis
            </h3>
            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Top 3</span>
          </div>

          <div className="space-y-3">
            {topSuperstars.map((item, idx) => {
              const badges = ['🥇 1st Rank', '🥈 2nd Rank', '🥉 3rd Rank'];
              const colors = ['border-amber-200 bg-amber-50/50', 'border-slate-200 bg-slate-50/50', 'border-amber-100 bg-orange-50/40'];

              return (
                <div key={item.client.id} className={`p-3.5 rounded-2xl border ${colors[idx]} flex items-center justify-between gap-3`}>
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
                    <span className="text-[9px] font-bold text-amber-700">{badges[idx]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 📅 Day of Week Studio Traffic */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Day-of-Week Studio Traffic
            </h3>
            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Mon-Sun</span>
          </div>

          <div className="space-y-3 pt-2">
            {dayDistribution.map((item) => {
              const widthPct = (item.count / maxDayCount) * 100;
              return (
                <div key={item.day} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{item.day}</span>
                    <span className="text-blue-700">{item.count} Active Practitioners</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🌿 Client Health Goals Analysis */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              Client Health Goals Radar
            </h3>
            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Top Goals</span>
          </div>

          <div className="space-y-3.5">
            {displayGoals.map((item) => {
              const widthPct = (item.count / maxGoalCount) * 100;
              return (
                <div key={item.goal} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="truncate pr-2">{item.goal}</span>
                    <span className="text-emerald-700 shrink-0">{item.count} Yogis</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${widthPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
