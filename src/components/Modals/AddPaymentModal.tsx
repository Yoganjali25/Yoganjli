import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMode, PaymentStatus } from '../../types';
import { X, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { getTodayDateString } from '../../utils/dateUtils';
import { formatMonthName } from '../../utils/paymentUtils';

export const AddPaymentModal: React.FC = () => {
  const { 
    isAddPaymentOpen, 
    setIsAddPaymentOpen, 
    clients, 
    addPayment, 
    paymentModalDefaultClientId,
    setPaymentModalDefaultClientId 
  } = useApp();

  const currentMonthStr = getTodayDateString().slice(0, 7); // e.g. "2026-09"

  const [clientId, setClientId] = useState<string>('');
  const [amount, setAmount] = useState<number>(4500);
  const [date, setDate] = useState<string>(getTodayDateString());
  const [billingMonth, setBillingMonth] = useState<string>(currentMonthStr);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [status, setStatus] = useState<PaymentStatus>('Paid');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isAddPaymentOpen) {
      setDate(getTodayDateString());
      setBillingMonth(getTodayDateString().slice(0, 7));
    }
  }, [isAddPaymentOpen]);

  useEffect(() => {
    if (paymentModalDefaultClientId) {
      setClientId(paymentModalDefaultClientId);
      const targetClient = clients.find(c => c.id === paymentModalDefaultClientId);
      if (targetClient) setAmount(targetClient.monthlyFee);
    } else if (clients.length > 0 && clients[0]) {
      setClientId(clients[0].id);
      setAmount(clients[0].monthlyFee);
    } else {
      setClientId('');
      setAmount(0);
    }
  }, [paymentModalDefaultClientId, clients, isAddPaymentOpen]);

  // Generate dynamic billing month options around current active month
  const getBillingMonthOptions = () => {
    const options: { value: string; label: string }[] = [];
    const [cy, cm] = currentMonthStr.split('-').map(Number);

    // Current Active Month
    options.push({
      value: currentMonthStr,
      label: `${formatMonthName(currentMonthStr)} (Current Cycle)`
    });

    // Past 3 Months
    for (let i = 1; i <= 3; i++) {
      let m = cm - i;
      let y = cy;
      if (m < 1) {
        m += 12;
        y -= 1;
      }
      const mStr = `${y}-${String(m).padStart(2, '0')}`;
      options.push({
        value: mStr,
        label: `${formatMonthName(mStr)} (Previous ${i === 1 ? 'Cycle' : 'Due Payment'})`
      });
    }

    // Next 2 Months (Advance)
    for (let i = 1; i <= 2; i++) {
      let m = cm + i;
      let y = cy;
      if (m > 12) {
        m -= 12;
        y += 1;
      }
      const mStr = `${y}-${String(m).padStart(2, '0')}`;
      options.push({
        value: mStr,
        label: `${formatMonthName(mStr)} (Advance Cycle)`
      });
    }

    return options;
  };

  if (!isAddPaymentOpen) return null;

  const handleClientChange = (id: string) => {
    setClientId(id);
    const target = clients.find(c => c.id === id);
    if (target) setAmount(target.monthlyFee);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find(c => c.id === clientId);
    if (!selectedClient) return;

    addPayment({
      clientId,
      clientName: selectedClient.name,
      amount: Number(amount),
      date,
      month: billingMonth,
      paymentMode,
      status,
      notes
    });

    setIsAddPaymentOpen(false);
    setPaymentModalDefaultClientId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Record Fee Payment</h3>
              <p className="text-xs text-emerald-100">Log cash, UPI, or bank transfers</p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAddPaymentOpen(false);
              setPaymentModalDefaultClientId(null);
            }}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Client *</label>
            <select
              value={clientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Fee: ₹{c.monthlyFee} • {c.classTime})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">For Billing Month *</label>
              <select
                value={billingMonth}
                onChange={(e) => setBillingMonth(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              >
                {getBillingMonthOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Payment Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {(['UPI', 'Cash', 'Bank'] as PaymentMode[]).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                    paymentMode === mode
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Updated Status</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Paid', 'Partial', 'Pending'] as PaymentStatus[]).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`p-3 rounded-2xl border text-xs font-bold text-center transition-all ${
                    status === st
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Transaction Reference</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. GPay UPI ref #881920"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Payment Record
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
