"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Trash2,
  Plus,
  Loader2,
  Users,
} from "lucide-react";

interface ChatUser {
  id: string;
  name: string;
  username: string;
  color: string;
  isAdmin: boolean;
  createdAt: string;
}

const COLOR_PRESETS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
  "#1d4ed8",
  "#059669",
  "#dc2626",
];

export default function ChatUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [color, setColor] = useState("#ef4444");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/chat/users");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/chat/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, color, isAdmin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Fehler beim Erstellen");
        setSaving(false);
        return;
      }

      setUsers((prev) => [...prev, data]);
      setName("");
      setUsername("");
      setPassword("");
      setColor("#ef4444");
      setIsAdmin(false);
    } catch {
      setError("Verbindungsfehler");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`Benutzer "${userName}" wirklich löschen?`)) return;

    try {
      const res = await fetch("/api/admin/chat/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch { /* ignore */ }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/chat"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chat-Benutzer verwalten
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Mitarbeiter für den Team-Chat anlegen und verwalten
          </p>
        </div>
      </div>

      {/* Create User Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus size={20} />
          Neuen Benutzer anlegen
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Max Mustermann"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Benutzername
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="max"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passwort
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="passwort123"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Avatar-Farbe
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-bs-accent" />
            </label>
            <span className="text-sm text-gray-700 flex items-center gap-1.5">
              <Shield size={14} className="text-bs-accent" />
              Administrator (kann Kanäle verwalten)
            </span>
          </div>

          {error && (
            <div className="text-bs-accent text-sm bg-blue-50 rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-bs-accent hover:bg-bs-accent-dark disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Benutzer anlegen
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Users size={18} className="text-gray-400" />
          <h2 className="font-semibold text-gray-900">
            Benutzer ({users.length})
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Noch keine Benutzer angelegt</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: u.color }}
                  >
                    <span className="text-white font-semibold">
                      {u.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-1.5">
                      {u.name}
                      {u.isAdmin && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 text-bs-accent-dark text-xs font-medium rounded">
                          <Shield size={10} />
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">@{u.username}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(u.id, u.name)}
                  className="p-2 text-gray-400 hover:text-bs-accent hover:bg-blue-50 rounded-lg transition-colors"
                  title="Benutzer löschen"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
