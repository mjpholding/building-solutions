import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { storeGet, storeSet } from "@/lib/admin-store";

export interface JobPosting {
  id: string; title: string; location: string; type: string;
  description: string; requirements: string[]; benefits: string[];
  active: boolean; createdAt: string;
}

async function getJobs(): Promise<JobPosting[]> {
  return ((await storeGet("careers")) as JobPosting[]) || [];
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getJobs());
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await storeSet("careers", body);
  return NextResponse.json(body);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const jobs = await getJobs();
  const job: JobPosting = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: body.title || "", location: body.location || "Kerpen", type: body.type || "Vollzeit",
    description: body.description || "", requirements: body.requirements || [], benefits: body.benefits || [],
    active: true, createdAt: new Date().toISOString(),
  };
  jobs.push(job);
  await storeSet("careers", jobs);
  return NextResponse.json(job, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const jobs = await getJobs();
  await storeSet("careers", jobs.filter((j) => j.id !== id));
  return NextResponse.json({ success: true });
}
