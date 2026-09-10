export const runtime = 'nodejs';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: 'CONNECTED',
            version: 0,
            activeConnections: 1,
            timestamp: new Date().toISOString(),
          })}\n\n`
        )
      );

      // Short-lived compatibility heartbeat. Firestore listeners are the
      // actual cross-device realtime channel in the migrated application.
      const timer = setTimeout(() => {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'HEARTBEAT',
                version: 0,
                activeConnections: 1,
                timestamp: new Date().toISOString(),
              })}\n\n`
            )
          );
          controller.close();
        } catch {}
      }, 5000);

      return () => clearTimeout(timer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
