"use client"

import { useState, useEffect, useRef } from "react"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"

const API_URL = process.env.REACT_APP_API_URL

// Helper function to parse timestamp (moved outside hook for reusability)
const parseTimestamp = (timestamp) => {
  if (!timestamp) return new Date()

  try {
    const date = new Date(timestamp)
    // Always interpret as Manila local time
    const manila = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }))
    return manila
  } catch (error) {
    console.error("Error parsing timestamp:", error)
    return new Date()
  }
}



// Helper function to calculate time ago
const getTimeAgo = (timestamp) => {
  if (!timestamp) return "Just now"
  
  try {
    const now = new Date()
    const time = parseTimestamp(timestamp)
    
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    }
    if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000)
      return `${months} ${months === 1 ? 'month' : 'months'} ago`
    }
    
    const years = Math.floor(diffInSeconds / 31536000)
    return `${years} ${years === 1 ? 'year' : 'years'} ago`
  } catch (error) {
    console.error("Error calculating time ago:", error)
    return "Recently"
  }
}

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

                // Use current time if timestamp is missing, otherwise use backend timestamp
                // Prefer Manila time if available, otherwise fallback to UTC or now
                const timestamp =
                  payload.timestampManila ||
                  payload.timestampInstant ||
                  payload.timestamp ||
                  new Date().toISOString()

                const newNotification = {
                  id: payload.id || Date.now(),
                  title: title,
                  message: payload.message,
                  timestamp: timestamp, // Keep original format from backend
                  time: getTimeAgo(timestamp), // Calculate time ago immediately
                  read: false,
                  student: payload.student || null,
                  studentId: payload.student?.id || null,
                  type: payload.type || "info",
                  priority: priority
                }

                console.log("Created notification with timestamp:", {
                  original: timestamp,
                  calculated: newNotification.time,
                  parsed: parseTimestamp(timestamp)
                })

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