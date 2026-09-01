import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, SessionType, TimeSlot, MembershipPlan, Gender, FeeType } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';
import { X, Check, Save, Upload, Sparkles, Users, Clock, Calendar, Trash2 } from 'lucide-react';

const REASONS_LIST = [
  'Weight Loss', 'Weight Gain', 'Back Pain', 'Neck Pain', 
  'General Fitness', 'Strength', 'Flexibility', 'Stress Relief', 
  'Meditation', 'PCOS', 'Lumbar Spondylitis', 'Insomnia', 'Other'
];

const DAYS_LIST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MORNING_TIMES = ['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM'];
const EVENING_TIMES = ['04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'];

interface EditClientModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({ client, isOpen, onClose }) => {
  const { updateClient, deleteClient, customGroupBatches, addCustomGroupBatch, deleteCustomGroupBatch } = useApp();

  const availableBatches = (customGroupBatches && customGroupBatches.length > 0)
    ? customGroupBatches
    : ['General Yoga Batch'];

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Female');
  const [phone, setPhone] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [classTime, setClassTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('Morning');
  const [sessionType, setSessionType] = useState<SessionType>('Personal');
  
  const [selectedBatchDropdown, setSelectedBatchDropdown] = useState('');
  const [customGroupName, setCustomGroupName] = useState('');

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [currentProblems, setCurrentProblems] = useState<string>('');

  const [feeType, setFeeType] = useState<FeeType>('Monthly');
  const [feeStartMonth, setFeeStartMonth] = useState<string>('2026-08');
  const [perSessionFee, setPerSessionFee] = useState<number>(1000);
  const [monthlyFee, setMonthlyFee] = useState<number>(10000);
  const [feeDueDate, setFeeDueDate] = useState('5th');

  const [trainerNotes, setTrainerNotes] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (client) {
      setName(client.name);
      setGender(client.gender || 'Female');
      setPhone(client.phone);
      setSameAsPhone(client.phone === client.whatsapp);
      setWhatsapp(client.whatsapp);
      setAddress(client.address);
      setJoiningDate(client.joiningDate);
      setPhotoUrl(client.photoUrl);
      setClassTime(client.classTime);
      setSelectedDays(client.days || ['Mon', 'Wed', 'Fri']);
      setTimeSlot(client.timeSlot);
      setSessionType(client.sessionType);

      const existingGroup = client.groupName || 'General Yoga Batch';
      if (availableBatches.includes(existingGroup)) {
        setSelectedBatchDropdown(existingGroup);
        setCustomGroupName('');
      } else {
        setSelectedBatchDropdown('CUSTOM');
        setCustomGroupName(existingGroup);
      }

      setSelectedReasons(client.reasonsForJoining || []);
      setCurrentProblems((client.currentProblems || []).join(', '));
      setFeeType(client.feeType || 'Monthly');
      setFeeStartMonth(client.feeStartMonth || (client.joiningDate ? client.joiningDate.slice(0, 7) : '2026-08'));
      setPerSessionFee(client.perSessionFee || 1000);
      setMonthlyFee(client.monthlyFee || 10000);
      setFeeDueDate(client.feeDueDate);
      setTrainerNotes(client.trainerNotes || '');
      setGoal(client.goal || '');
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleVectorAvatarPreset = (type: 'notionist' | 'initials' | 'bottts') => {
    const seed = encodeURIComponent(name.trim() || 'YogaClient');
    const bg = gender === 'Female' ? 'f3e8ff' : 'eff6ff';
    if (type === 'notionist') {
      setPhotoUrl(`https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=${bg}`);
    } else if (type === 'initials') {
      setPhotoUrl(`https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=${bg}`);
    } else {
      setPhotoUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=${bg}`);
    }
  };

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file, 400, 0.82);
      if (compressed) {
        setPhotoUrl(compressed);
      }
    }
  };

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalGroup = selectedBatchDropdown;
    if (selectedBatchDropdown === 'CUSTOM' && customGroupName.trim()) {
      finalGroup = customGroupName.trim();
      addCustomGroupBatch(finalGroup);
    }

    const autoTimeSlot = (classTime || '').toUpperCase().includes('PM') ? 'Evening' : 'Morning';

    updateClient({
      ...client,
      name,
      gender,
      phone,
      whatsapp: sameAsPhone ? phone : (whatsapp || phone),
      address,
      joiningDate,
      photoUrl,
      classTime,
      days: selectedDays,
      timeSlot: autoTimeSlot,
      sessionType,
      groupName: sessionType === 'Personal' ? '' : (finalGroup === 'CUSTOM' ? '' : finalGroup),
      reasonsForJoining: selectedReasons,
      currentProblems: currentProblems.split(',').map(s => s.trim()).filter(Boolean),
      feeType,
      feeStartMonth: feeType === 'Monthly' ? feeStartMonth : undefined,
      perSessionFee: feeType === 'Per Session' ? Number(perSessionFee) : 0,
      monthlyFee: feeType === 'Per Session' ? 0 : Number(monthlyFee),
      feeDueDate: feeType === 'Per Session' ? 'N/A' : feeDueDate,
      membershipPlan: feeType === 'Per Session' ? 'Per Session' : 'Unlimited',
      trainerNotes,
      goal
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 relative overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={photoUrl} alt={name} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white/30" />
            <div>
              <h3 className="font-extrabold text-lg">Edit {client.name}'s Profile</h3>
              <p className="text-xs text-purple-100">Update class timing, days, fees, and health details</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Avatar & Gender */}
          <div className="bg-purple-50/60 p-4 rounded-3xl border border-purple-100 space-y-3">
            <div className="flex items-center gap-4">
              <img src={photoUrl} alt={name} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-200 bg-white" />
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Change Avatar</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleVectorAvatarPreset('notionist')}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-purple-700 border border-purple-200"
                  >
                    🎨 Vector
                  </button>

                  <label className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 text-white cursor-pointer shadow-sm">
                    <Upload className="w-3 h-3 inline mr-1" />
                    Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleGenderChange('Female')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    gender === 'Female' ? 'border-purple-600 bg-purple-100 text-purple-900' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  ♀️ Female Practitioner
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderChange('Male')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    gender === 'Male' ? 'border-indigo-600 bg-indigo-100 text-indigo-900' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  ♂️ Male Practitioner
                </button>
              </div>
            </div>
          </div>

          {/* Name & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold outline-none"
              />
            </div>
          </div>

          {/* Joining Date & Area / Locality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Joining Date *</label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Area / Locality</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Indiranagar, Bengaluru"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none"
              />
            </div>
          </div>

          {/* Group Batch Selection */}
          <div className="bg-purple-50/60 p-4 rounded-3xl border border-purple-100 space-y-3">
            <label className="block text-xs font-bold text-purple-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-600" />
                Group Batch Assignment *
              </span>
            </label>

            <div className="flex items-center gap-2">
              <select
                value={selectedBatchDropdown}
                onChange={(e) => {
                  setSelectedBatchDropdown(e.target.value);
                  if (e.target.value !== 'CUSTOM') {
                    setCustomGroupName('');
                  }
                }}
                className="flex-1 px-4 py-3 rounded-2xl bg-white border border-purple-200 text-xs font-bold text-purple-900 outline-none shadow-sm"
              >
                {availableBatches.map((batch) => (
                  <option key={batch} value={batch}>👥 {batch}</option>
                ))}
                <option value="CUSTOM">➕ + Create New Group Batch...</option>
              </select>

              {selectedBatchDropdown !== 'CUSTOM' && availableBatches.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    deleteCustomGroupBatch(selectedBatchDropdown);
                    const remaining = availableBatches.filter(b => b !== selectedBatchDropdown);
                    setSelectedBatchDropdown(remaining[0] || 'CUSTOM');
                  }}
                  title="Delete this Group Batch"
                  className="px-3.5 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs transition-all flex items-center gap-1 shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            {selectedBatchDropdown === 'CUSTOM' && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  autoFocus
                  value={customGroupName}
                  onChange={(e) => setCustomGroupName(e.target.value)}
                  placeholder="Enter custom group batch name..."
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-purple-300 text-xs font-bold text-purple-950 outline-none shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = customGroupName.trim();
                    if (trimmed) {
                      addCustomGroupBatch(trimmed);
                      setSelectedBatchDropdown(trimmed);
                      setCustomGroupName('');
                    } else {
                      alert('Please enter a batch name first.');
                    }
                  }}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>💾 Save & Store Group Batch</span>
                </button>
              </div>
            )}
          </div>

          {/* Class Time Selector - Compact Modern Design */}
          <div className="bg-gradient-to-br from-slate-50 to-purple-50/40 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Class Time Picker *
              </label>
              <span className="text-[11px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-lg border border-purple-200">
                Selected: {classTime}
              </span>
            </div>

            {/* Morning Batches */}
            <div className="space-y-1">
              <div className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <span>🌅 Morning Batches</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {MORNING_TIMES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setClassTime(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      classTime === t
                        ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300 scale-105'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50 hover:border-amber-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Evening Batches */}
            <div className="space-y-1 pt-1 border-t border-slate-200/60">
              <div className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <span>🌆 Evening Batches</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {EVENING_TIMES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setClassTime(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      classTime === t
                        ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-300 scale-105'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Or Custom:</span>
              <input
                type="text"
                value={classTime}
                onChange={(e) => setClassTime(e.target.value)}
                placeholder="07:00 AM"
                className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Class Days Multi-Select Section */}
          <div className="bg-purple-50/40 p-4 rounded-3xl border border-purple-100 space-y-2">
            <label className="block text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-600" />
              Class Days * (Click to toggle scheduled days)
            </label>
            
            <div className="flex flex-wrap gap-2 pt-1">
              {DAYS_LIST.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50'
                    }`}
                  >
                    {isSelected ? `✓ ${day}` : day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fee Billing Model Section */}
          <div className="space-y-4 bg-purple-50/40 p-5 rounded-3xl border border-purple-100">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Fee Billing Model</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFeeType('Monthly')}
                className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
                  feeType === 'Monthly'
                    ? 'border-purple-600 bg-purple-100 text-purple-950 ring-2 ring-purple-300'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                💳 Monthly Fixed Fee (₹10,000 / month)
              </button>

              <button
                type="button"
                onClick={() => setFeeType('Per Session')}
                className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all ${
                  feeType === 'Per Session'
                    ? 'border-emerald-600 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-300'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                🧘 Per Session Fee (₹1,000 / class)
              </button>
            </div>

            {feeType === 'Monthly' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Fee (₹)</label>
                  <input
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    placeholder="10000"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fee Due Date</label>
                  <input
                    type="text"
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Fee Billing Cycle Starts From</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Select July 2026 if July fee is pending</span>
                  </label>
                  <select
                    value={feeStartMonth}
                    onChange={(e) => setFeeStartMonth(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-extrabold text-slate-900 outline-none"
                  >
                    <option value="2026-09">September 2026 (Current Cycle)</option>
                    <option value="2026-08">August 2026 (Previous Cycle)</option>
                    <option value="2026-07">July 2026 (Include July 2026 Pending Fee Due)</option>
                    <option value="2026-06">June 2026 (Include June & July Fee Dues)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <label className="block text-xs font-extrabold text-emerald-950 mb-1">Per Session Class Fee (₹)</label>
                <input
                  type="number"
                  value={perSessionFee}
                  onChange={(e) => setPerSessionFee(Number(e.target.value))}
                  placeholder="1000"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-emerald-300 text-xs font-extrabold text-emerald-950 outline-none"
                />
              </div>
            )}
          </div>

          {/* Health Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary Health Goal</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete ${client.name}?`)) {
                  deleteClient(client.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              Delete Client
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-md hover:bg-purple-700"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
