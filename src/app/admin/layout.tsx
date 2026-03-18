"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Mail, Type, Package, LogOut, Loader2, ShoppingCart, Euro, Users, Tag, AtSign, CreditCard, MessageCircle, ShieldCheck, FileText, Menu, X, BarChart3 } from "lucide-react";

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
  { href: "/admin/document-settings", label: "Dokumente", icon: FileText },
  { href: "/admin/finance", label: "Finanzen", icon: BarChart3 },
  { href: "/admin/chat", label: "Team-Chat", icon: MessageCircle },
  { href: "/admin/users", label: "Benutzer", icon: ShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [auth, setAuth] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        setAuth(d.authenticated);
        if (!d.authenticated && pathname !== "/admin/login") {
          window.location.href = "/admin/login";
        }
        if (d.authenticated) {
          fetch("/api/admin/login").then((r) => r.json()).then((data) => {
            if (data.user) setAdminUser(data.user);
          });
        }
      })
      .catch(() => setAuth(false));
  }, [pathname]);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Print page — no chrome
  if (pathname.startsWith("/admin/documents/print")) {
    return (
      <html lang="de">
        <body>{children}</body>
      </html>
    );
  }

  // Login page — no sidebar
  if (pathname === "/admin/login") {
    return (
      <html lang="de">
        <body>{children}</body>
      </html>
    );
  }

  if (auth === null) {
    return (
      <html lang="de">
        <body>
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </body>
      </html>
    );
  }

  if (!auth) return <html lang="de"><body></body></html>;

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin/login";
  };

  return (
    <html lang="de">
      <body>
        <div className="min-h-screen flex bg-gray-50">
          {/* Mobile header bar */}
          <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white flex items-center justify-between px-4 py-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 hover:bg-gray-800 rounded-lg"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-sm font-bold tracking-tight">
              <span className="text-red-500">Swish</span> Admin
            </h1>
            <div className="w-8" />
          </div>

          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h1 className="text-lg font-bold tracking-tight">
                <span className="text-red-500">Swish</span> Admin
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-800 rounded"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
            <div className="p-4 border-t border-gray-800 space-y-2">
              {adminUser && (
                <div className="px-4 py-2 text-xs text-gray-500">
                  <p className="text-gray-300 font-medium truncate">{adminUser.name}</p>
                  <p className="capitalize">{adminUser.role}</p>
                </div>
              )}
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
          <main className="flex-1 overflow-auto pt-14 lg:pt-0">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
