import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, 
  Search, 
  Plus, 
  Sparkles, 
  CreditCard, 
  Calendar as CalendarIcon, 
  Users,
  RefreshCw,
  Trophy,
  BookOpen,
  Share2
} from 'lucide-react';

interface PanelHeaderProps {
  onOpenMobileSidebar: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  onOpenMobileSidebar
}) => {
  const { 
    activeTab, 
    clients, 
    payments, 
    attendance, 
    setIsAddClientOpen, 
    setIsAddPaymentOpen, 
    setIsSearchOpen,
    setIsShareLinkOpen,
    syncCloudNow,
    isSyncingCloud
  } = useApp();

  const activeClientsCount = clients.filter(c => c.status !== 'Discontinued').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'Pending').length;
  
  // Today's day name (e.g. Fri)
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayClassesCount = clients.filter(c => c.status !== 'Discontinued' && (c.days || []).includes(todayDayName)).length;

  // Dynamic Page Titles & Subtitles based on active category
  const getHeaderDetails = () => {
    switch (activeTab) {
      case 'clients':
        return {
          titlePrefix: 'Client',
          titleAccent: 'Journal',
          subtitle: 'Empower practitioners with personalized yoga guidance & tracking.',
          pill: `🟢 ${activeClientsCount} Active Yogis`,
          actionLabel: '+ Add Client',
          actionIcon: Plus,
          onAction: () => setIsAddClientOpen(true)
        };
      case 'payments':
        return {
          titlePrefix: 'Fee & Billing',
          titleAccent: 'Manager',
          subtitle: 'Transparent automated accounting, continuous cycles & fee alerts.',
          pill: pendingPaymentsCount > 0 ? `💳 ${pendingPaymentsCount} Pending Fees` : '✨ All Dues Cleared',
          actionLabel: '+ Log Payment',
          actionIcon: CreditCard,
          onAction: () => setIsAddPaymentOpen(true)
        };
      case 'calendar':
        return {
          titlePrefix: 'Attendance',
          titleAccent: 'Calendar',
          subtitle: 'Daily consistency ledger, leave tracker & class schedules.',
          pill: `📅 ${todayDayName} • ${todayClassesCount} Classes Today`,
          actionLabel: 'Mark Attendance',
          actionIcon: CalendarIcon,
          onAction: undefined
        };
      case 'dreams':
        return {
          titlePrefix: 'Trainer Dreams',
          titleAccent: '& Vision',
          subtitle: 'Financial targets, life goals & revenue milestone progress.',
          pill: '🏆 Vision Tracker',
          actionLabel: '+ Add Vision Goal',
          actionIcon: Trophy,
          onAction: undefined
        };
      case 'blog':
        return {
          titlePrefix: 'Article CMS',
          titleAccent: '& Guides',
          subtitle: 'Publish high-ranking yoga wisdom, asanas & health nutrition guides.',
          pill: '📝 Studio Publication',
          actionLabel: '+ New Article',
          actionIcon: BookOpen,
          onAction: undefined
        };
      case 'reports':
        return {
          titlePrefix: 'Performance',
          titleAccent: 'Analytics',
          subtitle: 'Studio regularity metrics, retention stats & revenue insights.',
          pill: '📈 Studio Intelligence',
          actionLabel: undefined,
          actionIcon: undefined,
          onAction: undefined
        };
      case 'settings':
        return {
          titlePrefix: 'Studio Profile',
          titleAccent: '& Config',
          subtitle: 'Manage branding, instructor credentials, cloud sync & security.',
          pill: '⚙️ Settings Center',
          actionLabel: 'Sync Cloud',
          actionIcon: RefreshCw,
          onAction: () => syncCloudNow()
        };
      case 'dashboard':
      default:
        return {
          titlePrefix: 'Studio Admin',
          titleAccent: 'Center',
          subtitle: 'Consistency is the bridge between dedicated practice and transformation.',
          pill: `🟢 ${todayClassesCount} Classes Scheduled (${todayDayName})`,
          actionLabel: '+ Add Client',
          actionIcon: Plus,
          onAction: () => setIsAddClientOpen(true)
        };
    }
  };

  const details = getHeaderDetails();
  const ActionIcon = details.actionIcon;

  return (
    <header className="mb-6 sm:mb-8">
      {/* Top Mobile Header (Brand & Quick Tool Icons without redundant Menu button) */}
      <div className="flex lg:hidden items-center justify-between py-2.5 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            🌿
          </div>
          <span className="font-serif font-black text-slate-900 text-sm tracking-tight">Yoganjali</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => syncCloudNow()}
            disabled={isSyncingCloud}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs shadow-xs"
            title="Sync Cloud Data"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncingCloud ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs shadow-xs"
            title="Search Clients"
          >
            <Search className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => setIsShareLinkOpen(true)}
            className="p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs shadow-xs"
            title="Share Client Registration Link"
          >
            <Share2 className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Main Desktop Header Layout matching user reference screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        
        {/* Left Side: Category Title + Tagline */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
              <span>{details.titlePrefix} </span>
              <span className="text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {details.titleAccent}
              </span>
            </h1>

            {/* Quick Status Pill */}
            {details.pill && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-extrabold shadow-xs">
                {details.pill}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
            {details.subtitle}
          </p>
        </div>

        {/* Right Side: Quick Search & Primary Action Button */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          
          {/* Quick Search ⌘K Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium shadow-xs transition-colors group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            <span>Search yogis...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Sync Cloud Button */}
          <button
            onClick={() => syncCloudNow()}
            disabled={isSyncingCloud}
            title="Sync latest data with cloud database"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-700 text-xs font-bold shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>

          {/* Share Registration Link Button */}
          <button
            onClick={() => setIsShareLinkOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200/90 text-purple-700 hover:text-purple-800 text-xs font-extrabold shadow-xs transition-all hover:scale-105 active:scale-95"
            title="Share 5-Step Client Registration Link"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Share Link ↗</span>
          </button>

          {/* Primary Action Button (e.g. + Add Client) */}
          {details.actionLabel && details.onAction && (
            <button
              onClick={details.onAction}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              {ActionIcon && <ActionIcon className="w-4 h-4" />}
              <span>{details.actionLabel}</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
