import React from 'react';
import { 
  Globe, 
  LayoutDashboard, 
  UserCheck, 
  MessageCircle, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  DollarSign, 
  Sparkles, 
  BarChart3, 
  Smartphone, 
  Building2, 
  Clock, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Rocket, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  ArrowUpRight
} from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export const CrmDemoShowcase: React.FC = () => {
  const whatsappNumberClean = SITE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const demoMessage = encodeURIComponent('Hello, I would like a demo of Yoganjali Studio CRM for my business.');
  const whatsappUrl = `https://wa.me/${whatsappNumberClean}?text=${demoMessage}`;

  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('demo-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const demoCards = [
    {
      icon: <Globe className="w-8 h-8 text-emerald-600" />,
      badge: "Public Website",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      title: "Live Website Demo",
      description: "Explore the public-facing website experience and see how your studio can present itself online.",
      buttonText: "Open Website Demo",
      link: "https://studio-crm-demo.negianoop99.workers.dev/",
      highlights: ["SEO Landing Page", "Online Trial Booking", "Student Transformation Stories"]
    },
    {
      icon: <LayoutDashboard className="w-8 h-8 text-indigo-600" />,
      badge: "Admin Operations",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      title: "Owner / Trainer Panel",
      description: "Manage members, attendance, memberships, payments, classes, and reports from one dashboard.",
      buttonText: "Open Trainer Panel",
      link: "https://studio-crm-demo.negianoop99.workers.dev/panel",
      highlights: ["Real-time Multi-Device Sync", "Fee Tracking & Auto-Dues", "Live Daily Class Timetable"]
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      badge: "Member Experience",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      title: "Student / Member Portal",
      description: "Allow members to view attendance, memberships, profiles, and account information.",
      buttonText: "Open Member Portal",
      link: "https://studio-crm-demo.negianoop99.workers.dev/member",
      highlights: ["Digital Attendance Calendar", "Paid Fee Badges", "Mobile PWA Access"]
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-amber-600" />,
      badge: "Get Your Custom CRM",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      title: "Get This Software For Your Studio",
      description: "Interested in using this software for your Yoga Studio, Gym, Dance Academy, Coaching Center, or Fitness Business?",
      buttonText: "Chat on WhatsApp",
      link: whatsappUrl,
      isWhatsApp: true,
      highlights: ["Custom Studio Branding", "Independent Cloud DB", "Instant 24-Hour Deployment"]
    }
  ];

  const features = [
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      title: "Member Management",
      desc: "Complete profiles, medical history, goals, joining dates, and emergency contacts in one secure place."
    },
    {
      icon: <CalendarCheck className="w-6 h-6 text-indigo-600" />,
      title: "Attendance Tracking",
      desc: "1-click Present/Absent marking with real-time multi-device synchronization and monthly calendars."
    },
    {
      icon: <CreditCard className="w-6 h-6 text-purple-600" />,
      title: "Membership Plans",
      desc: "Flexible monthly, quarterly, annual subscriptions, personal 1-on-1 slots, and group batches."
    },
    {
      icon: <DollarSign className="w-6 h-6 text-teal-600" />,
      title: "Fee Collection",
      desc: "Automated billing cycle calculations, overdue payment alerts, and month-by-month financial tracking."
    },
    {
      icon: <UserCheck className="w-6 h-6 text-amber-600" />,
      title: "Lead Management",
      desc: "Capture website inquiries, free trial requests, and follow up seamlessly to boost conversions."
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-blue-600" />,
      title: "Trainer Dashboard",
      desc: "Today's live schedule, ongoing class timers, student counts, and day-to-day revenue stats."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-rose-600" />,
      title: "Student Portal",
      desc: "Self-service web cards for members to verify attendance check-ins, fee receipts, and class schedules."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-cyan-600" />,
      title: "Reports & Analytics",
      desc: "Visual charts for monthly revenue growth, active members count, and student retention trends."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-600" />,
      title: "Mobile Friendly",
      desc: "Ultra-fast, mobile-first responsive interface that works smoothly on Android, iPhone, iPad & Laptops."
    },
    {
      icon: <Building2 className="w-6 h-6 text-violet-600" />,
      title: "Multi-Branch Ready",
      desc: "Manage multiple studio locations, batch schedules, and trainer instructors under a single CRM."
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      title: "Class Scheduling",
      desc: "Recurring morning and evening batch schedules with automated 1-hour live class tracking."
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-green-600" />,
      title: "WhatsApp Communication",
      desc: "Direct 1-click WhatsApp messaging for fee reminders, trial confirmations, and class updates."
    }
  ];

  const industries = [
    {
      icon: "🧘",
      title: "Yoga Studios",
      desc: "Group asana batches, personal 1-on-1 sessions, and therapy classes with attendance tracking."
    },
    {
      icon: "🏋️",
      title: "Gyms & Fitness Clubs",
      desc: "Membership passes, trainer slot management, and monthly recurring fee renewals."
    },
    {
      icon: "💃",
      title: "Dance Academies",
      desc: "Choreography batches, weekend workshops, and student performance roll calls."
    },
    {
      icon: "🥋",
      title: "Martial Arts Centers",
      desc: "Karate, Taekwondo, and MMA belt-level progression with daily class logs."
    },
    {
      icon: "📚",
      title: "Coaching Institutes",
      desc: "Tuition batches, fee collection ledgers, student attendance, and parent communication."
    },
    {
      icon: "🏃",
      title: "Fitness Trainers",
      desc: "Freelance coaches managing client time slots, goal achievements, and online batches."
    },
    {
      icon: "🌿",
      title: "Wellness Centers",
      desc: "Holistic therapy, meditation retreats, nutrition counseling, and wellness plans."
    },
    {
      icon: "⚽",
      title: "Sports Academies",
      desc: "Football, swimming, tennis, and badminton training camps with seasonal plans."
    }
  ];

  const benefits = [
    {
      icon: <ShieldCheck className="w-7 h-7 text-emerald-600" />,
      title: "Easy to Use",
      desc: "Designed specifically for studio owners and trainers. No complicated IT setup or steep learning curves."
    },
    {
      icon: <Zap className="w-7 h-7 text-amber-600" />,
      title: "Save Time",
      desc: "Automate daily attendance, recurring membership dues, and student WhatsApp follow-ups in seconds."
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-indigo-600" />,
      title: "Increase Retention",
      desc: "Track student activity, recognize absences early, and send friendly check-ins to prevent dropouts."
    },
    {
      icon: <Rocket className="w-7 h-7 text-purple-600" />,
      title: "Grow Faster",
      desc: "Manage leads, track studio revenue, and scale your operations effortlessly from a single master dashboard."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white antialiased">
      
      {/* Top Floating Glass Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
                <img src="/yoganjali-logo.png" alt="Yoganjali Logo" className="w-8 h-8 object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  Yoganjali
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Studio CRM
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-400 hidden sm:block">
                All-in-One Studio & Fitness Management
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#demo-showcase" onClick={scrollToDemo} className="hover:text-emerald-400 transition-colors">
              Live Demos
            </a>
            <a href="#features" className="hover:text-emerald-400 transition-colors">
              Features
            </a>
            <a href="#industries" className="hover:text-emerald-400 transition-colors">
              Industries
            </a>
            <a href="#why-choose" className="hover:text-emerald-400 transition-colors">
              Why Us
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href="/panel"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
              Trainer Login
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-700/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get CRM Demo</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        {/* Subtle Background Glow Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-emerald-400 mb-8 shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Modern SaaS Studio Platform • 2026 Edition</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
            <span className="block">Yoganjali Studio CRM</span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Live Software Demo
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Explore a complete management platform for <strong className="text-white font-semibold">Yoga Studios</strong>, <strong className="text-white font-semibold">Gyms</strong>, <strong className="text-white font-semibold">Dance Academies</strong>, <strong className="text-white font-semibold">Martial Arts Centers</strong>, <strong className="text-white font-semibold">Coaching Institutes</strong>, and Membership-Based Businesses.
          </p>

          {/* CTA Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <a
              href="#demo-showcase"
              onClick={scrollToDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>View Live Demo</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-slate-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>Contact on WhatsApp</span>
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="mt-14 pt-10 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Complex Installation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Mobile & Tablet Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Cross-Device Cloud Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct WhatsApp Automations</span>
            </div>
          </div>

        </div>
      </section>

      {/* Demo Showcase Section (4 Cards Grid) */}
      <section id="demo-showcase" className="py-20 bg-slate-950/60 border-y border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-4">
              Interactive Environments
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Experience the CRM in Action
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-400">
              Click any demo environment below to test live workflows, portals, and student management features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {demoCards.map((card, idx) => (
              <div 
                key={idx}
                className="group relative rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 hover:border-emerald-500/50 p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/30 hover:-translate-y-1"
              >
                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                      {card.icon}
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Highlights */}
                  <ul className="mt-6 space-y-2.5 border-t border-slate-800 pt-5">
                    {card.highlights.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs font-medium text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Button */}
                <div className="mt-8 pt-4">
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md ${
                      card.isWhatsApp
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30'
                        : 'bg-white hover:bg-slate-100 text-slate-900 hover:shadow-lg'
                    }`}
                  >
                    <span>{card.buttonText}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-extrabold uppercase tracking-widest text-indigo-400 mb-4">
              Powerful Capabilities
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Everything You Need to Run Your Studio
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-400">
              Built from real trainer feedback to simplify daily operations, eliminate paperwork, and boost member retention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((item, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Industries We Serve */}
      <section id="industries" className="py-24 bg-slate-950/60 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-extrabold uppercase tracking-widest text-purple-400 mb-4">
              Tailored Solutions
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Industries We Serve
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-400">
              Yoganjali Studio CRM is built to adapt seamlessly to any membership or appointment-based business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((ind, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/70 hover:border-purple-500/40 transition-all hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">{ind.icon}</div>
                <h3 className="font-bold text-lg text-white mb-2">{ind.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Why Choose Section */}
      <section id="why-choose" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-extrabold uppercase tracking-widest text-emerald-400 mb-4">
              Proven Value
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Choose Yoganjali Studio CRM?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-400">
              Designed for ease, built for speed, and engineered to scale your studio business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((b, idx) => (
              <div 
                key={idx}
                className="p-8 rounded-3xl bg-slate-800/50 border border-slate-700/70 hover:border-emerald-500/40 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-inner">
                  {b.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{b.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final Highlighted CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900/60 via-teal-900/60 to-slate-900 border border-emerald-500/30 p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
            
            {/* Background Decorative Blob */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Ready to Transform Your Studio Operations?
              </h2>
              <p className="mt-5 text-base sm:text-lg text-emerald-100 font-normal leading-relaxed">
                Run your studio more efficiently with a complete CRM solution built for membership-based businesses.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-xl shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Rocket className="w-5 h-5 text-slate-950" />
                  <span>Book a Demo</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-slate-900/80 hover:bg-slate-900 border border-emerald-500/40 hover:border-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Contact on WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="font-extrabold text-lg text-white">
                  Yoganjali Studio CRM
                </span>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Management Software for Yoga, Fitness & Training Businesses
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
              <a href="/" className="hover:text-white transition-colors">
                Home
              </a>
              <a href="/studio" className="hover:text-white text-emerald-400 font-bold transition-colors">
                Studio CRM
              </a>
              <a href="/panel" className="hover:text-white transition-colors">
                Trainer Panel
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>

            {/* Copyright */}
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} Yoganjali Studio CRM. All Rights Reserved.
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
};
