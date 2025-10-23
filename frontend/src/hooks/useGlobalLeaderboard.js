"use client"
import { useState, useEffect } from "react"
import fetchWithAuth from "../jwt/authInterceptor"

const API_BASE_URL = process.env.REACT_APP_API_URL

export const useGlobalLeaderboard = (selectedClass, selectedLevel) => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchLeaderboard = async (classId, levelName) => {
    if (!classId || !levelName) {
      setLeaderboard([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/leaderboard/global/class/${classId}/level/${levelName}`
      )
      if (!response.ok) throw new Error("Failed to fetch leaderboard")

      const data = await response.json()

      // Map DTO directly
      const mappedData = data.map((entry) => ({
        realName: entry.realName,
        robloxName: entry.robloxName,
        highestScore: entry.highestScore,
        bestTimeTaken: entry.bestTimeTaken,
        globalRank: entry.globalRank,
        level: entry.level,
      }))

      setLeaderboard(mappedData)
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setError(err.message)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedClass && selectedLevel) {
      fetchLeaderboard(selectedClass.id, selectedLevel)
    }
  }, [selectedClass, selectedLevel])

  return {
    leaderboard,
    loading,
    error,
    fetchLeaderboard,
  }
}
