import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const url = new URL("/login", req.url); 
  const res = NextResponse.redirect(url);
  res.cookies.delete("token");
  return res;
}
