import { NextResponse } from "next/server";
import { listAccounts } from "../../../lib/store";

export async function GET() {
  return NextResponse.json({ data: listAccounts(), source: process.env.DATABASE_URL ? "database-adapter" : "mock", updatedAt: new Date().toISOString() });
}
