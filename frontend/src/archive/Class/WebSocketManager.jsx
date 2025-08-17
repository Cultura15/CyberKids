"use client"

import { useEffect } from "react"

const WebSocketManager = ({ stompClientRef, isConnectingRef, setStudentStatuses, setStudents, WS_ENDPOINT }) => {
  useEffect(() => {
    const connectWebSocket = async () => {
      if (isConnectingRef.current || typeof window === "undefined") return

      isConnectingRef.current = true

      try {
        const token = localStorage.getItem("jwtToken")
        if (!token) {
          isConnectingRef.current = false
          return
        }

        console.log("Connecting to student status WebSocket...")

        const [{ Client }, { default: SockJS }] = await Promise.all([import("@stomp/stompjs"), import("sockjs-client")])

        const client = new Client({
          webSocketFactory: () => new SockJS(WS_ENDPOINT),
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },
          debug: (str) => {
            console.log(str)
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          onConnect: () => {
            console.log("Connected to student status WebSocket")
            isConnectingRef.current = false

            client.subscribe("/topic/student-status", (message) => {
              if (message.body) {
                try {
                  const statusUpdate = JSON.parse(message.body)
                  console.log("Received student status update:", statusUpdate)

                  if (statusUpdate.robloxId) {
                    setStudentStatuses((prev) => ({
                      ...prev,
                      [statusUpdate.robloxId]: statusUpdate.isOnline || statusUpdate.online,
                    }))

                    setStudents((prevStudents) =>
                      prevStudents.map((student) =>
                        student.robloxId === statusUpdate.robloxId
                          ? { ...student, online: statusUpdate.isOnline || statusUpdate.online }
                          : student,
                      ),
                    )
                  }
                } catch (e) {
                  console.error("Error parsing student status message:", e)
                }
              }
            })
          },
          onStompError: (frame) => {
            console.error("STOMP error:", frame.headers, frame.body)
            isConnectingRef.current = false
          },
          onWebSocketClose: () => {
            console.log("WebSocket connection closed")
            isConnectingRef.current = false
          },
        })

        client.activate()
        stompClientRef.current = client
      } catch (error) {
        console.error("Error initializing WebSocket:", error)
        isConnectingRef.current = false
        setTimeout(connectWebSocket, 5000)
      }
    }

    connectWebSocket()

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
        stompClientRef.current = null
      }
    }
  }, [])

  return null
}

export default WebSocketManager
