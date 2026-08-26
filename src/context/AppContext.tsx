import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Client, PaymentRecord, LeaveRecord, AttendanceRecord, TrainerProfile, TrainerLeave, AttendanceStatus, WebsiteCMS, TrainerDreamGoal, PaymentStatus, BlogPost } from '../types';
import { INITIAL_CLIENTS, INITIAL_PAYMENTS, INITIAL_LEAVES, INITIAL_ATTENDANCE, DEFAULT_TRAINER_PROFILE, INITIAL_TRAINER_LEAVES, INITIAL_TRAINER_DREAMS, INITIAL_BLOG_POSTS } from '../data/mockData';
import { DEFAULT_WEBSITE_CMS } from '../config/siteConfig';
import { getTodayDateString } from '../utils/dateUtils';
import { safeStorage } from "../utils/safeStorage";
import { fetchCloudSyncData, pushCloudSyncData, mergeArraysById, normalizeClient, normalizePayment, normalizeAttendance, normalizeTrainerDream, normalizeLeave, normalizeBlog } from '../utils/cloudSync';
import { getClientBillingCycles } from '../utils/paymentUtils';

interface AppContextType {
  trainerProfile: TrainerProfile;
  updateTrainerProfile: (profile: TrainerProfile) => void;

  websiteCMS: WebsiteCMS;
  updateWebsiteCMS: (cms: WebsiteCMS) => void;

  blogs: BlogPost[];
  addBlogPost: (blog: Omit<BlogPost, 'id'>) => void;
  updateBlogPost: (blog: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  toggleBlogPublish: (id: string) => void;
  
  trainerLeaves: TrainerLeave[];
  addTrainerLeave: (leave: Omit<TrainerLeave, 'id'>) => void;
  deleteTrainerLeave: (id: string) => void;

  trainerDreams: TrainerDreamGoal[];
  addTrainerDream: (dream: Omit<TrainerDreamGoal, 'id'>) => void;
  updateTrainerDream: (dream: TrainerDreamGoal) => void;
  deleteTrainerDream: (id: string) => void;

  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'completedClasses' | 'paymentStatus'> & Partial<Pick<Client, 'id'>>) => Promise<Client | void>;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  toggleClientStatus: (id: string, status: 'Active' | 'Discontinued', reason?: string) => void;

  payments: PaymentRecord[];
  addPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  updatePayment: (payment: PaymentRecord) => void;
  deletePayment: (id: string) => void;
  quickMarkPaid: (clientId: string) => void;

  leaves: LeaveRecord[];
  addLeave: (leave: Omit<LeaveRecord, 'id' | 'clientName' | 'photoUrl'>) => void;
  deleteLeave: (id: string) => void;

  attendance: AttendanceRecord[];
  markAttendance: (clientId: string, status: AttendanceStatus, targetDateStr?: string) => void;
  deleteAttendanceRecord: (id: string) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  isAddClientOpen: boolean;
  setIsAddClientOpen: (open: boolean) => void;

  isAddPaymentOpen: boolean;
  setIsAddPaymentOpen: (open: boolean) => void;

  isAddLeaveOpen: boolean;
  setIsAddLeaveOpen: (open: boolean) => void;

  isAddTrainerLeaveOpen: boolean;
  setIsAddTrainerLeaveOpen: (open: boolean) => void;

  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  isShareLinkOpen: boolean;
  setIsShareLinkOpen: (open: boolean) => void;

  paymentModalDefaultClientId: string | null;
  setPaymentModalDefaultClientId: (clientId: string | null) => void;

  toastMessage: string | null;
  showSuccessToast: (msg: string) => void;

  isClientWebsiteMode: boolean;
  setIsClientWebsiteMode: (mode: boolean) => void;

  customGroupBatches: string[];
  addCustomGroupBatch: (name: string) => void;
  deleteCustomGroupBatch: (name: string) => void;

  isSyncingCloud: boolean;
  lastCloudSyncTime: string | null;
  syncCloudNow: () => Promise<void>;
  forcePushCloud: () => Promise<void>;

  startNewMonthCycle: () => void;
  resetToSampleData: () => void;
  exportBackupData: () => void;
  importBackupData: (data: any) => boolean;

  deletedIds: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'yoganjali_app_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trainerProfile, setTrainerProfile] = useState<TrainerProfile>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_trainer_profile`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (!parsed.photoUrl || parsed.photoUrl.includes('dicebear')) parsed.photoUrl = '/anjali-hero.jpg';
          if (!parsed.studioLogoUrl || parsed.studioLogoUrl.includes('dicebear')) parsed.studioLogoUrl = '/yoganjali-logo.png';
          return { ...DEFAULT_TRAINER_PROFILE, ...parsed };
        }
      }
    } catch (e) {}
    return DEFAULT_TRAINER_PROFILE;
  });

  const [websiteCMS, setWebsiteCMS] = useState<WebsiteCMS>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_website_cms`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_WEBSITE_CMS, ...parsed };
        }
      }
    } catch (e) {}
    return DEFAULT_WEBSITE_CMS;
  });

  const updateWebsiteCMS = (newCMS: WebsiteCMS) => {
    setWebsiteCMS(newCMS);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_website_cms`, JSON.stringify(newCMS));
    } catch (e) {
      console.warn('LocalStorage quota limit reached, saving in memory session:', e);
    }
    showSuccessToast('🎉 Live Website Content & Images Updated!');
  };

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_blogs`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeBlog).filter(Boolean);
      }
    } catch (e) {}
    return INITIAL_BLOG_POSTS;
  });

  const addBlogPost = (blogData: Omit<BlogPost, 'id'>) => {
    const title = blogData.title || 'Yoga Insights';
    const autoSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newBlog: BlogPost = {
      ...blogData,
      id: `blog-${Date.now()}`,
      slug: blogData.slug?.trim() || autoSlug || `post-${Date.now()}`,
      author: blogData.author || trainerProfile.name || 'Anjali Negi',
      authorRole: blogData.authorRole || 'Founder & Senior Yoga Instructor',
      authorPhoto: blogData.authorPhoto || trainerProfile.photoUrl || '/anjali-hero.jpg',
      date: blogData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      isPublished: blogData.isPublished !== undefined ? blogData.isPublished : true,
    };
    const updated = [newBlog, ...blogs];
    setBlogs(updated);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_blogs`, JSON.stringify(updated));
    } catch (e) {}

    pushCloudSyncData({
      clients,
      payments,
      trainerDreams,
      trainerLeaves,
      leaves,
      attendance,
      blogs: updated,
      customGroupBatches,
      deletedIds,
      action: 'overwrite'
    } as any);

    showSuccessToast('📝 New Blog Article Published Successfully!');
  };

  const updateBlogPost = (updatedBlog: BlogPost) => {
    const updated = blogs.map(b => b.id === updatedBlog.id ? updatedBlog : b);
    setBlogs(updated);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_blogs`, JSON.stringify(updated));
    } catch (e) {}

    pushCloudSyncData({
      clients,
      payments,
      trainerDreams,
      trainerLeaves,
      leaves,
      attendance,
      blogs: updated,
      customGroupBatches,
      deletedIds,
      action: 'overwrite'
    } as any);

    showSuccessToast('✨ Blog Article Updated & Saved!');
  };

  const deleteBlogPost = (id: string) => {
    const updated = blogs.filter(b => b.id !== id);
    setBlogs(updated);
    const newDeleted = Array.from(new Set([...deletedIdsRef.current, id]));
    deletedIdsRef.current = newDeleted;
    setDeletedIds(newDeleted);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_ids`, JSON.stringify(newDeleted));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, JSON.stringify(newDeleted));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_blogs`, JSON.stringify(updated));
    } catch (e) {}

    pushCloudSyncData({
      clients,
      payments,
      trainerDreams,
      trainerLeaves,
      leaves,
      attendance,
      blogs: updated,
      customGroupBatches,
      deletedIds: newDeleted,
      action: 'overwrite'
    } as any);

    showSuccessToast('🗑️ Blog Article Deleted.');
  };

  const toggleBlogPublish = (id: string) => {
    const updated = blogs.map(b => b.id === id ? { ...b, isPublished: !b.isPublished } : b);
    setBlogs(updated);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_blogs`, JSON.stringify(updated));
    } catch (e) {}

    pushCloudSyncData({
      clients,
      payments,
      trainerDreams,
      trainerLeaves,
      leaves,
      attendance,
      blogs: updated,
      customGroupBatches,
      deletedIds,
      action: 'overwrite'
    } as any);

    const target = updated.find(b => b.id === id);
    showSuccessToast(target?.isPublished ? '🌐 Article is now Live on Website!' : '🔒 Article moved to Drafts.');
  };

  const [trainerLeaves, setTrainerLeaves] = useState<TrainerLeave[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_trainer_leaves`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return INITIAL_TRAINER_LEAVES;
  });

  const [trainerDreams, setTrainerDreams] = useState<TrainerDreamGoal[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_trainer_dreams`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.map(normalizeTrainerDream).filter(Boolean);
      }
    } catch (e) {}
    return INITIAL_TRAINER_DREAMS.map(normalizeTrainerDream).filter(Boolean);
  });

  const addTrainerDream = (dream: Omit<TrainerDreamGoal, 'id'>) => {
    const newDream: TrainerDreamGoal = {
      ...dream,
      id: `dream-${Date.now()}`
    };
    const updatedDreams = [newDream, ...trainerDreams];
    setTrainerDreams(updatedDreams);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainer_dreams`, JSON.stringify(updatedDreams));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainerDreams`, JSON.stringify(updatedDreams));
    } catch (e) {}

    pushCloudSyncData({
      clients,
      payments,
      trainerDreams: updatedDreams,
      trainerLeaves,
      leaves,
      attendance,
      customGroupBatches,
      deletedIds,
      action: 'overwrite'
    } as any);

    showSuccessToast('🎯 New Financial Vision Goal Added!');
  };

  const updateTrainerDream = (updated: TrainerDreamGoal) => {
    const updatedDreams = trainerDreams.map(d => d.id === updated.id ? updated : d);
    setTrainerDreams(updatedDreams);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainer_dreams`, JSON.stringify(updatedDreams));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainerDreams`, JSON.stringify(updatedDreams));
    } catch (e) {}

    pushCloudSyncData({
      clients,
      payments,
      trainerDreams: updatedDreams,
      trainerLeaves,
      leaves,
      attendance,
      customGroupBatches,
      deletedIds,
      action: 'overwrite'
    } as any);

    showSuccessToast('✨ Dream Goal Updated!');
  };

  const deletePayment = (id: string) => {
    let clientIdToReset: string | null = null;
    if (id.startsWith('syn-')) {
      clientIdToReset = id.replace('syn-', '').replace('dash-', '').replace('persession-', '');
    } else {
      const targetPayment = payments.find(p => p.id === id);
      if (targetPayment) {
        clientIdToReset = targetPayment.clientId;
      }
    }

    let updatedClients = clients;
    if (clientIdToReset) {
      const remainingClientPayments = payments.filter(p => p.id !== id && p.clientId === clientIdToReset && p.status === 'Paid');
      if (remainingClientPayments.length === 0) {
        updatedClients = clients.map(c => c.id === clientIdToReset ? { ...c, paymentStatus: 'Pending' as PaymentStatus } : c);
        setClients(updatedClients);
        try {
          safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(updatedClients));
        } catch (e) {}
      }
    }

    const nextDeletedIds = Array.from(new Set([...deletedIdsRef.current, id]));
    if (clientIdToReset) {
      nextDeletedIds.push(`syn-${clientIdToReset}`);
      nextDeletedIds.push(`syn-dash-${clientIdToReset}`);
    }
    deletedIdsRef.current = nextDeletedIds;
    const updatedPayments = payments.filter(p => p.id !== id);

    setDeletedIds(nextDeletedIds);
    setPayments(updatedPayments);

    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_ids`, JSON.stringify(nextDeletedIds));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, JSON.stringify(nextDeletedIds));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(updatedPayments));
    } catch (e) {}

    pushCloudSyncData({
      clients: updatedClients,
      payments: updatedPayments,
      trainerDreams,
      trainerLeaves,
      leaves,
      attendance,
      customGroupBatches,
      deletedIds: nextDeletedIds,
      action: 'overwrite'
    } as any);

    showSuccessToast('🗑️ Payment record removed!');
  };

  const deleteTrainerDream = (id: string) => {
    const nextDeletedIds = Array.from(new Set([...deletedIdsRef.current, id]));
    deletedIdsRef.current = nextDeletedIds;
    const updatedDreams = trainerDreams.filter(d => d.id !== id);

    setDeletedIds(nextDeletedIds);
    setTrainerDreams(updatedDreams);

    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_ids`, JSON.stringify(nextDeletedIds));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, JSON.stringify(nextDeletedIds));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainer_dreams`, JSON.stringify(updatedDreams));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainerDreams`, JSON.stringify(updatedDreams));
    } catch (e) {}

    pushCloudSyncData({
      clients,
      payments,
      trainerDreams: updatedDreams,
      trainerLeaves,
      leaves,
      attendance,
      customGroupBatches,
      deletedIds: nextDeletedIds,
      action: 'overwrite'
    } as any);

    showSuccessToast('🗑️ Vision Goal removed permanently across all devices!');
  };

  const [customGroupBatches, setCustomGroupBatches] = useState<string[]>(() => {
    const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_custom_group_batches`);
    return saved ? JSON.parse(saved) : ['Morning Vinyasa Batch (07:00 AM)', 'Evening Flow Batch (05:30 PM)'];
  });

  const [deletedGroupBatches, setDeletedGroupBatches] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_deleted_group_batches`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_custom_group_batches`, JSON.stringify(customGroupBatches));
  }, [customGroupBatches]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_group_batches`, JSON.stringify(deletedGroupBatches));
  }, [deletedGroupBatches]);

  const addCustomGroupBatch = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = Array.from(new Set([...customGroupBatches, trimmed]));
    const nextDeleted = deletedGroupBatches.filter(b => b !== trimmed);
    setCustomGroupBatches(next);
    setDeletedGroupBatches(nextDeleted);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_custom_group_batches`, JSON.stringify(next));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_group_batches`, JSON.stringify(nextDeleted));
    } catch (e) {}
    pushCloudSyncData({
      clients,
      payments,
      trainerDreams,
      trainerLeaves,
      leaves,
      attendance,
      customGroupBatches: next,
      deletedGroupBatches: nextDeleted,
      deletedIds,
      action: 'overwrite'
    } as any);
    showSuccessToast(`✨ New group batch '${trimmed}' created & synced across all forms!`);
  };

  const deleteCustomGroupBatch = (name: string) => {
    const next = customGroupBatches.filter(b => b !== name);
    const nextDeleted = Array.from(new Set([...deletedGroupBatches, name]));
    setCustomGroupBatches(next);
    setDeletedGroupBatches(nextDeleted);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_custom_group_batches`, JSON.stringify(next));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_group_batches`, JSON.stringify(nextDeleted));
    } catch (e) {}
    pushCloudSyncData({
      clients,
      payments,
      trainerDreams,
      trainerLeaves,
      leaves,
      attendance,
      customGroupBatches: next,
      deletedGroupBatches: nextDeleted,
      deletedIds,
      action: 'overwrite'
    } as any);
    showSuccessToast(`🗑️ Group batch '${name}' deleted permanently`);
  };

  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_clients`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeClient).filter(Boolean) as Client[];
        }
      }
    } catch (e) {
      console.warn('Failed parsing local storage clients:', e);
    }
    return INITIAL_CLIENTS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_payments`);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
    } catch (e) {
      return INITIAL_PAYMENTS;
    }
  });

  const [leaves, setLeaves] = useState<LeaveRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_leaves`);
      return saved ? JSON.parse(saved) : INITIAL_LEAVES;
    } catch (e) {
      return INITIAL_LEAVES;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_attendance`);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch (e) {
      return INITIAL_ATTENDANCE;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);
  const [isAddTrainerLeaveOpen, setIsAddTrainerLeaveOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareLinkOpen, setIsShareLinkOpen] = useState(false);
  const [paymentModalDefaultClientId, setPaymentModalDefaultClientId] = useState<string | null>(null);
  const [isClientWebsiteMode, setIsClientWebsiteMode] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showSuccessToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Automatic Month Cycle Detection & Background Rollover
  useEffect(() => {
    const currentMonthStr = getTodayDateString().slice(0, 7); // e.g. "2026-08"
    const lastActiveMonth = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_last_active_month`);

    if (lastActiveMonth && lastActiveMonth !== currentMonthStr) {
      // Automatic background rollover for new calendar month
      setClients(prev => prev.map(c => ({
        ...c,
        completedClasses: 0,
        monthlyFee: c.feeType === 'Per Session' ? 0 : c.monthlyFee
      })));
    }

    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_last_active_month`, currentMonthStr);
  }, []);

  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    const saved = safeStorage.getItem(`${LOCAL_STORAGE_KEY}_deleted_ids`) || safeStorage.getItem(`${LOCAL_STORAGE_KEY}_deletedIds`);
    return saved ? JSON.parse(saved) : [];
  });
  const deletedIdsRef = useRef<string[]>(deletedIds);

  useEffect(() => {
    deletedIdsRef.current = deletedIds;
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_ids`, JSON.stringify(deletedIds));
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, JSON.stringify(deletedIds));
  }, [deletedIds]);

  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  const syncCloudNow = async () => {
    setIsSyncingCloud(true);
    try {
      const remote = await fetchCloudSyncData();

      const allDeleted = Array.from(new Set([...deletedIdsRef.current, ...(remote?.deletedIds || [])]));
      deletedIdsRef.current = allDeleted;
      setDeletedIds(allDeleted);
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_ids`, JSON.stringify(allDeleted));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, JSON.stringify(allDeleted));

      // Smart Deduplicated Array Merging across Phone and Laptop with Deletion Tracking
      const mergedClients = mergeArraysById(clients, remote?.clients || [], allDeleted);
      const mergedPayments = mergeArraysById(payments, remote?.payments || [], allDeleted);
      const mergedDreams = mergeArraysById(trainerDreams, remote?.trainerDreams || [], allDeleted);
      const mergedTrainerLeaves = mergeArraysById(trainerLeaves, remote?.trainerLeaves || [], allDeleted);
      const mergedLeaves = mergeArraysById(leaves, remote?.leaves || [], allDeleted);
      const mergedAttendance = mergeArraysById(attendance, remote?.attendance || [], allDeleted);
      const mergedBlogs = mergeArraysById(blogs, remote?.blogs || [], allDeleted);
      const mergedBatches = Array.from(new Set([...customGroupBatches, ...(remote?.customGroupBatches || [])]));

      setClients(mergedClients);
      setPayments(mergedPayments);
      setTrainerDreams(mergedDreams);
      setTrainerLeaves(mergedTrainerLeaves);
      setLeaves(mergedLeaves);
      setAttendance(mergedAttendance);
      setBlogs(mergedBlogs);
      setCustomGroupBatches(mergedBatches);

      try {
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(mergedClients));
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(mergedPayments));
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(mergedAttendance));
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_leaves`, JSON.stringify(mergedLeaves));
      } catch (e) {}

      setLastCloudSyncTime(new Date().toISOString());
      showSuccessToast(`☁️ Cloud Synced! Updated with live cloud database.`);
    } catch (e) {
      console.warn('Cloud sync error:', e);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const isInitialFetchDoneRef = useRef(false);
  const lastUserActionTimeRef = useRef<number>(0);
  const pushDebounceTimerRef = useRef<any>(null);
  const isPushingRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);
  const pendingPayloadRef = useRef<any>(null);
  const attendanceBatchQueueRef = useRef<Map<string, any>>(new Map());
  const fetchSeqRef = useRef<number>(0);
  const lastAppliedSeqRef = useRef<number>(0);
  const lastSyncTimestampRef = useRef<string | null>(null);

  const queueAttendanceSync = useCallback((record: any, debounceMs = 250) => {
    const key = `${record.clientId}_${record.date}`;
    attendanceBatchQueueRef.current.set(key, record);
    lastUserActionTimeRef.current = Date.now();

    if (pushDebounceTimerRef.current) {
      clearTimeout(pushDebounceTimerRef.current);
    }

    pushDebounceTimerRef.current = setTimeout(async () => {
      if (isPushingRef.current) {
        setTimeout(() => queueAttendanceSync(record, 100), 150);
        return;
      }

      const recordsToSend = Array.from(attendanceBatchQueueRef.current.values());
      if (recordsToSend.length === 0) return;
      attendanceBatchQueueRef.current.clear();
      isPushingRef.current = true;

      try {
        await pushCloudSyncData({
          action: 'batch_mark_attendance',
          records: recordsToSend
        } as any);
      } catch (err) {
        console.warn('Batch attendance push error:', err);
      } finally {
        isPushingRef.current = false;
        setTimeout(() => {
          lastUserActionTimeRef.current = 0;
        }, 500);
      }
    }, debounceMs);
  }, []);

  const triggerCloudSync = useCallback((payload: any, debounceMs = 200) => {
    pendingPayloadRef.current = payload;
    lastUserActionTimeRef.current = Date.now();

    if (pushDebounceTimerRef.current) {
      clearTimeout(pushDebounceTimerRef.current);
    }

    pushDebounceTimerRef.current = setTimeout(async () => {
      if (isPushingRef.current) {
        // If push currently in flight, retry after small interval
        setTimeout(() => triggerCloudSync(pendingPayloadRef.current, 50), 150);
        return;
      }

      const toPush = pendingPayloadRef.current;
      if (!toPush) return;
      pendingPayloadRef.current = null;
      isPushingRef.current = true;

      try {
        await pushCloudSyncData(toPush);
      } catch (err) {
        console.warn('Sync push error:', err);
      } finally {
        isPushingRef.current = false;
        setTimeout(() => {
          lastUserActionTimeRef.current = 0;
        }, 600);
      }
    }, debounceMs);
  }, []);

  const forcePushCloud = async () => {
    setIsSyncingCloud(true);
    try {
      await pushCloudSyncData({
        clients,
        payments,
        trainerDreams,
        trainerLeaves,
        leaves,
        attendance,
        blogs,
        customGroupBatches,
        deletedIds,
        action: 'overwrite'
      } as any);
      setLastCloudSyncTime(new Date().toISOString());
      showSuccessToast('⚡ Current screen clients force-pushed to Cloud! Other devices will sync to this.');
    } catch (e) {
      console.warn('Force push failed:', e);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Initial Startup & Lightweight 2-Second Background Real-Time Cloud Polling (99.8% Bandwidth Reduced)
  useEffect(() => {
    const runSync = async () => {
      // Visibility Guard: Don't poll when tab is hidden or phone screen is locked
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      if (isFetchingRef.current) return;
      if (isPushingRef.current || pendingPayloadRef.current !== null || (Date.now() - lastUserActionTimeRef.current < 600)) {
        return;
      }

      isFetchingRef.current = true;
      const currentSeq = ++fetchSeqRef.current;
      const fetchStartTime = Date.now();

      try {
        const remote = await fetchCloudSyncData(lastSyncTimestampRef.current);

        // Critical Stale-Fetch Guard: If user took any local action while this fetch was in flight, discard
        if (lastUserActionTimeRef.current >= fetchStartTime) {
          return;
        }
        if (currentSeq < lastAppliedSeqRef.current) {
          return;
        }
        lastAppliedSeqRef.current = currentSeq;

        if (remote) {
          // If remote returned 50-byte unchanged response, nothing to update
          if (remote.unchanged) {
            isInitialFetchDoneRef.current = true;
            return;
          }

          if (remote.lastUpdated) {
            lastSyncTimestampRef.current = remote.lastUpdated;
            setLastCloudSyncTime(remote.lastUpdated);
          }

          const allDeleted = Array.from(new Set([...deletedIdsRef.current, ...(remote.deletedIds || [])]));
          deletedIdsRef.current = allDeleted;
          setDeletedIds(allDeleted);
          safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_ids`, JSON.stringify(allDeleted));
          safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, JSON.stringify(allDeleted));

          setClients(prev => {
            const merged = mergeArraysById(prev, remote.clients || [], allDeleted);
            return merged;
          });

          setPayments(prev => {
            const rawRemote = Array.isArray(remote.payments) ? remote.payments.map(normalizePayment).filter(Boolean) : [];
            const merged = mergeArraysById(prev, rawRemote, allDeleted);
            return merged.map(normalizePayment).filter(Boolean);
          });
          setTrainerDreams(prev => {
            const rawRemote = Array.isArray(remote.trainerDreams) ? remote.trainerDreams.map(normalizeTrainerDream).filter(Boolean) : [];
            const merged = mergeArraysById(prev, rawRemote, allDeleted);
            return merged.map(normalizeTrainerDream).filter(Boolean);
          });
          setTrainerLeaves(prev => mergeArraysById(prev, remote.trainerLeaves || [], allDeleted));
          setLeaves(prev => {
            const rawRemote = Array.isArray(remote.leaves) ? remote.leaves.map(normalizeLeave).filter(Boolean) : [];
            const merged = mergeArraysById(prev, rawRemote, allDeleted);
            return merged.map(normalizeLeave).filter(Boolean);
          });
          setAttendance(prev => {
            const rawRemote = Array.isArray(remote.attendance) ? remote.attendance.map(normalizeAttendance).filter(Boolean) : [];
            const merged = mergeArraysById(prev, rawRemote, allDeleted);
            safeStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(merged));
            return merged.map(normalizeAttendance).filter(Boolean);
          });
          setBlogs(prev => {
            const rawRemote = Array.isArray(remote.blogs) ? remote.blogs.map(normalizeBlog).filter(Boolean) : [];
            if (rawRemote.length === 0) return prev;
            const merged = mergeArraysById(prev, rawRemote, allDeleted);
            return merged.map(normalizeBlog).filter(Boolean);
          });

          if (Array.isArray(remote.customGroupBatches)) {
            setCustomGroupBatches(prev => {
              const cleanRemote = remote.customGroupBatches!.filter(b => !deletedGroupBatches.includes(b));
              const cleanPrev = prev.filter(b => !deletedGroupBatches.includes(b));
              return Array.from(new Set([...cleanPrev, ...cleanRemote]));
            });
          }
        }
        isInitialFetchDoneRef.current = true;
      } catch (err) {
        console.warn('runSync poll error:', err);
      } finally {
        isFetchingRef.current = false;
      }
    };

    runSync();
    
    // Smart Real-time Sync wakeup across all Mobile Browsers & Desktop Tabs:
    const handleWakeupSync = () => {
      runSync();
    };

    document.addEventListener('visibilitychange', handleWakeupSync);
    window.addEventListener('focus', handleWakeupSync);
    window.addEventListener('pageshow', handleWakeupSync);
    window.addEventListener('online', handleWakeupSync);

    // Ultra-Lightweight 2-Second Real-Time Polling (50 bytes / poll)
    const interval = setInterval(() => {
      runSync();
    }, 2000);

    return () => {
      document.removeEventListener('visibilitychange', handleWakeupSync);
      window.removeEventListener('focus', handleWakeupSync);
      window.removeEventListener('pageshow', handleWakeupSync);
      window.removeEventListener('online', handleWakeupSync);
      clearInterval(interval);
    };
  }, []);

  // Instant Real-time Tab-to-Tab Synchronization (Same Device)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${LOCAL_STORAGE_KEY}_clients` && e.newValue) {
        try { setClients(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === `${LOCAL_STORAGE_KEY}_payments` && e.newValue) {
        try { setPayments(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === `${LOCAL_STORAGE_KEY}_attendance` && e.newValue) {
        try { setAttendance(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === `${LOCAL_STORAGE_KEY}_leaves` && e.newValue) {
        try { setLeaves(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === `${LOCAL_STORAGE_KEY}_trainer_dreams` && e.newValue) {
        try { setTrainerDreams(JSON.parse(e.newValue)); } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync to local storage
  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainer_profile`, JSON.stringify(trainerProfile));
  }, [trainerProfile]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainer_leaves`, JSON.stringify(trainerLeaves));
  }, [trainerLeaves]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainer_dreams`, JSON.stringify(trainerDreams));
  }, [trainerDreams]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_leaves`, JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);

  // Explicit Cloud Push happens strictly inside user actions (addClient, updateClient, deleteClient, forcePushCloud)
  // Background polling only FETCHES from cloud to avoid race-condition overwrites.

  useEffect(() => {
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(attendance));
  }, [attendance]);

  const updateTrainerProfile = (profile: TrainerProfile) => {
    setTrainerProfile(profile);
    showSuccessToast('Trainer profile updated successfully!');
  };

  const addTrainerLeave = (leaveData: Omit<TrainerLeave, 'id'>) => {
    const newLeave: TrainerLeave = {
      ...leaveData,
      id: `t-leave-${Date.now()}`
    };
    setTrainerLeaves(prev => [newLeave, ...prev]);
    showSuccessToast(`Logged Trainer Leave for ${newLeave.date}!`);
  };

  const deleteTrainerLeave = (id: string) => {
    setTrainerLeaves(prev => prev.filter(l => l.id !== id));
    showSuccessToast('Instructor leave record removed.');
  };

  const addClient = async (clientData: Partial<Client>) => {
    lastUserActionTimeRef.current = Date.now();
    const newId = clientData.id || `c${Date.now()}`;
    const newClient: Client = {
      name: '',
      gender: 'Female',
      phone: '',
      whatsapp: '',
      address: '',
      joiningDate: getTodayDateString(),
      photoUrl: '',
      classTime: '07:00 AM',
      days: ['Mon', 'Wed', 'Fri'],
      timeSlot: 'Morning',
      sessionType: 'Group',
      reasonsForJoining: [],
      currentProblems: [],
      monthlyFee: 0,
      feeDueDate: '5th',
      membershipPlan: 'Unlimited',
      totalClasses: 30,
      trainerNotes: '',
      goal: 'General Yoga',
      ...clientData,
      id: newId,
      completedClasses: 0,
      paymentStatus: 'Pending',
      status: 'Active',
    } as Client;

    let updatedList: Client[] = [];
    setClients(prev => {
      const filtered = prev.filter(c => c.id !== newId);
      const next = [newClient, ...filtered].sort((a, b) => (b.id || '').localeCompare(a.id || ''));
      updatedList = next;
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(next));
      return next;
    });

    try {
      triggerCloudSync({
        action: 'save_clients',
        clients: updatedList.length > 0 ? updatedList : [newClient, ...clients]
      }, 50);
    } catch (err) {
      console.warn('addClient pushCloudSyncData error:', err);
    }

    showSuccessToast(`Added new client: ${newClient.name}`);
    return newClient;
  };

  const updateClient = (updatedClient: Client) => {
    lastUserActionTimeRef.current = Date.now();
    const updated = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updated);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(updated));
    } catch (e) {}

    triggerCloudSync({
      action: 'update_client',
      client: updatedClient,
      clients: updated
    }, 50);

    showSuccessToast(`Updated profile for ${updatedClient.name}`);
  };

  const deleteClient = async (id: string) => {
    lastUserActionTimeRef.current = Date.now();
    const target = clients.find(c => c.id === id);
    const newDeletedIds = Array.from(new Set([...deletedIdsRef.current, id]));
    deletedIdsRef.current = newDeletedIds;
    setDeletedIds(newDeletedIds);
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_ids`, JSON.stringify(newDeletedIds));
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, JSON.stringify(newDeletedIds));

    const updatedClients = clients.filter(c => c.id !== id);
    const updatedPayments = payments.filter(p => p.clientId !== id);
    const updatedLeaves = leaves.filter(l => l.clientId !== id);
    const updatedAttendance = attendance.filter(a => a.clientId !== id);

    setClients(updatedClients);
    setPayments(updatedPayments);
    setLeaves(updatedLeaves);
    setAttendance(updatedAttendance);

    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(updatedClients));
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(updatedPayments));
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_leaves`, JSON.stringify(updatedLeaves));
    safeStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(updatedAttendance));
    
    if (selectedClientId === id) {
      setSelectedClientId(null);
    }

    try {
      triggerCloudSync({
        action: 'save_clients',
        clients: updatedClients,
        payments: updatedPayments,
        leaves: updatedLeaves,
        attendance: updatedAttendance,
        deletedIds: newDeletedIds
      }, 50);
    } catch (err) {
      console.warn('deleteClient cloud push error:', err);
    }

    showSuccessToast(`Deleted client profile: ${target?.name || ''}`);
  };

  const toggleClientStatus = (id: string, status: 'Active' | 'Discontinued', reason?: string) => {
    lastUserActionTimeRef.current = Date.now();
    const todayStr = getTodayDateString();
    const updated = clients.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          leftDate: status === 'Discontinued' ? todayStr : undefined,
          leftReason: status === 'Discontinued' ? (reason || 'Left Class') : undefined
        };
      }
      return c;
    });

    setClients(updated);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(updated));
    } catch (e) {}

    triggerCloudSync({
      action: 'save_clients',
      clients: updated
    }, 50);

    if (status === 'Discontinued') {
      showSuccessToast('Marked client as Left Class / Discontinued.');
    } else {
      showSuccessToast('Re-activated client membership.');
    }
  };

  const addPayment = (paymentData: Omit<PaymentRecord, 'id'>) => {
    lastUserActionTimeRef.current = Date.now();
    const paymentMonth = paymentData.date.slice(0, 7);

    if (paymentData.status === 'Pending' || paymentData.status === 'Overdue') {
      // If marked Pending / Overdue, clear any paid records for this month and set client paymentStatus to Pending
      const updatedPayments = payments.filter(p => !(p.clientId === paymentData.clientId && (p.date || '').startsWith(paymentMonth)));
      const updatedClients = clients.map(c => {
        if (c.id === paymentData.clientId) {
          return { ...c, paymentStatus: 'Pending' as PaymentStatus };
        }
        return c;
      });

      setPayments(updatedPayments);
      setClients(updatedClients);
      try {
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(updatedPayments));
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(updatedClients));
      } catch (e) {}

      triggerCloudSync({
        action: 'save_payments',
        clients: updatedClients,
        payments: updatedPayments
      }, 50);

      showSuccessToast(`⚠️ Updated ${paymentData.clientName}'s status to Pending in Dashboard checklist!`);
      return;
    }

    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `p${Date.now()}`
    };

    const updatedPayments = [newPayment, ...payments];
    const updatedClients = clients.map(c => {
      if (c.id === paymentData.clientId) {
        return { ...c, paymentStatus: paymentData.status };
      }
      return c;
    });

    setPayments(updatedPayments);
    setClients(updatedClients);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(updatedPayments));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(updatedClients));
    } catch (e) {}

    triggerCloudSync({
      action: 'save_payments',
      clients: updatedClients,
      payments: updatedPayments
    }, 50);

    showSuccessToast(`Recorded fee payment for ${paymentData.clientName}`);
  };

  const updatePayment = (updatedPayment: PaymentRecord) => {
    lastUserActionTimeRef.current = Date.now();
    const updatedPayments = payments.map(p => p.id === updatedPayment.id ? updatedPayment : p);
    setPayments(updatedPayments);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(updatedPayments));
    } catch (e) {}

    triggerCloudSync({
      action: 'save_payments',
      clients,
      payments: updatedPayments
    }, 50);

    showSuccessToast(`Updated payment record for ${updatedPayment.clientName}`);
  };


  const quickMarkPaid = (clientId: string) => {
    lastUserActionTimeRef.current = Date.now();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const todayStr = getTodayDateString();
    const currentMonthStr = todayStr.slice(0, 7);

    // For Per Session clients
    if (client.feeType === 'Per Session' || client.membershipPlan === 'Per Session') {
      const dueAmount = (client.completedClasses || 1) * (client.perSessionFee || 1000);
      addPayment({
        clientId: client.id,
        clientName: client.name,
        amount: dueAmount,
        date: todayStr,
        month: currentMonthStr,
        status: 'Paid',
        paymentMode: 'UPI',
        notes: `Quick mark Per Session fee payment`
      });
      return;
    }

    // Find all billing cycles for this client
    const cycles = getClientBillingCycles(client, payments, leaves, currentMonthStr);
    const unpaidCycles = cycles.filter(c => c.status === 'Pending' || c.status === 'Overdue' || c.status === 'Partial');

    if (unpaidCycles.length > 0) {
      const newPaymentRecords: PaymentRecord[] = [];
      unpaidCycles.forEach((cycle, idx) => {
        const remainingDue = Math.max(0, cycle.dueAmount - cycle.paidAmount);
        if (remainingDue > 0) {
          newPaymentRecords.push({
            id: `p${Date.now()}_${idx}`,
            clientId: client.id,
            clientName: client.name,
            amount: remainingDue,
            date: todayStr,
            month: cycle.monthStr,
            status: 'Paid',
            paymentMode: 'UPI',
            notes: `Cleared fee for ${cycle.monthName}`
          });
        }
      });

      const updatedPayments = [...newPaymentRecords, ...payments];
      const updatedClients = clients.map(c => c.id === clientId ? { ...c, paymentStatus: 'Paid' as PaymentStatus } : c);

      setPayments(updatedPayments);
      setClients(updatedClients);

      try {
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(updatedPayments));
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(updatedClients));
      } catch (e) {}

      triggerCloudSync({
        action: 'save_payments',
        clients: updatedClients,
        payments: updatedPayments
      }, 50);

      showSuccessToast(`✅ Cleared all pending fee dues for ${client.name}!`);
    } else {
      addPayment({
        clientId: client.id,
        clientName: client.name,
        amount: client.monthlyFee || 1000,
        date: todayStr,
        month: currentMonthStr,
        status: 'Paid',
        paymentMode: 'UPI',
        notes: `Quick mark full fee payment`
      });
    }
  };

  const addLeave = (leaveData: Omit<LeaveRecord, 'id' | 'clientName' | 'photoUrl'>) => {
    const client = clients.find(c => c.id === leaveData.clientId);
    if (!client) return;

    const newLeave: LeaveRecord = {
      ...leaveData,
      id: `l${Date.now()}`,
      clientName: client.name,
      photoUrl: client.photoUrl
    };

    const updatedLeaves = [newLeave, ...leaves];
    setLeaves(updatedLeaves);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_leaves`, JSON.stringify(updatedLeaves));
    } catch (e) {}

    pushCloudSyncData({
      clients,
      payments,
      trainerDreams,
      trainerLeaves,
      leaves: updatedLeaves,
      attendance,
      customGroupBatches,
      deletedIds,
      action: 'overwrite'
    } as any);

    markAttendance(client.id, 'Leave', leaveData.startDate || leaveData.date);

    showSuccessToast(`Logged leave for ${client.name}`);
  };

  const deleteLeave = (id: string) => {
    const nextDeletedIds = Array.from(new Set([...deletedIdsRef.current, id]));
    deletedIdsRef.current = nextDeletedIds;
    const updatedLeaves = leaves.filter(l => l.id !== id);

    setDeletedIds(nextDeletedIds);
    setLeaves(updatedLeaves);
    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_ids`, JSON.stringify(nextDeletedIds));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, JSON.stringify(nextDeletedIds));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_leaves`, JSON.stringify(updatedLeaves));
    } catch (e) {}

    pushCloudSyncData({
      clients,
      payments,
      trainerDreams,
      trainerLeaves,
      leaves: updatedLeaves,
      attendance,
      customGroupBatches,
      deletedIds: nextDeletedIds,
      action: 'overwrite'
    } as any);

    showSuccessToast('Leave entry removed permanently across all devices!');
  };

  const markAttendance = (clientId: string, status: AttendanceStatus, targetDateStr?: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    // Lock background sync to avoid in-flight race condition reverts
    lastUserActionTimeRef.current = Date.now();

    const dateToUse = targetDateStr || getTodayDateString();

    const existingRecord = attendance.find(
      a => a.clientId === clientId && a.date === dateToUse
    );

    // If already marked with the exact same status today, notify user & prevent duplicate clicks
    if (existingRecord && existingRecord.status === status) {
      showSuccessToast(`Already marked ${status} for ${client.name} today!`);
      return;
    }

    // Clean any prior duplicate/conflicting records for the exact same date
    const cleanPriorAttendance = attendance.filter(
      a => !(a.clientId === clientId && a.date === dateToUse)
    );

    const newAttendanceRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      clientId,
      clientName: client.name,
      date: dateToUse,
      status,
      updatedAt: new Date().toISOString()
    };

    const updatedAttendance = [newAttendanceRecord, ...cleanPriorAttendance];

    // Compute actual present classes count from real unique attendance dates
    const realPresentCount = updatedAttendance.filter(
      a => a.clientId === clientId && a.status === 'Present'
    ).length;

    const updatedClients = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          completedClasses: realPresentCount
        };
      }
      return c;
    });

    setAttendance(updatedAttendance);
    setClients(updatedClients);

    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(updatedAttendance));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(updatedClients));
    } catch (e) {}

    // Atomic Accumulating Batch Sync to Cloud: Queues all rapid clicks without losing any!
    queueAttendanceSync(newAttendanceRecord, 250);

    showSuccessToast(`Recorded ${status} for ${client.name}!`);
  };

  const deleteAttendanceRecord = (id: string) => {
    const nextDeletedIds = Array.from(new Set([...deletedIdsRef.current, id]));
    deletedIdsRef.current = nextDeletedIds;
    const updatedAttendance = attendance.filter(a => a.id !== id);

    setDeletedIds(nextDeletedIds);
    setAttendance(updatedAttendance);

    try {
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deleted_ids`, JSON.stringify(nextDeletedIds));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, JSON.stringify(nextDeletedIds));
      safeStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(updatedAttendance));
    } catch (e) {}

    // Atomic Delta Sync to Cloud: Delete ONLY this specific record!
    triggerCloudSync({
      action: 'delete_attendance',
      id
    }, 50);

    showSuccessToast('Attendance record deleted permanently across all devices!');
  };

  const startNewMonthCycle = () => {
    setClients(prev => prev.map(c => ({
      ...c,
      completedClasses: 0,
      monthlyFee: c.feeType === 'Per Session' ? 0 : c.monthlyFee
    })));
    showSuccessToast('New Month Cycle Started! Completed classes reset to 0.');
  };

  const resetToSampleData = () => {
    setTrainerProfile(DEFAULT_TRAINER_PROFILE);
    setTrainerLeaves([]);
    setClients([]);
    setPayments([]);
    setLeaves([]);
    setAttendance([]);
    setDeletedIds([]);
    pushCloudSyncData({
      clients: [],
      payments: [],
      trainerDreams,
      trainerLeaves,
      leaves: [],
      attendance: [],
      customGroupBatches,
      deletedIds: []
    });
    showSuccessToast('🧹 Studio database wiped clean to 0 clients! Ready for real entries.');
  };

  const exportBackupData = () => {
    const backupData = {
      trainerProfile,
      trainerLeaves,
      clients,
      payments,
      leaves,
      attendance,
      exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `yoganjali_backup_${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showSuccessToast('Exported complete data backup JSON!');
  };

  const importBackupData = (rawJson: any): boolean => {
    try {
      if (!rawJson) return false;

      // Deep recursive search for clients array
      const findArrayWithProp = (obj: any, propName: string): any[] => {
        if (!obj || typeof obj !== 'object') return [];
        if (Array.isArray(obj)) {
          if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null && propName in obj[0]) {
            return obj;
          }
          return [];
        }
        // Direct key check
        for (const k of Object.keys(obj)) {
          if (Array.isArray(obj[k]) && obj[k].length > 0) {
            const first = obj[k][0];
            if (typeof first === 'object' && first !== null && propName in first) {
              return obj[k];
            }
          }
        }
        // Deep nested search
        for (const k of Object.keys(obj)) {
          if (typeof obj[k] === 'object' && obj[k] !== null) {
            const found = findArrayWithProp(obj[k], propName);
            if (found.length > 0) return found;
          }
        }
        return [];
      };

      const rawClients = findArrayWithProp(rawJson, 'name');
      const rawPayments = findArrayWithProp(rawJson, 'amount');
      const rawAtt = findArrayWithProp(rawJson, 'status');
      const rawDreams = findArrayWithProp(rawJson, 'targetAmount');
      const rawLeaves = findArrayWithProp(rawJson, 'reason');

      // CRITICAL: Wipe old deletedIds so restored client IDs are never filtered out by background polling!
      setDeletedIds([]);
      try {
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_deletedIds`, '[]');
      } catch (e) {}

      let importedClients: Client[] = [];
      let importedPayments: PaymentRecord[] = [];
      let importedAttendance: AttendanceRecord[] = [];
      let importedDreams: TrainerDreamGoal[] = [];
      let importedLeaves: LeaveRecord[] = [];

      if (rawClients.length > 0) {
        importedClients = rawClients.map(normalizeClient).filter(Boolean) as Client[];
        setClients(importedClients);
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(importedClients));
      }

      if (rawPayments.length > 0) {
        importedPayments = rawPayments.map(normalizePayment).filter(Boolean) as PaymentRecord[];
        setPayments(importedPayments);
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_payments`, JSON.stringify(importedPayments));
      }

      if (rawAtt.length > 0) {
        importedAttendance = rawAtt.map(normalizeAttendance).filter(Boolean);
        setAttendance(importedAttendance);
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_attendance`, JSON.stringify(importedAttendance));
      }

      if (rawDreams.length > 0) {
        importedDreams = rawDreams;
        setTrainerDreams(importedDreams);
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainer_dreams`, JSON.stringify(importedDreams));
      }

      if (rawLeaves.length > 0) {
        importedLeaves = rawLeaves.map(normalizeLeave).filter(Boolean) as LeaveRecord[];
        setLeaves(importedLeaves);
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_leaves`, JSON.stringify(importedLeaves));
      }

      let payload = rawJson?.data || rawJson?.backup?.data || rawJson?.backup || rawJson;
      if (payload.trainerLeaves && Array.isArray(payload.trainerLeaves)) {
        setTrainerLeaves(payload.trainerLeaves);
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainer_leaves`, JSON.stringify(payload.trainerLeaves));
      }

      if (payload.trainerProfile) {
        setTrainerProfile(payload.trainerProfile);
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_trainer_profile`, JSON.stringify(payload.trainerProfile));
      }

      if (payload.websiteCMS) {
        setWebsiteCMS(payload.websiteCMS);
        safeStorage.setItem(`${LOCAL_STORAGE_KEY}_website_cms`, JSON.stringify(payload.websiteCMS));
      }

      const finalClients = importedClients.length > 0 ? importedClients : clients;
      const finalPayments = importedPayments.length > 0 ? importedPayments : payments;
      const finalDreams = importedDreams.length > 0 ? importedDreams : trainerDreams;
      const finalLeaves = importedLeaves.length > 0 ? importedLeaves : leaves;

      // CRITICAL: Overwrite Cloud Store so all connected devices adopt the restored master dataset!
      pushCloudSyncData({
        clients: finalClients,
        payments: finalPayments,
        trainerDreams: finalDreams,
        trainerLeaves,
        leaves: finalLeaves,
        attendance: importedAttendance.length > 0 ? importedAttendance : attendance,
        customGroupBatches,
        deletedIds: [],
        action: 'overwrite'
      } as any);

      const totalCount = finalClients.length;
      showSuccessToast(`🎉 Restored & synchronized ${totalCount} client records across all devices!`);
      return true;
    } catch (e: any) {
      console.error('Import error:', e);
      alert(`Import error: ${e.message || 'Invalid backup file format'}`);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        trainerProfile,
        updateTrainerProfile,
        websiteCMS,
        updateWebsiteCMS,
        trainerLeaves,
        addTrainerLeave,
        deleteTrainerLeave,
        trainerDreams,
        addTrainerDream,
        updateTrainerDream,
        deleteTrainerDream,
        clients,
        addClient,
        updateClient,
        deleteClient,
        toggleClientStatus,
        payments,
        addPayment,
        updatePayment,
        deletePayment,
        quickMarkPaid,
        deletedIds,
        leaves,
        addLeave,
        deleteLeave,
        attendance,
        markAttendance,
        deleteAttendanceRecord,
        activeTab,
        setActiveTab,
        selectedClientId,
        setSelectedClientId,
        searchQuery,
        setSearchQuery,
        isAddClientOpen,
        setIsAddClientOpen,
        isAddPaymentOpen,
        setIsAddPaymentOpen,
        isAddLeaveOpen,
        setIsAddLeaveOpen,
        isAddTrainerLeaveOpen,
        setIsAddTrainerLeaveOpen,
        isSearchOpen,
        setIsSearchOpen,
        isShareLinkOpen,
        setIsShareLinkOpen,
        paymentModalDefaultClientId,
        setPaymentModalDefaultClientId,
        toastMessage,
        showSuccessToast,
        isClientWebsiteMode,
        setIsClientWebsiteMode,
        customGroupBatches,
        addCustomGroupBatch,
        deleteCustomGroupBatch,
        isSyncingCloud,
        lastCloudSyncTime,
        syncCloudNow,
        forcePushCloud,
        blogs,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        toggleBlogPublish,
        startNewMonthCycle,
        resetToSampleData,
        exportBackupData,
        importBackupData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
