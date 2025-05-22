"use client"

import { useState, useEffect } from "react"
import { Users, Award, CheckCircle, Zap, Lock, Unlock, Shield, Key, Eye } from "lucide-react"
import fetchWithAuth from "../../JWT/authInterceptor"

// Constants
const API_BASE_URL = "https://cyberkids.onrender.com"

// Game world definitions with correct backend world names
const GAME_WORLDS = [
  {
    name: "CyberKids1", // Correct backend world name
    displayName: "Info Classification",
    level: "Level 1",
    icon: Shield,
    color: "emerald",
  },
  {
    name: "CyberKids2", // Correct backend world name
    displayName: "Password Security",
    level: "Level 2",
    icon: Key,
    color: "blue",
  },
  {
    name: "CyberKids3", // Correct backend world name
    displayName: "Phishing ID",
    level: "Level 3",
    icon: Eye,
    color: "purple",
  },
]

// Local storage key for world status
const WORLD_STATUS_KEY = "cyberkids_world_status"

const Overview = ({ scores, selectedChallenge, challengeNames }) => {
  // State management
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [worldStatus, setWorldStatus] = useState({})
  const [actionLoading, setActionLoading] = useState({})

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
    GAME_WORLDS.forEach((world) => {
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

  // Fetch students data on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/student`)
        if (!response.ok) {
          throw new Error("Failed to fetch students")
        }
        const data = await response.json()
        setStudents(data)
      } catch (err) {
        console.error("Error fetching students:", err)
      } finally {
        setLoading(false)
      }
    }

    // Load world status from localStorage
    const status = loadWorldStatus()
    setWorldStatus(status)

    fetchStudents()
  }, [])

  // Lock/unlock world
  const toggleWorldLock = async (worldName) => {
    const isLocked = worldStatus[worldName]
    const worldDisplayName = GAME_WORLDS.find((w) => w.name === worldName)?.displayName || worldName

    // Confirmation dialog - using window.confirm to avoid ESLint error
    const confirmMessage = isLocked
      ? `Are you sure you want to unlock ${worldDisplayName}? Students will be able to access this level.`
      : `Are you sure you want to lock ${worldDisplayName}? Students will not be able to access this level.`

    if (!window.confirm(confirmMessage)) {
      return // User cancelled the action
    }

    setActionLoading((prev) => ({ ...prev, [worldName]: true }))

    try {
      const endpoint = isLocked ? "unlock-world" : "lock-world"

      const response = await fetchWithAuth(`${API_BASE_URL}/api/teacher/${endpoint}?worldName=${worldName}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isLocked ? "unlock" : "lock"} world`)
      }

      // Add a 3-second delay to ensure the world is fully locked/unlocked
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Update world status
      const newStatus = {
        ...worldStatus,
        [worldName]: !isLocked,
      }

      setWorldStatus(newStatus)

      // Save to localStorage to persist between refreshes
      saveWorldStatus(newStatus)
    } catch (err) {
      console.error(`Error toggling world lock for ${worldName}:`, err)
      alert(`Failed to ${worldStatus[worldName] ? "unlock" : "lock"} the world. Please try again.`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [worldName]: false }))
    }
  }

  // Stats calculations
  const getTotalCompletions = () => scores.filter((score) => score.completionStatus === "Completed").length

  const getAverageScore = () => {
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((sum, score) => sum + score.points, 0) / scores.length)
  }

  const getCompletionRate = () => {
    const total = scores.length
    const completed = getTotalCompletions()
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // Main component render
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{students.length}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">Active learners in the platform</div>
        </div>

        {/* Challenges Completed Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Challenges Completed</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{getTotalCompletions()}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">Successfully finished challenges</div>
        </div>

        {/* Average Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{getAverageScore()}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Award className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">Points per challenge</div>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{getCompletionRate()}%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">Success percentage</div>
        </div>
      </div>

      {/* Game Worlds Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Game Worlds</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GAME_WORLDS.map((world) => {
            const isLocked = worldStatus[world.name]
            const IconComponent = world.icon
            return (
              <div
                key={world.name}
                className={`rounded-xl p-5 border transition-all ${
                  isLocked
                    ? `bg-${world.color}-50 border-${world.color}-200`
                    : `bg-${world.color}-100 border-${world.color}-300`
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-lg ${isLocked ? `bg-${world.color}-100` : `bg-${world.color}-200`} mr-3`}
                    >
                      <IconComponent className={`h-5 w-5 text-${world.color}-600`} />
                    </div>
                    <div>
                      <h3 className={`font-bold text-${world.color}-800`}>{world.displayName}</h3>
                      <div className="text-xs text-gray-500">{world.level}</div>
                    </div>
                  </div>
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isLocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isLocked ? "Locked" : "Unlocked"}
                  </div>
                </div>

                <button
                  onClick={() => toggleWorldLock(world.name)}
                  disabled={actionLoading[world.name]}
                  className={`w-full py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    isLocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {actionLoading[world.name] ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      {isLocked ? "Unlocking..." : "Locking..."}
                    </>
                  ) : (
                    <>
                      {isLocked ? <Unlock className="h-4 w-4 mr-1.5" /> : <Lock className="h-4 w-4 mr-1.5" />}
                      {isLocked ? "Unlock" : "Lock"}
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Overview
