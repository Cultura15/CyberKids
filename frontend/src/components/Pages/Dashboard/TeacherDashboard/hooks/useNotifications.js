import { useState, useCallback } from "react"
import axios from "axios"

// Constants (moved inline to avoid import issues)
const API_URL = "https://cyberkids.onrender.com"

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Add notification
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
  }, [])

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("jwtToken")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      await axios.delete(`${API_URL}/api/teacher/notification/${id}`, { headers })
      
      // Remove notification from state
      const deletedNotification = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(notification => notification.id !== id))
      
      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      alert("Failed to delete notification")
    }
  }, [notifications])

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }
}