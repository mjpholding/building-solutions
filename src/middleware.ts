import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(de|en|pl|tr|ru|uk|sk|sq|hr)/:path*'],
};
