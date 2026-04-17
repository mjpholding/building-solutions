import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const TOGGLEABLE_PATHS = [
  'leistungen', 'uber-uns', 'kontakt', 'referenzen', 'karriere', 'partner',
  'produkte', 'produktberater', 'konto', 'hygieneplane', 'downloads', 'ai-berater',
  'bestellung', 'kasse',
];

// Legal pages must always be accessible (legal requirement) — never block these
const ALWAYS_ALLOWED = new Set(['agb', 'impressum', 'datenschutz']);

// Pages disabled by default (shop features)
const DISABLED_BY_DEFAULT = new Set([
  'produkte', 'produktberater', 'hygieneplane', 'downloads',
  'ai-berater', 'bestellung', 'kasse',
]);

const locales = ['de', 'en', 'pl', 'tr', 'ru', 'uk', 'sk', 'sq', 'hr'];

let visibilityCache: { data: Record<string, boolean>; ts: number } | null = null;
const CACHE_TTL = 30_000;

async function getPageVisibility(baseUrl: string): Promise<Record<string, boolean> | null> {
  const now = Date.now();
  if (visibilityCache && now - visibilityCache.ts < CACHE_TTL) {
    return visibilityCache.data;
  }

  try {
    const res = await fetch(`${baseUrl}/api/pages`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      const map: Record<string, boolean> = {};
      for (const p of json.pages || []) {
        map[p.slug] = true;
      }
      visibilityCache = { data: map, ts: now };
      return map;
    }
  } catch {
    // On error, return null = allow all
  }
  return null;
}

function extractPageSlug(pathname: string): string | null {
  let path = pathname;
  for (const locale of locales) {
    if (path.startsWith(`/${locale}/`)) {
      path = path.slice(locale.length + 1);
      break;
    }
    if (path === `/${locale}`) return null;
  }
  const segments = path.split('/').filter(Boolean);
  return segments[0] || null;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api') || pathname.startsWith('/admin') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const slug = extractPageSlug(pathname);

  if (slug && ALWAYS_ALLOWED.has(slug)) {
    return intlMiddleware(request);
  }

  if (slug && TOGGLEABLE_PATHS.includes(slug)) {
    const baseUrl = request.nextUrl.origin;
    const visibility = await getPageVisibility(baseUrl);

    if (visibility === null) {
      // API failed — use defaults: block only shop pages
      if (DISABLED_BY_DEFAULT.has(slug)) {
        const url = request.nextUrl.clone();
        url.pathname = '/404';
        return NextResponse.rewrite(url);
      }
    } else if (!visibility[slug]) {
      // Page explicitly not in enabled list
      const url = request.nextUrl.clone();
      url.pathname = '/404';
      return NextResponse.rewrite(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(de|en|pl|tr|ru|uk|sk|sq|hr)/:path*'],
};
