import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentRecord, Client } from '../types';
import { EditPaymentModal } from './Modals/EditPaymentModal';
import { 
  CreditCard, 
  Plus, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  Trash2, 
  Calendar, 
  Pencil, 
  Download, 
  Sparkles, 
  AlertCircle, 
  MessageCircle, 
  ArrowUpRight, 
  TrendingUp, 
  Layers, 
  Check, 
  UserCheck,
  Send,
  Zap,
  Activity
} from 'lucide-react';
import { getClientCurrentMonthPaymentStatus, formatMonthName } from '../utils/paymentUtils';
import { getTodayDateString, isDateInMonth } from '../utils/dateUtils';

export const Payments: React.FC = () => {
  const { 
    payments, 
    clients, 
    attendance, 
    leaves, 
    setIsAddPaymentOpen, 
    setPaymentModalDefaultClientId, 
    deletePayment, 
    deletedIds,
    quickMarkPaid,
    addPayment
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'pending' | 'passes'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [filterMode, setFilterMode] = useState<string>('All');
  const [search, setSearch] = useState<string>('');
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);

  const todayDateStr = getTodayDateString();
  const currentMonthStr = todayDateStr.slice(0, 7); // "2026-09"

  const activeClients = clients.filter(c => c.status !== 'Discontinued');

  // Full month leaves set
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

  // Per session clients
  const perSessionClients = activeClients.filter(c => c.feeType === 'Per Session' || c.membershipPlan === 'Per Session');

  // Clean explicit payments list
  const validPayments = payments.filter(p => {
    if (deletedIds.includes(p.id)) return false;
    if (!p.clientId && (!p.clientName || p.clientName === 'Yoga Client')) return false;
    return true;
  });

  // 1. Calculations for Selected Month (September 2026 by default)
  const isSelectedCurrentMonth = selectedMonth === currentMonthStr;

  // Real fixed payments in selected month (including previous months' dues cleared in current month)
  const monthFixedPayments = validPayments.filter(p => {
    if (p.status !== 'Paid' && p.status !== 'Partial') return false;
    const isThisMonth = selectedMonth === 'all'
      ? true
      : isSelectedCurrentMonth
        ? (isDateInMonth(p.date, selectedMonth) || p.month === selectedMonth)
        : isDateInMonth(p.date, selectedMonth);
    if (!isThisMonth) return false;
    const matchedClient = activeClients.find(c => c.id === p.clientId);
    if (matchedClient && (matchedClient.feeType === 'Per Session' || matchedClient.membershipPlan === 'Per Session')) {
      return false; // Per session is realized by attendance
    }
    return true;
  });
  const monthFixedCollectedTotal = monthFixedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

  // Per session classes attended in selected month
  let monthPerSessionEarned = 0;
  perSessionClients.forEach(client => {
    if (fullMonthLeaveClientIds.has(client.id)) return;
    const rate = client.perSessionFee || 800;
    const presentCount = attendance.filter(a => 
      a.clientId === client.id && 
      a.status === 'Present' && 
      isDateInMonth(a.date, selectedMonth)
    ).length;
    monthPerSessionEarned += (presentCount * rate);
  });

  const monthTotalCollected = monthFixedCollectedTotal + monthPerSessionEarned;

  // 2. Pending Fee Clients for Selected Month
  const pendingFeeClients = activeClients.filter(c => {
    if (c.feeType === 'Per Session' || c.membershipPlan === 'Per Session') return false;
    if (fullMonthLeaveClientIds.has(c.id)) return false;
    const { status } = getClientCurrentMonthPaymentStatus(c, payments, selectedMonth, leaves);
    return status === 'Pending' || status === 'Overdue' || status === 'Partial';
  });

  const totalPendingAmount = pendingFeeClients.reduce((acc, c) => {
    const { remainingBalance } = getClientCurrentMonthPaymentStatus(c, payments, selectedMonth, leaves);
    return acc + remainingBalance;
  }, 0);

  // 3. Advance Prepaid Pass Credits (e.g. Chetna ₹3,200)
  let totalPrepaidPassCredits = 0;
  perSessionClients.forEach(client => {
    const rate = client.perSessionFee || 800;
    const directPaid = validPayments.filter(p => p.clientId === client.id && p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
    const attendedCount = client.completedClasses || attendance.filter(a => a.clientId === client.id && a.status === 'Present').length;
    const consumed = attendedCount * rate;
    if (directPaid > consumed) {
      totalPrepaidPassCredits += (directPaid - consumed);
    }
  });

  // Filtered Payments list
  const filteredPayments = validPayments.filter((p) => {
    const matchesSearch = (p.clientName || '').toLowerCase().includes((search || '').toLowerCase()) ||
                          (p.notes || '').toLowerCase().includes((search || '').toLowerCase());
    const matchesMode = filterMode === 'All' || p.paymentMode === filterMode;
    const matchesMonth = selectedMonth === 'all'
      ? true
      : isSelectedCurrentMonth
        ? (isDateInMonth(p.date, selectedMonth) || p.month === selectedMonth)
        : isDateInMonth(p.date, selectedMonth);
    return matchesSearch && matchesMode && matchesMonth;
  });

  // Export Financial CSV
  const handleExportCSV = () => {
    const headers = ['Receipt ID', 'Client Name', 'Amount (INR)', 'Payment Date', 'Billing Month', 'Payment Mode', 'Status', 'Notes'];
    const rows = validPayments.map(p => [
      `"${p.id}"`,
      `"${p.clientName || 'Yogi'}"`,
      p.amount || 0,
      `"${p.date || todayDateStr}"`,
      `"${p.month || currentMonthStr}"`,
      `"${p.paymentMode || 'UPI'}"`,
      `"${p.status || 'Paid'}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yoganjali_Financial_Ledger_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Reminder Handler
  const sendWhatsAppReminder = (client: Client, dueAmount: number) => {
    const cleanPhone = (client.phone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `🙏 Namaste ${client.name}! This is a gentle reminder regarding your monthly yoga studio membership fee of ₹${dueAmount.toLocaleString()} for ${formatMonthName(selectedMonth)} at Yoganjali. Kindly settle via UPI at your convenience. Thank you! 🌿✨`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. TOP MONTH SELECTOR & ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80">
        {/* Month Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setSelectedMonth('2026-09')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              selectedMonth === '2026-09'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sep 2026 (Live)
          </button>
          <button
            onClick={() => setSelectedMonth('2026-08')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              selectedMonth === '2026-08'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aug 2026
          </button>
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              selectedMonth === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all active:scale-95"
            title="Download CSV Statement"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {/* Primary + Log New Payment Button */}
          <button
            onClick={() => {
              setPaymentModalDefaultClientId(null);
              setIsAddPaymentOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Log Payment</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Selected Month Collected */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                {selectedMonth === 'all' ? 'All-Time Collections' : `${formatMonthName(selectedMonth).split(' ')[0]} Collected`}
              </p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">₹{(monthTotalCollected || 0).toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xl border border-emerald-200">
              ₹
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
            ₹{monthFixedCollectedTotal.toLocaleString()} Subscriptions + ₹{monthPerSessionEarned.toLocaleString()} Sessions
          </p>
        </div>

        {/* Card 2: Pending Fees */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-rose-100 hover:border-rose-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">Pending Dues ({pendingFeeClients.length})</p>
              <h3 className="text-3xl font-black text-rose-600 mt-1">₹{(totalPendingAmount || 0).toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-rose-600 font-bold pt-2 border-t border-rose-100">
            {pendingFeeClients.length} clients awaiting payment for {formatMonthName(selectedMonth)}
          </p>
        </div>

        {/* Card 3: Advance Prepaid Passes */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-purple-100 hover:border-purple-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-purple-800 uppercase tracking-wider">Prepaid Pass Credit</p>
              <h3 className="text-3xl font-black text-purple-900 mt-1">₹{(totalPrepaidPassCredits || 0).toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-purple-700 font-medium pt-2 border-t border-purple-100">
            Chetna & Pass Yogis available class credits
          </p>
        </div>

        {/* Card 4: Collection Efficiency */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border-2 border-blue-100 hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">Collection Ratio</p>
              <h3 className="text-3xl font-black text-blue-950 mt-1">
                {selectedMonth === '2026-08' ? '100%' : `${Math.round((monthTotalCollected / Math.max(1, monthTotalCollected + totalPendingAmount)) * 100)}%`}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-blue-700 font-medium pt-2 border-t border-blue-100">
            {selectedMonth === '2026-08' ? 'August 100% Realized' : 'Active billing cycle in progress'}
          </p>
        </div>

      </div>

      {/* 3. INTERACTIVE SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>All Payment Logs ({filteredPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'pending'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Pending & Dues ({pendingFeeClients.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('passes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeSubTab === 'passes'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Prepaid Passes ({perSessionClients.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client or note..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* 4. SUB-TAB 1: ALL PAYMENT LOGS (PAYMENT LEDGER) */}
      {activeSubTab === 'all' && (
        <div className="space-y-4">
          
          {/* Mode Filter Pills */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Mode:
              </span>
              {['All', 'UPI', 'Cash', 'Bank'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    filterMode === mode
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400 font-bold">
              Showing {filteredPayments.length} transactions
            </span>
          </div>

          {/* Transaction Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPayments.length === 0 ? (
              <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 space-y-2">
                <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-600">No payment logs found for this filter.</p>
                <p className="text-xs text-slate-400">Click "+ Log Payment" to record a new fee transaction.</p>
              </div>
            ) : (
              filteredPayments.map((p) => {
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-700 flex items-center justify-center font-black text-lg border border-emerald-200 shrink-0">
                          ₹
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                            {p.clientName}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                            <span>📅 {p.date}</span>
                            <span>•</span>
                            <span className="px-2 py-0.2 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200 text-[10px]">
                              {p.paymentMode || 'UPI'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900">
                          ₹{(p.amount || 0).toLocaleString()}
                        </div>
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 mt-1">
                          ✓ {p.status}
                        </span>
                      </div>
                    </div>

                    {p.notes && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium">
                        "{p.notes}"
                      </div>
                    )}

                    {/* Card Action Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Billing Month: <strong className="text-slate-700">{formatMonthName(p.month || selectedMonth)}</strong>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingPayment(p)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold transition-all flex items-center gap-1 text-xs"
                        >
                          <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete payment record of ₹${p.amount} for ${p.clientName}?`)) {
                              deletePayment(p.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                          title="Delete Record"
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
        </div>
      )}

      {/* 5. SUB-TAB 2: PENDING & OVERDUE FEES ACTION CENTER */}
      {activeSubTab === 'pending' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-rose-950 text-sm">
                  {pendingFeeClients.length} Yogis have Pending Dues for {formatMonthName(selectedMonth)}
                </h4>
                <p className="text-xs text-rose-700 font-medium">
                  Total Outstanding Balance: <strong className="font-black text-rose-900">₹{totalPendingAmount.toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                pendingFeeClients.forEach(c => {
                  const { dueAmount } = getClientCurrentMonthPaymentStatus(c, payments, selectedMonth, leaves);
                  sendWhatsAppReminder(c, dueAmount);
                });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send WhatsApp Reminders</span>
            </button>
          </div>

          {/* Pending Clients List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingFeeClients.length === 0 ? (
              <div className="col-span-3 text-center py-16 bg-white rounded-3xl border border-slate-100 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-base font-extrabold text-slate-800">All fees fully collected for {formatMonthName(selectedMonth)}! 🎉</p>
                <p className="text-xs text-slate-400">Zero pending dues across all batches.</p>
              </div>
            ) : (
              pendingFeeClients.map((client) => {
                const { status, dueAmount, remainingBalance } = getClientCurrentMonthPaymentStatus(client, payments, selectedMonth, leaves);

                return (
                  <div
                    key={client.id}
                    className="bg-white rounded-3xl p-5 shadow-soft border-2 border-rose-100 hover:border-rose-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={client.photoUrl} 
                          alt={client.name} 
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-rose-100 shrink-0" 
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">{client.name}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {client.timeSlot} • Due Day: <strong className="text-slate-800">{client.feeDueDate}th</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-rose-600 block">
                          ₹{remainingBalance.toLocaleString()}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                          {status}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center justify-between text-slate-600 font-medium">
                      <span>Monthly Plan Fee:</span>
                      <strong className="text-slate-900 font-bold">₹{(client.monthlyFee || 1200).toLocaleString()}/mo</strong>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => quickMarkPaid(client.id)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Mark Paid</span>
                      </button>

                      <button
                        onClick={() => sendWhatsAppReminder(client, remainingBalance || client.monthlyFee || 1200)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs transition-all"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. SUB-TAB 3: PREPAID PASSES & PER-SESSION PACKAGES */}
      {activeSubTab === 'passes' && (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-purple-950 text-sm">
                  Pay-As-You-Go & Prepaid Class Packages ({perSessionClients.length} Clients)
                </h4>
                <p className="text-xs text-purple-700 font-medium">
                  Track advance 10-class package credits & per-session attended classes.
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-purple-900 bg-white px-3 py-1.5 rounded-xl border border-purple-300">
              ₹{totalPrepaidPassCredits.toLocaleString()} Total Prepaid Pool
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {perSessionClients.map((client) => {
              const rate = client.perSessionFee || 800;
              const directPaid = validPayments.filter(p => p.clientId === client.id && p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
              const presentCount = attendance.filter(a => a.clientId === client.id && a.status === 'Present').length;
              const completedCount = client.completedClasses || presentCount || 0;
              const consumedCost = completedCount * rate;
              const isPrepaid = directPaid > consumedCost;
              const advanceCredit = Math.max(0, directPaid - consumedCost);
              const remainingClasses = rate > 0 ? Math.floor(advanceCredit / rate) : 0;
              const totalClasses = client.totalClasses || (rate > 0 && directPaid > 0 ? Math.floor(directPaid / rate) : completedCount);
              const progressPct = totalClasses > 0 ? Math.min(100, Math.round((completedCount / totalClasses) * 100)) : 100;

              return (
                <div
                  key={client.id}
                  className="bg-white rounded-3xl p-6 shadow-soft border-2 border-slate-100 hover:border-purple-300 transition-all space-y-5 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <img 
                        src={client.photoUrl} 
                        alt={client.name} 
                        className="w-13 h-13 rounded-2xl object-cover ring-2 ring-purple-100 shrink-0" 
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-base">{client.name}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Rate: <strong className="text-purple-700 font-extrabold">₹{rate} / class</strong> • {client.days?.join(', ') || 'Flexible'}
                        </p>
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      isPrepaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isPrepaid ? '🟢 Active Pass' : 'Pay-As-You-Go'}
                    </span>
                  </div>

                  {/* 4 Metric Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Attended</span>
                      <strong className="text-lg font-black text-slate-900">{completedCount} Classes</strong>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Utilized Fee</span>
                      <strong className="text-lg font-black text-purple-700">₹{consumedCost.toLocaleString()}</strong>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Paid</span>
                      <strong className="text-lg font-black text-emerald-900">₹{directPaid.toLocaleString()}</strong>
                    </div>

                    <div className={`p-3 rounded-2xl border ${isPrepaid ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}>
                      <span className="text-[10px] font-bold text-purple-800 uppercase block">Remaining</span>
                      <strong className="text-lg font-black text-purple-900">
                        {isPrepaid ? `${remainingClasses} Left` : '0'}
                      </strong>
                    </div>
                  </div>

                  {/* Progress Bar for Package Pass */}
                  {isPrepaid && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-600">Pass Completion</span>
                        <span className="font-extrabold text-purple-800">{completedCount} / {totalClasses} ({progressPct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Top-up Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      {isPrepaid ? `Prepaid Balance: ₹${advanceCredit.toLocaleString()}` : 'Classes billed per attendance'}
                    </span>

                    <button
                      onClick={() => {
                        setPaymentModalDefaultClientId(client.id);
                        setIsAddPaymentOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-xs transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>+ Log Pass Recharge</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      <EditPaymentModal
        payment={editingPayment}
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
      />

    </div>
  );
};
