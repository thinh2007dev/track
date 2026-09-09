import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { error: "Realtime refresh is disabled. Use the refresh button to reload accounts." },
    { status: 410 },
  );
}
