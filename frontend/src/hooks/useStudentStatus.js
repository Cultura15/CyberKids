import { useState, useEffect, useRef } from "react";

const WS_ENDPOINT = process.env.REACT_APP_WS_ENDPOINT;

export function useStudentStatus() {
  const [studentStatuses, setStudentStatuses] = useState({});
  const stompClientRef = useRef(null);
  const isConnectingRef = useRef(false);

  // --- WebSocket Setup ---
  useEffect(() => {
    const connectWebSocket = async () => {
      if (isConnectingRef.current) return;
      isConnectingRef.current = true;

      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          console.warn("No JWT token found — WebSocket not connected");
          isConnectingRef.current = false;
          return;
        }

        console.log("Connecting to student status WebSocket...");

        const [{ Client }, { default: SockJS }] = await Promise.all([
          import("@stomp/stompjs"),
          import("sockjs-client"),
        ]);

        const client = new Client({
          webSocketFactory: () => new SockJS(WS_ENDPOINT),
          connectHeaders: { Authorization: `Bearer ${token}` },
          debug: (str) => console.log(str),
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          onConnect: () => {
            console.log("[WebSocket] Connected to /topic/student-status");
            isConnectingRef.current = false;

            client.subscribe("/topic/student-status", (message) => {
              if (!message.body) return;

              try {
                const statusUpdate = JSON.parse(message.body);
                console.log("Received student status update:", statusUpdate);

                if (statusUpdate.robloxId) {
                  setStudentStatuses((prev) => ({
                    ...prev,
                    [statusUpdate.robloxId]:
                      statusUpdate.isOnline ||
                      statusUpdate.online ||
                      statusUpdate.is_online === 1,
                  }));
                }
              } catch (err) {
                console.error("Error parsing student status:", err);
              }
            });
          },

          onStompError: (frame) => {
            console.error("[WebSocket STOMP Error]", frame.headers, frame.body);
            isConnectingRef.current = false;
          },

          onWebSocketClose: () => {
            console.warn("[WebSocket] Connection closed — reconnecting soon");
            isConnectingRef.current = false;
          },
        });

        client.activate();
        stompClientRef.current = client;
      } catch (error) {
        console.error("Error initializing WebSocket:", error);
        isConnectingRef.current = false;
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
      }
    };
  }, []);

  // --- Initialize from Database ---
  const initializeStatuses = (students) => {
    if (!students || students.length === 0) return;
    const initial = {};

    students.forEach((s) => {
      if (!s.robloxId) return;

      const dbOnline =
        s.online === true ||
        s.online === 1 ||
        s.isOnline === true ||
        s.isOnline === 1 ||
        s.is_online === 1 ||
        s.is_online === "1";

      initial[s.robloxId] = !!dbOnline;
    });

    // Merge, preferring live WebSocket updates
    setStudentStatuses((prev) => ({ ...initial, ...prev }));

    console.log("Initialized student online statuses (from DB):", initial);
  };

  // --- Status Resolver ---
  const getOnlineStatus = (student) => {
    if (!student || !student.robloxId) return "offline";

    if (Object.prototype.hasOwnProperty.call(studentStatuses, student.robloxId)) {
      return studentStatuses[student.robloxId] ? "online" : "offline";
    }

    const dbOnline =
      student.online === true ||
      student.online === 1 ||
      student.isOnline === true ||
      student.isOnline === 1 ||
      student.is_online === 1 ||
      student.is_online === "1";

    return dbOnline ? "online" : "offline";
  };

  return { studentStatuses, initializeStatuses, getOnlineStatus };
}
