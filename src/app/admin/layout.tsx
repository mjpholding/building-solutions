"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Mail, Type, Package, LogOut, Loader2, ShoppingCart, Euro, Users, Tag, AtSign, CreditCard, MessageCircle } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Bestellungen", icon: ShoppingCart },
  { href: "/admin/customers", label: "Kunden", icon: Users },
  { href: "/admin/products", label: "Produkte", icon: Package },
  { href: "/admin/prices", label: "Preise", icon: Euro },
  { href: "/admin/discounts", label: "Rabatte", icon: Tag },
  { href: "/admin/contact", label: "Kontakt", icon: Mail },
  { href: "/admin/texts", label: "Texte", icon: Type },
  { href: "/admin/email-signature", label: "E-Mail-Signatur", icon: AtSign },
  { href: "/admin/business-cards", label: "Visitenkarten", icon: CreditCard },
  { href: "/admin/chat", label: "Team-Chat", icon: MessageCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        setAuth(d.authenticated);
        if (!d.authenticated && pathname !== "/admin/login" && !pathname.startsWith("/admin/chat")) {
          window.location.href = "/admin/login";
        }
      })
      .catch(() => setAuth(false));
  }, [pathname]);

  if (pathname === "/admin/login" || pathname === "/admin/chat/login") return <>{children}</>;

  if (auth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Chat pages have their own auth - render without admin sidebar if not admin-authed
  if (!auth && pathname.startsWith("/admin/chat")) {
    return <>{children}</>;
  }

  if (!auth) return null;

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-red-500">Swish</span> Admin
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full"
          >
            <LogOut size={18} />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
