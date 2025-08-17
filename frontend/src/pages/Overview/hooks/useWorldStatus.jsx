import { useState, useEffect, useCallback } from "react"
import fetchWithAuth from "../../../../JWT/authInterceptor"
import { API_BASE_URL, WORLD_STATUS_KEY, GAME_WORLDS } from "../constants"

export const useWorldStatus = () => {
  const [worldStatus, setWorldStatus] = useState({})
  const [actionLoading, setActionLoading] = useState({})

  // Load world status from localStorage
  const loadWorldStatus = useCallback(() => {
    try {
      const savedStatus = localStorage.getItem(WORLD_STATUS_KEY)
      if (savedStatus) {
        return JSON.parse(savedStatus)
      }
    } catch (err) {
      console.error("Error loading world status from localStorage:", err)
    }

    // Default status if nothing in localStorage
    const defaultStatus = {}
    GAME_WORLDS.forEach((world) => {
      defaultStatus[world.name] = false // Default to unlocked
    })
    return defaultStatus
  }, [])

  // Save world status to localStorage
  const saveWorldStatus = useCallback((status) => {
    try {
      localStorage.setItem(WORLD_STATUS_KEY, JSON.stringify(status))
    } catch (err) {
      console.error("Error saving world status to localStorage:", err)
    }
  }, [])

  // Lock/unlock world
  const toggleWorldLock = useCallback(async (worldName, isLocked) => {
    setActionLoading((prev) => ({ ...prev, [worldName]: true }))

    try {
      const endpoint = isLocked ? "unlock-world" : "lock-world"
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/teacher/${endpoint}?worldName=${worldName}`,
        { method: "POST" }
      )

      if (!response.ok) {
        throw new Error(`Failed to ${isLocked ? "unlock" : "lock"} world`)
      }

      // Add a delay to ensure the world is fully locked/unlocked
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update world status
      const newStatus = {
        ...worldStatus,
        [worldName]: !isLocked,
      }

      setWorldStatus(newStatus)
      saveWorldStatus(newStatus)
    } catch (err) {
      console.error(`Error toggling world lock for ${worldName}:`, err)
      alert(`Failed to ${worldStatus[worldName] ? "unlock" : "lock"} the world. Please try again.`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [worldName]: false }))
    }
  }, [worldStatus, saveWorldStatus])

  useEffect(() => {
    const status = loadWorldStatus()
    setWorldStatus(status)
  }, [loadWorldStatus])

  return {
    worldStatus,
    actionLoading,
    toggleWorldLock,
  }
}