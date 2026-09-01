import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  InvoiceData, 
  InvoiceLineItem, 
  InvoiceLinkItem,
  DEFAULT_SAMPLE_INVOICE, 
  numberToIndianRupeesWords 
} from '../utils/invoiceUtils';
import { 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowLeft, 
  Copy, 
  Check, 
  Eye, 
  Edit3, 
  Building, 
  User, 
  CreditCard, 
  FileText, 
  Share2, 
  RefreshCw, 
  Instagram, 
  Link as LinkIcon, 
  Upload,
  Calendar,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const InvoiceGenerator: React.FC = () => {
  const { trainerProfile, showSuccessToast, setIsClientWebsiteMode } = useApp();

  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yoganjali_saved_invoice_draft');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Migrate old collabReelLink if links array not present
          if (!parsed.links && (parsed as any).collabReelLink) {
            parsed.links = [{ id: '1', label: 'COLLAB REEL LINK:', url: (parsed as any).collabReelLink }];
          } else if (!parsed.links) {
            parsed.links = DEFAULT_SAMPLE_INVOICE.links;
          }
          return parsed;
        }
      } catch (e) {}
    }
    return {
      ...DEFAULT_SAMPLE_INVOICE,
      billerName: trainerProfile.studioName || 'Yoganjali',
      billerInstructor: trainerProfile.name || 'Anjali Negi',
      billerPhone: trainerProfile.phone || '8449137304',
      billerEmail: 'Negidytto@gmail.com',
      billerAddress: 'Srinagar Garhwal, Pauri Uttarakhand'
    };
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [copiedLink, setCopiedLink] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const billerLogoInputRef = useRef<HTMLInputElement | null>(null);
  const clientLogoInputRef = useRef<HTMLInputElement | null>(null);

  // Logo Upload Handlers
  const handleBillerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file size should be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setInvoice(prev => ({ ...prev, billerLogoUrl: reader.result as string }));
        showSuccessToast('Studio / Biller logo updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClientLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Brand DP file size should be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setInvoice(prev => ({ ...prev, clientLogoUrl: reader.result as string }));
        showSuccessToast('Brand DP / avatar updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-save draft in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('yoganjali_saved_invoice_draft', JSON.stringify(invoice));
    } catch (e) {}
  }, [invoice]);

  // Calculations
  const subtotal = invoice.items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.unitPrice) || 0)), 0);
  const totalAmount = subtotal;
  const grandTotal = totalAmount;
  const amountInWords = numberToIndianRupeesWords(grandTotal);

  // Handlers for Items
  const handleAddItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      title: 'Yoga Service / Content Creation',
      description: 'Detailed description of deliverable',
      qty: 1,
      unitPrice: 1000
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(it => it.id === id ? { ...it, [field]: value } : it)
    }));
  };

  const handleDeleteItem = (id: string) => {
    if (invoice.items.length <= 1) {
      alert('Invoice must have at least 1 item.');
      return;
    }
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id)
    }));
  };

  // Handlers for Custom Links
  const handleAddLink = () => {
    const newLink: InvoiceLinkItem = {
      id: `link-${Date.now()}`,
      label: 'COLLAB REEL LINK:',
      url: 'https://www.instagram.com/reels/'
    };
    setInvoice(prev => ({
      ...prev,
      links: [...(prev.links || []), newLink]
    }));
  };

  const handleUpdateLink = (id: string, field: keyof InvoiceLinkItem, val: string) => {
    setInvoice(prev => ({
      ...prev,
      links: (prev.links || []).map(l => l.id === id ? { ...l, [field]: val } : l)
    }));
  };

  const handleDeleteLink = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      links: (prev.links || []).filter(l => l.id !== id)
    }));
  };

  // Notes Handlers
  const handleAddNote = () => {
    setInvoice(prev => ({
      ...prev,
      notes: [...prev.notes, 'New payment condition or delivery term.']
    }));
  };

  const handleUpdateNote = (index: number, val: string) => {
    const updated = [...invoice.notes];
    updated[index] = val;
    setInvoice(prev => ({ ...prev, notes: updated }));
  };

  const handleDeleteNote = (index: number) => {
    setInvoice(prev => ({
      ...prev,
      notes: prev.notes.filter((_, idx) => idx !== index)
    }));
  };

  // Presets
  const loadPreset = (preset: 'collab' | 'personal' | 'workshop') => {
    if (preset === 'collab') {
      setInvoice({
        ...DEFAULT_SAMPLE_INVOICE,
        invoiceNo: `YG/${new Date().getFullYear().toString().slice(-2)}-${(new Date().getFullYear() + 1).toString().slice(-2)}/${String(Math.floor(Math.random() * 900) + 100)}`,
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
        clientName: 'Sirona Hygiene',
        clientSubtitle: 'Breaking taboos & solving unaddressed period & intimate hygiene issues for vulva owners!',
        clientInstagram: '@sironahygiene',
        links: [
          { id: '1', label: 'COLLAB REEL LINK:', url: 'https://www.instagram.com/reels/DZ1GcJ1heKx/' }
        ],
        items: [
          { id: '1', title: 'Instagram Reel Creation', description: 'Content creation, shooting, editing and posting\n(Refer Reel Link Above)', qty: 1, unitPrice: 2000 },
          { id: '2', title: 'Product Cost / Reimbursement', description: 'Reimbursement for product received', qty: 1, unitPrice: 200 }
        ]
      });
      showSuccessToast('Loaded Brand Collaboration Preset!');
    } else if (preset === 'personal') {
      setInvoice({
        ...DEFAULT_SAMPLE_INVOICE,
        invoiceNo: `YOGI/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        clientName: 'Personal Yoga Client',
        clientSubtitle: '1-on-1 Personalized Transformational Yoga & Meditation Program',
        clientInstagram: '',
        links: [],
        items: [
          { id: '1', title: 'Monthly Personal Yoga Coaching (12 Sessions)', description: 'Personalized posture alignment, breathwork, diet guidance & daily WhatsApp support', qty: 1, unitPrice: 5000 }
        ]
      });
      showSuccessToast('Loaded Personal Yoga Coaching Preset!');
    } else if (preset === 'workshop') {
      setInvoice({
        ...DEFAULT_SAMPLE_INVOICE,
        invoiceNo: `CORP/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
        clientName: 'Corporate Wellness Client',
        clientSubtitle: 'Corporate Workplace Wellness & Stress Management Yoga Session',
        clientInstagram: '',
        links: [],
        items: [
          { id: '1', title: 'Corporate Yoga & Breathwork Workshop', description: '60-Minute interactive employee wellness & chair yoga posture correction session', qty: 1, unitPrice: 10000 }
        ]
      });
      showSuccessToast('Loaded Corporate Workshop Preset!');
    }
  };

  // Native PDF Print Handler
  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoiceLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showSuccessToast('Invoice generator link copied!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans print:bg-white print:p-0">
      
      {/* 1. TOP NAV & TOOLBAR (HIDDEN IN PRINT) */}
      <nav className="print:hidden sticky top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 text-white px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left Brand Title */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <a 
              href="/panel"
              className="flex items-center gap-2 text-xs font-extrabold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Studio Panel</span>
            </a>

            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-base tracking-tight text-white flex items-center gap-1.5">
                <span>🌿 Yoganjali</span>
                <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                  Invoice Builder
                </span>
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden lg:inline">Templates:</span>
            <button
              onClick={() => loadPreset('collab')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-900/60 text-purple-300 hover:text-purple-200 border border-purple-500/30 text-xs font-bold whitespace-nowrap transition-all"
            >
              📱 Brand Collab
            </button>
            <button
              onClick={() => loadPreset('personal')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 text-xs font-bold whitespace-nowrap transition-all"
            >
              🧘 Personal Yoga
            </button>
            <button
              onClick={() => loadPreset('workshop')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-900/60 text-blue-300 hover:text-blue-200 border border-blue-500/30 text-xs font-bold whitespace-nowrap transition-all"
            >
              🏢 Workshop
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {/* Mobile Tab Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 lg:hidden">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'edit' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'preview' ? 'bg-purple-600 text-white' : 'text-slate-400'
                }`}
              >
                👁️ Preview
              </button>
            </div>

            {/* Print / Download PDF Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Download PDF / Print</span>
            </button>
          </div>

        </div>
      </nav>

      {/* 2. MAIN 2-COLUMN WORKSPACE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 print:p-0 print:m-0 print:max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
          
          {/* LEFT COLUMN: INTERACTIVE INVOICE FORM (HIDDEN IN PRINT & MOBILE PREVIEW) */}
          <div className={`lg:col-span-5 space-y-6 print:!hidden ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Form Header Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Invoice Information</h3>
                    <p className="text-[11px] text-slate-400">Invoice numbering & due date</p>
                  </div>
                </div>
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Auto-Saved
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">INVOICE NO.</label>
                  <input
                    type="text"
                    value={invoice.invoiceNo}
                    onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">INVOICE DATE</label>
                  <input
                    type="date"
                    value={invoice.invoiceDate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">DUE DATE</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Customizable Deliverable & Collab Links Section */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Deliverable & Collab Links <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-colors border border-purple-200"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Link</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(invoice.links || []).map((link) => (
                    <div key={link.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleUpdateLink(link.id, 'label', e.target.value)}
                          placeholder="Link Label (e.g. COLLAB REEL LINK:)"
                          className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-800 uppercase focus:outline-none w-2/3"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteLink(link.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                          title="Remove link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                          placeholder="https://www.instagram.com/reels/..."
                          className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                  {(!invoice.links || invoice.links.length === 0) && (
                    <p className="text-[11px] text-slate-400 italic">No links added. Click "+ Add Link" to add a reel or deliverable link.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Biller & Brand Cards */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Biller (Your Details)</h3>
                  <p className="text-[11px] text-slate-400">Printed on the left "From" section</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Biller Logo Upload */}
                <div className="sm:col-span-2 p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={invoice.billerLogoUrl || '/yoganjali-logo.png'} 
                      alt="Logo" 
                      className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white p-1 shrink-0" 
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">Studio / Biller Logo</h4>
                      <p className="text-[11px] text-slate-500">Custom PNG, JPG or default Yoganjali logo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => billerLogoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Logo</span>
                    </button>
                    {invoice.billerLogoUrl && invoice.billerLogoUrl !== '/yoganjali-logo.png' && (
                      <button
                        type="button"
                        onClick={() => setInvoice(prev => ({ ...prev, billerLogoUrl: '/yoganjali-logo.png' }))}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Reset
                      </button>
                    )}
                    <input
                      type="file"
                      ref={billerLogoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleBillerLogoUpload}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Studio / Business Name</label>
                  <input
                    type="text"
                    value={invoice.billerName}
                    onChange={(e) => setInvoice(prev => ({ ...prev, billerName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Instructor / Founder</label>
                  <input
                    type="text"
                    value={invoice.billerInstructor}
                    onChange={(e) => setInvoice(prev => ({ ...prev, billerInstructor: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={invoice.billerEmail}
                    onChange={(e) => setInvoice(prev => ({ ...prev, billerEmail: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={invoice.billerPhone}
                    onChange={(e) => setInvoice(prev => ({ ...prev, billerPhone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Studio Tagline / Slogan</label>
                  <input
                    type="text"
                    value={invoice.billerTagline || ''}
                    onChange={(e) => setInvoice(prev => ({ ...prev, billerTagline: e.target.value }))}
                    placeholder="e.g. YOGA | WELLNESS | BALANCE"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Address / Location</label>
                  <input
                    type="text"
                    value={invoice.billerAddress}
                    onChange={(e) => setInvoice(prev => ({ ...prev, billerAddress: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Bill To (Client or Brand) */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Bill To (Brand / Client)</h3>
                  <p className="text-[11px] text-slate-400">Printed on the right "To" section</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Brand DP / Logo Upload */}
                <div className="sm:col-span-2 p-3 rounded-2xl bg-rose-50/50 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {invoice.clientLogoUrl ? (
                      <img 
                        src={invoice.clientLogoUrl} 
                        alt="Brand DP" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-rose-300 shadow-xs shrink-0" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-dashed border-rose-200 flex items-center justify-center text-rose-300 font-bold text-xs shrink-0">
                        DP
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Brand DP / Avatar <span className="text-slate-400 font-normal">(Optional)</span></h4>
                      <p className="text-[11px] text-slate-500">Upload brand's Instagram DP or brand logo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => clientLogoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{invoice.clientLogoUrl ? 'Change DP' : 'Upload Brand DP'}</span>
                    </button>
                    {invoice.clientLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setInvoice(prev => ({ ...prev, clientLogoUrl: '' }))}
                        className="text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    )}
                    <input
                      type="file"
                      ref={clientLogoInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleClientLogoUpload}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Brand / Client Name</label>
                  <input
                    type="text"
                    value={invoice.clientName}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="e.g. Sirona Hygiene, Wow Skin Science, Nitin..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Brand Tagline / Bio / Notes</label>
                  <textarea
                    rows={2}
                    value={invoice.clientSubtitle}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientSubtitle: e.target.value }))}
                    placeholder="Brand description or client notes"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={invoice.clientInstagram}
                    onChange={(e) => setInvoice(prev => ({ ...prev, clientInstagram: e.target.value }))}
                    placeholder="@brandhandle"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Line Items & Deliverables */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Line Items & Deliverables</h3>
                    <p className="text-[11px] text-slate-400">Services, Reels, Reimbursements</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Item</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {invoice.items.map((item, idx) => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-slate-600 uppercase">Item #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete line item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                        placeholder="Deliverable Title (e.g. Instagram Reel Creation)"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="Scope / Description details..."
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Quantity</label>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(item.id, 'qty', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Unit Price (₹)</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-800 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank Details & Terms Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Bank & Payment Accounts</h3>
                  <p className="text-[11px] text-slate-400">Where brand/client will transfer funds</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={invoice.bankAccountHolder}
                    onChange={(e) => setInvoice(prev => ({ ...prev, bankAccountHolder: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={invoice.bankName}
                    onChange={(e) => setInvoice(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={invoice.bankAccountNumber}
                    onChange={(e) => setInvoice(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={invoice.bankIfscCode}
                    onChange={(e) => setInvoice(prev => ({ ...prev, bankIfscCode: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={invoice.bankUpiId}
                    onChange={(e) => setInvoice(prev => ({ ...prev, bankUpiId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Notes & Terms Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Notes & Payment Terms</h3>
                    <p className="text-[11px] text-slate-400">Instructions for brand/client</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  + Add Note
                </button>
              </div>

              <div className="space-y-2">
                {invoice.notes.map((note, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => handleUpdateNote(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: PIXEL-PERFECT PRINT-READY A4 LIVE INVOICE (SINGLE-PAGE COMPACT FIT) */}
          <div className={`lg:col-span-7 print:!block print:!w-full print:!m-0 print:!p-0 ${activeTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
            
            {/* CONTAINER FOR PREVIEW */}
            <div className="lg:sticky lg:top-20 print:!static print:!block print-invoice-wrapper">
              
              {/* PRINT & PREVIEW A4 CONTAINER */}
              <div 
                ref={printRef}
                id="printable-invoice-a4"
                className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 p-8 sm:p-12 max-w-[850px] mx-auto print:!shadow-none print:!border-none print:!p-0 print:!m-0 print:!max-w-none print:!w-full print:!block relative overflow-hidden"
              >
                
                {/* 1. TOP LOGO & HEADER ROW */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 mb-4 border-b border-[#E2D8CC]">
                  
                  {/* Left: Yoganjali Brand Artwork */}
                  <div className="flex items-center gap-3.5 shrink-0 self-start sm:self-center">
                    <img 
                      src={invoice.billerLogoUrl || '/yoganjali-logo.png'} 
                      alt="Logo" 
                      className="w-16 h-16 sm:w-18 sm:h-18 object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wider text-[#2D3B27] uppercase leading-tight">
                        {invoice.billerName || 'YOGANJALI'}
                      </h1>
                      <p className="text-[10px] sm:text-xs tracking-[0.2em] font-bold text-[#8C6D58] uppercase mt-1 whitespace-nowrap">
                        {invoice.billerTagline || 'YOGA | WELLNESS | BALANCE'}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[#C67D78]">
                        <span className="text-xs">🪷</span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Elegant INVOICE Title */}
                  <div className="text-center px-2 my-2 sm:my-0">
                    <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-[0.25em] text-[#3E4F3A] uppercase leading-none">
                      INVOICE
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-1.5 text-[#C67D78]">
                      <span className="w-8 h-[1px] bg-[#E2D8CC]" />
                      <span className="text-xs">🪷</span>
                      <span className="w-8 h-[1px] bg-[#E2D8CC]" />
                    </div>
                  </div>

                  {/* Right: Invoice Metadata */}
                  <div className="shrink-0 self-end sm:self-center pr-2">
                    <table className="text-xs sm:text-sm font-serif border-collapse">
                      <tbody>
                        <tr>
                          <td className="font-extrabold text-[#3E4F3A] uppercase tracking-wider text-right pr-2 py-0.5 whitespace-nowrap">
                            INVOICE NO.
                          </td>
                          <td className="font-bold text-[#3E4F3A] px-1 py-0.5 text-center">:</td>
                          <td className="font-sans font-bold text-slate-900 text-left pl-2 py-0.5 whitespace-nowrap">
                            {invoice.invoiceNo}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-extrabold text-[#3E4F3A] uppercase tracking-wider text-right pr-2 py-0.5 whitespace-nowrap">
                            INVOICE DATE
                          </td>
                          <td className="font-bold text-[#3E4F3A] px-1 py-0.5 text-center">:</td>
                          <td className="font-sans font-semibold text-slate-800 text-left pl-2 py-0.5 whitespace-nowrap">
                            {new Date(invoice.invoiceDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                        <tr>
                          <td className="font-extrabold text-[#3E4F3A] uppercase tracking-wider text-right pr-2 py-0.5 whitespace-nowrap">
                            DUE DATE
                          </td>
                          <td className="font-bold text-[#3E4F3A] px-1 py-0.5 text-center">:</td>
                          <td className="font-sans font-semibold text-slate-800 text-left pl-2 py-0.5 whitespace-nowrap">
                            {new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* 2. FROM (BILLER) & TO (BILL TO) CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  
                  {/* FROM (BILLER) CARD */}
                  <div className="rounded-2xl border border-[#D5DDD2] p-4 sm:p-5 bg-[#FAFAF8] space-y-2.5 relative">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#5C7054] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                      <span>👤 FROM (BILLER)</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <h4 className="font-serif font-extrabold text-base sm:text-lg text-[#2D3B27]">
                        {invoice.billerName}
                      </h4>
                      <p className="text-xs sm:text-sm font-semibold text-[#B36B66]">
                        {invoice.billerInstructor}
                      </p>
                      
                      <div className="pt-2 space-y-1 text-xs sm:text-sm text-slate-600">
                        <p className="flex items-start gap-1.5">
                          <span>📍</span>
                          <span>{invoice.billerAddress}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span>✉️</span>
                          <span className="font-medium">{invoice.billerEmail}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span>📞</span>
                          <span className="font-bold text-slate-800">{invoice.billerPhone}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TO (BILL TO) CARD */}
                  <div className="rounded-2xl border border-[#E8DCD5] p-4 sm:p-5 bg-[#FAF8F7] space-y-2.5 relative">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C67D78] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                      <span>👤 TO (BILL TO)</span>
                    </div>

                    <div className="flex items-start gap-3.5 pt-1">
                      {/* Optional Uploaded Brand DP */}
                      {invoice.clientLogoUrl && (
                        <img 
                          src={invoice.clientLogoUrl} 
                          alt={invoice.clientName} 
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-rose-300 shadow-xs shrink-0" 
                        />
                      )}

                      <div className="space-y-1.5 flex-1">
                        <h4 className="font-serif font-extrabold text-base sm:text-lg text-[#B36B66]">
                          {invoice.clientName}
                        </h4>
                        {invoice.clientSubtitle && (
                          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                            {invoice.clientSubtitle}
                          </p>
                        )}
                        {invoice.clientInstagram && (
                          <p className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5 pt-1">
                            <Instagram className="w-4 h-4 text-[#E1306C]" />
                            <span>{invoice.clientInstagram}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 3. COLLAB REEL & DELIVERABLE LINKS (DYNAMIC & MULTI-LINK) */}
                {invoice.links && invoice.links.length > 0 && invoice.links.some(l => l.url) && (
                  <div className="my-4 space-y-2">
                    {invoice.links.map(link => link.url ? (
                      <div key={link.id} className="space-y-1">
                        <span className="text-[10px] font-black text-[#4A5D4E] uppercase tracking-wider block">
                          {link.label || 'COLLAB REEL LINK:'}
                        </span>
                        <div className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white text-xs sm:text-sm font-mono font-medium truncate shadow-xs flex items-center gap-2">
                          <LinkIcon className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-white hover:underline truncate"
                          >
                            {link.url}
                          </a>
                        </div>
                      </div>
                    ) : null)}
                  </div>
                )}

                {/* 4. LINE ITEMS TABLE WITH SUBTLE YOGA WATERMARK */}
                <div className="my-4 rounded-2xl border border-[#D5DDD2] overflow-hidden relative">
                  
                  {/* Subtle Yoga Silhouette Background Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
                    <span className="text-9xl">🧘</span>
                  </div>

                  <table className="w-full text-left border-collapse relative z-10">
                    <thead>
                      <tr className="bg-[#EAE4DC] text-[#3E4F3A] font-serif text-xs uppercase tracking-wider font-extrabold border-b border-[#D5DDD2]">
                        <th className="py-3 px-4 text-center w-14">S. NO.</th>
                        <th className="py-3 px-4">DESCRIPTION</th>
                        <th className="py-3 px-3 text-center w-16">QTY.</th>
                        <th className="py-3 px-4 text-right w-28 sm:w-32">UNIT PRICE (₹)</th>
                        <th className="py-3 px-4 text-right w-28 sm:w-32">AMOUNT (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE4DC] text-xs sm:text-sm">
                      {invoice.items.map((item, idx) => {
                        const lineAmount = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-4 text-center font-bold text-slate-700 align-top">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 space-y-1">
                              <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {item.title}
                              </h5>
                              <p className="text-xs text-slate-500 font-medium whitespace-pre-line leading-relaxed">
                                {item.description}
                              </p>
                            </td>
                            <td className="py-3 px-3 text-center font-semibold text-slate-800 align-top">
                              {item.qty}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-800 align-top">
                              {(Number(item.unitPrice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900 align-top">
                              {lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Summary Totals Table */}
                  <div className="bg-[#FAF8F5] border-t border-[#D5DDD2] p-4 space-y-2">
                    <div className="flex justify-end gap-10 text-xs sm:text-sm">
                      <span className="font-serif font-bold text-slate-600 uppercase">SUBTOTAL</span>
                      <span className="font-sans font-medium text-slate-900 w-28 sm:w-32 text-right">
                        {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-end gap-10 text-xs sm:text-sm">
                      <span className="font-serif font-bold text-slate-600 uppercase">TOTAL AMOUNT</span>
                      <span className="font-sans font-medium text-slate-900 w-28 sm:w-32 text-right">
                        {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* GRAND TOTAL HIGHLIGHT ROW */}
                    <div className="flex justify-end items-center gap-10 bg-[#E2D8CC] px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-[#2D3B27]">
                      <span className="font-serif uppercase tracking-wider">GRAND TOTAL (₹)</span>
                      <span className="font-sans font-black text-slate-950 w-28 sm:w-32 text-right text-base sm:text-lg">
                        {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Amount in Words */}
                    <div className="pt-2 text-right">
                      <span className="text-[10px] font-serif font-bold text-slate-500 uppercase tracking-wider block">
                        Amount In Words:
                      </span>
                      <em className="text-xs sm:text-sm font-serif font-bold text-[#8C6D58] not-italic">
                        {amountInWords}
                      </em>
                    </div>
                  </div>

                </div>

                {/* 5. BANK DETAILS & NOTES BOTTOM CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  
                  {/* BANK DETAILS (BOTTOM LEFT) */}
                  <div className="rounded-2xl border border-[#D5DDD2] p-4 sm:p-5 bg-[#FAFAF8] space-y-2.5 relative">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#5C7054] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                      <span>🏛️ BANK DETAILS</span>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs sm:text-sm">
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5 font-serif font-extrabold text-[#3E4F3A]">Account Holder Name :</span>
                        <strong className="col-span-7 font-sans font-extrabold text-slate-900">{invoice.bankAccountHolder}</strong>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5 font-serif font-extrabold text-[#3E4F3A]">Bank Name :</span>
                        <span className="col-span-7 font-medium text-slate-800">{invoice.bankName}</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5 font-serif font-extrabold text-[#3E4F3A]">Account Number :</span>
                        <strong className="col-span-7 font-mono font-bold text-slate-900 tracking-wider">{invoice.bankAccountNumber}</strong>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-5 font-serif font-extrabold text-[#3E4F3A]">IFSC Code :</span>
                        <strong className="col-span-7 font-mono font-bold text-slate-900">{invoice.bankIfscCode}</strong>
                      </div>
                      {invoice.bankUpiId && (
                        <div className="grid grid-cols-12 gap-1">
                          <span className="col-span-5 font-serif font-extrabold text-[#3E4F3A]">UPI ID :</span>
                          <span className="col-span-7 font-mono font-medium text-purple-700">{invoice.bankUpiId}</span>
                        </div>
                      )}

                      <p className="text-xs text-[#5C7054] font-medium italic pt-2">
                        {invoice.footerNote}
                      </p>
                    </div>
                  </div>

                  {/* NOTES & TERMS (BOTTOM RIGHT) */}
                  <div className="rounded-2xl border border-[#E8DCD5] p-4 sm:p-5 bg-[#FAF8F7] space-y-2.5 relative flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#C67D78] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                        <span>📋 NOTES</span>
                      </div>

                      <ul className="space-y-1.5 pt-2 text-xs sm:text-sm text-slate-700 list-disc list-inside font-medium leading-relaxed">
                        {invoice.notes.map((note, idx) => (
                          <li key={idx}>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Signature Cursive Thank You */}
                    <div className="pt-3 text-right">
                      <span className="font-serif italic text-3xl sm:text-4xl text-[#B36B66] font-normal tracking-wide inline-block transform -rotate-3">
                        Thank you! ♡
                      </span>
                    </div>
                  </div>

                </div>

                {/* 6. BOTTOM ELEGANT FOOTER */}
                <div className="pt-4 border-t border-[#E2D8CC] text-center space-y-1">
                  <p className="text-xs text-slate-500 font-medium">
                    Grateful for the opportunity to create and collaborate.
                  </p>
                  <p className="font-serif text-xs font-bold text-[#8C6D58] uppercase tracking-wider">
                    {invoice.billerName} – <span className="text-[#B36B66]">Yoga</span> | <span className="text-[#5C7054]">Wellness</span> | <span className="text-[#8C6D58]">Balance</span>
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
