import { NextResponse } from "next/server";
import { isSupabaseConfigured, listAccounts } from "../../../lib/store";

export async function GET() {
  const accounts = await listAccounts();
  return NextResponse.json({
    data: accounts,
    source: isSupabaseConfigured() ? "supabase" : "memory",
    updatedAt: new Date().toISOString(),
  });
}
