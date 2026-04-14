import { NextResponse } from "next/server";
import { storeGet } from "@/lib/admin-store";

interface JobPosting { active: boolean; [key: string]: unknown; }

export async function GET() {
  const jobs = ((await storeGet("careers")) as JobPosting[]) || [];
  return NextResponse.json(jobs.filter((j) => j.active));
}
