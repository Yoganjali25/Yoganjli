import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentRecord } from '../types';
import { EditPaymentModal } from './Modals/EditPaymentModal';
import { CreditCard, Plus, IndianRupee, CheckCircle2, Clock, Filter, Search, Trash2, Calendar, Pencil } from 'lucide-react';
import { getClientCurrentMonthPaymentStatus, formatMonthName } from '../utils/paymentUtils';
import { getTodayDateString, isDateInMonth } from '../utils/dateUtils';

export const Payments: React.FC = () => {
  const { payments, clients, attendance, leaves, setIsAddPaymentOpen, setPaymentModalDefaultClientId, deletePayment, deletedIds } = useApp();

  const [filterMode, setFilterMode] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);

  const todayDateStr = getTodayDateString();
  const currentMonthStr = todayDateStr.slice(0, 7); // e.g. "2026-08"
  const currentMonthShortUpper = new Date(currentMonthStr + '-01').toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  const activeClients = clients.filter(c => c.status !== 'Discontinued');

  // Clients who are on full month leave this month — hide from payments
  const currentMonthStart = `${currentMonthStr}-01`;
  const currentMonthEnd = new Date(new Date(currentMonthStart).getFullYear(), new Date(currentMonthStart).getMonth() + 1, 0)
    .toISOString().slice(0, 10);

  const fullMonthLeaveClientIds = new Set(
    leaves
      .filter(l => {
        const start = l.startDate || l.date || '';
        const end = l.endDate || start;
        if (l.isFullMonthLeave && (start.slice(0, 7) === currentMonthStr || end.slice(0, 7) === currentMonthStr)) return true;
        if (start <= currentMonthStart && end >= currentMonthEnd) return true;
        return false;
      })
      .map(l => l.clientId)
  );

  // Synthesize payment records for any active client marked 'Paid' / 'Partial' OR Per Session clients if missing from explicit payments list
  const synthesizedPaymentsFromClients: PaymentRecord[] = activeClients
    .filter(c => {
      if (fullMonthLeaveClientIds.has(c.id)) return false;
      const isPerSession = c.feeType === 'Per Session' || c.membershipPlan === 'Per Session';
      if (isPerSession) {
        const presentCount = attendance.filter(a => a.clientId === c.id && a.status === 'Present' && isDateInMonth(a.date, currentMonthStr)).length;
        if (presentCount === 0) return false;
        return !payments.some(p => p.clientId === c.id && (p.month === currentMonthStr || isDateInMonth(p.date, currentMonthStr)));
      }
      const { status } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
      const isPaidOrPartial = status === 'Paid' || status === 'Partial';
      if (!isPaidOrPartial) return false;
      return !payments.some(p => p.clientId === c.id && (p.month === currentMonthStr || isDateInMonth(p.date, currentMonthStr)));
    })
    .map(c => {
      const isPerSession = c.feeType === 'Per Session' || c.membershipPlan === 'Per Session';
      let amount = c.monthlyFee || 1200;
      let notes = 'Paid status on client profile';

      if (isPerSession) {
        const presentCount = attendance.filter(a => a.clientId === c.id && a.status === 'Present' && isDateInMonth(a.date, currentMonthStr)).length;
        const count = presentCount;
        const rate = c.perSessionFee || 1000;
        amount = count * rate;
        notes = `Pay-As-You-Go (${count} ${count === 1 ? 'session' : 'sessions'} attended in ${formatMonthName(currentMonthStr)} @ ₹${rate}/session)`;
      }

      return {
        id: `syn-${c.id}`,
        clientId: c.id,
        clientName: c.name,
        amount,
        date: c.joiningDate || todayDateStr,
        month: currentMonthStr,
        paymentMode: 'UPI',
        status: 'Paid',
        notes
      };
    });

  const combinedPaymentSources = [...payments, ...synthesizedPaymentsFromClients];

  // Auto-enrich payments that have missing clientName, amount or date by matching clientId with clients array, filtering out orphan/ghost dummy records!
  const enrichedPayments = combinedPaymentSources
    .filter(p => {
      // Filter out deleted records
      if (deletedIds.includes(p.id)) return false;

      // Hide clients who are on full month leave this month
      if (p.clientId && fullMonthLeaveClientIds.has(p.clientId)) return false;

      // Drop any payment with no clientId and no valid clientName
      if (!p.clientId && (!p.clientName || p.clientName === 'Yoga Client')) return false;

      // Drop any payment whose clientId does NOT exist in active clients array AND has no real clientName
      const matchedClient = clients.find(c => c.id === p.clientId);
      if (!matchedClient && (!p.clientName || p.clientName === 'Yoga Client')) return false;

      return true;
    })
    .map(p => {
      const matchedClient = clients.find(c => c.id === p.clientId);
      const rawName = p.clientName && p.clientName !== 'Yoga Client' ? p.clientName : (matchedClient?.name || '');

      if (!rawName) return null;

      const defaultFee = matchedClient?.feeType === 'Per Session'
        ? (matchedClient.perSessionFee || 1000)
        : (matchedClient?.monthlyFee || 1200);
      const amount = (p.amount && Number(p.amount) > 0) ? Number(p.amount) : defaultFee;
      const date = p.date || matchedClient?.joiningDate || todayDateStr;
      const paymentMode = p.paymentMode || 'UPI';

      return {
        ...p,
        clientName: rawName,
        amount,
        date,
        paymentMode
      };
    })
    .filter(Boolean) as PaymentRecord[];

  // 1. Current Month Total Collected (Matching Dashboard & Reports!)
  const currentMonthPayments = enrichedPayments.filter(p => {
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
    const fee = c.feeType === 'Per Session' ? (c.perSessionFee || 1000) * (c.completedClasses || 1) : (c.monthlyFee || 0);
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

  // 2. Pending Fee Amount & Pending Clients (Matching Dashboard & Reports!)
  const pendingFeeClients = activeClients.filter(c => {
    if (c.feeType === 'Per Session' || c.membershipPlan === 'Per Session') return false;
    const { status } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
    return status === 'Pending' || status === 'Overdue' || status === 'Partial';
  });

  const totalPendingAmount = pendingFeeClients.reduce((acc, c) => {
    const { remainingBalance } = getClientCurrentMonthPaymentStatus(c, payments, currentMonthStr, leaves);
    return acc + remainingBalance;
  }, 0);

  const pendingCount = pendingFeeClients.length;

  const filteredPayments = enrichedPayments.filter((p) => {
    const matchesSearch = (p.clientName || '').toLowerCase().includes((search || '').toLowerCase());
    const matchesMode = filterMode === 'All' || p.paymentMode === filterMode;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesMode && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-emerald-600" />
            Fee Payments & Collections
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Track monthly client fees, UPI payments, cash logs, and edit payment records anytime.
          </p>
        </div>

        <button
          onClick={() => {
            setPaymentModalDefaultClientId(null);
            setIsAddPaymentOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md hover:shadow-glow-emerald hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          + Log New Payment
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">{currentMonthShortUpper} COLLECTED</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">₹{(totalCollected || 0).toLocaleString()}</h3>
            <p className="text-xs font-semibold text-emerald-600 mt-0.5">Collected + Earned</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Pending Fee Amount</p>
            <h3 className="text-3xl font-extrabold text-rose-600 mt-1">₹{(totalPendingAmount || 0).toLocaleString()}</h3>
            <p className="text-xs font-semibold text-rose-500 mt-0.5">{pendingCount} pending clients</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Collection Efficiency</p>
            <h3 className="text-3xl font-extrabold text-purple-700 mt-1">
              {Math.round((totalCollected / (totalCollected + totalPendingAmount || 1)) * 100)}%
            </h3>
            <p className="text-xs font-semibold text-purple-600 mt-0.5">Target &gt; 90%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl p-4 shadow-soft border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Mode:
            </span>
            {['All', 'UPI', 'Cash', 'Bank'].map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterMode === mode
                    ? 'bg-white text-emerald-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-slate-400 px-2">Status:</span>
            {['All', 'Paid', 'Partial', 'Pending'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === st
                    ? 'bg-white text-emerald-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Records Cards / List */}
      <div className="space-y-3">
        {filteredPayments.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-12 text-center bg-white rounded-3xl border border-slate-100">
            No payment records found.
          </p>
        ) : (
          filteredPayments.map((p) => {
            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-base border border-emerald-100">
                    ₹
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{p.clientName}</h4>
                    
                    <p className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                      <span>Date: <strong className="text-slate-800">{p.date}</strong></span>
                      <span>• Mode: <span className="text-purple-700 font-bold">{p.paymentMode}</span></span>
                    </p>

                    {p.notes && (
                      <p className="text-[11px] text-slate-400 italic mt-0.5">"{p.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-slate-900">₹{(p.amount || 0).toLocaleString()}</div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      p.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingPayment(p)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors flex items-center gap-1 text-xs font-bold px-3"
                      title="Edit Payment Amount / Details"
                    >
                      <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete payment log of ₹${p.amount} for ${p.clientName}?`)) {
                          deletePayment(p.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Payment Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Payment Modal */}
      <EditPaymentModal
        payment={editingPayment}
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
      />

    </div>
  );
};
