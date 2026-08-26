// Vercel Serverless Sync API Proxy with Supabase Integration Auto-Detection & Server-Side Smart Merging
// Served at https://www.yoganjaliyoga.com/api/sync

const PERSISTENT_BLOB_URL = 'https://api.restful-api.dev/objects/ff8081819f7e10ae019fefa0a25822af';

function getSupabaseEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { url, key };
}

async function fetchFromSupabaseEnv() {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/yoganjali_sync?id=eq.master_db&select=*`, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
        return rows[0].payload;
      }
    }
  } catch (e) {
    console.warn('Vercel Supabase env fetch warning:', e);
  }
  return null;
}

async function pushToSupabaseEnv(payload) {
  const nowIso = new Date().toISOString();
  const { url, key } = getSupabaseEnv();
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url}/rest/v1/yoganjali_sync`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: 'master_db',
        payload,
        updated_at: nowIso
      })
    });
    return res.ok;
  } catch (e) {
    console.warn('Vercel Supabase env push warning:', e);
  }
  return false;
}

function normalizeClient(c) {
  if (!c || typeof c !== 'object') return null;
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
    classTime: c.classTime || '07:00 AM',
    days: Array.isArray(c.days) ? c.days : ['Mon', 'Wed', 'Fri'],
    timeSlot: c.timeSlot || 'Morning',
    sessionType: c.sessionType || 'Group',
    groupName: cleanGroup,
    reasonsForJoining: Array.isArray(c.reasonsForJoining) ? c.reasonsForJoining : [],
    currentProblems: Array.isArray(c.currentProblems) ? c.currentProblems : [],
    feeType: c.feeType || 'Monthly',
    feeStartMonth: c.feeStartMonth || undefined,
    perSessionFee: typeof c.perSessionFee === 'number' ? c.perSessionFee : 0,
    monthlyFee: typeof c.monthlyFee === 'number' ? c.monthlyFee : 0,
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
}

function normalizePayment(p) {
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
}

function normalizeAttendance(a) {
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
}

function normalizeTrainerDream(d) {
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
}

function mergeGenericLists(existing = [], incoming = [], deletedIds = [], normalizer = (x) => x) {
  const map = new Map();
  const deletedSet = new Set(deletedIds || []);

  (existing || []).forEach(item => {
    if (item && item.id && !deletedSet.has(item.id)) {
      map.set(item.id, normalizer(item));
    }
  });

  (incoming || []).forEach(item => {
    if (item && item.id && !deletedSet.has(item.id)) {
      const norm = normalizer(item);
      if (!map.has(item.id)) {
        map.set(item.id, norm);
      } else {
        map.set(item.id, { ...map.get(item.id), ...norm });
      }
    }
  });

  return Array.from(map.values()).filter(Boolean);
}

function getTimestampMs(item) {
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
}

function mergeAttendanceLists(existing = [], incoming = [], deletedIds = []) {
  const map = new Map();
  const deletedSet = new Set(deletedIds || []);

  (existing || []).forEach(a => {
    if (a && a.id && !deletedSet.has(a.id)) {
      const key = (a.clientId && a.date) ? `${a.clientId}_${a.date}` : a.id;
      map.set(key, normalizeAttendance(a));
    }
  });

  (incoming || []).forEach(a => {
    if (a && a.id && !deletedSet.has(a.id)) {
      const norm = normalizeAttendance(a);
      const key = (a.clientId && a.date) ? `${a.clientId}_${a.date}` : a.id;
      if (!map.has(key)) {
        map.set(key, norm);
      } else {
        const existingItem = map.get(key);
        const existingTs = getTimestampMs(existingItem);
        const incomingTs = getTimestampMs(norm);
        // Only accept incoming update if it is newer or equal to existing
        if (incomingTs >= existingTs) {
          map.set(key, norm);
        }
      }
    }
  });

  return Array.from(map.values()).filter(Boolean);
}

function mergeClientLists(existing = [], incoming = [], deletedIds = []) {
  const map = new Map();
  const deletedSet = new Set(deletedIds || []);

  (existing || []).forEach(c => {
    if (c && c.id && !deletedSet.has(c.id)) {
      map.set(c.id, normalizeClient(c));
    }
  });

  (incoming || []).forEach(c => {
    if (c && c.id && !deletedSet.has(c.id)) {
      const norm = normalizeClient(c);
      if (!map.has(c.id)) {
        map.set(c.id, norm);
      } else {
        map.set(c.id, { ...map.get(c.id), ...norm });
      }
    }
  });

  const list = Array.from(map.values()).filter(Boolean);
  return list.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate, proxy-revalidate');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // 1. Try Supabase Vercel Integration First
    try {
      const sbData = await fetchFromSupabaseEnv();
      if (sbData && (Array.isArray(sbData.clients) || Array.isArray(sbData.payments) || Array.isArray(sbData.trainerDreams))) {
        if (Array.isArray(sbData.clients)) sbData.clients = sbData.clients.map(normalizeClient).filter(Boolean);
        if (Array.isArray(sbData.payments)) sbData.payments = sbData.payments.map(normalizePayment).filter(Boolean);
        if (Array.isArray(sbData.trainerDreams)) sbData.trainerDreams = sbData.trainerDreams.map(normalizeTrainerDream).filter(Boolean);
        if (Array.isArray(sbData.attendance)) sbData.attendance = sbData.attendance.map(normalizeAttendance).filter(Boolean);
        return res.status(200).json(sbData);
      }
    } catch (e) {
      console.warn('Vercel Supabase env fetch fallback:', e);
    }

    // 2. Fallback to Persistent Blob
    try {
      const response = await fetch(PERSISTENT_BLOB_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const json = await response.json();
        const data = json.data || json;
        if (data && (Array.isArray(data.clients) || Array.isArray(data.trainerDreams))) {
          if (Array.isArray(data.clients)) data.clients = data.clients.map(normalizeClient).filter(Boolean);
          if (Array.isArray(data.payments)) data.payments = data.payments.map(normalizePayment).filter(Boolean);
          if (Array.isArray(data.trainerDreams)) data.trainerDreams = data.trainerDreams.map(normalizeTrainerDream).filter(Boolean);
          if (Array.isArray(data.attendance)) data.attendance = data.attendance.map(normalizeAttendance).filter(Boolean);
        }
        return res.status(200).json(data);
      }
    } catch (e) {
      console.error('Fetch persistent blob failed:', e);
    }
    return res.status(200).json({ clients: [], payments: [], trainerDreams: [], trainerLeaves: [], attendance: [] });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const payload = body || {};

      let currentBlobData = { clients: [], payments: [], trainerDreams: [], trainerLeaves: [], attendance: [], deletedIds: [] };
      try {
        const sbCur = await fetchFromSupabaseEnv(true);
        if (sbCur) currentBlobData = sbCur;
        else {
          const curRes = await fetch(PERSISTENT_BLOB_URL, { method: 'GET', headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' } });
          if (curRes.ok) {
            const parsedJson = await curRes.json();
            if (parsedJson && parsedJson.data) currentBlobData = parsedJson.data;
          }
        }
      } catch (err) {
        console.warn('Fetch remote for merge warning:', err);
      }

      // --- ATOMIC DELTA HANDLER: batch_mark_attendance & mark_attendance ---
      if ((payload.action === 'batch_mark_attendance' && Array.isArray(payload.records)) || (payload.action === 'mark_attendance' && payload.record)) {
        const rawRecords = Array.isArray(payload.records) ? payload.records : [payload.record];
        const incomingNorms = rawRecords.map(normalizeAttendance).filter(r => r && r.clientId && r.date);

        if (incomingNorms.length > 0) {
          let attList = Array.isArray(currentBlobData.attendance) ? currentBlobData.attendance : [];
          const incomingKeys = new Set(incomingNorms.map(r => `${r.clientId}_${r.date}`));
          
          // Filter out existing records that are being replaced
          attList = attList.filter(a => !(a && incomingKeys.has(`${a.clientId}_${a.date}`)));
          // Prepend new records
          attList = [...incomingNorms, ...attList];
          currentBlobData.attendance = attList;

          // Update completedClasses for all affected clients
          if (Array.isArray(currentBlobData.clients)) {
            const clientIdsToUpdate = new Set(incomingNorms.map(r => r.clientId));
            currentBlobData.clients = currentBlobData.clients.map(c => {
              if (c && clientIdsToUpdate.has(c.id)) {
                const realPresentCount = attList.filter(a => a && a.clientId === c.id && a.status === 'Present').length;
                return { ...c, completedClasses: realPresentCount };
              }
              return c;
            });
          }

          currentBlobData.lastUpdated = new Date().toISOString();
          await pushToSupabaseEnv(currentBlobData);
          return res.status(200).json(currentBlobData);
        }
      }

      // --- ATOMIC DELTA HANDLER: delete_attendance ---
      if (payload.action === 'delete_attendance' && payload.id) {
        let attList = Array.isArray(currentBlobData.attendance) ? currentBlobData.attendance : [];
        const deletedRecord = attList.find(a => a && a.id === payload.id);
        attList = attList.filter(a => a && a.id !== payload.id);
        currentBlobData.attendance = attList;
        currentBlobData.deletedIds = Array.from(new Set([...(currentBlobData.deletedIds || []), payload.id]));

        if (deletedRecord && deletedRecord.clientId && Array.isArray(currentBlobData.clients)) {
          const realPresentCount = attList.filter(a => a && a.clientId === deletedRecord.clientId && a.status === 'Present').length;
          currentBlobData.clients = currentBlobData.clients.map(c => {
            if (c && c.id === deletedRecord.clientId) {
              return { ...c, completedClasses: realPresentCount };
            }
            return c;
          });
        }

        currentBlobData.lastUpdated = new Date().toISOString();
        await pushToSupabaseEnv(currentBlobData);
        return res.status(200).json(currentBlobData);
      }

      const combinedDeletedIds = Array.from(new Set([
        ...(currentBlobData.deletedIds || []),
        ...(Array.isArray(payload.deletedIds) ? payload.deletedIds : [])
      ]));

      const incomingDreams = Array.isArray(payload.trainerDreams) ? payload.trainerDreams : [];
      const mergedClients = isForceRestore 
        ? incomingClients.map(normalizeClient).filter(c => c && !combinedDeletedIds.includes(c.id)) 
        : mergeClientLists(currentBlobData.clients || [], incomingClients, combinedDeletedIds);
      const mergedPayments = isForceRestore 
        ? incomingPayments.filter(p => p && !combinedDeletedIds.includes(p.id) && !combinedDeletedIds.includes(p.clientId)) 
        : mergeGenericLists(currentBlobData.payments || [], incomingPayments, combinedDeletedIds, normalizePayment);
      const mergedDreams = isForceRestore 
        ? incomingDreams.map(normalizeTrainerDream).filter(d => d && !combinedDeletedIds.includes(d.id)) 
        : mergeGenericLists(currentBlobData.trainerDreams || [], incomingDreams, combinedDeletedIds, normalizeTrainerDream);
      const mergedLeaves = isForceRestore 
        ? (payload.trainerLeaves || []).filter(tl => tl && !combinedDeletedIds.includes(tl.id)) 
        : mergeGenericLists(currentBlobData.trainerLeaves || [], payload.trainerLeaves || [], combinedDeletedIds);
      const mergedClientLeaves = isForceRestore
        ? (payload.leaves || []).filter(l => l && !combinedDeletedIds.includes(l.id))
        : mergeGenericLists(currentBlobData.leaves || [], payload.leaves || [], combinedDeletedIds);
      const mergedAttendance = isForceRestore 
        ? (payload.attendance || []).map(normalizeAttendance).filter(a => a && !combinedDeletedIds.includes(a.id) && !combinedDeletedIds.includes(a.clientId)) 
        : mergeAttendanceLists(currentBlobData.attendance || [], payload.attendance || [], combinedDeletedIds);

      const incomingDeletedGroupBatches = Array.from(new Set([
        ...(currentBlobData.deletedGroupBatches || []),
        ...(payload.deletedGroupBatches || [])
      ]));

      const finalCustomGroupBatches = isForceRestore
        ? (Array.isArray(payload.customGroupBatches) ? payload.customGroupBatches : [])
        : Array.from(new Set([
            ...(currentBlobData.customGroupBatches || []).filter(b => !incomingDeletedGroupBatches.includes(b)),
            ...(Array.isArray(payload.customGroupBatches) ? payload.customGroupBatches.filter(b => !incomingDeletedGroupBatches.includes(b)) : [])
          ]));

      const mergedPayload = {
        ...currentBlobData,
        ...payload,
        clients: mergedClients,
        payments: mergedPayments,
        trainerDreams: mergedDreams,
        trainerLeaves: mergedLeaves,
        leaves: mergedClientLeaves,
        attendance: mergedAttendance,
        customGroupBatches: finalCustomGroupBatches,
        deletedGroupBatches: incomingDeletedGroupBatches,
        deletedIds: combinedDeletedIds,
        lastUpdated: new Date().toISOString()
      };

      // Push to Vercel Supabase Integration (Authoritative Fast Store)
      await pushToSupabaseEnv(mergedPayload);

      // Asynchronous Background Backup Push to RESTful Blob Store (Non-blocking)
      fetch(PERSISTENT_BLOB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: 'yoganjali_master', data: mergedPayload })
      }).catch(e => console.warn('Blob backup push failed:', e));

      return res.status(200).json({ success: true, count: mergedClients.length, data: mergedPayload });
    } catch (e) {
      console.error('Proxy update failed:', e);
      return res.status(400).json({ error: 'Invalid payload' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
