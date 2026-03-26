"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Mail, Type, Package, LogOut, Loader2, ShoppingCart, Euro,
  Users, Tag, AtSign, CreditCard, MessageCircle, ShieldCheck, FileText,
  Menu, X, BarChart3, Activity, Scale, Printer, ClipboardList, Brain,
  ChevronDown
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Bestellungen",
    icon: ShoppingCart,
    items: [
      { href: "/admin/orders", label: "Bestellungen", icon: ShoppingCart },
      { href: "/admin/customers", label: "Kunden", icon: Users },
      { href: "/admin/offers", label: "Angebote", icon: ClipboardList },
    ],
  },
  {
    label: "Produkte",
    icon: Package,
    items: [
      { href: "/admin/products", label: "Produkte", icon: Package },
      { href: "/admin/prices", label: "Preise", icon: Euro },
      { href: "/admin/discounts", label: "Rabatte", icon: Tag },
    ],
  },
  {
    label: "Inhalte",
    icon: Type,
    items: [
      { href: "/admin/texts", label: "Texte", icon: Type },
      { href: "/admin/contact", label: "Kontaktdaten", icon: Mail },
      { href: "/admin/legal", label: "Impressum / Datenschutz / AGB", icon: Scale },
    ],
  },
  {
    label: "Finanzen",
    icon: Euro,
    items: [
      { href: "/admin/finance", label: "Finanzen", icon: BarChart3 },
    ],
  },
  {
    label: "Marketing",
    icon: Activity,
    items: [
      { href: "/admin/analytics", label: "Analytik", icon: Activity },
      { href: "/admin/ai-advisor", label: "AI-Berater", icon: Brain },
    ],
  },
  {
    label: "Dokumente",
    icon: FileText,
    items: [
      { href: "/admin/pdf-generator", label: "PDF-Generator", icon: Printer },
      { href: "/admin/document-settings", label: "Vorlagen", icon: FileText },
      { href: "/admin/email-signature", label: "E-Mail-Signatur", icon: AtSign },
      { href: "/admin/business-cards", label: "Visitenkarten", icon: CreditCard },
    ],
  },
  {
    label: "Team",
    icon: Users,
    items: [
      { href: "/admin/chat", label: "Team-Chat", icon: MessageCircle },
      { href: "/admin/users", label: "Benutzer", icon: ShieldCheck },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [auth, setAuth] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const isChat = pathname.startsWith("/admin/chat");

  // Auto-open group that contains current page
  useEffect(() => {
    for (const group of navGroups) {
      if (group.items.some((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)))) {
        setOpenGroups((prev) => ({ ...prev, [group.label]: true }));
      }
    }
  }, [pathname]);

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

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin/documents/print")) {
    return <html lang="de"><body>{children}</body></html>;
  }

  if (pathname === "/admin/login") {
    return <html lang="de"><body>{children}</body></html>;
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

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <html lang="de">
      <body>
        <div className={`flex bg-gray-50 ${isChat ? "h-screen" : "min-h-screen"}`}>
          {/* Mobile header bar */}
          <div className="fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white flex items-center justify-between px-4 py-3 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-800 rounded-lg">
              <Menu size={22} />
            </button>
            <h1 className="text-sm font-bold tracking-tight">
              <span className="text-red-500">Swish</span> Admin
            </h1>
            <div className="w-8" />
          </div>

          {/* Overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 bg-gray-900 text-white flex flex-col flex-shrink-0 transform transition-all duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
              isChat ? "lg:w-16" : "lg:w-64"
            } w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          >
            <div className={`border-b border-gray-800 flex items-center justify-between ${isChat ? "lg:p-3 lg:justify-center p-6" : "p-6"}`}>
              <h1 className={`text-lg font-bold tracking-tight ${isChat ? "lg:hidden" : ""}`}>
                <span className="text-red-500">Swish</span> Admin
              </h1>
              {isChat && <span className="text-red-500 font-bold text-lg hidden lg:block">S</span>}
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-800 rounded">
                <X size={18} />
              </button>
            </div>

            <nav className={`flex-1 overflow-y-auto ${isChat ? "lg:p-2 p-3" : "p-3"}`}>
              {/* Dashboard — always visible */}
              <Link
                href="/admin"
                title={isChat ? "Dashboard" : undefined}
                className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  isChat ? "lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5" : "px-3 py-2.5"
                } ${pathname === "/admin" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
              >
                <LayoutDashboard size={18} />
                <span className={isChat ? "lg:hidden" : ""}>Dashboard</span>
              </Link>

              {/* Groups */}
              {navGroups.map((group) => {
                const GroupIcon = group.icon;
                const isOpen = openGroups[group.label];
                const hasActive = group.items.some((item) =>
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                );

                // Chat mode — show only icons
                if (isChat) {
                  return group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} title={item.label}
                        className={`flex items-center justify-center py-2.5 rounded-lg transition-colors ${isActive ? "bg-red-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}>
                        <Icon size={18} />
                      </Link>
                    );
                  });
                }

                return (
                  <div key={group.label} className="mt-1">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hasActive ? "text-white" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                      }`}
                    >
                      <GroupIcon size={16} />
                      <span className="flex-1 text-left">{group.label}</span>
                      <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                      <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-800 pl-3">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                isActive
                                  ? "bg-red-600 text-white"
                                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                              }`}
                            >
                              <Icon size={15} />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className={`border-t border-gray-800 space-y-2 ${isChat ? "lg:p-2 p-4" : "p-4"}`}>
              {adminUser && !isChat && (
                <div className="px-3 py-2 text-xs text-gray-500">
                  <p className="text-gray-300 font-medium truncate">{adminUser.name}</p>
                  <p className="capitalize">{adminUser.role}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                title={isChat ? "Abmelden" : undefined}
                className={`flex items-center gap-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full ${
                  isChat ? "lg:justify-center lg:px-0 lg:py-2.5 px-4 py-3" : "px-3 py-2.5"
                }`}
              >
                <LogOut size={18} />
                <span className={isChat ? "lg:hidden" : ""}>Abmelden</span>
              </button>
            </div>
          </aside>

          {/* Main */}
          <main className={`flex-1 overflow-auto pt-14 lg:pt-0 ${isChat ? "h-full" : ""}`}>
            <div className={isChat ? "h-full" : "p-4 sm:p-6 lg:p-8"}>{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
