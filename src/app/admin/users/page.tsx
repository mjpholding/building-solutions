"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Shield, ShieldCheck, Edit3, Save, X, Loader2, Key, UserCircle, Bell, Mail } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: "superadmin" | "admin" | "editor";
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  editor: "Editor",
};
const ROLE_COLORS: Record<string, string> = {
  superadmin: "bg-blue-100 text-bs-accent-dark",
  admin: "bg-blue-100 text-blue-700",
  editor: "bg-gray-100 text-gray-700",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Create form
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<string>("admin");

  // Edit form
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<string>("admin");

  const isSuperadmin = currentUser?.role === "superadmin";

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/login").then((r) => r.json()),
    ]).then(([usersData, loginData]) => {
      setUsers(usersData || []);
      setCurrentUser(loginData.user);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!newName || !newUsername || !newPassword) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, username: newUsername, password: newPassword, role: newRole }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => [...prev, data.user]);
      setNewName(""); setNewUsername(""); setNewPassword(""); setNewRole("admin");
      setShowCreate(false);
    } else {
      setError(data.error);
    }
    setSaving(false);
  };

  const handleEdit = (user: AdminUser) => {
    setEditId(user.id);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditPassword("");
    setEditRole(user.role);
  };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);
    setError("");
    const body: Record<string, string> = { id: editId, name: editName, username: editUsername, role: editRole };
    if (editPassword) body.password = editPassword;
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editId ? { ...u, name: editName, username: editUsername, role: editRole as AdminUser["role"] } : u))
      );
      setEditId(null);
    } else {
      const data = await res.json();
      setError(data.error);
    }
    setSaving(false);
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`"${user.name}" wirklich loschen?`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} Benutzer</p>
        </div>
        {isSuperadmin && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-bs-accent hover:bg-bs-accent-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Neuer Benutzer
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-bs-accent bg-blue-50 p-3 rounded-lg flex items-center justify-between">
          {error}
          <button onClick={() => setError("")}><X size={14} /></button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Neuer Benutzer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Max Mustermann"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-bs-accent500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername *</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                placeholder="max.mustermann"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-bs-accent500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 4 Zeichen"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-bs-accent500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-bs-accent500 outline-none text-sm"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={handleCreate}
              disabled={saving || !newName || !newUsername || !newPassword}
              className="flex items-center gap-2 bg-bs-accent hover:bg-bs-accent-dark disabled:bg-red-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Erstellen
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Users list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Benutzer</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Benutzername</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Rolle</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Erstellt</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                {editId === user.id ? (
                  <>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-200 focus:border-bs-accent500 outline-none text-sm"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                        className="w-full px-3 py-1.5 rounded border border-gray-200 focus:border-bs-accent500 outline-none text-sm font-mono"
                      />
                    </td>
                    <td className="px-6 py-3">
                      {isSuperadmin ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="px-3 py-1.5 rounded border border-gray-200 text-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                      ) : (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Key size={14} className="text-gray-400" />
                        <input
                          type="password"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="Neues Passwort (leer = unverändert)"
                          className="w-full px-3 py-1.5 rounded border border-gray-200 focus:border-bs-accent500 outline-none text-sm"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                          {user.role === "superadmin" ? (
                            <ShieldCheck size={16} className="text-bs-accent" />
                          ) : user.role === "admin" ? (
                            <Shield size={16} className="text-blue-500" />
                          ) : (
                            <UserCircle size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          {user.id === currentUser?.id && (
                            <span className="text-[10px] text-green-600 font-medium">Sie</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-gray-600 bg-gray-50 px-2 py-0.5 rounded">{user.username}</code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(isSuperadmin || user.id === currentUser?.id) && (
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        {isSuperadmin && user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-gray-400 hover:text-bs-accent hover:bg-blue-50 rounded-lg transition-colors"
                            title="Loschen"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notification settings */}
      <NotificationSettingsPanel />

      {/* Role info */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Rollenubersicht</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS.superadmin}`}>Superadmin</span>
            Voller Zugriff, kann Benutzer verwalten, Rollen andern
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS.admin}`}>Admin</span>
            Zugriff auf alle Funktionen, kann keine Benutzer verwalten
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS.editor}`}>Editor</span>
            Kann Produkte, Texte und Kontaktdaten bearbeiten
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationSettingsPanel() {
  const [email, setEmail] = useState("");
  const [chatNotify, setChatNotify] = useState(false);
  const [orderNotify, setOrderNotify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/notification-settings")
      .then((r) => r.json())
      .then((data) => {
        setEmail(data.email || "");
        setChatNotify(data.chatNotify || false);
        setOrderNotify(data.orderNotify || false);
        setLoaded(true);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/notification-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, chatNotify, orderNotify }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!loaded) return null;

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={18} className="text-bs-accent" />
        <h3 className="text-sm font-semibold text-gray-900">E-Mail-Benachrichtigungen</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Erhalten Sie E-Mail-Benachrichtigungen bei neuen Chat-Nachrichten oder Bestellungen.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail size={14} className="inline mr-1" />
            E-Mail-Adresse
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ihre@email.de"
            className="w-full max-w-sm px-4 py-2.5 rounded-lg border border-gray-200 focus:border-bs-accent500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={chatNotify}
              onChange={(e) => setChatNotify(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-bs-accent focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Chat-Nachrichten — Benachrichtigung bei neuen Nachrichten im Team-Chat</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={orderNotify}
              onChange={(e) => setOrderNotify(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-bs-accent focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Bestellungen — Benachrichtigung bei neuen Kundenbestellungen</span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !email}
            className="flex items-center gap-2 bg-bs-accent hover:bg-bs-accent-dark disabled:bg-red-300 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Speichern
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">Gespeichert!</span>}
        </div>
      </div>
    </div>
  );
}
