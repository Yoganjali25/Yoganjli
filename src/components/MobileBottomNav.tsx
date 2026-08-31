import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutGrid, Users, Plus, TrendingUp, Menu, CreditCard, CalendarCheck, CalendarX, X, UserPlus, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsAddClientOpen, 
    setIsAddPaymentOpen, 
    setIsAddLeaveOpen,
    setPaymentModalDefaultClientId 
  } = useApp();

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState<boolean>(false);

  const handleTabClick = (tab: any) => {
    setActiveTab(tab);
    setIsQuickActionsOpen(false);
    // Smooth scroll to top when changing tab
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* QUICK ACTION BOTTOM SHEET OVERLAY */}
      {isQuickActionsOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end p-4 animate-fadeIn lg:hidden"
          onClick={() => setIsQuickActionsOpen(false)}
        >
          <div 
            className="bg-[#0F172A] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-white animate-slideUp mb-20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Quick Actions</h3>
                  <p className="text-[11px] text-slate-400">1-Tap Yogi & Studio Management</p>
                </div>
              </div>
              <button 
                onClick={() => setIsQuickActionsOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. Add New Yogi */}
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  setIsAddClientOpen(true);
                }}
                className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white">+ Add New Yogi</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Register new client</span>
              </button>

              {/* 2. Log Payment */}
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  setPaymentModalDefaultClientId(null);
                  setIsAddPaymentOpen(true);
                }}
                className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white">+ Log Payment</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Monthly fee or pass</span>
              </button>

              {/* 3. Daily Attendance */}
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  setActiveTab('calendar');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white">Attendance</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Mark daily batch</span>
              </button>

              {/* 4. Mark Leave */}
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  setIsAddLeaveOpen(true);
                }}
                className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:scale-95 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <CalendarX className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white">Mark Leave</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Client absence record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B111E]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 shadow-2xl safe-area-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          
          {/* TAB 1: DASHBOARD */}
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'text-blue-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-500/20 shadow-sm shadow-blue-500/30' : ''
            }`}>
              <LayoutGrid className={`w-5 h-5 ${activeTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Dashboard</span>
          </button>

          {/* TAB 2: CLIENTS / YOGIS */}
          <button
            onClick={() => handleTabClick('clients')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              activeTab === 'clients'
                ? 'text-blue-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              activeTab === 'clients' ? 'bg-blue-500/20 shadow-sm shadow-blue-500/30' : ''
            }`}>
              <Users className={`w-5 h-5 ${activeTab === 'clients' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Yogis</span>
          </button>

          {/* TAB 3: CENTER ELEVATED FLOATING PLUS BUTTON */}
          <div className="relative flex flex-col items-center justify-center">
            <button
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              aria-label="Quick Actions"
              className={`w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/50 ring-4 ring-[#0B111E] active:scale-90 transition-all duration-300 ${
                isQuickActionsOpen ? 'rotate-45 from-rose-600 to-red-600' : 'hover:scale-105'
              }`}
            >
              <Plus className="w-6 h-6 stroke-[2.8]" />
            </button>
            <span className="text-[9px] font-extrabold text-indigo-400 mt-1 uppercase tracking-wider">Quick</span>
          </div>

          {/* TAB 4: REPORTS / ANALYTICS */}
          <button
            onClick={() => handleTabClick('reports')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
              activeTab === 'reports'
                ? 'text-blue-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              activeTab === 'reports' ? 'bg-blue-500/20 shadow-sm shadow-blue-500/30' : ''
            }`}>
              <TrendingUp className={`w-5 h-5 ${activeTab === 'reports' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Reports</span>
          </button>

          {/* TAB 5: MENU / MORE DRAWER */}
          <button
            onClick={onOpenMenu}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-400 hover:text-slate-200 font-medium transition-all duration-200 active:scale-95"
          >
            <div className="p-1 rounded-xl">
              <Menu className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
          </button>

        </div>
      </div>
    </>
  );
};
