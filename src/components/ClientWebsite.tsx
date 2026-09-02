import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SITE_CONFIG, DEFAULT_WEBSITE_CMS } from '../config/siteConfig';
import { FreeDemoModal } from './Modals/FreeDemoModal';
import { BlogArticleModal } from './BlogArticleModal';
import { 
  Sparkles, 
  CheckCircle2, 
  MessageCircle, 
  ShieldCheck, 
  Award, 
  Users, 
  Clock, 
  Heart, 
  Flame, 
  Check, 
  Star, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Instagram, 
  Youtube, 
  Phone, 
  Menu, 
  X, 
  Target, 
  Compass, 
  Zap, 
  Sun, 
  Moon, 
  Feather, 
  Smile, 
  Activity,
  Globe,
  Sparkle,
  Shield,
  Layers,
  CheckCircle,
  UserPlus,
  FileText,
  BookOpen,
  Calendar
} from 'lucide-react';
import { Gender, SessionType, FeeType, BlogPost } from '../types';

export const ClientWebsite: React.FC = () => {
  const { addClient, setIsClientWebsiteMode, showSuccessToast, websiteCMS, blogs } = useApp();
  const cms = websiteCMS || DEFAULT_WEBSITE_CMS;

  // URL check for Share Demo / Join Link (/join, /demo, ?demo=true, ?join=true)
  const isJoinLink = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const search = window.location.search;
    const path = window.location.pathname.toLowerCase();
    return search.includes('join=true') || search.includes('demo=true') || search.includes('register=true') || search.includes('mode=client') || path === '/join' || path === '/demo';
  }, []);

  // State
  const [activeTab, setActiveTab] = useState<'home' | 'register' | 'leaderboard' | 'myProfile'>('home');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(isJoinLink);
  const [selectedGoalForModal, setSelectedGoalForModal] = useState('');
  const [selectedProgramForModal, setSelectedProgramForModal] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);
  const [activeGoalCard, setActiveGoalCard] = useState<string | null>(null);

  // Blog State
  const [selectedBlogForModal, setSelectedBlogForModal] = useState<BlogPost | null>(null);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [blogFilterCategory, setBlogFilterCategory] = useState<string>('All');

  // Full Onboarding Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Female');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [classTime, setClassTime] = useState('07:00 AM');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [sessionType, setSessionType] = useState<SessionType>('Group');
  const [groupName, setGroupName] = useState('Morning Vinyasa Batch');
  const [feeType, setFeeType] = useState<FeeType>('Monthly');
  const [monthlyFee, setMonthlyFee] = useState<number>(10000);
  const [perSessionFee, setPerSessionFee] = useState<number>(1000);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Flexibility & Posture', 'Stress Relief & Peace']);
  const [healthNotes, setHealthNotes] = useState('');
  const [registrationSubmitted, setRegistrationSubmitted] = useState(false);

  // Auto-open modal if opened via Share Join link
  useEffect(() => {
    if (isJoinLink) {
      setIsDemoModalOpen(true);
    }
  }, [isJoinLink]);

  // Deep linking to individual blog post via clean URL (/blog/:slug or ?blog=slug or #blog-slug)
  useEffect(() => {
    if (typeof window === 'undefined' || !blogs || blogs.length === 0) return;
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search;
    const hash = window.location.hash.toLowerCase();

    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '').replace(/\/$/, '');
      const match = blogs.find(b => b.slug.toLowerCase() === slug || b.id.toLowerCase() === slug);
      if (match) {
        setSelectedBlogForModal(match);
        setIsBlogModalOpen(true);
      }
    } else {
      const params = new URLSearchParams(search);
      const querySlug = params.get('blog') || params.get('article');
      if (querySlug) {
        const match = blogs.find(b => b.slug.toLowerCase() === querySlug.toLowerCase() || b.id.toLowerCase() === querySlug.toLowerCase());
        if (match) {
          setSelectedBlogForModal(match);
          setIsBlogModalOpen(true);
        }
      } else if (hash.startsWith('#blog-')) {
        const hashSlug = hash.replace('#blog-', '');
        const match = blogs.find(b => b.slug.toLowerCase() === hashSlug || b.id.toLowerCase() === hashSlug);
        if (match) {
          setSelectedBlogForModal(match);
          setIsBlogModalOpen(true);
        }
      }
    }
  }, [blogs]);

  const openDemoModal = (goal: string = '', program: string = '') => {
    setSelectedGoalForModal(goal);
    setSelectedProgramForModal(program);
    setIsDemoModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleDirectWhatsAppChat = (customText?: string) => {
    const defaultMsg = customText || "Hi Anjali! 👋 I found your website Yoganjali and would like to chat about yoga classes. 🌿";
    const waNumber = SITE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(defaultMsg)}`, '_blank');
  };

  const handleFullRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please fill out your Name and Phone number.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Feed Client Data into AppContext & localStorage
    await addClient({
      name,
      gender,
      phone,
      whatsapp: whatsapp || phone,
      address: address || 'Online Resident',
      joiningDate: todayStr,
      photoUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`,
      classTime,
      days: selectedDays,
      timeSlot: parseInt(classTime, 10) < 12 ? 'Morning' : 'Evening',
      sessionType,
      groupName: sessionType === 'Group' ? groupName : 'Personal Session',
      reasonsForJoining: selectedGoals,
      currentProblems: healthNotes ? [healthNotes] : [],
      feeType,
      monthlyFee: feeType === 'Monthly' ? monthlyFee : 0,
      perSessionFee: feeType === 'Per Session' ? perSessionFee : undefined,
      feeDueDate: '5th',
      membershipPlan: feeType === 'Monthly' ? '12 Classes' : 'Per Session',
      totalClasses: feeType === 'Monthly' ? 12 : 1,
      trainerNotes: `Self-Registered via Shareable Link on ${todayStr}. Health Notes: ${healthNotes || 'None'}`,
      goal: selectedGoals.join(', ') || 'Overall Wellness'
    });

    setRegistrationSubmitted(true);
    showSuccessToast(`🎉 Client Data fed successfully! Welcome ${name} to Yoganjali Studio.`);

    // Send WhatsApp confirmation to Anjali Negi
    const message = `Hi Anjali! 👋\n\nI have completed my Client Registration details for Yoganjali Studio.\n\n• Name: ${name}\n• Phone/WhatsApp: ${phone}\n• Session Choice: ${sessionType} (${classTime})\n• Days: ${selectedDays.join(', ')}\n• Goals: ${selectedGoals.join(', ')}\n• Health Notes: ${healthNotes || 'None'}\n\nPlease review my profile. 🧘🌿`;
    const waNumber = SITE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  // Section 8: Goal-Based Yoga Interactive Data
  const goalsData = [
    {
      id: 'weight',
      title: 'Weight Management',
      icon: '🔥',
      themeColor: 'from-amber-500 to-rose-600',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Yoga supports healthy body composition when combined with active posture flows, metabolic breathing, and consistent practice.'
    },
    {
      id: 'flexibility',
      title: 'Flexibility & Posture',
      icon: '🧘‍♀️',
      themeColor: 'from-emerald-500 to-teal-700',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Gradual, gentle stretching designed to release tight hamstrings, hips, and shoulders at your body\'s natural pace.'
    },
    {
      id: 'strength',
      title: 'Core & Body Strength',
      icon: '💪',
      themeColor: 'from-indigo-600 to-purple-700',
      badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      desc: 'Bodyweight postures and holds that build functional core strength, muscle tone, and joint stability without heavy weights.'
    },
    {
      id: 'stress',
      title: 'Stress Relief & Peace',
      icon: '🌿',
      themeColor: 'from-[#4A5D3E] to-[#2D3B27]',
      badgeBg: 'bg-green-100 text-green-800 border-green-200',
      desc: 'Calming pranayama breathwork and guided relaxation to soothe the nervous system and clear mental fatigue.'
    },
    {
      id: 'pcos',
      title: 'PCOS & Hormonal Care',
      icon: '🌸',
      themeColor: 'from-pink-500 to-rose-600',
      badgeBg: 'bg-pink-100 text-pink-800 border-pink-200',
      desc: 'Targeted pelvic circulation postures and stress-reduction techniques designed to complement your endocrine health.'
    },
    {
      id: 'thyroid',
      title: 'Thyroid Wellness',
      icon: '✨',
      themeColor: 'from-cyan-500 to-blue-600',
      badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      desc: 'Supported neck and throat posture work combined with gentle metabolic movement to complement overall well-being.'
    },
    {
      id: 'backpain',
      title: 'Back Pain Relief',
      icon: '🦴',
      themeColor: 'from-orange-500 to-[#3F4D2A]',
      badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
      desc: 'Gentle spinal decompression, core strengthening, and posture realignment to support lower and upper back comfort.'
    },
    {
      id: 'sciatica',
      title: 'Sciatica Relief',
      icon: '⚡',
      themeColor: 'from-yellow-500 to-amber-600',
      badgeBg: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      desc: 'Mindful hip openers and glute stretches focused on easing sciatic nerve tension and improving mobility.'
    },
    {
      id: 'mobility',
      title: 'Joint Mobility',
      icon: '🔄',
      themeColor: 'from-teal-500 to-emerald-700',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
      desc: 'Joint mobility drills that improve your daily range of motion, reducing stiffness from long sitting hours.'
    },
    {
      id: 'beginner',
      title: 'Beginner Foundation',
      icon: '🌱',
      themeColor: 'from-lime-600 to-[#3F4D2A]',
      badgeBg: 'bg-lime-100 text-lime-800 border-lime-200',
      desc: 'Step-by-step foundation classes explaining alignment, breathing, and modifications for absolute beginners.'
    }
  ];

  // Section 13: FAQ Data
  const faqs = [
    {
      q: "Do I need previous yoga experience?",
      a: "No. Sessions can be adapted for complete beginners as well as students with previous yoga experience."
    },
    {
      q: "Are the classes online?",
      a: "Yes. Classes are conducted live online."
    },
    {
      q: "How long is each session?",
      a: "Each personal session is 60 minutes."
    },
    {
      q: "How many days should I practice?",
      a: "The recommended frequency depends on your goals, schedule and current fitness level."
    },
    {
      q: "Do you offer one-on-one classes?",
      a: "Yes. Personalized one-on-one online yoga sessions are available."
    },
    {
      q: "Do you offer group classes?",
      a: "Yes, group classes are also available depending on the current schedule."
    },
    {
      q: "Can yoga help with weight management?",
      a: "Yoga can support an active and healthy lifestyle. Your practice can be combined with movement, mindful eating and consistent lifestyle habits."
    },
    {
      q: "Can I join if I have back pain or other concerns?",
      a: "Please share your condition before starting. Sessions can be modified according to individual needs, and medical advice should be followed where appropriate."
    },
    {
      q: "How can I book a class?",
      a: "Click the Free Demo button, fill in your details and connect with Anjali on WhatsApp."
    }
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F3EDE2] to-[#EBE2D3] text-slate-900 font-sans selection:bg-[#4A5D3E]/20 selection:text-[#2D3B27] pb-24 md:pb-12 relative">
      
      {/* Decorative Background Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse overflow-hidden" />
      <div className="absolute top-1/3 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-amber-200/25 rounded-full blur-3xl pointer-events-none -z-10 overflow-hidden" />

      {/* Share Link Welcome Notice Banner */}
      {isJoinLink && (
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 text-white px-4 py-3 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span>Welcome! You are on the Official Client Self-Registration Form for Yoganjali with Anjali Negi.</span>
          <button 
            onClick={() => openDemoModal()}
            className="ml-2 px-3 py-1 bg-white text-purple-900 font-extrabold rounded-full hover:bg-amber-100 transition-colors shadow-sm"
          >
            📝 Fill Demo Form
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* 1. TOP HEADER / NAVIGATION */}
      {/* ================================================== */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-2xl border-b border-[#E3D9C6] px-4 sm:px-8 py-3 shadow-md transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <img 
              src={SITE_CONFIG.logoImage} 
              alt="Yoganjali Official Brand Logo" 
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-600/30 shadow-md group-hover:scale-105 transition-all bg-white p-0.5" 
            />
            <div>
              <span className="font-serif font-extrabold text-2xl tracking-wide bg-gradient-to-r from-[#2D3B27] via-[#4A5D3E] to-[#789A65] bg-clip-text text-transparent block leading-none">
                {SITE_CONFIG.brandName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800/80 block mt-0.5">
                By {SITE_CONFIG.instructorName}
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-slate-700">
            <button 
              onClick={() => setActiveTab('home')}
              className={`transition-colors ${activeTab === 'home' ? 'text-[#4A5D3E] font-extrabold' : 'hover:text-[#4A5D3E]'}`}
            >
              Home
            </button>
            <a href="/packages" className="text-purple-900 bg-purple-100/90 hover:bg-purple-200 px-3 py-1 rounded-full transition-all flex items-center gap-1 font-extrabold shadow-xs">
              <span>💳 Fee & Packages</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            </a>
            <a href="#about" className="hover:text-[#4A5D3E] transition-colors">About</a>
            <a href="#classes" className="hover:text-[#4A5D3E] transition-colors">Classes</a>
            <a href="#benefits" className="hover:text-[#4A5D3E] transition-colors">Why Yoganjali</a>
            <a href="#goals" className="hover:text-[#4A5D3E] transition-colors">Goal Programs</a>
            <a href="#blog" className="hover:text-[#4A5D3E] transition-colors flex items-center gap-1">
              <span>Blog</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </a>
            <a href="#testimonials" className="hover:text-[#4A5D3E] transition-colors">Reviews</a>
            <a href="#faq" className="hover:text-[#4A5D3E] transition-colors">FAQ</a>
          </nav>

          {/* Right Action Buttons (Desktop & Laptop screens only - 1024px+) */}
          <div className="hidden lg:flex items-center gap-3">
            
            {/* WhatsApp Icon Button */}
            <button
              onClick={() => handleDirectWhatsAppChat()}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 transition-all border border-emerald-200/80 shadow-sm hover:scale-105"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Primary CTA Button */}
            <button
              onClick={() => openDemoModal()}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#4A5D3E] via-[#3F4D2A] to-[#2D3B27] hover:from-emerald-800 hover:to-[#2D3B27] text-white font-extrabold text-xs shadow-md shadow-emerald-950/20 hover:scale-105 active:scale-95 transition-all"
            >
              FREE DEMO CLASS
            </button>
          </div>

          {/* Mobile Menu Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-2xl bg-white border border-[#E3D9C6] text-slate-700 shadow-sm"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 p-5 bg-white/95 backdrop-blur-xl rounded-3xl border border-[#E3D9C6] shadow-2xl space-y-3 text-xs font-bold text-slate-800 animate-fadeIn">
            <a href="/packages" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-xl bg-purple-100 text-purple-950 font-black flex items-center justify-between">
              <span>💳 Fee & Packages (Official Plans)</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px]">View</span>
            </a>
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-700">Home</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-700">About Anjali</a>
            <a href="#classes" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-700">Yoga Programs</a>
            <a href="#benefits" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-700">Why Choose Yoganjali</a>
            <a href="#goals" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-700">Targeted Goal Programs</a>
            <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-emerald-800 font-extrabold flex items-center justify-between">
              <span>🌿 Yoga Blog & Guides</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] text-emerald-900">New</span>
            </a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-700">Student Reviews</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-emerald-700">FAQ</a>
            
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openDemoModal();
                }}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-[#4A5D3E] to-[#2D3B27] text-white font-extrabold text-xs shadow-md text-center"
              >
                FREE DEMO CLASS
              </button>

              <button
                onClick={() => handleDirectWhatsAppChat()}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ================================================== */}
      {/* HERO SECTION */}
      {/* ================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-12">
        
        <section id="home" className="pt-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Content Left */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 via-amber-100 to-rose-100 border border-emerald-300/50 text-[#2D3B27] text-xs font-extrabold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>{cms.heroTagline}</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#2D3B27] tracking-tight leading-[1.1] drop-shadow-sm">
              {cms.heroTitle}
            </h1>

            {/* Supporting Headline & Subheading */}
            <div className="space-y-3">
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
                {cms.heroSubtitle}
              </p>
            </div>

            {/* Glowing CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => openDemoModal()}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-[#2D3B27] hover:from-emerald-500 hover:to-[#2D3B27] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <Sparkle className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>JOIN FREE DEMO CLASS</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDirectWhatsAppChat()}
                className="px-7 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4.5 h-4.5" />
                <span>CHAT ON WHATSAPP</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-[#E3D9C6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-extrabold text-[#2D3B27]">
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/60 border border-white/80 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Certified Instructor</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/60 border border-white/80 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personalized Online</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/60 border border-white/80 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Beginner Friendly</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-white/60 border border-white/80 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1-Day Free Trial</span>
              </div>
            </div>

          </div>

          {/* Hero Visual Right */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer Decorative Gradient Frames */}
              <div className="absolute -top-6 -left-6 w-full h-full rounded-[3rem] bg-gradient-to-tr from-amber-400/30 via-emerald-400/20 to-rose-400/20 -z-10 blur-xl" />
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-[3rem] bg-gradient-to-br from-[#4A5D3E] to-[#2D3B27] opacity-20 -z-10" />

              <img
                src={cms.heroImage || SITE_CONFIG.heroImage}
                alt="Anjali Negi practicing yoga"
                className="w-full h-[450px] sm:h-[530px] object-cover rounded-[3rem] shadow-2xl border-4 border-white"
              />
              
              {/* Floating Live Badge 1 */}
              <div className="absolute top-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                  ⭐
                </div>
                <div>
                  <h4 className="font-serif font-extrabold text-xs text-[#2D3B27]">5.0 Star Rated</h4>
                  <p className="text-[10px] text-emerald-700 font-bold">100+ Happy Students</p>
                </div>
              </div>

              {/* Floating Live Badge 2 */}
              <div className="absolute bottom-6 right-4 sm:-right-4 bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3 max-w-xs">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                  🌿
                </div>
                <div>
                  <h4 className="font-serif font-extrabold text-xs text-[#2D3B27]">Live 1-on-1 Guidance</h4>
                  <p className="text-[10px] text-slate-600 font-medium">Practice safely from the comfort of home</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 5. LUXURY TRUST & EXPERIENCE SECTION: WHY CHOOSE YOGANJALI */}
      {/* ================================================== */}
      <section id="benefits" className="py-24 my-10 relative overflow-hidden bg-gradient-to-br from-[#162212] via-[#263720] to-[#121B0E] text-white rounded-[3.5rem] border-2 border-emerald-500/20 shadow-2xl">
        
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-16 relative z-10">
          
          {/* Section Editorial Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-400/20 px-5 py-2 rounded-full border border-amber-300/30 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              THE YOGANJALI EXPERIENCE
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl text-white font-extrabold tracking-tight leading-tight">
              Why Choose Yoganjali?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Experience authentic, personalized yoga tailored around your unique body, goals and schedule with Trainer Anjali Negi.
            </p>
          </div>

          {/* 4 Glassmorphism Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-4 shadow-xl hover:bg-white/10 hover:border-emerald-400/40 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-110 transition-transform">
                <Compass className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif font-extrabold text-2xl text-white">Personalized Guidance</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Every flow is tailored around your individual body alignment, strength levels, and fitness aspirations.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-4 shadow-xl hover:bg-white/10 hover:border-amber-400/40 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-950/40 group-hover:scale-110 transition-transform">
                <Smile className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif font-extrabold text-2xl text-white">Beginner Friendly</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Never stepped on a yoga mat before? No problem. We start gently with complete patience and zero pressure.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-4 shadow-xl hover:bg-white/10 hover:border-rose-400/40 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif font-extrabold text-2xl text-white">Goal Based Practice</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Whether your goal is weight loss, flexibility, PCOS management or back pain relief, your journey is customized.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-4 shadow-xl hover:bg-white/10 hover:border-purple-400/40 hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-950/40 group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif font-extrabold text-2xl text-white">Online Convenience</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Enjoy high-energy live 1-on-1 and group sessions right from the comfort and privacy of your home.
              </p>
            </div>

          </div>

          {/* Studio Stats Live Highlight Bar */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <h4 className="font-serif text-3xl font-extrabold text-amber-300">100+</h4>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Active Practitioners</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-3xl font-extrabold text-emerald-400">5.0 ★</h4>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Student Satisfaction</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-3xl font-extrabold text-teal-300">98%</h4>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Batch Regularity</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-3xl font-extrabold text-rose-300">100%</h4>
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Personal Attention</p>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 6. ABOUT ANJALI SECTION */}
      {/* ================================================== */}
      <section id="about" className="py-16 relative">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Photo Left */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -bottom-6 -right-6 w-full h-full rounded-[3rem] bg-gradient-to-br from-amber-300/40 via-emerald-300/30 to-[#4A5D3E]/30 -z-10 blur-md" />
              <img
                src={cms.aboutImage || SITE_CONFIG.aboutImage}
                alt="Anjali Negi Yoga Instructor"
                className="w-full h-[480px] object-cover rounded-[3rem] shadow-2xl border-4 border-white"
              />
            </div>
          </div>

          {/* Bio Right */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3.5 py-1 rounded-full border border-emerald-200 inline-block">
                MEET YOUR INSTRUCTOR
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl font-extrabold text-[#2D3B27]">{cms.aboutTitle}</h2>
            </div>

            <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed font-sans font-medium">
              <p className="font-serif text-xl text-[#2D3B27] font-bold leading-normal italic">
                {cms.aboutQuote}
              </p>
              <p>{cms.aboutBio1}</p>
              <p>{cms.aboutBio2}</p>
            </div>

            {/* MY APPROACH Checklist */}
            <div className="pt-3">
              <h4 className="font-serif font-extrabold text-sm text-[#2D3B27] uppercase tracking-wider mb-3">MY APPROACH</h4>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { title: 'Personalized', bg: 'bg-emerald-700 text-white' },
                  { title: 'Practical', bg: 'bg-teal-700 text-white' },
                  { title: 'Sustainable', bg: 'bg-amber-700 text-white' },
                  { title: 'Beginner Friendly', bg: 'bg-rose-700 text-white' },
                  { title: 'Mind-Body Focused', bg: 'bg-[#2D3B27] text-white' }
                ].map((item) => (
                  <span key={item.title} className={`px-4 py-2 rounded-full ${item.bg} font-extrabold text-xs flex items-center gap-2 shadow-sm hover:scale-105 transition-all`}>
                    <Check className="w-4 h-4" /> {item.title}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <button
                onClick={() => openDemoModal()}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-[#2D3B27] text-white font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <span>START YOUR YOGA JOURNEY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 7. LUXURY TAILORED PROGRAMS SECTION */}
      {/* ================================================== */}
      <section id="classes" className="py-16 my-6">
        <div className="space-y-16">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-5 py-2 rounded-full border border-emerald-200 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              TAILORED PROGRAMS
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl text-[#2D3B27] font-extrabold tracking-tight">
              {cms.classesTitle}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              {cms.classesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* CARD 1: 1-ON-1 PERSONAL ONLINE CLASS (HIGHLIGHTED) */}
            <div className="bg-gradient-to-b from-[#1C2B17] via-[#2A3F23] to-[#162312] text-white rounded-[3rem] p-8 sm:p-10 border-2 border-emerald-400/40 shadow-2xl space-y-8 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <div className="absolute top-0 right-0 px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-xs uppercase tracking-wider rounded-bl-3xl shadow-lg">
                ⭐ MOST POPULAR
              </div>

              <div className="space-y-6 pt-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-serif text-3xl font-extrabold shadow-xl shadow-emerald-950/50">
                  🧘‍♀️
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-3xl text-white">Personal Online Yoga</h3>
                  <p className="text-xs font-bold text-emerald-300 mt-1">Live 1-on-1 Personalized Session</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Customized live 1-on-1 yoga adapted specifically to your body structure, health goals, injuries and daily pace.
                </p>

                <div className="pt-4 space-y-3 border-t border-white/15">
                  <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block">Core Highlights:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-200">
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Weight Loss</span>
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Core Strength</span>
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Flexibility</span>
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Joint Mobility</span>
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Stress Relief</span>
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Posture Fix</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/15">
                <button
                  onClick={() => openDemoModal('', 'Personal Online Yoga Class (1-on-1)')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>BOOK 1-ON-1 DEMO CLASS</span>
                </button>
              </div>
            </div>

            {/* CARD 2: GROUP YOGA BATCHES */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 sm:p-10 border border-[#E3D9C6] shadow-xl space-y-8 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl hover:border-amber-400/50 hover:scale-[1.01] transition-all duration-300">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-serif text-3xl font-extrabold shadow-lg shadow-amber-900/20">
                  👥
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-3xl text-[#2D3B27]">Group Yoga Classes</h3>
                  <p className="text-xs font-bold text-amber-700 mt-1">Live Interactive Cohort</p>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  High-energy live group classes designed to build steady practice consistency, movement discipline, and community motivation.
                </p>

                <div className="pt-4 space-y-3 border-t border-[#E3D9C6]">
                  <span className="text-[11px] font-black text-[#2D3B27] uppercase tracking-widest block">Benefits:</span>
                  <div className="space-y-2.5 text-xs font-semibold text-slate-800">
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Community Motivation & Accountability</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Daily Practice Consistency & Discipline</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Full-Body Strength, Toning & Flexibility</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E3D9C6]">
                <button
                  onClick={() => openDemoModal('', 'Group Yoga Classes')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>JOIN A GROUP BATCH</span>
                </button>
              </div>
            </div>

            {/* CARD 3: WELLNESS & THERAPEUTIC YOGA */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 sm:p-10 border border-[#E3D9C6] shadow-xl space-y-8 flex flex-col justify-between relative overflow-hidden group hover:shadow-2xl hover:border-emerald-400/50 hover:scale-[1.01] transition-all duration-300">
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#3A4E31] to-[#202C1B] text-white flex items-center justify-center font-serif text-3xl font-extrabold shadow-lg shadow-emerald-950/20">
                  🌿
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-3xl text-[#2D3B27]">Wellness & Care</h3>
                  <p className="text-xs font-bold text-[#4A5D3E] mt-1">Therapeutic & Restorative Focus</p>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Designed for individuals recovering from stiffness, back pain, hormonal imbalances (PCOS/Thyroid), and high stress.
                </p>

                <div className="pt-4 space-y-3 border-t border-[#E3D9C6]">
                  <span className="text-[11px] font-black text-[#2D3B27] uppercase tracking-widest block">Includes:</span>
                  <div className="space-y-2 text-xs font-semibold text-slate-800">
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4A5D3E] shrink-0" /> Gentle spinal decompression & pain relief</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4A5D3E] shrink-0" /> Pranayama breathwork & Nidra</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4A5D3E] shrink-0" /> Endocrine & metabolic circulation</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E3D9C6]">
                <button
                  onClick={() => openDemoModal('', 'Wellness-Focused Yoga')}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#3A4E31] to-[#202C1B] hover:from-emerald-800 hover:to-[#202C1B] text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>LEARN MORE & CONNECT</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 8. GOAL-BASED YOGA SECTION */}
      {/* ================================================== */}
      <section id="goals" className="py-24 space-y-14">
        
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-rose-800 bg-rose-100 px-4 py-1.5 rounded-full border border-rose-200 inline-block">
            INTERACTIVE PRACTICE GOALS
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#2D3B27] font-extrabold">What Are You Working On?</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Click any goal to reveal how personalized yoga can support your journey.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {goalsData.map((item) => {
            const isSelected = activeGoalCard === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActiveGoalCard(isSelected ? null : item.id)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all duration-300 space-y-3 text-center ${
                  isSelected 
                    ? `bg-gradient-to-br ${item.themeColor} text-white border-transparent shadow-2xl scale-105` 
                    : 'bg-white/80 backdrop-blur-md text-[#2D3B27] border-[#E3D9C6] hover:border-emerald-600/50 hover:bg-white hover:shadow-xl'
                }`}
              >
                <span className="text-4xl block animate-bounce-slow">{item.icon}</span>
                <h3 className="font-serif font-extrabold text-sm leading-tight">{item.title}</h3>
                
                {isSelected && (
                  <div className="pt-3 border-t border-white/20 space-y-3 animate-fadeIn text-left text-xs font-sans">
                    <p className="text-white/90 text-[11px] leading-relaxed font-medium">{item.desc}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectWhatsAppChat(`Hi Anjali! I would like to talk about personalized Yoga for ${item.title}. 🌿`);
                      }}
                      className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-[11px] shadow-md flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> Talk on WhatsApp
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ================================================== */}
      {/* 9. LUXURY SIMPLE ONBOARDING SECTION */}
      {/* ================================================== */}
      <section id="onboarding" className="py-24 my-10 relative overflow-hidden bg-gradient-to-br from-[#162312] via-[#273820] to-[#121B0E] text-white rounded-[3.5rem] border-2 border-emerald-500/20 shadow-2xl">
        
        {/* Glow Orbs */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-16 relative z-10">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-400/20 px-5 py-2 rounded-full border border-amber-300/30 inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              SIMPLE 4-STEP ONBOARDING
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl text-white font-extrabold tracking-tight">
              Your Yoga Journey Starts Here
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Starting your practice with Anjali Negi is simple, welcoming and completely personalized.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* STEP 1 */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl hover:bg-white/10 hover:border-emerald-400/40 hover:-translate-y-2 transition-all duration-300 group relative">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-serif font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-110 transition-transform">
                  1
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                  Step 1
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-extrabold text-2xl text-white">Book Free Demo</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Fill out the 1-minute demo form or click to connect directly with Anjali on WhatsApp.
                </p>
              </div>
            </div>

            {/* STEP 2 */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl hover:bg-white/10 hover:border-amber-400/40 hover:-translate-y-2 transition-all duration-300 group relative">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-serif font-black text-xl flex items-center justify-center shadow-lg shadow-amber-950/40 group-hover:scale-110 transition-transform">
                  2
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                  Step 2
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-extrabold text-2xl text-white">Share Your Goals</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Discuss your health goals, medical background, back pain/PCOS issues and schedule.
                </p>
              </div>
            </div>

            {/* STEP 3 */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl hover:bg-white/10 hover:border-rose-400/40 hover:-translate-y-2 transition-all duration-300 group relative">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white font-serif font-black text-xl flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-110 transition-transform">
                  3
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-400/30">
                  Step 3
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-extrabold text-2xl text-white">Custom Practice</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Attend your live demo class where postures & pranayama are tailored specifically for you.
                </p>
              </div>
            </div>

            {/* STEP 4 */}
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 space-y-6 shadow-xl hover:bg-white/10 hover:border-teal-400/40 hover:-translate-y-2 transition-all duration-300 group relative">
              <div className="flex items-center justify-between">
                <span className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-serif font-black text-xl flex items-center justify-center shadow-lg shadow-teal-950/40 group-hover:scale-110 transition-transform">
                  4
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/30">
                  Step 4
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-extrabold text-2xl text-white">Consistent Progress</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Join regular monthly group or 1-on-1 batches to build strength, flexibility and peace.
                </p>
              </div>
            </div>

          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => openDemoModal()}
              className="px-9 py-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>START STEP 1 - BOOK FREE DEMO</span>
            </button>
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 10. WHAT A 60-MINUTE CLASS LOOKS LIKE */}
      {/* ================================================== */}
      <section className="py-16 space-y-14">
        
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-100 px-4 py-1.5 rounded-full border border-teal-200 inline-block">
            CLASS TIMELINE
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl text-[#2D3B27] font-extrabold">60 Minutes For You</h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">Every session is structured to balance movement, strength, breath and relaxation.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <div className="bg-gradient-to-b from-indigo-50 to-white p-5 rounded-3xl border border-indigo-200 text-center space-y-3 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-black text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full inline-block">5 min</span>
            <h4 className="font-serif font-extrabold text-xs text-[#2D3B27]">Breath Centering</h4>
          </div>

          <div className="bg-gradient-to-b from-emerald-50 to-white p-5 rounded-3xl border border-emerald-200 text-center space-y-3 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full inline-block">10 min</span>
            <h4 className="font-serif font-extrabold text-xs text-[#2D3B27]">Joint Mobility</h4>
          </div>

          <div className="bg-gradient-to-b from-amber-50 to-white p-5 rounded-3xl border border-amber-200 text-center space-y-3 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full inline-block">20 min</span>
            <h4 className="font-serif font-extrabold text-xs text-[#2D3B27]">Yoga Asanas</h4>
          </div>

          <div className="bg-gradient-to-b from-rose-50 to-white p-5 rounded-3xl border border-rose-200 text-center space-y-3 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-full inline-block">10 min</span>
            <h4 className="font-serif font-extrabold text-xs text-[#2D3B27]">Strength Focus</h4>
          </div>

          <div className="bg-gradient-to-b from-teal-50 to-white p-5 rounded-3xl border border-teal-200 text-center space-y-3 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-black text-teal-700 bg-teal-100 px-3 py-1 rounded-full inline-block">10 min</span>
            <h4 className="font-serif font-extrabold text-xs text-[#2D3B27]">Pranayama</h4>
          </div>

          <div className="bg-gradient-to-b from-purple-50 to-white p-5 rounded-3xl border border-purple-200 text-center space-y-3 shadow-sm hover:shadow-md transition-all">
            <span className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full inline-block">5 min</span>
            <h4 className="font-serif font-extrabold text-xs text-[#2D3B27]">Deep Relaxation</h4>
          </div>

        </div>

      </section>



      {/* ================================================== */}
      {/* 11. YOGA INSIGHTS & HOLISTIC WELLNESS BLOG SECTION */}
      {/* ================================================== */}
      <section id="blog" className="py-24 space-y-12">
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4.5 py-1.5 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
            <span>YOGA INSIGHTS & HOLISTIC GUIDES</span>
          </span>

          <h2 className="font-serif text-4xl sm:text-6xl text-[#2D3B27] font-extrabold tracking-tight">
            Knowledge for Your Mat & Mind
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Explore authentic posture alignment, back pain recovery, breathwork science, and mindful health guides written by Trainer Anjali Negi.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {Array.from(new Set(['All', ...(blogs || []).filter(b => b.isPublished).map(b => b.category).filter(Boolean)])).map((cat) => {
              const count = cat === 'All' 
                ? (blogs || []).filter(b => b.isPublished).length 
                : (blogs || []).filter(b => b.isPublished && b.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setBlogFilterCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                    blogFilterCategory === cat
                      ? 'bg-[#2D3B27] text-white shadow-md ring-2 ring-emerald-600/30'
                      : 'bg-white/80 text-slate-700 hover:bg-white border border-[#E3D9C6] hover:border-emerald-500'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="ml-1.5 opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Blog Post Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {(blogs || [])
            .filter(b => b.isPublished)
            .filter(b => blogFilterCategory === 'All' || b.category === blogFilterCategory)
            .slice(0, 3)
            .map((post) => (
              <div
                key={post.id}
                onClick={() => {
                  setSelectedBlogForModal(post);
                  setIsBlogModalOpen(true);
                }}
                className="group bg-white/95 backdrop-blur-md rounded-3xl border border-[#E3D9C6] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1 relative"
              >
                <div>
                  {/* Card Cover Image */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Category Badge */}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black border border-white/20">
                      {post.category}
                    </span>

                    {/* Date and Read Time Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-300" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-300" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Card Title & Excerpt */}
                  <div className="p-6 space-y-3">
                    <h3 className="font-serif font-extrabold text-lg sm:text-xl text-[#2D3B27] group-hover:text-emerald-800 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer / Author & CTA */}
                <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-2 pt-3">
                    <img
                      src={post.authorPhoto || '/anjali-hero.jpg'}
                      alt={post.author}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500 bg-white"
                    />
                    <span className="text-xs font-bold text-slate-800">{post.author}</span>
                  </div>

                  <span className="pt-3 text-xs font-black text-emerald-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                  </span>
                </div>
              </div>
            ))}
        </div>

      </section>

      {/* ================================================== */}
      {/* 12. TESTIMONIALS & GOOGLE REVIEWS */}
      {/* ================================================== */}
      <section id="testimonials" className="py-24 space-y-14">
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4.5 py-1.5 rounded-full border border-emerald-200 inline-block">
            VERIFIED STUDENT REVIEWS
          </span>

          <h2 className="font-serif text-4xl sm:text-6xl text-[#2D3B27] font-extrabold">What My Students Say</h2>
          
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-[#E3D9C6] shadow-sm">
              <span className="text-blue-600 text-base font-black">G</span>
              <span>5.0 ★★★★★ Rated on Google Reviews</span>
            </div>

            <a
              href={SITE_CONFIG.socials.googleReviews}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#4A5D3E] via-[#3F4D2A] to-[#2D3B27] hover:from-emerald-800 hover:to-[#2D3B27] text-white font-extrabold text-xs shadow-md hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>VIEW GOOGLE REVIEWS ↗</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SITE_CONFIG.testimonials.map((t) => (
            <div key={t.id} className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-[#E3D9C6] shadow-xl space-y-5 flex flex-col justify-between hover-lift relative overflow-hidden group">
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                    <span className="text-blue-600 font-black text-xs">G</span> Google
                  </span>
                </div>

                <p className="text-xs text-slate-700 italic leading-relaxed font-medium">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#E3D9C6] flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-extrabold text-sm text-[#2D3B27]">{t.name}</h4>
                  {t.location && <p className="text-[10px] text-slate-500 font-semibold">{t.location}</p>}
                </div>

                <a 
                  href={SITE_CONFIG.socials.googleReviews} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  Verified ↗
                </a>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ================================================== */}
      {/* 13. FAQ SECTION */}
      {/* ================================================== */}
      <section id="faq" className="py-24 bg-white/70 backdrop-blur-xl border-y border-[#E3D9C6]">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full border border-emerald-200 inline-block">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#2D3B27] font-extrabold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaqIndex === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-[#FAF7F2] rounded-3xl border border-[#E3D9C6] overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                    className="w-full p-6 text-left font-serif font-extrabold text-base text-[#2D3B27] flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-emerald-700 shrink-0" /> : <ChevronDown className="w-5 h-5 text-emerald-700 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans border-t border-[#E3D9C6]/60 pt-4 animate-fadeIn font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================================================== */}
      {/* 14. ELEGANT LUXURY SANCTUARY FINAL CTA SECTION */}
      {/* ================================================== */}
      <section id="contact" className="py-24 my-10 relative">
        <div className="bg-gradient-to-br from-[#121B0D] via-[#22351C] to-[#0F170B] rounded-[3.5rem] p-8 sm:p-16 text-[#FAF7F2] shadow-2xl relative overflow-hidden border-2 border-emerald-400/30">
          
          {/* Ambient Gold & Emerald Lighting */}
          <div className="absolute -top-24 -right-24 w-[550px] h-[550px] bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-[550px] h-[550px] bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Photo & Floating Badges */}
            <div className="lg:col-span-5 relative order-2 lg:order-1">
              <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                
                {/* Decorative Frame Orbs */}
                <div className="absolute -top-6 -left-6 w-full h-full rounded-[3rem] bg-gradient-to-tr from-amber-400/30 via-emerald-400/20 to-teal-400/20 -z-10 blur-lg" />
                <div className="absolute -bottom-6 -right-6 w-full h-full rounded-[3rem] bg-black/40 -z-10" />

                <img 
                  src={cms.contactImage || "/anjali-mountain-pose.jpg"} 
                  alt="Anjali Negi Yoga Coach Outdoor Mountain Pose" 
                  className="w-full h-[400px] sm:h-[480px] object-cover rounded-[3rem] shadow-2xl border-4 border-white/20"
                />



                {/* Floating Badge 2 */}
                <div className="absolute bottom-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl border border-white/80 text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                    🌿
                  </div>
                  <div>
                    <h4 className="font-serif font-extrabold text-xs text-[#2D3B27]">1-Day Free Trial</h4>
                    <p className="text-[10px] text-slate-600 font-medium">No credit card needed</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Editorial Content */}
            <div className="lg:col-span-7 space-y-8 text-left order-1 lg:order-2">
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-amber-400/20 via-emerald-400/20 to-teal-400/20 border border-amber-300/40 text-amber-200 text-xs font-black uppercase tracking-widest shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>YOUR YOGA JOURNEY STARTS HERE</span>
                </div>

                <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] drop-shadow-md">
                  Ready to Transform Your Body & Peace of Mind?
                </h2>

                <p className="text-xs sm:text-base text-slate-200 font-medium max-w-xl leading-relaxed">
                  Take your first step today with live, personalized guidance from Certified Yoga Instructor Anjali Negi. Book your 100% free 1-day demo session now!
                </p>
              </div>

              {/* 3 Checklist Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-extrabold text-emerald-200">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-Day Free Trial</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-on-1 & Group</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Beginner Friendly</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => openDemoModal()}
                  className="px-9 py-4 sm:py-5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-emerald-950/60 ring-2 ring-emerald-300/40"
                >
                  <Sparkle className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                  <span>JOIN FREE DEMO CLASS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDirectWhatsAppChat()}
                  className="px-8 py-4 sm:py-5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-emerald-400/40"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-200" />
                  <span>CHAT ON WHATSAPP ({SITE_CONFIG.displayPhone})</span>
                </button>
              </div>

              {/* Direct Hotline Footer */}
              <div className="pt-4 border-t border-white/10 text-slate-300 text-xs font-semibold flex flex-wrap items-center gap-6">
                <span>Primary WhatsApp: <strong className="text-emerald-400">{SITE_CONFIG.displayPhone}</strong></span>
                <span>•</span>
                <span>Alternative Hotline: <strong className="text-amber-300">{SITE_CONFIG.displayPhone2}</strong></span>
              </div>

            </div>

          </div>

        </div>
      </section>

      </main>

      {/* ================================================== */}
      {/* 15. FOOTER */}
      {/* ================================================== */}
      <footer className="bg-[#1E2917] text-[#FAF7F2] pt-14 pb-8 border-t border-[#4A5D3E]/40 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#4A5D3E]/30 text-xs font-sans">
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img 
                src={SITE_CONFIG.logoImage} 
                alt="Yoganjali Logo" 
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-amber-300/40 shadow-md bg-white p-0.5" 
              />
              <h3 className="font-serif font-extrabold text-2xl text-white tracking-wide">{SITE_CONFIG.brandName}</h3>
            </div>
            <p className="text-slate-300 font-medium">By {SITE_CONFIG.instructorName}</p>
            <p className="text-amber-300 italic font-serif text-xs">"{SITE_CONFIG.tagline}"</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-2 text-xs">Quick Links</h4>
            <button onClick={() => setActiveTab('home')} className="block text-slate-300 hover:text-white transition-colors">Home</button>
            <a href="#about" className="block text-slate-300 hover:text-white transition-colors">About</a>
            <a href="#classes" className="block text-slate-300 hover:text-white transition-colors">Classes</a>
            <a href="#benefits" className="block text-slate-300 hover:text-white transition-colors">Why Yoganjali</a>
            <a href="#blog" className="block text-amber-300 hover:text-white font-bold transition-colors">🌿 Yoga Insights Blog</a>
            <a href="#faq" className="block text-slate-300 hover:text-white transition-colors">FAQ</a>
            <a href="/panel" className="block text-slate-400 hover:text-white transition-colors text-[11px] pt-1">🔐 Trainer Panel</a>
            <a href="/members" className="block text-slate-400 hover:text-white transition-colors text-[11px]">🧘 Our Yogis</a>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-2 text-xs">Social Connections</h4>
            <a href={SITE_CONFIG.socials.instagram} target="_blank" rel="noopener noreferrer" className="block text-slate-300 hover:text-white transition-colors">Instagram (@Yoganjali25)</a>
            <a href={SITE_CONFIG.socials.youtube} target="_blank" rel="noopener noreferrer" className="block text-slate-300 hover:text-white transition-colors">YouTube (Yoganjali25)</a>
            <a href={SITE_CONFIG.socials.linkedin} target="_blank" rel="noopener noreferrer" className="block text-slate-300 hover:text-white transition-colors">LinkedIn (@anjalinegi25)</a>
            <button onClick={() => handleDirectWhatsAppChat()} className="block text-slate-300 hover:text-white text-left transition-colors">WhatsApp Direct</button>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-white uppercase tracking-wider mb-2 text-xs">Direct Contact</h4>
            <p className="text-slate-300 font-medium">WhatsApp / Call: {SITE_CONFIG.displayPhone}</p>
            <p className="text-slate-300 font-medium">WhatsApp / Call 2: {SITE_CONFIG.displayPhone2}</p>
            <p className="text-slate-300 font-medium">Email: {SITE_CONFIG.email}</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 text-center text-[11px] text-slate-400 font-semibold">
          <p>© 2026 Yoganjali • All rights reserved. Designed for Anjali Negi Yoga & Wellness.</p>
        </div>
      </footer>

      {/* ================================================== */}
      {/* 18. MOBILE STICKY BOTTOM BAR - SLEEK COMPACT FLOATING DESIGN */}
      {/* ================================================== */}
      <div className="fixed bottom-3 left-3 right-3 z-40 lg:hidden bg-[#2D3B27]/95 backdrop-blur-xl border border-emerald-800/50 p-2 rounded-2xl shadow-2xl flex items-center gap-2 max-w-md mx-auto">
        <button
          onClick={() => openDemoModal()}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#1E271A] font-black text-xs uppercase tracking-wider shadow-sm text-center flex items-center justify-center gap-1 transition-all active:scale-95"
        >
          <span>✨ FREE DEMO</span>
        </button>

        <button
          onClick={() => handleDirectWhatsAppChat()}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-sm text-center flex items-center justify-center gap-1.5 transition-all active:scale-95"
        >
          <MessageCircle className="w-4 h-4 text-white" />
          <span>WHATSAPP</span>
        </button>
      </div>

      {/* BLOG ARTICLE READER MODAL */}
      <BlogArticleModal
        post={selectedBlogForModal}
        isOpen={isBlogModalOpen}
        onClose={() => {
          setIsBlogModalOpen(false);
          // If URL was /blog/slug, reset clean history without reloading
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/blog/')) {
            window.history.pushState(null, '', '/');
          }
        }}
        onOpenDemoModal={(goal, prog) => openDemoModal(goal, prog)}
        allPosts={blogs || []}
        onSelectPost={(p) => setSelectedBlogForModal(p)}
      />

      {/* LEAD FORM MODAL */}
      <FreeDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        defaultGoal={selectedGoalForModal}
        defaultProgram={selectedProgramForModal}
      />

    </div>
  );
};
