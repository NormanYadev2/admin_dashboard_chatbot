import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Lead } from "@/lib/schema/lead";

export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });
    return NextResponse.json(leads);
  } catch (err) {
    console.error(" Failed to fetch leads:", err);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
