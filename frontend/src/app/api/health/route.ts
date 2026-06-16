import { NextResponse } from "next/server";

/** Health endpoint for the frontend itself. Backend has its own /health. */
export async function GET() {
  return NextResponse.json({ status: "ok", service: "safesquare-frontend" });
}
