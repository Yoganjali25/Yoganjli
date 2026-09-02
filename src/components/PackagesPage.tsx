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
  X,
  CreditCard,
  Maximize2,
  Instagram,
  Lock,
  Loader2
} from 'lucide-react';
import { openRazorpayCheckout } from '../utils/razorpay';
import { SITE_CONFIG } from '../config/siteConfig';

export const PackagesPage: React.FC = () => {
  const { packagesCMS, websiteCMS, addPayment, showSuccessToast } = useApp();
  const cms = packagesCMS || {};

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedIfsc, setCopiedIfsc] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  // Razorpay Checkout Modal State
  const [checkoutModal, setCheckoutModal] = useState<{
    open: boolean;
    title: string;
    amount: number;
    planType: 'personal_monthly' | 'personal_single' | 'group_monthly';
  } | null>(null);

  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    title: string;
    payerName: string;
  } | null>(null);

  // Direct Bank Modal
  const [showBankModal, setShowBankModal] = useState(false);

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

  // Trigger Razorpay Checkout
  const handleStartRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutModal) return;
    if (!payerName.trim() || !payerPhone.trim()) {
      alert('Please enter your full Name and Mobile Number.');
      return;
    }

    setIsProcessingPayment(true);

    try {
      await openRazorpayCheckout({
        amount: checkoutModal.amount,
        clientName: payerName.trim(),
        clientPhone: payerPhone.trim(),
        clientEmail: payerEmail.trim() || undefined,
        purpose: `Yoganjali Fee: ${checkoutModal.title}`,
        onSuccess: (paymentId, orderId) => {
          setIsProcessingPayment(false);
          setPaymentSuccessData({
            paymentId,
            orderId,
            amount: checkoutModal.amount,
            title: checkoutModal.title,
            payerName: payerName.trim()
          });

          // Automatically record transaction in Studio Ledger
          try {
            addPayment({
              clientId: `web_${Date.now()}`,
              clientName: payerName.trim(),
              amount: checkoutModal.amount,
              date: new Date().toISOString().split('T')[0],
              month: new Date().toISOString().slice(0, 7),
              paymentMode: 'UPI',
              paymentMethod: 'Razorpay',
              status: 'Paid',
              notes: `Online Package: ${checkoutModal.title} (Razorpay ID: ${paymentId})`
            });
          } catch (err) {
            console.warn('Auto add payment note:', err);
          }

          showSuccessToast(`🎉 Payment of ₹${checkoutModal.amount.toLocaleString('en-IN')} Received Successfully!`);
        },
        onFailure: (errMsg) => {
          setIsProcessingPayment(false);
          alert(`Payment could not be completed: ${errMsg}`);
        }
      });
    } catch (err: any) {
      setIsProcessingPayment(false);
      alert(`Error initializing payment gateway: ${err.message || err}`);
    }
  };

  // QR Code URL using standard UPI payment intent
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountName)}&cu=INR`)}`;

  const faqs = [
    {
      q: "How does the Razorpay Online Payment work?",
      a: "Razorpay allows you to pay instantly using any UPI App (Google Pay, PhonePe, Paytm, BHIM, Cred), Debit/Credit Cards, Net Banking, or Digital Wallets. You receive an instant digital receipt and immediate confirmation."
    },
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
      a: "After online payment via Razorpay, your transaction is instantly verified. You can also send a quick WhatsApp message to +91 9528191678 to receive your batch meeting invite link immediately."
    }
  ];

  // Instagram Post Mock Grid for @Yoganjali25
  const instaPosts = [
    {
      id: 'p1',
      img: cms.photoTerrace || '/yoga_pose_terrace.jpg',
      likes: '1.4k',
      caption: 'Finding balance and stability in every breath. Outdoor practice in the Himalayas. 🌄🧘‍♀️'
    },
    {
      id: 'p2',
      img: cms.photoPlank || '/yoga_pose_plank.jpg',
      likes: '2.1k',
      caption: 'Side plank reach flow for core strength & spinal alignment. Never skip your daily foundation! 💪✨'
    },
    {
      id: 'p3',
      img: cms.photoBeach || '/yoga_pose_beach.jpg',
      likes: '1.8k',
      caption: 'Deep backbends and heart opening by the river. Release stress, breathe deep. 🌿🌊'
    },
    {
      id: 'p4',
      img: '/hero-group-yoga.jpg',
      likes: '3.2k',
      caption: 'Energy of our live morning vinyasa batch. Practicing together, transforming together! 🌸👥'
    },
    {
      id: 'p5',
      img: '/anjali-mountain-pose.jpg',
      likes: '1.9k',
      caption: 'Morning meditation & alignment with nature. Consistency is the key to transformation. 🏔️'
    },
    {
      id: 'p6',
      img: '/anjali-hero.jpg',
      likes: '2.6k',
      caption: 'Step on the mat today. Your body and peace of mind will thank you. 🙏🌿'
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
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" /> Instant Razorpay Checkout
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <Video className="w-4 h-4 text-purple-600" /> Live on Google Meet / Zoom
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Certified Instructor
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
                  <span>Single Session Pass:</span>
                  <button
                    type="button"
                    onClick={() => setCheckoutModal({
                      open: true,
                      title: "1-on-1 Personal Yoga (Single Session Pass)",
                      amount: personalSingle,
                      planType: 'personal_single'
                    })}
                    className="font-extrabold text-xs text-purple-900 bg-white hover:bg-purple-100 px-3 py-1 rounded-lg border border-purple-300 transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pay ₹{personalSingle.toLocaleString('en-IN')} / session</span>
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                  </button>
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

            {/* Action Buttons with Razorpay Integration */}
            <div className="pt-8 space-y-2.5">
              <button
                type="button"
                onClick={() => setCheckoutModal({
                  open: true,
                  title: "1-on-1 Personal Yoga (Monthly Plan)",
                  amount: personalMonthly,
                  planType: 'personal_monthly'
                })}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-800 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-700/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
                <span>⚡ Pay Online via Razorpay (₹{personalMonthly.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={getWhatsAppBookingUrl("1-on-1 Personal Yoga (Monthly)", `₹${personalMonthly.toLocaleString('en-IN')} / month`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-purple-200 transition-colors text-center"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Trainer</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowBankModal(true)}
                  className="py-2.5 px-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-purple-200 transition-colors text-center cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-700" />
                  <span>UPI / Bank Transfer</span>
                </button>
              </div>
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

            {/* Action Buttons with Razorpay Integration */}
            <div className="pt-8 space-y-2.5">
              <button
                type="button"
                onClick={() => setCheckoutModal({
                  open: true,
                  title: "Group Yoga Classes (Monthly Plan)",
                  amount: groupMonthly,
                  planType: 'group_monthly'
                })}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-400/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-950 fill-amber-950" />
                <span>⚡ Pay Online via Razorpay (₹{groupMonthly.toLocaleString('en-IN')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={getFreeDemoWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-white/20 transition-colors text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Book Free Trial</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowBankModal(true)}
                  className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 border border-white/20 transition-colors text-center cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                  <span>UPI / Bank Transfer</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. REAL YOGA ASANA PHOTOGRAPHY GALLERY (CLEAN - NO TEXT ON IMAGES) */}
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
          
          {/* Photo 1 (Clean edge-to-edge, no text overlay) */}
          <div 
            onClick={() => setSelectedImageModal(cms.photoTerrace || "/yoga_pose_terrace.jpg")}
            className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer bg-slate-100"
          >
            <img 
              src={cms.photoTerrace || "/yoga_pose_terrace.jpg"} 
              alt="Anjali Negi Yoga Pose" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          {/* Photo 2 (Clean edge-to-edge, no text overlay) */}
          <div 
            onClick={() => setSelectedImageModal(cms.photoPlank || "/yoga_pose_plank.jpg")}
            className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer bg-slate-100"
          >
            <img 
              src={cms.photoPlank || "/yoga_pose_plank.jpg"} 
              alt="Anjali Negi Yoga Pose" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          {/* Photo 3 (Clean edge-to-edge, no text overlay) */}
          <div 
            onClick={() => setSelectedImageModal(cms.photoBeach || "/yoga_pose_beach.jpg")}
            className="group relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-slate-200 cursor-pointer bg-slate-100"
          >
            <img 
              src={cms.photoBeach || "/yoga_pose_beach.jpg"} 
              alt="Anjali Negi Yoga Pose" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* 5. INSTAGRAM LIVE FEED & EMBED SHOWCASE (@Yoganjali25) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-10 border border-purple-500/30 shadow-2xl text-white space-y-8">
          
          {/* Instagram Header Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shadow-xl">
                  <img 
                    src="/anjali-hero.jpg" 
                    alt="Anjali Negi Instagram" 
                    className="w-full h-full object-cover rounded-full border-2 border-slate-900"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white ring-2 ring-slate-900">
                  <Instagram className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight font-serif">
                    @Yoganjali25
                  </h3>
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black" title="Verified Creator">
                    ✓
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-purple-200 font-medium">
                  Anjali Negi • Certified Yoga & Wellness Coach
                </p>
                <p className="text-[11px] text-slate-400">
                  Daily Asanas • Posture Corrections • Online Yoga Batches
                </p>
              </div>
            </div>

            <a
              href="https://www.instagram.com/yoganjali25/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:scale-105 transition-all shrink-0"
            >
              <Instagram className="w-4 h-4" />
              <span>Follow @Yoganjali25</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Instagram Post Showcase Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {instaPosts.map((post) => (
              <a
                key={post.id}
                href="https://www.instagram.com/yoganjali25/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-white/10 shadow-md block"
              >
                <img 
                  src={post.img} 
                  alt={post.caption} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center text-white backdrop-blur-xs space-y-1">
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <span className="text-[11px] font-black flex items-center gap-1">
                    ❤️ {post.likes}
                  </span>
                  <span className="text-[9px] font-semibold text-purple-200">
                    View on Instagram
                  </span>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-purple-300 font-medium">
              Join 10,000+ Practitioners on Instagram for Daily Flows & Live Class Snippets • <a href="https://www.instagram.com/yoganjali25/" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-300 hover:text-white">instagram.com/yoganjali25</a>
            </p>
          </div>

        </div>
      </section>

      {/* 6. PAYMENT METHODS & DIRECT TRANSFER DETAILS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              Direct Official Studio Payment
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Direct UPI ID & Bank Transfer Option
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              You can also pay manually via any UPI App (GPay, PhonePe, Paytm) or Direct NEFT / IMPS Bank Transfer.
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

      {/* 7. IMPORTANT NOTES & GUIDELINES */}
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

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
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

      {/* 9. BOTTOM FINAL CTA BANNER */}
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

      {/* MODAL: RAZORPAY CHECKOUT POPUP */}
      {checkoutModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => !isProcessingPayment && setCheckoutModal(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                  ⚡ Razorpay Instant Checkout
                </span>
                <h4 className="text-lg font-black text-slate-900 font-serif mt-1">{checkoutModal.title}</h4>
                <p className="text-sm font-black text-emerald-700">Amount: ₹{checkoutModal.amount.toLocaleString('en-IN')}</p>
              </div>
              <button 
                onClick={() => !isProcessingPayment && setCheckoutModal(null)}
                disabled={isProcessingPayment}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleStartRazorpay} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional for receipt)</label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  placeholder="e.g. priya@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-[11px] text-purple-900 font-semibold space-y-1">
                <p className="flex items-center gap-1.5 font-extrabold text-purple-950">
                  <Lock className="w-3.5 h-3.5 text-purple-700" />
                  100% Secure 256-Bit SSL Encryption
                </p>
                <p className="text-purple-700">
                  Supports Google Pay, PhonePe, Paytm, All Debit/Credit Cards & NetBanking.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Proceed to Pay ₹{checkoutModal.amount.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PAYMENT SUCCESS CONFIRMATION */}
      {paymentSuccessData && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Payment Successful
              </span>
              <h3 className="text-2xl font-black text-slate-900 font-serif pt-1">
                Welcome to Yoganjali! 🌸
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Thank you <strong>{paymentSuccessData.payerName}</strong>. Your enrollment has been confirmed.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan:</span>
                <span className="font-extrabold text-slate-900">{paymentSuccessData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-extrabold text-emerald-700 text-sm">₹{paymentSuccessData.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Razorpay Payment ID:</span>
                <span className="font-mono text-[11px] font-bold text-slate-700">{paymentSuccessData.paymentId}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent(`Namaste Anjali ji! 🙏\n\nI have completed the payment of ₹${paymentSuccessData.amount.toLocaleString('en-IN')} for ${paymentSuccessData.title} on your website.\n\n• My Name: ${paymentSuccessData.payerName}\n• Razorpay ID: ${paymentSuccessData.paymentId}\n\nPlease share my batch meeting invite link!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Get Batch Invite Link on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setPaymentSuccessData(null);
                  setCheckoutModal(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIRECT BANK & UPI DETAILS */}
      {showBankModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowBankModal(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-base font-black text-slate-900 font-serif">Direct UPI & Bank Transfer</h4>
                <p className="text-xs text-slate-500 font-medium">State Bank of India & UPI</p>
              </div>
              <button 
                onClick={() => setShowBankModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="w-44 h-44 mx-auto p-2 bg-stone-50 border-2 border-emerald-500/40 rounded-2xl shadow-inner">
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

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Bank:</span>
                <span className="font-bold text-slate-900">{bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">A/C No:</span>
                <span className="font-bold text-slate-900 font-mono">{accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IFSC Code:</span>
                <span className="font-bold text-slate-900 font-mono">{ifscCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Branch:</span>
                <span className="font-bold text-slate-900">{branch}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/${rawWhatsApp}?text=${encodeURIComponent('Namaste Anjali ji, I have completed the direct fee transfer. Here is the screenshot for confirmation.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Screenshot on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
};
