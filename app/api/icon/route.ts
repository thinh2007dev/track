import { NextRequest, NextResponse } from "next/server";

const allowedHosts = new Set(["static.wikia.nocookie.net"]);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src");
  if (!src) return new NextResponse("Missing src", { status: 400 });

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return new NextResponse("Invalid src", { status: 400 });
  }

  if (url.protocol !== "https:" || !allowedHosts.has(url.host)) {
    return new NextResponse("Blocked image host", { status: 400 });
  }

  const upstream = await fetch(url.toString(), {
    headers: {
      "user-agent": "FruitVault/1.0",
      accept: "image/avif,image/webp,image/png,image/*,*/*;q=0.8",
    },
    next: { revalidate: 60 * 60 * 24 * 7 },
  });

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Image unavailable", { status: upstream.status || 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "image/png",
      "cache-control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}
