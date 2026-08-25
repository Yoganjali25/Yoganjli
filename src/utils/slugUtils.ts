// Slug generator and URL matcher for Public Yogi Profiles
export function slugifyName(name: string): string {
  if (!name) return 'member';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface UrlRouteInfo {
  isYogiProfile: boolean;
  isMembersDirectory: boolean;
  isPanel: boolean;
  isJoinLink: boolean;
  isRegisterLink: boolean;
  isDemoShowcase: boolean;
  slug: string | null;
}

export function getSlugFromUrl(): UrlRouteInfo {
  const empty: UrlRouteInfo = { isYogiProfile: false, isMembersDirectory: false, isPanel: false, isJoinLink: false, isRegisterLink: false, isDemoShowcase: false, slug: null };
  if (typeof window === 'undefined') return empty;

  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const search = window.location.search;
  const params = new URLSearchParams(search);

  // --- Clean path routing (primary) ---

  // /demo or /showcase (Yoganjali Studio CRM SaaS Live Demo Showcase Page)
  if (pathname === '/demo' || pathname === '/showcase' || params.get('view') === 'demo') {
    return { ...empty, isDemoShowcase: true };
  }

  // /panel or /admin or /login
  if (pathname === '/panel' || pathname === '/admin' || pathname === '/login') {
    return { ...empty, isPanel: true };
  }

  // /register (explicit internal client registration wizard)
  if (pathname === '/register') {
    return { ...empty, isRegisterLink: true };
  }

  // /join (public Free Trial Class booking on client website)
  if (pathname === '/join') {
    return { ...empty, isJoinLink: true };
  }

  // /members or /yogis
  if (pathname === '/members' || pathname === '/member' || pathname === '/yogis') {
    return { ...empty, isMembersDirectory: true };
  }

  // /yogi/anoop-negi or /member/anoop-negi
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2 && (pathParts[0] === 'yogi' || pathParts[0] === 'member')) {
    return { ...empty, isYogiProfile: true, slug: pathParts[1] };
  }

  // --- Legacy query parameter fallbacks (backward compatibility) + Instant URL Bar Clean-up ---

  if (search.includes('view=panel') || search.includes('admin=true') || search.includes('login=true')) {
    try { window.history.replaceState({}, '', '/panel'); } catch (e) {}
    return { ...empty, isPanel: true };
  }

  if (search.includes('join=true') || search.includes('demo=true') || search.includes('mode=client')) {
    try { window.history.replaceState({}, '', '/join'); } catch (e) {}
    return { ...empty, isJoinLink: true };
  }

  if (search.includes('register=true')) {
    try { window.history.replaceState({}, '', '/register'); } catch (e) {}
    return { ...empty, isRegisterLink: true };
  }

  if (params.get('view') === 'members' || params.get('members') === 'true') {
    try { window.history.replaceState({}, '', '/members'); } catch (e) {}
    return { ...empty, isMembersDirectory: true };
  }

  const querySlug = params.get('yogi') || params.get('member');
  if (querySlug) {
    try { window.history.replaceState({}, '', `/yogi/${querySlug}`); } catch (e) {}
    return { ...empty, isYogiProfile: true, slug: querySlug };
  }

  return empty;
}
