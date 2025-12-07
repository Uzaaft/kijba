/**
 * Server-Sent Events (SSE) management for real-time board updates
 * Uses a callback-based approach for server-side delivery
 */

type SSECallback = (message: string) => void;

interface SSEClient {
  send: SSECallback;
}

const activeConnections = new Map<string, Set<SSEClient>>();

/**
 * Add a new SSE client connection for a board
 */
export function addSSEClient(boardId: string, send: SSECallback) {
  if (!activeConnections.has(boardId)) {
    activeConnections.set(boardId, new Set());
  }
  
  const client: SSEClient = { send };
  activeConnections.get(boardId)!.add(client);
  
  return () => {
    // Cleanup function
    const clients = activeConnections.get(boardId);
    if (clients) {
      clients.delete(client);
      if (clients.size === 0) {
        activeConnections.delete(boardId);
      }
    }
  };
}

/**
 * Broadcast a real-time event to all clients connected to a board
 */
export function broadcastBoardEvent(
  boardId: string,
  event: string,
  data: unknown
) {
  const clients = activeConnections.get(boardId);
  if (!clients || clients.size === 0) return;

  const message = `data: ${JSON.stringify({ event, data })}\n\n`;

  for (const client of clients) {
    try {
      client.send(message);
    } catch (error) {
      // Client disconnected, will be cleaned up by stream close
      console.error("Error sending SSE message:", error);
    }
  }
}

/**
 * Get count of active connections for a board (useful for debugging)
 */
export function getActiveConnectionCount(boardId: string): number {
  return activeConnections.get(boardId)?.size ?? 0;
}
