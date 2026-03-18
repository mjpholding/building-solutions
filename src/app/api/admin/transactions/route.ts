import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface Transaction {
  id: string;
  type: "purchase" | "sale";
  date: string;
  description: string;
  amount: number;
  currency: "EUR" | "PLN";
  exchangeRate?: number;
  amountEUR?: number;
  note?: string;
  createdAt: string;
}

const STORE_KEY = "finance:transactions";

async function getTransactions(): Promise<Transaction[]> {
  const data = await storeGet(STORE_KEY);
  return (data as Transaction[]) || [];
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const transactions = await getTransactions();
  return NextResponse.json({ transactions });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, date, description, amount, currency, exchangeRate, note } = body;

    if (!type || !date || !description || !amount || !currency) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const transactions = await getTransactions();

    const tx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      date,
      description,
      amount: Number(amount),
      currency,
      exchangeRate: exchangeRate ? Number(exchangeRate) : undefined,
      amountEUR: currency === "PLN" && exchangeRate ? Number(amount) / Number(exchangeRate) : Number(amount),
      note: note || undefined,
      createdAt: new Date().toISOString(),
    };

    transactions.push(tx);
    await storeSet(STORE_KEY, transactions);

    return NextResponse.json({ success: true, transaction: tx });
  } catch (err) {
    console.error("Transaction create error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const transactions = await getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    await storeSet(STORE_KEY, filtered);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Transaction delete error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
