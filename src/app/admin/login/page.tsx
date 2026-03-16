"use client";

import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/admin";
      } else {
        setError(data.error || "Login fehlgeschlagen");
      }
    } catch {
      setError("Verbindungsfehler");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              <span className="text-red-600">Swish</span> Admin
            </h1>
            <p className="mt-1 text-sm text-gray-500">Bitte melden Sie sich an</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none text-sm"
                placeholder="Admin-Passwort eingeben"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Anmelden
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Standard-Passwort: admin123
        </p>
      </div>
    </div>
  );
}
