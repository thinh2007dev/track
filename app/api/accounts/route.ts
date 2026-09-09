import { NextRequest, NextResponse } from "next/server";
import { clearAccounts, getStoreDiagnostics, isSupabaseConfigured, listAccounts } from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accounts = await listAccounts();
    return NextResponse.json({
      data: accounts,
      source: isSupabaseConfigured() ? "supabase" : "memory",
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Account list failed", error);
    const diagnostics = await getStoreDiagnostics();
    const detail = error instanceof Error ? error.message : diagnostics.message;
    return NextResponse.json(
      {
        error: "Không đọc được dữ liệu Supabase.",
        detail,
        diagnostics,
      },
      { status: 503 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const secret = process.env.SCANNER_API_KEY ?? (process.env.NODE_ENV !== "production" ? "dev-scanner-key" : undefined);
  if (!secret || request.headers.get("x-admin-key") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await clearAccounts();
  return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
}
