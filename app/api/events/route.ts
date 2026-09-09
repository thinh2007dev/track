import { scanEvents } from "../../../lib/scan-events";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) => controller.enqueue(encoder.encode(`event: scan\ndata: ${JSON.stringify(event)}\n\n`));
      const heartbeat = setInterval(() => controller.enqueue(encoder.encode(": heartbeat\n\n")), 20_000);
      scanEvents.on("scan", send);
      cleanup = () => { clearInterval(heartbeat); scanEvents.off("scan", send); };
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
