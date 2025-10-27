"use client"

import { useState, useEffect, useRef } from "react"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"

const API_URL = process.env.REACT_APP_API_URL

const useWebSocket = (teacherProfile, userData, setNotifications, setUnreadCount) => {
  const [wsConnected, setWsConnected] = useState(false)
  const stompClient = useRef(null)

  useEffect(() => {
    const connectWebSocket = async () => {
      // Fallback to localStorage if props are not ready
      const storedUser = JSON.parse(localStorage.getItem("teacherData"))
      const email = teacherProfile?.email || userData?.email || storedUser?.email
      if (!email) return

      const token = localStorage.getItem("jwtToken")
      if (!token) return

      console.log("Attempting to connect to WebSocket...")

      const stompClientInstance = new Client({
        webSocketFactory: () => new SockJS(`${API_URL}/ws`),
        connectHeaders: { Authorization: `Bearer ${token}` },
        debug: (str) => console.log(str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log("Connected to WebSocket")
          setWsConnected(true)

          const destination = `/topic/teacher/${email.replace("@", "_")}`
          console.log(`Subscribing to ${destination}`)

          stompClientInstance.subscribe(destination, (message) => {
            if (message.body) {
              try {
                const payload = JSON.parse(message.body)
                console.log("Received WebSocket payload:", payload)

                // Determine notification details based on type
                let title, priority
                switch (payload.type) {
                  case "REGISTRATION":
                    title = "New Student Registered"
                    priority = "high"
                    break
                  case "MISSION_COMPLETION":
                    title = "Challenge Completed"
                    priority = "medium"
                    break
                  default:
                    title = "Notification"
                    priority = "medium"
                }

                const newNotification = {
                  id: payload.id || Date.now(),
                  title: title,
                  message: payload.message,
                  timestamp: payload.timestamp, // Keep original format from backend
                  time: "Just now",
                  read: false,
                  student: payload.student || null,
                  type: payload.type || "info",
                  priority: priority
                }

                console.log("Created notification:", newNotification)

                setNotifications(prev => [newNotification, ...prev])
                setUnreadCount(prev => prev + 1)
              } catch (e) {
                console.error("Error parsing WebSocket message:", e)
              }
            }
          })
        },
        onStompError: (frame) => {
          console.error("STOMP error:", frame)
          setWsConnected(false)
        },
        onWebSocketClose: () => {
          console.log("WebSocket connection closed")
          setWsConnected(false)
        },
      })

      stompClientInstance.activate()
      stompClient.current = stompClientInstance

      return () => {
        if (stompClientInstance.active) stompClientInstance.deactivate()
      }
    }

    if (teacherProfile || userData || localStorage.getItem("teacherData")) {
      connectWebSocket()
    }

    return () => {
      if (stompClient.current && stompClient.current.active) {
        stompClient.current.deactivate()
      }
    }
  }, [teacherProfile?.email, userData?.email, setNotifications, setUnreadCount])

  const disconnect = () => {
    if (stompClient.current && stompClient.current.active) {
      stompClient.current.deactivate()
    }
  }

  return { wsConnected, disconnect }
}

export default useWebSocket