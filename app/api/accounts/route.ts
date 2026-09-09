import { NextRequest, NextResponse } from "next/server";
import { clearAccounts, isSupabaseConfigured, listAccounts } from "../../../lib/store";

export async function GET() {
  const accounts = await listAccounts();
  return NextResponse.json({
    data: accounts,
    source: isSupabaseConfigured() ? "supabase" : "memory",
    updatedAt: new Date().toISOString(),
  });
}

export async function DELETE(request: NextRequest) {
  const secret = process.env.SCANNER_API_KEY ?? (process.env.NODE_ENV !== "production" ? "dev-scanner-key" : undefined);
  if (!secret || request.headers.get("x-admin-key") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearAccounts();
  return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
}
