import { NextResponse } from "next/server";
import { accounts } from "../../../lib/mock-data";

export async function GET() {
  return NextResponse.json({ data: accounts, source: "mock", updatedAt: new Date().toISOString() });
}
