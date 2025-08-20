"use client"

import { useState, useEffect } from "react"

const WORLD_STATUS_KEY = "cyberkids_world_status"

export const useWorldStatus = (gameWorlds) => {
  const [worldStatus, setWorldStatus] = useState({})

  // Load world status from localStorage
  const loadWorldStatus = () => {
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
    gameWorlds.forEach((world) => {
      defaultStatus[world.name] = false // Default to unlocked
    })
    return defaultStatus
  }

  // Save world status to localStorage
  const saveWorldStatus = (status) => {
    try {
      localStorage.setItem(WORLD_STATUS_KEY, JSON.stringify(status))
    } catch (err) {
      console.error("Error saving world status to localStorage:", err)
    }
  }

  useEffect(() => {
    const status = loadWorldStatus()
    setWorldStatus(status)
  }, [])

  const updateWorldStatus = (worldName, isLocked) => {
    const newStatus = {
      ...worldStatus,
      [worldName]: isLocked,
    }
    setWorldStatus(newStatus)
    saveWorldStatus(newStatus)
  }

  return {
    worldStatus,
    updateWorldStatus,
  }
}
