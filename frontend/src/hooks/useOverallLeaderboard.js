"use client"

import { useState, useEffect } from "react"
import fetchWithAuth from "../jwt/authInterceptor"

const API_BASE_URL = process.env.REACT_APP_API_URL

export const useOverallLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOverallLeaderboard = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/leaderboard/global/overall`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch overall leaderboard")
      }

      const data = await response.json()

      // Map the GlobalLeaderboardDTO data
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
      console.error("Error fetching overall leaderboard:", err)
      setError(err.message)
      setLeaderboard([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverallLeaderboard()
  }, [])

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchOverallLeaderboard,
  }
}