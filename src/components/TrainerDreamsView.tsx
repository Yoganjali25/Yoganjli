import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrainerDreamGoal } from '../types';
import { 
  Trophy, 
  Sparkles, 
  Upload, 
  Plus, 
  Trash2, 
  Edit2, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Calendar,
  RotateCcw,
  MinusCircle,
  Calculator
} from 'lucide-react';

export const TrainerDreamsView: React.FC = () => {
  const { 
    trainerDreams, 
    addTrainerDream, 
    updateTrainerDream, 
    deleteTrainerDream,
    showSuccessToast
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDream, setEditingDream] = useState<TrainerDreamGoal | null>(null);

  // Track last deposited amount for each goal for 1-click UNDO / REDO correction
  const [lastDeposits, setLastDeposits] = useState<{ [dreamId: string]: number }>({});

  const handleDepositMoney = (dream: TrainerDreamGoal, amount: number) => {
    if (amount === 0) return;
    const currentSaved = dream.savedAmount || 0;
    const newSaved = Math.max(0, currentSaved + amount);
    
    if (newSaved >= dream.targetAmount && currentSaved < dream.targetAmount) {
      showSuccessToast(`🎉 CONGRATULATIONS ANJALI! You 100% unlocked your dream: "${dream.title}"! 🏆✨`);
    }

    // Remember last deposit for UNDO
    setLastDeposits(prev => ({ ...prev, [dream.id]: amount }));
    updateTrainerDream({ ...dream, savedAmount: newSaved });
  };

  const handleUndoDeposit = (dream: TrainerDreamGoal) => {
    const lastAmt = lastDeposits[dream.id];
    if (lastAmt !== undefined && lastAmt !== 0) {
      const currentSaved = dream.savedAmount || 0;
      const reverted = Math.max(0, currentSaved - lastAmt);
      setLastDeposits(prev => {
        const copy = { ...prev };
        delete copy[dream.id];
        return copy;
      });
      updateTrainerDream({ ...dream, savedAmount: reverted });
    }
  };

  const handleSetExactBalance = (dream: TrainerDreamGoal) => {
    const currentSaved = dream.savedAmount || 0;
    const valStr = prompt(`Correct / Set exact saved balance for "${dream.title}" (Current: ₹${currentSaved.toLocaleString('en-IN')}):`, String(currentSaved));
    if (valStr !== null && !isNaN(Number(valStr))) {
      const exactVal = Math.max(0, Number(valStr));
      updateTrainerDream({ ...dream, savedAmount: exactVal });
    }
  };

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [savedAmount, setSavedAmount] = useState<number>(0);
  const [photoUrl, setPhotoUrl] = useState<string>('/hero-group-yoga.jpg');
  const [targetDate, setTargetDate] = useState<string>('2027-12-31');
  const [category, setCategory] = useState<'Short Term' | 'Medium Term' | 'Long Term'>('Medium Term');
  const [notes, setNotes] = useState('');

  // Total Target across all dreams
  const totalDreamTarget = trainerDreams.reduce((sum, d) => sum + d.targetAmount, 0);
  
  // Total Saved across dreams
  const totalSaved = trainerDreams.reduce((sum, d) => sum + (d.savedAmount || 0), 0);

  // Overall Completion Percent
  const overallPercent = totalDreamTarget > 0 
    ? Math.min(100, Math.round((totalSaved / totalDreamTarget) * 100))
    : 0;

  // High-performance image compressor for vision photo uploads
  const compressVisionPhoto = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1000;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressVisionPhoto(file);
      if (compressed) setter(compressed);
    }
  };

  const openAddModal = () => {
    setTitle('');
    setTargetAmount(100000);
    setSavedAmount(0);
    setPhotoUrl('/hero-group-yoga.jpg');
    setTargetDate('2027-12-31');
    setCategory('Medium Term');
    setNotes('');
    setEditingDream(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (dream: TrainerDreamGoal) => {
    setTitle(dream.title);
    setTargetAmount(dream.targetAmount);
    setSavedAmount(dream.savedAmount || 0);
    setPhotoUrl(dream.photoUrl);
    setTargetDate(dream.targetDate || '2027-12-31');
    setCategory(dream.category || 'Medium Term');
    setNotes(dream.notes || '');
    setEditingDream(dream);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTarget = Number(targetAmount) || 100000;
    const cleanSaved = Number(savedAmount) || 0;

    if (!title.trim() || cleanTarget <= 0) {
      alert('Please enter a valid Dream Title and Target Amount.');
      return;
    }

    if (editingDream) {
      updateTrainerDream({
        ...editingDream,
        title: title.trim(),
        targetAmount: cleanTarget,
        savedAmount: cleanSaved,
        photoUrl: photoUrl || '/hero-group-yoga.jpg',
        targetDate: targetDate || '2027-12-31',
        category,
        notes
      });
    } else {
      addTrainerDream({
        title: title.trim(),
        targetAmount: cleanTarget,
        savedAmount: cleanSaved,
        photoUrl: photoUrl || '/hero-group-yoga.jpg',
        targetDate: targetDate || '2027-12-31',
        category,
        notes
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* CLEAN & SIMPLE SECTION HEADER */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-purple-500/30 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Trophy className="w-72 h-72 text-amber-300" />
        </div>

        <div className="relative z-10 space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-800/60 pb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Live Dream Progress Tracker
              </span>
            </div>

            <button
              onClick={openAddModal}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-xs uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-amber-950 stroke-[3]" />
              <span>+ Add New Dream Goal</span>
            </button>
          </div>

          {/* 2 SIMPLE SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white/10 p-5 rounded-2xl border border-white/15 space-y-1">
              <span className="text-xs font-bold text-purple-200 block">Total Dreams Target Amount</span>
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                ₹{(totalDreamTarget || 0).toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-purple-300 font-bold block">{trainerDreams.length} Active Goals Listed</span>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/15 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                <span>Total Saved & Funded</span>
                <span className="text-emerald-400 font-black">{overallPercent}% FUNDED</span>
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-extrabold text-amber-300">
                ₹{(totalSaved || 0).toLocaleString('en-IN')}
              </div>
              <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden mt-1">
                <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${overallPercent}%` }} />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* DREAM CARDS GRID */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span>My Goal Cards ({trainerDreams.length})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click on any goal card to edit or add savings</span>
        </div>

        {trainerDreams.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
            <Trophy className="w-16 h-16 text-purple-400 mx-auto animate-bounce" />
            <h4 className="font-serif text-xl font-bold text-slate-800">No Goal Cards Added Yet!</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Set your first dream (e.g., Physical Studio, Car, Advanced Certification) and start entering your savings progress!
            </p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md hover:bg-purple-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add My First Dream
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainerDreams.map((dream) => {
              const targetCost = Number(dream.targetAmount) || 100000;
              const saved = Number(dream.savedAmount) || 0;
              const percent = Math.min(100, Math.round((saved / targetCost) * 100)) || 0;

              const isAchieved = percent >= 100;

              return (
                <div 
                  key={dream.id}
                  className={`rounded-[2.5rem] overflow-hidden space-y-5 flex flex-col justify-between group transition-all duration-300 ${
                    isAchieved
                      ? 'bg-gradient-to-b from-amber-500/10 via-white to-amber-500/5 border-2 border-amber-400 ring-4 ring-amber-400/20 shadow-2xl scale-[1.01]'
                      : 'bg-white border border-slate-200/80 shadow-soft hover:shadow-2xl hover:border-purple-300'
                  }`}
                >
                  {/* Photo Banner with Overlay Badge */}
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <img 
                      src={dream.photoUrl} 
                      alt={dream.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Category Pill */}
                    <div className="absolute top-4 left-4">
                      {isAchieved ? (
                        <span className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-amber-950 text-xs font-black uppercase tracking-wider shadow-xl border border-amber-300 animate-bounce flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-950 fill-amber-950" />
                          <span>🏆 DREAM ACHIEVED & UNLOCKED!</span>
                        </span>
                      ) : (
                        <span className="px-3.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-amber-300 border border-amber-300/40 text-[10px] font-black uppercase tracking-wider shadow-md">
                          ⭐ {dream.category || 'Vision Goal'}
                        </span>
                      )}
                    </div>

                    {/* Quick Edit & Delete Buttons */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(dream)}
                        className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white shadow-md transition-all"
                        title="Edit Goal & Photo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete dream "${dream.title}"?`)) {
                            deleteTrainerDream(dream.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-rose-600/90 backdrop-blur-md text-white hover:bg-rose-600 shadow-md transition-all"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Overlay Title */}
                    <div className="absolute bottom-4 left-4 right-4 space-y-1">
                      <h4 className="font-serif font-extrabold text-xl text-white drop-shadow-md leading-tight">
                        {dream.title}
                      </h4>
                      {dream.targetDate && (
                        <p className="text-[11px] font-semibold text-purple-200 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-300" /> Target Date: {dream.targetDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="px-6 space-y-4">
                    
                    {/* 100% VICTORY BANNER CARD */}
                    {isAchieved && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-amber-950 shadow-xl border border-amber-300 space-y-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-amber-950 fill-amber-950" />
                            <span>🎉 CONGRATULATIONS ANJALI! DREAM UNLOCKED!</span>
                          </span>
                        </div>
                        <p className="text-xs font-extrabold leading-relaxed text-amber-950">
                          You have 100% completed your savings target for "{dream.title}"! Your hard work and teaching dedication made this dream a reality! Time to celebrate! ✨
                        </p>
                      </div>
                    )}

                    {/* Amount & Progress Ring Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="text-slate-700 flex items-center gap-1.5">
                          <span>Saved: <strong className="text-emerald-700">₹{(saved || 0).toLocaleString('en-IN')}</strong> / ₹{(targetCost || 0).toLocaleString('en-IN')}</span>
                          <button
                            type="button"
                            onClick={() => handleSetExactBalance(dream)}
                            className="text-[10px] text-purple-700 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded-md font-bold transition-colors"
                            title="Directly edit or correct the exact saved amount"
                          >
                            ✏️ Edit Balance
                          </button>
                        </span>
                        <span className={`font-black text-sm ${isAchieved ? 'text-amber-600' : 'text-purple-700'}`}>
                          {percent}% COMPLETED {isAchieved && '🎉'}
                        </span>
                      </div>

                      <div className="w-full h-3.5 rounded-full bg-slate-100 border border-slate-200 p-0.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                            isAchieved
                              ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-400'
                              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* HARD WORK & EFFORT CALCULATOR CARD ("Kitni Mehnat Karni Hai") */}
                    {!isAchieved && (() => {
                      const remaining = Math.max(0, targetCost - saved);
                      const personalMonthsNeeded = Math.ceil(remaining / 10000);
                      const groupMonthsNeeded = Math.ceil(remaining / 3500);
                      const sessionsNeeded = Math.ceil(remaining / 1000);

                      return (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100/60 border border-purple-200/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-purple-950 font-black text-xs uppercase tracking-wider">
                              <Calculator className="w-4 h-4 text-purple-700" />
                              <span>Required Effort ("Kitni Mehnat & Classes Needed")</span>
                            </div>
                            <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                              ₹{(remaining || 0).toLocaleString('en-IN')} Remaining
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center pt-1">
                            <div className="bg-white p-2 rounded-xl border border-purple-100 shadow-sm space-y-0.5">
                              <span className="block text-purple-800 font-black text-sm">~{personalMonthsNeeded}</span>
                              <span className="text-[10px] text-slate-500 font-bold">Personal Clients (1-on-1)</span>
                            </div>

                            <div className="bg-white p-2 rounded-xl border border-purple-100 shadow-sm space-y-0.5">
                              <span className="block text-amber-800 font-black text-sm">~{groupMonthsNeeded}</span>
                              <span className="text-[10px] text-slate-500 font-bold">Group Batch Clients</span>
                            </div>

                            <div className="bg-white p-2 rounded-xl border border-purple-100 shadow-sm space-y-0.5">
                              <span className="block text-emerald-800 font-black text-sm">~{sessionsNeeded}</span>
                              <span className="text-[10px] text-slate-500 font-bold">Total Yoga Classes</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Notes */}
                    {dream.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{dream.notes}"
                      </p>
                    )}

                  </div>

                  {/* DIRECT SAVINGS ENTRY & UNDO / CORRECTION BOX */}
                  <div className="px-6 pb-6 pt-2 space-y-3">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-amber-600" />
                          <span>Add or Correct Savings (₹)</span>
                        </label>

                        {/* ↺ 1-Click UNDO Button when last deposit exists */}
                        {lastDeposits[dream.id] !== undefined && (
                          <button
                            type="button"
                            onClick={() => handleUndoDeposit(dream)}
                            className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all animate-pulse"
                            title="Undo last deposit entry"
                          >
                            <RotateCcw className="w-3 h-3 text-white" />
                            <span>Undo (+₹{(lastDeposits[dream.id] || 0).toLocaleString('en-IN')})</span>
                          </button>
                        )}
                      </div>

                      {/* Quick Deposit Preset Chips */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {[2000, 5000, 10000, 25000].map(chipAmt => (
                          <button
                            key={chipAmt}
                            type="button"
                            onClick={() => handleDepositMoney(dream, chipAmt)}
                            className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 text-[10px] font-black shrink-0 transition-all shadow-sm active:scale-95"
                          >
                            + ₹{(chipAmt || 0).toLocaleString('en-IN')}
                          </button>
                        ))}
                      </div>

                      {/* Manual Savings Entry Form (Supports both +Deposit and -Deduct/Correct) */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const input = form.elements.namedItem('depositAmount') as HTMLInputElement;
                          const val = Number(input.value);
                          if (val && !isNaN(val)) {
                            handleDepositMoney(dream, val);
                            input.value = '';
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <div className="relative flex-1">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                          <input
                            type="number"
                            name="depositAmount"
                            placeholder="Type amount e.g. 5000 or -5000"
                            className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/30"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
                        >
                          <TrendingUp className="w-4 h-4 text-emerald-100" />
                          <span>Save / Fix</span>
                        </button>
                      </form>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ADD / EDIT DREAM MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-500" />
                <h3 className="font-serif font-extrabold text-xl text-slate-900">
                  {editingDream ? 'Edit Goal Card' : 'Add New Personal Goal Card'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div>
                <label className="block text-slate-900 font-bold mb-1">Dream Goal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Physical Yoga Studio Sanctuary or Dream Car"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Target Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={targetAmount === 0 ? '' : targetAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTargetAmount(val === '' ? 0 : Number(val));
                    }}
                    placeholder="e.g. 125000"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Amount Currently Saved (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={savedAmount === 0 ? '' : savedAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSavedAmount(val === '' ? 0 : Number(val));
                    }}
                    placeholder="e.g. 25000"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-900 font-bold mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-900 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none"
                  >
                    <option value="Short Term">Short Term (Under 1 Year)</option>
                    <option value="Medium Term">Medium Term (1-3 Years)</option>
                    <option value="Long Term">Long Term (3+ Years)</option>
                  </select>
                </div>
              </div>

              {/* Dream Vision Photo Upload */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-slate-900 font-bold">Dream Vision Photo (Upload & Preview)</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    <img src={photoUrl} alt="Dream Preview" className="w-full h-full object-cover" />
                  </div>

                  <label className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-extrabold text-xs cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Custom Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handlePhotoUpload(e, setPhotoUrl)} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Motivation Notes */}
              <div>
                <label className="block text-slate-900 font-bold mb-1">Personal Motivation Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. A serene studio with wooden flooring, plants and natural sunlight."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all"
                >
                  {editingDream ? 'Save Changes' : 'Create Vision Goal'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
