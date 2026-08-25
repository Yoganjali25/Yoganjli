import { fetchFromSupabase, pushToSupabase } from './supabaseSync';

export interface CloudDataPayload {
  clients: any[];
  payments: any[];
  trainerDreams: any[];
  trainerLeaves: any[];
  leaves?: any[];
  attendance: any[];
  blogs?: any[];
  customGroupBatches?: string[];
  deletedIds?: string[];
  lastUpdated: string;
}

// Same-domain Vercel Serverless Sync API Endpoint
const ENDPOINTS = [
  '/api/sync'
];

export const normalizeClassTime = (rawTime: any): string => {
  if (!rawTime || typeof rawTime !== 'string') return '07:00 AM';
  const clean = rawTime.trim();
  const match = clean.match(/^(\d{1,2})[:.](\d{1,2})\s*(AM|PM)?$/i);
  if (match) {
    const hh = match[1].padStart(2, '0');
    const mm = match[2].padStart(2, '0');
    const period = match[3] ? match[3].toUpperCase() : (parseInt(hh, 10) >= 12 ? 'PM' : 'AM');
    return `${hh}:${mm} ${period}`;
  }
  return clean;
};

export const normalizeClient = (c: any): any => {
  if (!c || typeof c !== 'object') return null;

  let rawMonthly = c.monthlyFee !== undefined ? c.monthlyFee : (c.fee !== undefined ? c.fee : c.amount);
  if (typeof rawMonthly === 'string') {
    rawMonthly = Number(rawMonthly.replace(/[^0-9.]/g, ''));
  }
  const cleanMonthlyFee = (typeof rawMonthly === 'number' && !isNaN(rawMonthly)) ? rawMonthly : 0;

  let rawPerSession = c.perSessionFee;
  if (typeof rawPerSession === 'string') {
    rawPerSession = Number(rawPerSession.replace(/[^0-9.]/g, ''));
  }
  const cleanPerSessionFee = (typeof rawPerSession === 'number' && !isNaN(rawPerSession)) ? rawPerSession : 0;

  const rawGroup = c.groupName || '';
  const cleanGroup = (rawGroup === 'Group Batch' || rawGroup === 'General Yoga Batch' || rawGroup === 'Group') ? '' : rawGroup;

  return {
    id: c.id || `c${Date.now()}`,
    name: c.name || 'Yoga Client',
    gender: c.gender || 'Female',
    phone: c.phone || '',
    whatsapp: c.whatsapp || c.phone || '',
    address: c.address || 'Indiranagar, Bengaluru',
    joiningDate: c.joiningDate || new Date().toISOString().split('T')[0],
    photoUrl: c.photoUrl || '',
    classTime: normalizeClassTime(c.classTime),
    days: Array.isArray(c.days) ? c.days : ['Mon', 'Wed', 'Fri'],
    timeSlot: c.timeSlot || 'Morning',
    sessionType: c.sessionType || 'Group',
    groupName: cleanGroup,
    reasonsForJoining: Array.isArray(c.reasonsForJoining) ? c.reasonsForJoining : [],
    currentProblems: Array.isArray(c.currentProblems) ? c.currentProblems : [],
    feeType: c.feeType || 'Monthly',
    feeStartMonth: c.feeStartMonth || undefined,
    perSessionFee: cleanPerSessionFee,
    monthlyFee: cleanMonthlyFee,
    feeDueDate: c.feeDueDate || '5th',
    membershipPlan: c.membershipPlan || 'Unlimited',
    completedClasses: typeof c.completedClasses === 'number' ? c.completedClasses : 0,
    totalClasses: typeof c.totalClasses === 'number' ? c.totalClasses : 30,
    paymentStatus: c.paymentStatus || 'Pending',
    status: c.status || 'Active',
    trainerNotes: c.trainerNotes || '',
    goal: c.goal || 'General Yoga',
    startingWeight: typeof c.startingWeight === 'number' ? c.startingWeight : undefined,
    targetWeight: typeof c.targetWeight === 'number' ? c.targetWeight : undefined,
    weightLogs: Array.isArray(c.weightLogs) ? c.weightLogs : [],
    medicalPrecautions: Array.isArray(c.medicalPrecautions) ? c.medicalPrecautions : []
  };
};

export const normalizePayment = (p: any): any => {
  if (!p || typeof p !== 'object') return null;

  let rawAmount = p.amount !== undefined ? p.amount : (p.paidAmount !== undefined ? p.paidAmount : p.fee);
  if (typeof rawAmount === 'string') {
    rawAmount = Number(rawAmount.replace(/[^0-9.]/g, ''));
  }
  const cleanAmount = (typeof rawAmount === 'number' && !isNaN(rawAmount)) ? rawAmount : 0;

  const rawName = p.clientName || p.name || p.client || '';
  const cleanClientName = (rawName && rawName !== 'Yoga Client') ? rawName : '';
  const cleanDate = p.date || p.paymentDate || p.createdAt || '';
  const cleanMode = p.paymentMode || p.paymentMethod || p.mode || 'UPI';

  // Discard orphan payments that have no clientId AND no real clientName
  if (!p.clientId && !cleanClientName) return null;

  return {
    id: p.id || `p-${Date.now()}`,
    clientId: p.clientId || p.client_id || '',
    clientName: cleanClientName,
    amount: cleanAmount,
    date: cleanDate,
    month: p.month || (cleanDate ? cleanDate.slice(0, 7) : ''),
    paymentMode: cleanMode,
    paymentMethod: cleanMode,
    status: p.status || 'Paid',
    notes: p.notes || ''
  };
};

export const normalizeAttendance = (a: any): any => {
  if (!a || typeof a !== 'object') return null;
  let updatedAt = a.updatedAt;
  if (!updatedAt) {
    if (typeof a.id === 'string') {
      const match = a.id.match(/\d{10,13}/);
      if (match) {
        try { updatedAt = new Date(parseInt(match[0], 10)).toISOString(); } catch (e) {}
      }
    }
    if (!updatedAt && a.date) {
      try { updatedAt = new Date(a.date).toISOString(); } catch (e) {}
    }
  }
  return {
    id: a.id || `att-${Date.now()}`,
    clientId: a.clientId || '',
    clientName: a.clientName || 'Yoga Client',
    date: a.date || new Date().toISOString().split('T')[0],
    status: a.status || 'Present',
    timeSlot: a.timeSlot || 'Morning',
    updatedAt: updatedAt || new Date(0).toISOString()
  };
};

export const normalizeTrainerDream = (d: any): any => {
  if (!d || typeof d !== 'object') return null;

  let rawTarget = d.targetAmount !== undefined ? d.targetAmount : (d.targetCost !== undefined ? d.targetCost : (d.target !== undefined ? d.target : d.cost));
  if (typeof rawTarget === 'string') {
    rawTarget = Number(rawTarget.replace(/[^0-9.]/g, ''));
  }
  const cleanTargetAmount = (typeof rawTarget === 'number' && !isNaN(rawTarget) && rawTarget > 0) ? rawTarget : 100000;

  let rawSaved = d.savedAmount !== undefined ? d.savedAmount : (d.saved !== undefined ? d.saved : d.currentSaved);
  if (typeof rawSaved === 'string') {
    rawSaved = Number(rawSaved.replace(/[^0-9.]/g, ''));
  }
  const cleanSavedAmount = (typeof rawSaved === 'number' && !isNaN(rawSaved)) ? rawSaved : 0;

  return {
    id: d.id || `dream-${Date.now()}`,
    title: d.title || 'My Financial Vision Goal',
    targetAmount: cleanTargetAmount,
    savedAmount: cleanSavedAmount,
    photoUrl: d.photoUrl || '/hero-group-yoga.jpg',
    targetDate: d.targetDate || '2027-12-31',
    category: d.category || 'Medium Term',
    notes: d.notes || ''
  };
};

export const normalizeLeave = (l: any): any => {
  if (!l || typeof l !== 'object') return null;
  const start = l.startDate || l.date || new Date().toISOString().split('T')[0];
  const end = l.endDate || start;
  const isSingleDay = start === end;
  return {
    id: l.id || `leave-${Date.now()}`,
    clientId: l.clientId || '',
    clientName: l.clientName || 'Yoga Client',
    photoUrl: l.photoUrl || '',
    date: start,
    startDate: start,
    endDate: end,
    reason: l.reason || 'Leave / Rest Day',
    duration: isSingleDay ? `1 Day (${start})` : (l.duration || '1 Day'),
    isFullMonthLeave: isSingleDay ? false : !!l.isFullMonthLeave
  };
};

export const normalizeBlog = (b: any): any => {
  if (!b || typeof b !== 'object') return null;
  const title = b.title || 'Yoga Insights & Practice Guide';
  const slug = b.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return {
    id: b.id || `blog-${Date.now()}`,
    slug: slug,
    title: title,
    excerpt: b.excerpt || '',
    content: b.content || '',
    coverImage: b.coverImage || '/hero-group-yoga.jpg',
    category: b.category || 'Yoga Asanas',
    author: b.author || 'Anjali Negi',
    authorRole: b.authorRole || 'Founder & Certified Senior Yoga Instructor',
    authorPhoto: b.authorPhoto || '/anjali-hero.jpg',
    date: b.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    readTime: b.readTime || '4 min read',
    tags: Array.isArray(b.tags) ? b.tags : [],
    isPublished: b.isPublished !== undefined ? !!b.isPublished : true,
    featured: !!b.featured,
    metaTitle: b.metaTitle || title,
    metaDescription: b.metaDescription || b.excerpt || ''
  };
};

// Smart Array Merging by Item ID (and ClientId_Date for Attendance) with Timestamp Conflict Resolution
export const mergeArraysById = (local: any[] = [], remote: any[] = [], deletedIds: string[] = []): any[] => {
  const map = new Map<string, any>();
  const deletedSet = new Set(deletedIds || []);

  const getItemKey = (item: any): string => {
    if (!item) return '';
    // Attendance records are uniquely identified per client per date
    if (item.clientId && item.date && item.status && item.amount === undefined && item.reason === undefined) {
      return `att_${item.clientId}_${item.date}`;
    }
    return item.id || '';
  };

  const getTimestamp = (item: any): number => {
    if (!item) return 0;
    if (item.updatedAt) {
      const t = new Date(item.updatedAt).getTime();
      if (!isNaN(t)) return t;
    }
    if (typeof item.id === 'string') {
      const match = item.id.match(/\d{10,13}/);
      if (match) return parseInt(match[0], 10);
    }
    return 0;
  };

  // 1. Put local items first
  (local || []).forEach(item => {
    if (item && item.id && !deletedSet.has(item.id)) {
      const key = getItemKey(item);
      if (key) map.set(key, item);
    }
  });

  // 2. Merge remote items over local items:
  // Remote cloud data is the shared source of truth across all devices.
  (remote || []).forEach(item => {
    if (item && item.id && !deletedSet.has(item.id)) {
      const key = getItemKey(item);
      if (key) {
        if (!map.has(key)) {
          map.set(key, item);
        } else {
          const localItem = map.get(key);
          const localTs = getTimestamp(localItem);
          const remoteTs = getTimestamp(item);
          // If local action is strictly newer and happened within last 15 seconds, keep local; otherwise remote wins!
          if (localTs > remoteTs && (Date.now() - localTs < 15000)) {
            map.set(key, { ...item, ...localItem });
          } else {
            map.set(key, { ...localItem, ...item });
          }
        }
      }
    }
  });

  const list = Array.from(map.values()).map(item => {
    if (item && item.name) return normalizeClient(item);
    if (item && item.amount !== undefined) return normalizePayment(item);
    if (item && item.status && item.clientId) return normalizeAttendance(item);
    if (item && item.reason && item.clientId) return normalizeLeave(item);
    return item;
  }).filter(Boolean);

  // Always sort newest items (highest timestamp ID) FIRST
  return list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
};

// Fetch Cloud Data Across Devices (Cached /api/sync Proxy First, then Supabase Fallback)
export const fetchCloudSyncData = async (): Promise<CloudDataPayload | null> => {
  if (typeof window === 'undefined') return null;

  // 1. Primary: Same-domain Vercel Serverless Sync API (Protected with Server-Side In-Memory Cache & Delta Checking)
  for (const url of ENDPOINTS) {
    try {
      const cacheBustUrl = `${url}?t=${Date.now()}&_r=${Math.random().toString(36).substring(2, 7)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(cacheBustUrl, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const payload = data.data || data;
        if (payload && (Array.isArray(payload.clients) || Array.isArray(payload.payments) || Array.isArray(payload.attendance))) {
          return payload as CloudDataPayload;
        }
      }
    } catch (e) {
      console.warn(`Primary cloud fetch failed for ${url}:`, e);
    }
  }

  // 2. Direct Supabase Fallback (Only if /api/sync is unreachable)
  try {
    const supabaseData = await fetchFromSupabase();
    if (supabaseData && (Array.isArray(supabaseData.clients) || Array.isArray(supabaseData.payments) || Array.isArray(supabaseData.attendance))) {
      return supabaseData as CloudDataPayload;
    }
  } catch (e) {
    console.warn('Direct Supabase fetch fallback error:', e);
  }

  return null;
};

// Push Local Changes to Cloud (/api/sync Primary + Direct Supabase Fallback)
export const pushCloudSyncData = async (payload: Omit<CloudDataPayload, 'lastUpdated'>): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const dataWithTimestamp: CloudDataPayload = {
    ...payload,
    lastUpdated: new Date().toISOString()
  };

  let success = false;

  // 1. Primary Push to /api/sync (Performs server-side merge, writes to Supabase, and updates cache)
  for (const url of ENDPOINTS) {
    try {
      const pushUrl = `${url}?t=${Date.now()}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(pushUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(dataWithTimestamp)
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        success = true;
        return true;
      }
    } catch (e) {
      console.warn(`Primary cloud push failed for ${url}:`, e);
    }
  }

  // 2. Direct Supabase Fallback (Only if /api/sync fails)
  if (!success) {
    try {
      const sbSuccess = await pushToSupabase(dataWithTimestamp);
      if (sbSuccess) success = true;
    } catch (e) {
      console.warn('Direct Supabase push fallback error:', e);
    }
  }

  return success;
};
