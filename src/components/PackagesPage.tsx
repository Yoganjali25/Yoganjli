import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Check, 
  Sparkles, 
  Clock, 
  Users, 
  User, 
  ShieldCheck, 
  Heart, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  Copy, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  Calendar, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Zap,
  Award,
  Video,
  Info,
  X
} from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

export const PackagesPage: React.FC = () => {
  const { packagesCMS, websiteCMS } = useApp();
  const cms = packagesCMS || {};

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedIfsc, setCopiedIfsc] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<{ open: boolean; title: string; price: number | string } | null>(null);

  const upiId = cms.upiId || '9528191678@axl';
  const accountName = cms.accountName || 'Anjali';
  const bankName = cms.bankName || 'State Bank of India';
  const accountNumber = cms.accountNumber || '39933201060';
  const ifscCode = cms.ifscCode || 'SBIN0008778';
  const branch = cms.branch || 'Nauti, Uttarakhand';
  const paymentPhone = cms.paymentPhone || '+91 9528191678';
  const rawWhatsApp = paymentPhone.replace(/[^0-9]/g, '');

  const personalMonthly = cms.personalMonthlyPrice || 7999;
  const personalOriginal = cms.personalMonthlyOriginalPrice || 9999;
  const personalSingle = cms.personalSinglePrice || 799;

  const groupMonthly = cms.groupMonthlyPrice || 2000;
  const groupOriginal = cms.groupMonthlyOriginalPrice || 2999;

  const handleCopy = (text: string, type: 'upi' | 'account' | 'ifsc') => {
    navigator.clipboard.writeText(text);
    if (type === 'upi') {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } else if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    } else if (type === 'ifsc') {
      setCopiedIfsc(true);
      setTimeout(() => setCopiedIfsc(false), 2500);
    }
  };

  const getWhatsAppBookingUrl = (planTitle: string, priceStr: string) => {
    const text = encodeURIComponent(`Namaste Anjali ji! 🙏\n\nI want to enroll in the *${planTitle}* (${priceStr}) on Yoganjali Studio.\n\nPlease share the class batch timings and payment confirmation details.`);
    return `https://wa.me/${rawWhatsApp}?text=${text}`;
  };

  const getFreeDemoWhatsAppUrl = () => {
    const text = encodeURIComponent(`Namaste Anjali ji! 🙏\n\nI would like to book a *1-Day Free Trial Demo Class* on Yoganjali Studio.\n\nPlease let me know the available time slots.`);
    return `https://wa.me/${rawWhatsApp}?text=${text}`;
  };

  // QR Code URL using standard UPI payment intent
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountName)}&cu=INR`)}`;

  const faqs = [
    {
      q: "How are the online yoga sessions conducted?",
      a: "All sessions are conducted live in real-time via Google Meet / Zoom with two-way camera interaction. Instructor Anjali Negi provides live posture corrections, breathwork pacing, and personalized guidance just like an in-person studio."
    },
    {
      q: "What is the difference between Personal and Group classes?",
      a: "1-on-1 Personal Yoga is tailored strictly for your body goals (weight loss, back pain, posture correction, flexibility) with flexible scheduling. Group Classes offer an energetic, community-driven practice suitable for daily wellness, beginners, and regular practice."
    },
    {
      q: "Can I attend a trial class before making a monthly payment?",
      a: "Yes! We offer a 1-Day Free Trial Demo session so you can experience the live practice, instruction style, and interaction before enrolling in a monthly plan."
    },
    {
      q: "How do I confirm my enrollment after making the payment?",
      a: "Simply take a screenshot of your successful UPI / Bank Transfer and send it to +91 9528191678 on WhatsApp. You will receive your official Yoganjali member portal link and batch meeting invite immediately."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-emerald-50/30 to-purple-50/30 font-sans text-slate-800 selection:bg-purple-500 selection:text-white pb-20">
      
      {/* 1. TOP HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <img 
              src="/yoganjali-logo.png" 
              alt="Yoganjali Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-105 transition-transform" 
            />
            <div>
              <span className="text-base sm:text-xl font-black tracking-wider text-emerald-950 block font-serif">
                YOGANJALI
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 tracking-wide block">
                By Anjali Negi • Online Yoga
              </span>
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-4">
            <a 
              href="/"
              className="hidden md:inline-flex text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors px-3 py-1.5"
            >
              ← Back to Studio Home
            </a>
            
            <a 
              href={getFreeDemoWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Book Free Demo</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6 overflow-hidden text-center">
        {/* Background Subtle Blooms */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-emerald-200/40 via-purple-200/30 to-amber-200/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-900 text-xs font-black uppercase tracking-widest shadow-xs">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>{cms.badge || "Official 2026 Fee Structure"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 font-serif tracking-tight leading-tight">
            {cms.title || "ONLINE YOGA FOR EVERY YOU"}
          </h1>

          <p className="text-base sm:text-xl font-bold text-emerald-900/90 max-w-2xl mx-auto">
            {cms.subtitle || "Heal Your Body • Calm Your Mind • Elevate Your Life"}
          </p>

          <p className="text-xs sm:text-sm font-medium text-slate-600 max-w-xl mx-auto">
            {cms.heroTagline || "Live Interactive Online Yoga Sessions Tailored to Your Body, Your Goals & Your Daily Lifestyle."}
          </p>

          {/* Quick Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-4 text-xs font-extrabold text-slate-700">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <Video className="w-4 h-4 text-purple-600" /> Live on Google Meet / Zoom
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Certified Instructor
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <Heart className="w-4 h-4 text-rose-500" /> Tailored Posture Care
            </span>
          </div>
        </div>
      </section>

      {/* 3. MAIN PACKAGES PRICING CARDS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* PACKAGE 1: ONE-ON-ONE PERSONAL YOGA */}
          <div className="relative bg-white rounded-3xl p-6 sm:p-9 border-2 border-purple-200/90 shadow-xl shadow-purple-500/5 flex flex-col justify-between hover:border-purple-400 transition-all group">
            <div className="space-y-6">
              
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-[11px] font-black uppercase tracking-wider mb-2">
                    <User className="w-3.5 h-3.5 text-purple-700" />
                    1-on-1 Personalized Guidance
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                    {cms.personalTitle || "One-On-One Personal Yoga Sessions"}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {cms.personalSubtitle || "Personalized yoga guidance tailored to your body, your health goals & your lifestyle."}
              </p>

              {/* Focus Tags */}
              <div>
                <span className="text-[11px] font-extrabold text-purple-950 uppercase tracking-wider block mb-2">
                  Targeted Health Focus:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(cms.personalFocusTags || [
                    "Weight Loss",
                    "Flexibility & Mobility",
                    "Strength Building",
                    "Stress Management",
                    "Back Pain Relief",
                    "Better Posture & Wellness"
                  ]).map((tag: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200/60"
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing Box */}
              <div className="bg-gradient-to-br from-purple-50 via-purple-100/40 to-stone-50 p-5 rounded-2xl border border-purple-200/80 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-black text-purple-800 uppercase tracking-widest block">
                      Monthly Package Plan
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-black text-purple-950">
                        ₹{personalMonthly.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm font-bold text-slate-400 line-through">
                        ₹{personalOriginal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-extrabold text-purple-700">/ month</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
                    Save 20%
                  </span>
                </div>

                <div className="pt-2.5 border-t border-purple-200/60 flex items-center justify-between text-xs font-bold text-purple-900">
                  <span>Or Single Session Pass:</span>
                  <span className="font-extrabold text-sm text-purple-950 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                    ₹{personalSingle.toLocaleString('en-IN')} / session
                  </span>
                </div>
              </div>

              {/* What's Included */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block">
                  What's Included in Personal Package:
                </span>
                <ul className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700">
                  {(cms.personalFeatures || [
                    "Personalized Yoga Plan crafted for your body type",
                    "Live Online Sessions (Google Meet / Zoom)",
                    "Pranayama & Custom Breathwork Pacing",
                    "Meditation & Deep Stress Relaxation",
                    "Weekly Progress & Posture Alignment Tracking",
                    "Direct WhatsApp Support & Trainer Chat Access"
                  ]).map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-8 space-y-2.5">
              <a
                href={getWhatsAppBookingUrl("1-on-1 Personal Yoga (Monthly)", `₹${personalMonthly.toLocaleString('en-IN')} / month`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-700/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enroll in Personal Yoga (₹{personalMonthly.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => setShowPaymentModal({ open: true, title: "1-on-1 Personal Yoga Session", price: `₹${personalMonthly.toLocaleString('en-IN')}` })}
                className="w-full py-3 px-6 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs flex items-center justify-center gap-2 border border-purple-200 transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-purple-700" />
                <span>View Direct UPI & Bank Details</span>
              </button>
            </div>
          </div>

          {/* PACKAGE 2: GROUP YOGA CLASSES */}
          <div className="relative bg-gradient-to-b from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-9 border-2 border-emerald-500 shadow-2xl shadow-emerald-950/20 flex flex-col justify-between hover:border-emerald-400 transition-all group">
            
            {/* Best Value Floating Ribbon */}
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-amber-950" /> Most Popular Batch
            </div>

            <div className="space-y-6">
              
              {/* Card Header */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-[11px] font-black uppercase tracking-wider mb-2">
                  <Users className="w-3.5 h-3.5 text-emerald-300" />
                  Practice Together • Grow Together
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white font-serif">
                  {cms.groupTitle || "Group Yoga Classes"}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                {cms.groupSubtitle || "Practice in an energetic, supportive group setting with live daily guidance & rhythm."}
              </p>

              {/* Target Audience Badges */}
              <div>
                <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider block mb-2">
                  Perfect For Everyone:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(cms.groupAudienceTags || [
                    "Beginners",
                    "Working Professionals",
                    "Homemakers",
                    "Seniors",
                    "Wellness Enthusiasts"
                  ]).map((aud: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/10 text-emerald-200 border border-white/10"
                    >
                      👥 {aud}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing Box */}
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest block">
                      Monthly Group Batch Fee
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-black text-amber-300">
                        ₹{groupMonthly.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm font-bold text-emerald-400/80 line-through">
                        ₹{groupOriginal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-200">/ month</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                    Limited Seats
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200 font-medium pt-1">
                  🌐 Live Morning & Evening Online Group Batches via Zoom / Meet
                </p>
              </div>

              {/* What's Included */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-black text-emerald-200 uppercase tracking-wider block">
                  What's Included in Group Class:
                </span>
                <ul className="space-y-2 text-xs sm:text-sm font-semibold text-emerald-100">
                  {(cms.groupFeatures || [
                    "Live Interactive Group Yoga Sessions",
                    "Guided Pranayama & Breath Control",
                    "Mindfulness & Meditation Practices",
                    "Recorded Session Access (Optional)",
                    "Friendly & Supportive Community Support"
                  ]).map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center shrink-0 mt-0.5 font-black">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-8 space-y-2.5">
              <a
                href={getWhatsAppBookingUrl("Group Yoga Class (Monthly)", `₹${groupMonthly.toLocaleString('en-IN')} / month`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Group Batch (₹{groupMonthly.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={getFreeDemoWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-white/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Book 1-Day Free Trial Demo First</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 4. REAL YOGA ASANA PHOTOGRAPHY GALLERY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center space-y-2 mb-8">
          <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full uppercase tracking-wider">
            📸 Studio In Action
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-serif">
            Authentic Yoga Under Certified Guidance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
            Learn postures with proper alignment, breathe freely, and build true physical strength.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Photo 1 */}
          <div 
            onClick={() => setSelectedImageModal(cms.photoTerrace || "/yoga_pose_terrace.jpg")}
            className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer bg-slate-100"
          >
            <img 
              src={cms.photoTerrace || "/yoga_pose_terrace.jpg"} 
              alt="Anjali Negi Yoga Pose - Utthita Hasta Padangusthasana" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Balance & Flexibility</span>
              <h4 className="text-base font-black font-serif">Utthita Hasta Padangusthasana</h4>
              <p className="text-[11px] text-slate-200">Standing Hand-to-Big-Toe Balance on Mountain Terrace</p>
            </div>
          </div>

          {/* Photo 2 */}
          <div 
            onClick={() => setSelectedImageModal(cms.photoPlank || "/yoga_pose_plank.jpg")}
            className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer bg-slate-100"
          >
            <img 
              src={cms.photoPlank || "/yoga_pose_plank.jpg"} 
              alt="Anjali Negi Yoga Pose - Vasisthasana Variation" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Core & Arm Strength</span>
              <h4 className="text-base font-black font-serif">Side Plank Split Reach</h4>
              <p className="text-[11px] text-slate-200">Advanced Core Stability & Hip Flexibility</p>
            </div>
          </div>

          {/* Photo 3 */}
          <div 
            onClick={() => setSelectedImageModal(cms.photoBeach || "/yoga_pose_beach.jpg")}
            className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer bg-slate-100"
          >
            <img 
              src={cms.photoBeach || "/yoga_pose_beach.jpg"} 
              alt="Anjali Negi Yoga Pose - Vyaghrasana Tiger Pose" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Spine & Back Health</span>
              <h4 className="text-base font-black font-serif">Vyaghrasana (Tiger Pose)</h4>
              <p className="text-[11px] text-slate-200">Deep Back Extension & Posture Alignment</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. PAYMENT METHODS & DIRECT TRANSFER DETAILS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              Direct Official Studio Payment
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Payment Details & Bank Transfer
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Pay securely via any UPI App (GPay, PhonePe, Paytm) or Direct NEFT / IMPS Bank Transfer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* UPI QR & ID */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
              <div className="w-40 h-40 rounded-2xl bg-stone-50 border-2 border-emerald-500/40 p-2 shrink-0 shadow-inner flex items-center justify-center">
                <img 
                  src={upiQrUrl} 
                  alt="Yoganjali UPI QR Code" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Official UPI ID</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      {upiId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(upiId, 'upi')}
                      className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <CheckCircle2 className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copiedUpi && <span className="text-[10px] font-bold text-emerald-700 block mt-1">✓ Copied to clipboard!</span>}
                </div>

                <div className="text-[11px] text-slate-500 font-medium space-y-0.5">
                  <p>• Accepted on: <strong>GPay, PhonePe, Paytm, BHIM</strong></p>
                  <p>• Instant fee verification & receipt.</p>
                </div>
              </div>
            </div>

            {/* Bank Transfer Details */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block border-b border-slate-100 pb-2">
                🏦 Bank Account Information (NEFT / IMPS):
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Account Holder</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{accountName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{bankName}</p>
                </div>
                
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Account Number</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="font-extrabold text-slate-900">{accountNumber}</p>
                    <button 
                      type="button" 
                      onClick={() => handleCopy(accountNumber, 'account')}
                      className="text-purple-600 hover:text-purple-800 cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedAccount ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">IFSC Code</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="font-extrabold text-slate-900">{ifscCode}</p>
                    <button 
                      type="button" 
                      onClick={() => handleCopy(ifscCode, 'ifsc')}
                      className="text-purple-600 hover:text-purple-800 cursor-pointer"
                      title="Copy IFSC Code"
                    >
                      {copiedIfsc ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Branch</span>
                  <p className="font-bold text-slate-700 mt-0.5">{branch}</p>
                </div>
              </div>

              {/* WhatsApp Confirmation Bar */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Namaste Anjali ji, I have completed the fee payment. Here is the transaction screenshot for confirmation.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send Screenshot on WhatsApp (+91 {rawWhatsApp.slice(-10)})</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6. IMPORTANT NOTES & GUIDELINES */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-amber-50/70 rounded-3xl p-6 sm:p-8 border border-amber-200/80 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-amber-700 shrink-0" />
            <h4 className="text-base sm:text-lg font-black text-amber-950 font-serif">
              Important Studio Guidelines & Notes
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-amber-900/90">
            {(cms.importantNotes || [
              "Sessions are non-refundable and non-transferable.",
              "Please be on time for each session to make the most of your practice.",
              "Join from a quiet space with a stable internet connection.",
              "Your consistency is the key to your transformation."
            ]).map((note: string, idx: number) => (
              <div key={idx} className="p-3 bg-white/80 rounded-xl border border-amber-200/60 flex items-start gap-2">
                <span className="font-black text-amber-700">0{idx + 1}.</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Everything you need to know about getting started.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. BOTTOM FINAL CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 text-center">
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-purple-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl space-y-5">
          <h3 className="text-2xl sm:text-4xl font-black font-serif">
            See You On The Mat! 🧘‍♀️
          </h3>
          <p className="text-xs sm:text-base text-emerald-100 max-w-xl mx-auto font-medium">
            "I am honored to be a part of your wellness journey. Let's grow, heal and transform together."
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href={getFreeDemoWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-lg hover:scale-105 transition-all"
            >
              Book Your Free Demo Class Today
            </a>
            <a
              href={`tel:${paymentPhone}`}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {paymentPhone}</span>
            </a>
          </div>
        </div>
      </section>

      {/* MODAL: IMAGE ZOOM */}
      {selectedImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-transparent">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute -top-12 right-0 text-white p-2 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={selectedImageModal} 
              alt="Zoomed Pose" 
              className="max-h-[85vh] w-auto rounded-2xl shadow-2xl object-contain mx-auto" 
            />
          </div>
        </div>
      )}

      {/* MODAL: PAYMENT QUICK DETAILS */}
      {showPaymentModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowPaymentModal(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900 font-serif">{showPaymentModal.title}</h4>
                <p className="text-xs font-extrabold text-purple-700">{showPaymentModal.price}</p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="w-44 h-44 mx-auto p-2 bg-stone-50 border-2 border-emerald-500/40 rounded-2xl">
                <img src={upiQrUrl} alt="UPI QR" className="w-full h-full object-contain rounded-xl" />
              </div>
              <p className="text-xs font-extrabold text-slate-800">Scan & Pay via any UPI App</p>
              
              <div className="flex items-center justify-center gap-2">
                <span className="font-extrabold text-xs text-purple-900 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                  {upiId}
                </span>
                <button
                  onClick={() => handleCopy(upiId, 'upi')}
                  className="p-1.5 rounded-xl bg-purple-600 text-white cursor-pointer"
                  title="Copy UPI"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <a
              href={getWhatsAppBookingUrl(showPaymentModal.title, String(showPaymentModal.price))}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Confirm on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
