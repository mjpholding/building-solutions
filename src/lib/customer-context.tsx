"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface CustomerPublic {
  id: string;
  type: "b2b" | "b2c";
  company: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  taxId: string;
  discountPercent: number;
  loyaltyPoints: number;
}

interface CustomerContextType {
  customer: CustomerPublic | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface RegisterData {
  type: "b2b" | "b2c";
  company?: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  taxId?: string;
}

const CustomerContext = createContext<CustomerContextType>({
  customer: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refresh: async () => {},
});

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setCustomer(data.customer || null);
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setCustomer(data.customer);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const register = async (regData: RegisterData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData),
    });
    const data = await res.json();
    if (data.success) {
      setCustomer(data.customer);
      return { success: true };
    }
    return { success: false, error: data.error };
  };

  const logout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    setCustomer(null);
  };

  return (
    <CustomerContext.Provider value={{ customer, loading, login, register, logout, refresh }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomer = () => useContext(CustomerContext);
