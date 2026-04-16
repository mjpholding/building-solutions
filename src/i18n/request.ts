import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { storeGetEdge } from '@/lib/store-edge';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as typeof routing.locales[number])) {
    locale = routing.defaultLocale;
  }

  // Build-time bundled translations (always present)
  const bundled = (await import(`../messages/${locale}/common.json`)).default;

  // Admin-editable overrides — in prod they live in Redis under `texts:<locale>`.
  // In dev the same key maps back to the file, so this is effectively a no-op.
  let live: Record<string, unknown> | null = null;
  try {
    live = (await storeGetEdge(`texts:${locale}`)) as Record<string, unknown> | null;
  } catch {
    live = null;
  }

  const messages =
    live && typeof live === 'object' && Object.keys(live).length > 0
      ? (live as Record<string, unknown>)
      : bundled;

  return { locale, messages };
});
