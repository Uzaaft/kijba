"use client";

import { useEffect, useRef } from "react";

export interface BoardEvent {
  event: string;
  data: unknown;
}

export type BoardEventHandler = (event: BoardEvent) => void;

/**
 * Hook for establishing SSE connection to board real-time updates
 * Manages connection lifecycle and event listening
 */
export function useRealtime(boardId: string, onEvent: BoardEventHandler) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const isConnectingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Use a ref for the callback so we can update it without reconnecting
  const onEventRef = useRef(onEvent);

  // Keep the callback ref up to date
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    const connect = () => {
      if (isConnectingRef.current || eventSourceRef.current) {
        return;
      }

      isConnectingRef.current = true;

      try {
        const eventSource = new EventSource(`/api/events/${boardId}`);

        eventSource.onopen = () => {
          console.log(`[SSE] Connected to board ${boardId}`);
          isConnectingRef.current = false;
        };

        eventSource.onmessage = (event) => {
          // Skip non-JSON messages (like "connected" or keep-alive pings)
          if (!event.data || event.data === "connected" || event.data.startsWith(":")) {
            return;
          }

          try {
            const message = JSON.parse(event.data);
            if (message.event && message.data !== undefined) {
              // Use the ref to always call the latest callback
              onEventRef.current(message);
            }
          } catch (error) {
            // Ignore parse errors for non-JSON messages
            console.debug("[SSE] Received non-JSON message:", event.data);
            console.error("[SSE] JSON parse error:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("[SSE] Connection error:", error);
          eventSource.close();
          eventSourceRef.current = null;
          isConnectingRef.current = false;

          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000);
        };

        eventSourceRef.current = eventSource;
      } catch (error) {
        console.error("[SSE] Failed to create EventSource:", error);
        isConnectingRef.current = false;
      }
    };

    connect();

    return () => {
      // Clean up reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      // Close the event source
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      isConnectingRef.current = false;
    };
  }, [boardId]);
}
