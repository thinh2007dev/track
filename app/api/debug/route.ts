import { NextResponse } from "next/server";
import { getStoreDiagnostics } from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const diagnostics = await getStoreDiagnostics();
  return NextResponse.json({
    ...diagnostics,
    checkedAt: new Date().toISOString(),
  }, {
    status: diagnostics.ok ? 200 : 503,
  });
}
