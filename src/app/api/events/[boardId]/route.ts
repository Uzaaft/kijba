import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { boards } from "@/lib/db/schema";
import { verifyCollaboratorToken } from "@/lib/board";
import { addSSEClient } from "@/lib/sse-events";
import { headers, cookies } from "next/headers";
import { eq } from "drizzle-orm";

/**
 * Server-Sent Events (SSE) endpoint for real-time board updates
 * Clients establish persistent connections here to receive real-time events
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const { boardId } = await params;

  // Verify access to board
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  // Check if user is authenticated owner
  if (userId) {
    const board = await db
      .select()
      .from(boards)
      .where(eq(boards.id, boardId))
      .limit(1);

    if (board.length && board[0].ownerId === userId) {
      // Owner has access
      return createSSEStream(boardId);
    }
  }

  // Check for valid collaborator token
  const cookieStore = await cookies();
  const token = cookieStore.get("collab_token")?.value;

  if (token) {
    const tokenBoardId = verifyCollaboratorToken(token);
    if (tokenBoardId === boardId) {
      return createSSEStream(boardId);
    }
  }

  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Create SSE stream with proper headers and cleanup
 */
function createSSEStream(boardId: string) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Send initial connection confirmation
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("data: connected\n\n"));

      // Create send function for this client
      const send = (message: string) => {
        try {
          const encoded = encoder.encode(message);
          controller.enqueue(encoded);
        } catch {
          // Client likely disconnected
          cleanup();
        }
      };

      // Register this client
      const cleanup = addSSEClient(boardId, send);

      // Set up a keep-alive ping to prevent connection drops
      const keepAliveInterval = setInterval(() => {
        try {
          send(": keep-alive\n\n");
        } catch {
          clearInterval(keepAliveInterval);
          cleanup();
        }
      }, 30000); // Every 30 seconds
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
