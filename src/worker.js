// src/worker.js
// Cloudflare Universal Worker for Yoganjali Studio
// Serves static Vite SPA assets with unlimited free bandwidth & handles all /api/* backend endpoints

const PERSISTENT_BLOB_URL = 'https://api.restful-api.dev/objects/ff8081819f7e10ae019fefa0a25822af';

const DEFAULT_SUPABASE_URL = 'https://vjhmvjlnalmdsoewtzrk.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqaG12amxuYWxtZHNvZXd0enJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MzI3MDQsImV4cCI6MjEwMjAwODcwNH0.RQOD-HBjdtk5v-0H-XEL5m3IDrh1viDpEkQpITYM3kI';
const DEFAULT_RZP_KEY_ID = 'rzp_live_TS0dsgT9a9l220';
const DEFAULT_RZP_KEY_SECRET = 'MTJlfJx8yA54fOhd9Rk5Fqhc';

function getSupabaseEnv(env) {
  const url = env?.SUPABASE_URL || env?.NEXT_PUBLIC_SUPABASE_URL || env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = env?.SUPABASE_ANON_KEY || env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || env?.VITE_SUPABASE_ANON_KEY || env?.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_KEY;
  return { url, key };
}

async function fetchFromSupabaseEnv(env) {
  const { url, key } = getSupabaseEnv(env);
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
    console.warn('Supabase fetch error in Cloudflare Worker:', e);
  }
  return null;
}

async function pushToSupabaseEnv(payload, env) {
  const { url, key } = getSupabaseEnv(env);
  if (!url || !key) return false;
  try {
    const row = {
      id: 'master_db',
      payload,
      updated_at: new Date().toISOString()
    };
    const res = await fetch(`${url}/rest/v1/yoganjali_sync`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(row)
    });
    return res.ok;
  } catch (e) {
    console.warn('Supabase push error in Cloudflare Worker:', e);
    return false;
  }
}

function normalizeClient(c) {
  if (!c || typeof c !== 'object') return null;
  return {
    id: c.id || `c${Date.now()}`,
    name: c.name || 'Yoga Client',
    gender: c.gender || 'Female',
    phone: c.phone || '',
    whatsapp: c.whatsapp || c.phone || '',
    address: c.address || '',
    joiningDate: c.joiningDate || new Date().toISOString().split('T')[0],
    photoUrl: c.photoUrl || '',
    classTime: c.classTime || '07:00 AM',
    days: Array.isArray(c.days) ? c.days : ['Mon', 'Wed', 'Fri'],
    timeSlot: c.timeSlot || 'Morning',
    sessionType: c.sessionType || 'Group',
    groupName: c.groupName || '',
    reasonsForJoining: Array.isArray(c.reasonsForJoining) ? c.reasonsForJoining : [],
    currentProblems: Array.isArray(c.currentProblems) ? c.currentProblems : [],
    feeType: c.feeType || 'Monthly',
    feeStartMonth: c.feeStartMonth || undefined,
    perSessionFee: typeof c.perSessionFee === 'number' ? c.perSessionFee : (Number(c.perSessionFee) || 0),
    monthlyFee: typeof c.monthlyFee === 'number' ? c.monthlyFee : (Number(c.monthlyFee) || 0),
    feeDueDate: c.feeDueDate || '5th',
    membershipPlan: c.membershipPlan || 'Unlimited',
    completedClasses: typeof c.completedClasses === 'number' ? c.completedClasses : (Number(c.completedClasses) || 0),
    totalClasses: typeof c.totalClasses === 'number' ? c.totalClasses : (Number(c.totalClasses) || 30),
    paymentStatus: c.paymentStatus || 'Pending',
    status: c.status || 'Active',
    trainerNotes: c.trainerNotes || '',
    goal: c.goal || 'General Yoga',
    startingWeight: typeof c.startingWeight === 'number' ? c.startingWeight : undefined,
    targetWeight: typeof c.targetWeight === 'number' ? c.targetWeight : undefined,
    weightLogs: Array.isArray(c.weightLogs) ? c.weightLogs : [],
    medicalPrecautions: Array.isArray(c.medicalPrecautions) ? c.medicalPrecautions : [],
    updatedAt: c.updatedAt || new Date().toISOString()
  };
}

function normalizePayment(p) {
  if (!p || typeof p !== 'object') return null;
  return {
    id: p.id || `p-${Date.now()}`,
    clientId: p.clientId || '',
    clientName: p.clientName || '',
    amount: Number(p.amount) || 0,
    date: p.date || new Date().toISOString().split('T')[0],
    month: p.month || (p.date ? p.date.slice(0, 7) : ''),
    paymentMode: p.paymentMode || p.paymentMethod || 'UPI',
    paymentMethod: p.paymentMethod || p.paymentMode || 'UPI',
    status: p.status || 'Paid',
    notes: p.notes || '',
    updatedAt: p.updatedAt || new Date().toISOString()
  };
}

function normalizeAttendance(a) {
  if (!a || typeof a !== 'object') return null;
  let updatedAt = a.updatedAt;
  if (!updatedAt && a.id) {
    const match = String(a.id).match(/\d{10,13}/);
    if (match) {
      try { updatedAt = new Date(parseInt(match[0], 10)).toISOString(); } catch (e) {}
    }
  }
  if (!updatedAt && a.date) {
    try { updatedAt = new Date(a.date).toISOString(); } catch (e) {}
  }
  return {
    id: a.id || `att-${Date.now()}`,
    clientId: a.clientId || '',
    clientName: a.clientName || '',
    date: a.date || new Date().toISOString().split('T')[0],
    status: a.status || 'Present',
    timeSlot: a.timeSlot || 'Morning',
    updatedAt: updatedAt || new Date(0).toISOString()
  };
}

function normalizeTrainerDream(d) {
  if (!d || typeof d !== 'object') return null;
  return {
    id: d.id || `dream-${Date.now()}`,
    title: d.title || 'My Goal',
    targetAmount: Number(d.targetAmount) || 100000,
    savedAmount: Number(d.savedAmount) || 0,
    photoUrl: d.photoUrl || '/hero-group-yoga.jpg',
    targetDate: d.targetDate || '2027-12-31',
    category: d.category || 'Medium Term',
    notes: d.notes || ''
  };
}

function normalizeLeave(l) {
  if (!l || typeof l !== 'object') return null;
  const start = l.startDate || l.date || new Date().toISOString().split('T')[0];
  const end = l.endDate || start;
  return {
    id: l.id || `leave-${Date.now()}`,
    clientId: l.clientId || '',
    clientName: l.clientName || '',
    photoUrl: l.photoUrl || '',
    date: start,
    startDate: start,
    endDate: end,
    reason: l.reason || 'Leave',
    duration: l.duration || (start === end ? `1 Day (${start})` : 'Multi-day Leave'),
    isFullMonthLeave: !!l.isFullMonthLeave
  };
}

function normalizeBlog(b) {
  if (!b || typeof b !== 'object') return null;
  const title = b.title || 'Yoga Insights';
  const slug = b.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return {
    id: b.id || `blog-${Date.now()}`,
    slug,
    title,
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
    isPublished: b.isPublished !== void 0 ? !!b.isPublished : true,
    featured: !!b.featured,
    metaTitle: b.metaTitle || title,
    metaDescription: b.metaDescription || b.excerpt || ''
  };
}

function mergeGenericLists(existing = [], incoming = [], deletedIds = [], normalizer = (x) => x) {
  const map = new Map();
  const deletedSet = new Set(deletedIds || []);
  (existing || []).forEach(item => {
    if (item && item.id && !deletedSet.has(item.id)) map.set(item.id, normalizer(item));
  });
  (incoming || []).forEach(item => {
    if (item && item.id && !deletedSet.has(item.id)) {
      const norm = normalizer(item);
      map.set(item.id, norm);
    }
  });
  return Array.from(map.values()).filter(Boolean);
}

// ----------------------------------------------------
// API HANDLER: /api/sync
// ----------------------------------------------------
async function handleSync(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, If-Modified-Since',
    'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate',
    'Surrogate-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const sinceParam = url.searchParams.get('since') || request.headers.get('If-Modified-Since');

  if (request.method === 'GET') {
    // 1. Try Supabase
    let data = await fetchFromSupabaseEnv(env);

    // 2. Fallback to Persistent Blob
    if (!data || (!Array.isArray(data.clients) && !Array.isArray(data.attendance))) {
      try {
        const bRes = await fetch(PERSISTENT_BLOB_URL, { headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' } });
        if (bRes.ok) {
          const bJson = await bRes.json();
          data = bJson.data || bJson;
        }
      } catch (e) {}
    }

    if (!data) {
      data = { clients: [], payments: [], trainerDreams: [], trainerLeaves: [], leaves: [], attendance: [], blogs: [], lastUpdated: new Date().toISOString() };
    }

    // ULTRA-FAST LIGHTWEIGHT DELTA CHECK (50 bytes bandwidth optimization!)
    if (sinceParam && data.lastUpdated && data.lastUpdated === sinceParam) {
      return new Response(JSON.stringify({ changed: false, lastUpdated: data.lastUpdated }), {
        status: 200,
        headers: corsHeaders
      });
    }

    if (Array.isArray(data.clients)) data.clients = data.clients.map(normalizeClient).filter(Boolean);
    if (Array.isArray(data.payments)) data.payments = data.payments.map(normalizePayment).filter(Boolean);
    if (Array.isArray(data.trainerDreams)) data.trainerDreams = data.trainerDreams.map(normalizeTrainerDream).filter(Boolean);
    if (Array.isArray(data.attendance)) data.attendance = data.attendance.map(normalizeAttendance).filter(Boolean);
    if (Array.isArray(data.leaves)) data.leaves = data.leaves.map(normalizeLeave).filter(Boolean);
    if (Array.isArray(data.blogs)) data.blogs = data.blogs.map(normalizeBlog).filter(Boolean);

    return new Response(JSON.stringify({ changed: true, ...data }), {
      status: 200,
      headers: corsHeaders
    });
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const payload = await request.json() || {};

      let currentData = await fetchFromSupabaseEnv(env);
      if (!currentData || (!Array.isArray(currentData.clients) && !Array.isArray(currentData.attendance))) {
        try {
          const curRes = await fetch(PERSISTENT_BLOB_URL, { headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' } });
          if (curRes.ok) {
            const parsed = await curRes.json();
            if (parsed?.data) currentData = parsed.data;
          }
        } catch (e) {}
      }

      if (!currentData) {
        currentData = { clients: [], payments: [], trainerDreams: [], trainerLeaves: [], leaves: [], attendance: [], blogs: [], deletedIds: [] };
      }

      // --- ATOMIC DELTA: batch_mark_attendance & mark_attendance ---
      if ((payload.action === 'batch_mark_attendance' && Array.isArray(payload.records)) || (payload.action === 'mark_attendance' && payload.record)) {
        const rawRecords = Array.isArray(payload.records) ? payload.records : [payload.record];
        const incomingNorms = rawRecords.map(normalizeAttendance).filter(r => r && r.clientId && r.date);

        if (incomingNorms.length > 0) {
          let attList = Array.isArray(currentData.attendance) ? currentData.attendance : [];
          const incomingKeys = new Set(incomingNorms.map(r => `${r.clientId}_${r.date}`));
          
          attList = attList.filter(a => !(a && incomingKeys.has(`${a.clientId}_${a.date}`)));
          attList = [...incomingNorms, ...attList];
          currentData.attendance = attList;

          if (Array.isArray(currentData.clients)) {
            const clientIdsToUpdate = new Set(incomingNorms.map(r => r.clientId));
            currentData.clients = currentData.clients.map(c => {
              if (c && clientIdsToUpdate.has(c.id)) {
                const realPresentCount = attList.filter(a => a && a.clientId === c.id && a.status === 'Present').length;
                return { ...c, completedClasses: realPresentCount };
              }
              return c;
            });
          }

          currentData.lastUpdated = new Date().toISOString();
          await pushToSupabaseEnv(currentData, env);

          // Non-blocking persistent backup
          fetch(PERSISTENT_BLOB_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ name: 'yoganjali_master', data: currentData })
          }).catch(() => {});

          return new Response(JSON.stringify(currentData), { status: 200, headers: corsHeaders });
        }
      }

      // --- ATOMIC DELTA: delete_attendance ---
      if (payload.action === 'delete_attendance' && payload.id) {
        let attList = Array.isArray(currentData.attendance) ? currentData.attendance : [];
        const deletedRecord = attList.find(a => a && a.id === payload.id);
        attList = attList.filter(a => a && a.id !== payload.id);
        currentData.attendance = attList;
        currentData.deletedIds = Array.from(new Set([...(currentData.deletedIds || []), payload.id]));

        if (deletedRecord && deletedRecord.clientId && Array.isArray(currentData.clients)) {
          const realPresentCount = attList.filter(a => a && a.clientId === deletedRecord.clientId && a.status === 'Present').length;
          currentData.clients = currentData.clients.map(c => {
            if (c && c.id === deletedRecord.clientId) {
              return { ...c, completedClasses: realPresentCount };
            }
            return c;
          });
        }

        currentData.lastUpdated = new Date().toISOString();
        await pushToSupabaseEnv(currentData, env);

        fetch(PERSISTENT_BLOB_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: 'yoganjali_master', data: currentData })
        }).catch(() => {});

        return new Response(JSON.stringify(currentData), { status: 200, headers: corsHeaders });
      }

      // --- ATOMIC DELTA: update_client ---
      if (payload.action === 'update_client' && payload.client) {
        const norm = normalizeClient(payload.client);
        if (norm && norm.id) {
          let clientList = Array.isArray(currentData.clients) ? currentData.clients : [];
          clientList = clientList.map(c => (c && c.id === norm.id ? norm : c));
          if (!clientList.some(c => c && c.id === norm.id)) {
            clientList.push(norm);
          }
          currentData.clients = clientList;
          currentData.lastUpdated = new Date().toISOString();
          await pushToSupabaseEnv(currentData, env);

          fetch(PERSISTENT_BLOB_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ name: 'yoganjali_master', data: currentData })
          }).catch(() => {});

          return new Response(JSON.stringify(currentData), { status: 200, headers: corsHeaders });
        }
      }

      // --- ATOMIC DELTA: save_clients ---
      if (payload.action === 'save_clients' && Array.isArray(payload.clients)) {
        const normClients = payload.clients.map(normalizeClient).filter(Boolean);
        currentData.clients = normClients;
        currentData.lastUpdated = new Date().toISOString();
        await pushToSupabaseEnv(currentData, env);

        fetch(PERSISTENT_BLOB_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: 'yoganjali_master', data: currentData })
        }).catch(() => {});

        return new Response(JSON.stringify(currentData), { status: 200, headers: corsHeaders });
      }

      // --- ATOMIC DELTA: save_payments ---
      if (payload.action === 'save_payments' && Array.isArray(payload.payments)) {
        const normPayments = payload.payments.map(normalizePayment).filter(Boolean);
        currentData.payments = normPayments;
        if (Array.isArray(payload.clients)) {
          currentData.clients = payload.clients.map(normalizeClient).filter(Boolean);
        }
        if (Array.isArray(payload.deletedIds)) {
          currentData.deletedIds = Array.from(new Set([...(currentData.deletedIds || []), ...payload.deletedIds]));
        }
        currentData.lastUpdated = new Date().toISOString();
        await pushToSupabaseEnv(currentData, env);

        fetch(PERSISTENT_BLOB_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: 'yoganjali_master', data: currentData })
        }).catch(() => {});

        return new Response(JSON.stringify(currentData), { status: 200, headers: corsHeaders });
      }

      // Full merge fallback
      const combinedDeletedIds = Array.from(new Set([
        ...(currentData.deletedIds || []),
        ...(Array.isArray(payload.deletedIds) ? payload.deletedIds : [])
      ]));

      const isForceRestore = payload.action === 'force_restore';
      const mergedClients = isForceRestore
        ? (payload.clients || []).map(normalizeClient).filter(c => c && !combinedDeletedIds.includes(c.id))
        : mergeGenericLists(currentData.clients || [], payload.clients || [], combinedDeletedIds, normalizeClient);

      const mergedPayments = isForceRestore
        ? (payload.payments || []).map(normalizePayment).filter(p => p && !combinedDeletedIds.includes(p.id))
        : mergeGenericLists(currentData.payments || [], payload.payments || [], combinedDeletedIds, normalizePayment);

      const mergedDreams = isForceRestore
        ? (payload.trainerDreams || []).map(normalizeTrainerDream).filter(d => d && !combinedDeletedIds.includes(d.id))
        : mergeGenericLists(currentData.trainerDreams || [], payload.trainerDreams || [], combinedDeletedIds, normalizeTrainerDream);

      const mergedLeaves = isForceRestore
        ? (payload.trainerLeaves || []).filter(tl => tl && !combinedDeletedIds.includes(tl.id))
        : mergeGenericLists(currentData.trainerLeaves || [], payload.trainerLeaves || [], combinedDeletedIds);

      const mergedClientLeaves = isForceRestore
        ? (payload.leaves || []).map(normalizeLeave).filter(l => l && !combinedDeletedIds.includes(l.id))
        : mergeGenericLists(currentData.leaves || [], payload.leaves || [], combinedDeletedIds, normalizeLeave);

      const mergedAttendance = isForceRestore
        ? (payload.attendance || []).map(normalizeAttendance).filter(a => a && !combinedDeletedIds.includes(a.id))
        : mergeGenericLists(currentData.attendance || [], payload.attendance || [], combinedDeletedIds, normalizeAttendance);

      const mergedBlogs = isForceRestore
        ? (payload.blogs || []).map(normalizeBlog).filter(b => b && !combinedDeletedIds.includes(b.id))
        : mergeGenericLists(currentData.blogs || [], payload.blogs || [], combinedDeletedIds, normalizeBlog);

      const mergedPayload = {
        ...currentData,
        ...payload,
        clients: mergedClients,
        payments: mergedPayments,
        trainerDreams: mergedDreams,
        trainerLeaves: mergedLeaves,
        leaves: mergedClientLeaves,
        attendance: mergedAttendance,
        blogs: mergedBlogs,
        deletedIds: combinedDeletedIds,
        lastUpdated: new Date().toISOString()
      };

      await pushToSupabaseEnv(mergedPayload, env);

      fetch(PERSISTENT_BLOB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name: 'yoganjali_master', data: mergedPayload })
      }).catch(() => {});

      return new Response(JSON.stringify({ success: true, data: mergedPayload }), { status: 200, headers: corsHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid payload', details: e.message }), { status: 400, headers: corsHeaders });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
}

// ----------------------------------------------------
// API HANDLER: /api/create-order (Razorpay)
// ----------------------------------------------------
async function handleCreateOrder(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });

  const keyId = env?.RAZORPAY_KEY_ID || DEFAULT_RZP_KEY_ID;
  const keySecret = env?.RAZORPAY_KEY_SECRET || DEFAULT_RZP_KEY_SECRET;

  if (!keyId || !keySecret) {
    return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), { status: 500, headers: corsHeaders });
  }

  try {
    const { amount, currency = 'INR', clientName, clientPhone, purpose, notes } = await request.json() || {};
    if (!amount || Number(amount) < 1) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), { status: 400, headers: corsHeaders });
    }

    const auth = btoa(`${keyId}:${keySecret}`);
    const orderPayload = {
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: `yog_${Date.now()}`,
      notes: { clientName: clientName || '', clientPhone: clientPhone || '', purpose: purpose || 'yoga_fee', studio: 'Yoganjali' }
    };

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await rzpRes.json();
    if (!rzpRes.ok) {
      return new Response(JSON.stringify({ error: data.error?.description || 'Order creation failed' }), { status: rzpRes.status, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ orderId: data.id, amount: data.amount, currency: data.currency, keyId }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}

// ----------------------------------------------------
// API HANDLER: /api/verify-payment (Razorpay)
// ----------------------------------------------------
async function handleVerifyPayment(request, env) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });

  const keySecret = env?.RAZORPAY_KEY_SECRET || DEFAULT_RZP_KEY_SECRET;
  if (!keySecret) {
    return new Response(JSON.stringify({ error: 'Payment gateway secret not configured' }), { status: 500, headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json() || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing payment details' }), { status: 400, headers: corsHeaders });
    }

    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(keySecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
    const expectedHex = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (expectedHex !== razorpay_signature) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid payment signature' }), { status: 400, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}

// ----------------------------------------------------
// MAIN ROUTER
// ----------------------------------------------------
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (url.pathname === '/api/sync' || url.pathname.startsWith('/api/sync/')) {
        return await handleSync(request, env);
      }
      if (url.pathname === '/api/create-order' || url.pathname.startsWith('/api/create-order/')) {
        return await handleCreateOrder(request, env);
      }
      if (url.pathname === '/api/verify-payment' || url.pathname.startsWith('/api/verify-payment/')) {
        return await handleVerifyPayment(request, env);
      }

      // 1. Try static assets fetch directly
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status !== 404) {
        return assetRes;
      }

      // 2. Fallback to /index.html
      const reqUrl = new URL(request.url);
      reqUrl.pathname = '/index.html';
      return await env.ASSETS.fetch(new Request(reqUrl.toString(), {
        method: 'GET',
        headers: request.headers
      }));
    } catch (err) {
      return new Response(`Worker Error: ${err.message}\nStack:\n${err.stack}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};
