import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/lib/cart-context";
import { CustomerProvider } from "@/lib/customer-context";
import CartDrawer from "@/components/cart/CartDrawer";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import PageTracker from "@/components/analytics/PageTracker";
import CopyProtection from "@/components/CopyProtection";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <CustomerProvider>
            <CartProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <CartDrawer />
              <LanguageSwitcher />
              <PageTracker />
              <CopyProtection />
            </CartProvider>
          </CustomerProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
