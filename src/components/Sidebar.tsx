import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings as SettingsIcon, 
  Trophy, 
  BookOpen, 
  LogOut, 
  Sparkles, 
  Cloud, 
  Globe,
  ChevronRight,
  X,
  Share2,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
  onLogout
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    clients, 
    payments, 
    trainerProfile, 
    isSyncingCloud, 
    syncCloudNow,
    setIsClientWebsiteMode,
    setIsShareLinkOpen
  } = useApp();

  const activeClientsCount = clients.filter(c => c.status !== 'Discontinued').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'Pending').length;

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      badge: null
    },
    { 
      id: 'clients', 
      label: 'Clients', 
      icon: Users,
      badge: `${activeClientsCount}`
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} Due` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: CalendarIcon,
      badge: null
    },
    { 
      id: 'dreams', 
      label: 'Goals & Dreams', 
      icon: Trophy,
      badge: 'Vision'
    },
    { 
      id: 'blog', 
      label: 'Blog CMS', 
      icon: BookOpen,
      badge: null
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: BarChart3,
      badge: null
    },
    { 
      id: 'invoice', 
      label: 'Invoice Tool', 
      icon: FileText,
      badge: 'Brand PDF'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: SettingsIcon,
      badge: null
    }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isOpenMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#090D16] text-slate-200 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Header */}
        <div>
          <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
            <div 
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              {trainerProfile.studioLogoUrl ? (
                <img
                  src={trainerProfile.studioLogoUrl}
                  alt="Studio Logo"
                  className="w-9 h-9 rounded-xl object-contain bg-white p-0.5 ring-2 ring-emerald-500/60 shadow-md group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4 animate-pulse text-emerald-100" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm tracking-wider uppercase text-white font-serif group-hover:text-emerald-400 transition-colors">
                    {trainerProfile.appTitle || 'YOGANJALI'}
                  </h1>
                </div>
                <p className="text-[10px] text-emerald-400/90 font-medium tracking-wide leading-none mt-0.5">
                  Studio Admin Journal
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Website Switcher Bar */}
          <div className="px-4 pt-3 pb-1">
            <a
              href="https://www.yoganjaliyoga.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-slate-400 hover:text-emerald-300 transition-all text-xs font-semibold group"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Studio Website</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </a>
          </div>

          {/* Navigation Category Tabs */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)] custom-scrollbar">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Menu Categories
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/10 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`} 
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span 
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        item.badgeColor || (isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Share Registration Link Tab Button */}
            <div className="pt-2 pb-1">
              <button
                onClick={() => {
                  setIsShareLinkOpen(true);
                  if (isOpenMobile) onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600/90 via-indigo-600/90 to-purple-700/90 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-950/40 hover:scale-[1.02] active:scale-95 transition-all border border-purple-400/40 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center">
                    <Share2 className="w-3 h-3 text-white" />
                  </div>
                  <span>Share Registration Link</span>
                </div>
                <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full text-purple-100 group-hover:bg-white group-hover:text-purple-700 transition-colors">
                  ↗
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Profile & Sync & Logout Section */}
        <div className="p-4 border-t border-slate-800/80 bg-[#060910]/70 space-y-3">
          
          {/* Cloud Sync Status Pill */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-slate-300">Cloud Sync Active</span>
            </div>
            <button
              onClick={() => syncCloudNow()}
              disabled={isSyncingCloud}
              title="Force Sync Cloud Database"
              className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Cloud className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {/* Trainer Profile Card */}
          <div 
            onClick={() => handleTabClick('settings')}
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-800/60 cursor-pointer transition-colors group"
          >
            <div className="relative">
              <img
                src={trainerProfile.photoUrl}
                alt={trainerProfile.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/70 shadow-sm bg-purple-50 group-hover:scale-105 transition-transform"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#090D16]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-xs text-white truncate group-hover:text-emerald-300 transition-colors">
                {trainerProfile.name || 'Anjali Negi'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {trainerProfile.studioName || 'Lead Yoga Instructor'}
              </p>
            </div>
          </div>

          {/* Log Out Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-all group"
          >
            <LogOut className="w-4 h-4 text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Log Out</span>
          </button>

        </div>
      </aside>
    </>
  );
};
