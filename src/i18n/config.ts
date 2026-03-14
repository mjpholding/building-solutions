export const locales = ['de', 'en', 'pl', 'tr', 'ru', 'uk', 'sk', 'sq', 'hr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'de';

export const localeNames: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
  pl: 'Polski',
  tr: 'Türkçe',
  ru: 'Русский',
  uk: 'Українська',
  sk: 'Slovenčina',
  sq: 'Shqip',
  hr: 'Hrvatski',
};

export const localeFlags: Record<Locale, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  pl: '🇵🇱',
  tr: '🇹🇷',
  ru: '🇷🇺',
  uk: '🇺🇦',
  sk: '🇸🇰',
  sq: '🇦🇱',
  hr: '🇭🇷',
};
