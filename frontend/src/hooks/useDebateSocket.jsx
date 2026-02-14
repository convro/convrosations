import { useEffect, useRef, useCallback, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001`;

export function useDebateSocket() {
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const handlers = useRef({});

  const on = useCallback((type, fn) => {
    handlers.current[type] = fn;
  }, []);

  const send = useCallback((data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    let reconnectTimer = null;
    let pingInterval = null;
    let dead = false;

    function connect() {
      if (dead) return;
      const socket = new WebSocket(WS_URL);
      ws.current = socket;

      socket.onopen = () => {
        setConnected(true);
        pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, 25000);
      };

      socket.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "connected") setSessionId(msg.sessionId);
          const handler = handlers.current[msg.type];
          if (handler) handler(msg);
          // catch-all
          if (handlers.current["*"]) handlers.current["*"](msg);
        } catch {}
      };

      socket.onclose = () => {
        setConnected(false);
        clearInterval(pingInterval);
        if (!dead) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      dead = true;
      clearInterval(pingInterval);
      clearTimeout(reconnectTimer);
      ws.current?.close();
    };
  }, []);

  return { connected, sessionId, send, on };
}
