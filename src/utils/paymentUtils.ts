import { Client, LeaveRecord, PaymentRecord, PaymentStatus } from '../types';
import { getTodayDateString } from './dateUtils';

export const formatCurrency = (val: number | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return '0';
  return Number(val).toLocaleString('en-IN');
};

export const getMonthsListBetween = (startMonthStr: string, endMonthStr: string): string[] => {
  const months: string[] = [];
  if (!startMonthStr || !endMonthStr || startMonthStr > endMonthStr) {
    return [endMonthStr || getTodayDateString().slice(0, 7)];
  }

  let [startYear, startMonth] = startMonthStr.split('-').map(Number);
  const [endYear, endMonth] = endMonthStr.split('-').map(Number);

  while (startYear < endYear || (startYear === endYear && startMonth <= endMonth)) {
    const monthFormatted = `${startYear}-${String(startMonth).padStart(2, '0')}`;
    months.push(monthFormatted);

    startMonth++;
    if (startMonth > 12) {
      startMonth = 1;
      startYear++;
    }
  }

  return months;
};

export const formatMonthName = (monthStr: string): string => {
  if (!monthStr || !monthStr.includes('-')) return monthStr;
  const [year, month] = monthStr.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const isClientOnFullMonthLeave = (clientId: string, monthStr: string, leaves?: LeaveRecord[]): boolean => {
  if (!leaves || !Array.isArray(leaves) || leaves.length === 0) return false;

  return leaves.some(l => {
    if (l.clientId !== clientId) return false;
    const start = l.startDate || l.date || '';
    const end = l.endDate || start;
    const dur = (l.duration || '').toLowerCase();
    const reason = (l.reason || '').toLowerCase();

    // 1. Safety rule: If start date and end date are the exact same day, it is a single-day leave, NOT a full month leave!
    if (start && end && start === end) {
      return false;
    }

    // 2. Explicit flag or full month keywords in duration / reason
    if (
      l.isFullMonthLeave ||
      dur.includes('full month') ||
      dur.includes('month leave') ||
      reason.includes('full month') ||
      reason.includes('month leave')
    ) {
      if (!start || (start || '').slice(0, 7) === monthStr || (end || '').slice(0, 7) === monthStr) return true;
    }

    // 2. Date range covering full or majority of the month
    if (start && end) {
      const monthStart = `${monthStr}-01`;
      if (start <= monthStart && end >= `${monthStr}-20`) return true;
      if (start.startsWith(monthStr) && end.startsWith(monthStr)) {
        const sDay = parseInt(start.split('-')[2], 10) || 1;
        const eDay = parseInt(end.split('-')[2], 10) || 30;
        if (sDay <= 10 && eDay >= 20) return true;
      }
    }
    return false;
  });
};

export const getClientCurrentMonthPaymentStatus = (
  client: Client,
  payments: PaymentRecord[],
  targetMonthStr?: string,
  leaves?: LeaveRecord[]
): {
  status: PaymentStatus;
  paidAmount: number;
  dueAmount: number;
  remainingBalance: number;
  unpaidMonthsCount: number;
  unpaidMonthsNames: string[];
  isOnFullMonthLeave?: boolean;
} => {
  const currentMonthStr = targetMonthStr || getTodayDateString().slice(0, 7); // e.g. "2026-08"
  const isPerSession = client.feeType === 'Per Session' || client.membershipPlan === 'Per Session';

  const clientPayments = payments.filter(p => p.clientId === client.id && p.status === 'Paid');
  const totalPaidAllTime = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // --- 1. DEDICATED PAY-AS-YOU-GO / PER-SESSION LOGIC ---
  if (isPerSession) {
    const rate = client.perSessionFee || 800;
    const completedSessions = client.completedClasses || 0;
    const sessionAttendedCost = completedSessions * rate;
    const directPaymentsPaid = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalEffectivePaid = Math.max(sessionAttendedCost, directPaymentsPaid);

    return {
      status: 'Paid',
      paidAmount: totalEffectivePaid,
      dueAmount: 0,
      remainingBalance: 0,
      unpaidMonthsCount: 0,
      unpaidMonthsNames: [],
      isOnFullMonthLeave: false
    };
  }

  // --- 2. MONTHLY BATCH SUBSCRIPTION LOGIC ---
  const isOnCurrentMonthLeave = isClientOnFullMonthLeave(client.id, currentMonthStr, leaves);

  // STRICT RULE: All billing operates from August 2026 ('2026-08') onwards by default.
  // ONLY if client has earlier payments (e.g. '2026-07' for Anoop Negi) or feeStartMonth is set, track from that month!
  const DEFAULT_FEE_START_MONTH = '2026-08';
  const earliestPaymentMonth = clientPayments.reduce((earliest, p) => (p.month && p.month < earliest ? p.month : earliest), DEFAULT_FEE_START_MONTH);
  const effectiveJoiningMonthStr = client.feeStartMonth || (earliestPaymentMonth < DEFAULT_FEE_START_MONTH ? earliestPaymentMonth : DEFAULT_FEE_START_MONTH);
  
  const activeMonths = getMonthsListBetween(
    effectiveJoiningMonthStr, 
    currentMonthStr
  );

  let totalDueSinceJoining = 0;
  const unpaidMonthsNames: string[] = [];

  activeMonths.forEach(mStr => {
    const isLeaveInMonth = isClientOnFullMonthLeave(client.id, mStr, leaves);
    if (!isLeaveInMonth) {
      totalDueSinceJoining += client.monthlyFee || 0;
    }
  });

  const cumulativeRemainingBalance = Math.max(0, totalDueSinceJoining - totalPaidAllTime);
  const currentMonthPayments = clientPayments.filter(p => (p.month === currentMonthStr || (p.date || '').startsWith(currentMonthStr)));
  const paidAmount = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  let dueAmount = isOnCurrentMonthLeave ? 0 : (client.monthlyFee || 0);

  let tempPaid = totalPaidAllTime;
  activeMonths.forEach(mStr => {
    const isLeaveInMonth = isClientOnFullMonthLeave(client.id, mStr, leaves);
    if (isLeaveInMonth) return;

    let mDue = client.monthlyFee || 0;
    if (tempPaid >= mDue) {
      tempPaid -= mDue;
    } else {
      tempPaid = 0;
      unpaidMonthsNames.push(formatMonthName(mStr));
    }
  });

  let status: PaymentStatus = 'Pending';
  let finalRemainingBalance = cumulativeRemainingBalance;

  // 1. If client is on full month leave this month, waive current fee
  if (isOnCurrentMonthLeave && unpaidMonthsNames.length === 0) {
    status = 'Paid';
    finalRemainingBalance = 0;
  } else if (unpaidMonthsNames.length === 0 && cumulativeRemainingBalance === 0) {
    // All active months (including previous dues) are fully paid!
    status = 'Paid';
    finalRemainingBalance = 0;
  } else if (unpaidMonthsNames.length > 0 || cumulativeRemainingBalance > 0) {
    // There are unpaid months (e.g. July 2026, August 2026, or September 2026)
    finalRemainingBalance = cumulativeRemainingBalance > 0 ? cumulativeRemainingBalance : (client.monthlyFee || 1200);
    const today = new Date();
    const currentDayNum = today.getDate();
    const dueDayNum = parseInt(client.feeDueDate, 10) || 5;

    if (unpaidMonthsNames.length > 1 || unpaidMonthsNames.some(m => !m.includes(formatMonthName(currentMonthStr))) || currentDayNum > dueDayNum) {
      status = 'Overdue';
    } else if (paidAmount > 0) {
      status = 'Partial';
    } else {
      status = 'Pending';
    }
  }

  return {
    status,
    paidAmount,
    dueAmount: finalRemainingBalance > 0 ? finalRemainingBalance : dueAmount,
    remainingBalance: finalRemainingBalance,
    unpaidMonthsCount: unpaidMonthsNames.length,
    unpaidMonthsNames,
    isOnFullMonthLeave: isOnCurrentMonthLeave
  };
};

export interface ClientBillingCycle {
  monthStr: string; // e.g. "2026-08"
  monthName: string; // e.g. "August 2026"
  dueAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial' | 'Leave Waived';
  paidDate?: string;
  isCurrentMonth: boolean;
}

export const getClientBillingCycles = (
  client: Client,
  payments: PaymentRecord[],
  leaves?: LeaveRecord[],
  targetMonthStr?: string
): ClientBillingCycle[] => {
  const isPerSession = client.feeType === 'Per Session' || client.membershipPlan === 'Per Session';
  const clientPayments = payments.filter(p => p.clientId === client.id && p.status === 'Paid');
  const currentMonthStr = targetMonthStr || getTodayDateString().slice(0, 7);

  // For Per Session clients: do not generate monthly recurring overdue cycles!
  if (isPerSession) {
    const rate = client.perSessionFee || 800;
    const completedSessions = client.completedClasses || 0;
    const sessionAttendedCost = completedSessions * rate;
    const directPaid = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPaid = Math.max(sessionAttendedCost, directPaid);
    const latestPayment = clientPayments[0];

    return [{
      monthStr: currentMonthStr,
      monthName: `${formatMonthName(currentMonthStr)} (Per Session Pass)`,
      dueAmount: 0,
      paidAmount: totalPaid,
      status: 'Paid',
      paidDate: latestPayment?.date || client.joiningDate || getTodayDateString(),
      isCurrentMonth: true,
    }];
  }

  // STRICT RULE: All billing operates from August 2026 ('2026-08') onwards by default.
  // ONLY if client has earlier payments (e.g. '2026-07' for Anoop Negi) or feeStartMonth is set, track from that month!
  const DEFAULT_FEE_START_MONTH = '2026-08';
  const earliestPaymentMonth = clientPayments.reduce((earliest, p) => (p.month && p.month < earliest ? p.month : earliest), DEFAULT_FEE_START_MONTH);
  const effectiveJoiningMonthStr = client.feeStartMonth || (earliestPaymentMonth < DEFAULT_FEE_START_MONTH ? earliestPaymentMonth : DEFAULT_FEE_START_MONTH);

  const activeMonths = getMonthsListBetween(
    effectiveJoiningMonthStr,
    currentMonthStr
  );

  const cycles: ClientBillingCycle[] = [];

  activeMonths.forEach((mStr) => {
    const isCurrent = mStr === currentMonthStr;
    const isLeave = isClientOnFullMonthLeave(client.id, mStr, leaves);
    const monthName = formatMonthName(mStr);
    const mDue = client.monthlyFee || 1200;
    const monthPayments = clientPayments.filter(p => (p.month === mStr || (p.date && p.date.startsWith(mStr))));
    const mPaid = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paidDate = monthPayments.length > 0 ? monthPayments[0].date : undefined;

    let cycleStatus: 'Paid' | 'Pending' | 'Overdue' | 'Partial' | 'Leave Waived' = 'Pending';
    
    // 1. If client has paid for this month -> ALWAYS 'Paid'
    if (mPaid >= mDue) {
      cycleStatus = 'Paid';
    } else if (isLeave && mPaid === 0) {
      // 2. Only show Leave Waived if no payments exist and client is on full month leave
      cycleStatus = 'Leave Waived';
    } else if (mPaid > 0) {
      cycleStatus = 'Partial';
    } else if (!isCurrent) {
      cycleStatus = 'Overdue';
    } else {
      const today = new Date();
      const currentDayNum = today.getDate();
      const dueDayNum = parseInt(client.feeDueDate, 10) || 5;
      cycleStatus = currentDayNum > dueDayNum ? 'Overdue' : 'Pending';
    }

    cycles.push({
      monthStr: mStr,
      monthName,
      dueAmount: (isLeave && cycleStatus === 'Leave Waived') ? 0 : mDue,
      paidAmount: cycleStatus === 'Paid' ? Math.max(mPaid, mDue) : mPaid,
      status: cycleStatus,
      isCurrentMonth: isCurrent,
      paidDate
    });
  });

  return cycles;
};
