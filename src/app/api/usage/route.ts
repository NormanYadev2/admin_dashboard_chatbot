import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { ApiUsage } from "@/lib/schema/ApiUsage";

export async function GET() {
  try {
    await connectDB();
    const usage = await ApiUsage.find().sort({ timestamp: -1 });
    return NextResponse.json(usage);
  } catch (err) {
    console.error(" Failed to fetch usage:", err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
