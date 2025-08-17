"use client"

import { useState, useEffect, useRef } from "react"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"

const API_URL = process.env.REACT_APP_API_URL;

const useWebSocket = (teacherProfile, userData, setNotifications, setUnreadCount) => {
  const [wsConnected, setWsConnected] = useState(false)
  const stompClient = useRef(null)

  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        // Get teacher email from profile or userData
        const email = teacherProfile?.email || userData?.email
        if (!email) return // Don't connect if we don't have an email

        // Get auth token
        const token = localStorage.getItem("jwtToken")
        if (!token) return

        console.log("Attempting to connect to WebSocket...")

        // Create STOMP client
        const stompClientInstance = new Client({
          // Use SockJS for the WebSocket connection
          webSocketFactory: () => new SockJS(`${API_URL}/ws`),

          // Connection headers with authentication
          connectHeaders: {
            Authorization: `Bearer ${token}`,
          },

          // Debug settings
          debug: (str) => {
            console.log(str)
          },

          // Reconnect settings
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          // Connection callbacks
          onConnect: (frame) => {
            console.log("Connected to WebSocket")
            setWsConnected(true)

            // Format the destination topic - replace @ with _ as done in the backend
            const destination = `/topic/teacher/${email.replace("@", "_")}`
            console.log(`Subscribing to ${destination}`)

            // Subscribe to the topic
            stompClientInstance.subscribe(destination, (message) => {
              console.log("Received WebSocket message:", message)
              if (message.body) {
                try {
                  const student = JSON.parse(message.body)
                  console.log("Parsed student data:", student)

                  // Create a new notification
                  const newNotification = {
                    id: Date.now(), // Use timestamp as ID
                    title: "New Student Joined",
                    message: `${student.realName} has joined ${student.grade} - ${student.section}`,
                    time: "Just now",
                    read: false,
                    student: student,
                  }

                  // Add the notification to the state
                  setNotifications((prev) => [newNotification, ...prev])

                  // Increment unread count
                  setUnreadCount((prev) => prev + 1)
                } catch (e) {
                  console.error("Error parsing WebSocket message:", e)
                }
              }
            })
          },

          // Error callback
          onStompError: (frame) => {
            console.error("STOMP error:", frame)
            setWsConnected(false)
          },

          // WebSocket closed callback
          onWebSocketClose: () => {
            console.log("WebSocket connection closed")
            setWsConnected(false)
          },
        })

        // Activate the client
        stompClientInstance.activate()

        // Store the client reference
        stompClient.current = stompClientInstance

        // Clean up on unmount
        return () => {
          if (stompClientInstance.active) {
            stompClientInstance.deactivate()
          }
        }
      } catch (error) {
        console.error("WebSocket connection error:", error)
        setWsConnected(false)
      }
    }

    // Connect to WebSocket when we have the teacher profile
    if (teacherProfile || userData) {
      connectWebSocket()
    }

    return () => {
      // Disconnect WebSocket on cleanup
      if (stompClient.current && stompClient.current.active) {
        stompClient.current.deactivate()
      }
    }
  }, [teacherProfile, userData, setNotifications, setUnreadCount])

  const disconnect = () => {
    if (stompClient.current && stompClient.current.active) {
      stompClient.current.deactivate()
    }
  }

  return { wsConnected, disconnect }
}

export default useWebSocket
