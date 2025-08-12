"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
  Users,
  Shield,
  Key,
  Eye,
  ChevronDown,
  Trophy,
  Lock,
  Unlock,
  Maximize2,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
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
    challengeType: "INFORMATION_CLASSIFICATION_SORTING",
    description: "Learn to classify information and protect sensitive data",
  },
  {
    name: "CyberKids2", // Correct backend world name
    displayName: "Password Security",
    level: "Level 2",
    icon: Key,
    color: "blue",
    challengeType: "PASSWORD_SECURITY",
    description: "Master the art of creating and managing secure passwords",
  },
  {
    name: "CyberKids3", // Correct backend world name
    displayName: "Phishing ID",
    level: "Level 3",
    icon: Eye,
    color: "purple",
    challengeType: "PHISHING_IDENTIFICATION",
    description: "Identify and avoid phishing attempts and online scams",
  },
]

// Local storage key for world status
const WORLD_STATUS_KEY = "cyberkids_world_status"

// Font style to apply Poppins font
const poppinsFont = {
  fontFamily: "'Poppins', sans-serif",
}

const Overview = () => {
  // State management
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [worldStatus, setWorldStatus] = useState({})
  const [actionLoading, setActionLoading] = useState({})
  const [selectedClass, setSelectedClass] = useState(null)
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState(GAME_WORLDS[0])
  const [challengeDropdownOpen, setChallengeDropdownOpen] = useState(false)
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false)
  const [sortField, setSortField] = useState("points")
  const [sortDirection, setSortDirection] = useState("desc")
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

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

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/classes/my-classes`)
        if (!response.ok) {
          throw new Error("Failed to fetch classes")
        }
        const data = await response.json()
        setClasses(data)

        // Select first class by default if available
        if (data.length > 0) {
          setSelectedClass(data[0])
          fetchStudentsForClass(data[0].grade, data[0].section)
        } else {
          // No classes found, stop loading
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching classes:", err)
        // Error occurred, stop loading
        setLoading(false)
      }
    }

    // Load world status from localStorage
    const status = loadWorldStatus()
    setWorldStatus(status)

    fetchClasses()
  }, [])

  // Fetch students for a specific class
  const fetchStudentsForClass = async (grade, section) => {
    setLoading(true)
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/classes/grade/${grade}/section/${section}/students`)
      if (!response.ok) {
        throw new Error("Failed to fetch students for this class")
      }
      const data = await response.json()
      setStudents(data)
    } catch (err) {
      console.error("Error fetching students for class:", err)
    } finally {
      setLoading(false)
    }
  }

  // Handle class selection
  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj)
    setClassDropdownOpen(false)
    fetchStudentsForClass(classObj.grade, classObj.section)
  }

  // Handle challenge selection
  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge)
    setChallengeDropdownOpen(false)
  }

  // Show confirmation modal for locking/unlocking world
  const showConfirmModal = (worldName) => {
    const isLocked = worldStatus[worldName]
    const world = GAME_WORLDS.find((w) => w.name === worldName)

    setConfirmAction({
      worldName,
      isLocked,
      world,
    })
    setConfirmModalOpen(true)
  }

  // Lock/unlock world
  const toggleWorldLock = async (worldName, isLocked) => {
    setConfirmModalOpen(false)
    setActionLoading((prev) => ({ ...prev, [worldName]: true }))

    try {
      const endpoint = isLocked ? "unlock-world" : "lock-world"

      const response = await fetchWithAuth(`${API_BASE_URL}/api/teacher/${endpoint}?worldName=${worldName}`, {
        method: "POST",
      })

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

      // Save to localStorage to persist between refreshes
      saveWorldStatus(newStatus)
    } catch (err) {
      console.error(`Error toggling world lock for ${worldName}:`, err)
      alert(`Failed to ${worldStatus[worldName] ? "unlock" : "lock"} the world. Please try again.`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [worldName]: false }))
    }
  }

  // Calculate completion rate for a specific challenge
  const calculateCompletionRate = (challengeType) => {
    if (!students || students.length === 0) return 0

    const completedCount = students.filter(
      (student) =>
        student.challengeAttempts &&
        student.challengeAttempts.some(
          (attempt) => attempt.challengeType === challengeType && attempt.completionStatus === "Completed",
        ),
    ).length

    return {
      percentage: students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0,
      completed: completedCount,
      total: students.length,
    }
  }

  // Get progress bar color based on completion percentage
  const getProgressBarColor = (percentage) => {
    if (percentage >= 71) return "bg-green-500"
    if (percentage >= 41) return "bg-yellow-500"
    return "bg-red-500"
  }

  // Handle sorting for leaderboard
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc") // Default to descending for new sort field
    }
  }

  // Get sorted students for leaderboard
  const getSortedStudents = () => {
    if (!students || students.length === 0) return []

    return [...students].sort((a, b) => {
      // For demo purposes, generate random points
      const aPoints = a.points || Math.floor(Math.random() * 100)
      const bPoints = b.points || Math.floor(Math.random() * 100)

      if (sortField === "name") {
        const aName = a.realName || ""
        const bName = b.realName || ""
        return sortDirection === "asc" ? aName.localeCompare(bName) : bName.localeCompare(aName)
      } else {
        // Sort by points
        return sortDirection === "asc" ? aPoints - bPoints : bPoints - aPoints
      }
    })
  }

  // Loading state
  if (loading && classes.length === 0 && students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64" style={poppinsFont}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // Main component render
  return (
    <div className="space-y-6 mt-6" style={poppinsFont}>
      {/* Page Header with Class Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Class Selector Dropdown */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-2">Class:</span>
            <div className="relative">
              <button
                onClick={() => setClassDropdownOpen(!classDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
              >
                <span>{selectedClass ? `${selectedClass.grade} - ${selectedClass.section}` : "Select Class"}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {classDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-100">
                  <div className="py-1">
                    {classes.map((classObj) => (
                      <button
                        key={classObj.id}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleClassSelect(classObj)}
                      >
                        {classObj.grade} - {classObj.section}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Challenge Filter Dropdown */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-2">Challenge:</span>
            <div className="relative">
              <button
                onClick={() => setChallengeDropdownOpen(!challengeDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
              >
                <span>{selectedChallenge.level}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {challengeDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-100">
                  <div className="py-1">
                    {GAME_WORLDS.map((world) => (
                      <button
                        key={world.name}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleChallengeSelect(world)}
                      >
                        {world.level}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Students Card */}
        <div className="bg-white rounded-xl shadow-sm p-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800">Total Students</h3>
              <p className="text-xl font-bold text-gray-900">{students.length}</p>
            </div>
          </div>
        </div>

        {/* Completion Rates Card */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Completion Rates</h3>

            {selectedChallenge && (
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center mb-3">
                  <div
                    className={`h-9 w-9 rounded-full bg-${selectedChallenge.color}-100 flex items-center justify-center text-${selectedChallenge.color}-600 mr-3`}
                  >
                    {React.createElement(selectedChallenge.icon, { className: "h-5 w-5" })}
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-gray-800">{selectedChallenge.displayName}</h4>
                    <p className="text-sm text-gray-600">
                      {calculateCompletionRate(selectedChallenge.challengeType).completed} of{" "}
                      {calculateCompletionRate(selectedChallenge.challengeType).total} students completed
                    </p>
                  </div>
                </div>

                {students.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No students have played this challenge yet</div>
                ) : (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                      <div
                        className={`${getProgressBarColor(calculateCompletionRate(selectedChallenge.challengeType).percentage)} h-4 rounded-full transition-all duration-300`}
                        style={{ width: `${calculateCompletionRate(selectedChallenge.challengeType).percentage}%` }}
                      ></div>
                    </div>

                    <p className="text-xl font-bold text-gray-900">
                      {calculateCompletionRate(selectedChallenge.challengeType).percentage}%
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Card */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                <Trophy className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">Leaderboard</h3>
            </div>
            <button
              onClick={() => setLeaderboardModalOpen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              title="Maximize Leaderboard"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[250px] overflow-y-auto pr-2">
            {/* Placeholder for leaderboard - will be populated later */}
            <div className="space-y-3">
              {getSortedStudents()
                .slice(0, 10)
                .map((student, index) => (
                  <div key={student.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{student.realName}</p>
                      <p className="text-xs text-gray-500 truncate">{student.robloxName}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {/* Placeholder score - will be replaced with actual data */}
                      {student.points || Math.floor(Math.random() * 100)} pts
                    </div>
                  </div>
                ))}

              {students.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No students available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Worlds Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="mr-3">
              {/* Roblox Logo */}
              <img src="/roblox-logo.png" alt="Roblox Logo" className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Roblox Game Worlds</h2>
              <p className="text-sm text-gray-500">Manage access to CyberKids learning environments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GAME_WORLDS.map((world) => {
            const isLocked = worldStatus[world.name]
            const IconComponent = world.icon
            return (
              <div
                key={world.name}
                className={`rounded-xl p-5 border transition-all ${
                  isLocked ? "bg-gray-50 border-gray-200" : `bg-${world.color}-50 border-${world.color}-200`
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div
                      className={`p-3 rounded-lg ${isLocked ? "bg-gray-200" : `bg-${world.color}-100`} mr-3 shadow-sm`}
                    >
                      <IconComponent className={`h-6 w-6 ${isLocked ? "text-gray-500" : `text-${world.color}-600`}`} />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className={`text-lg font-bold ${isLocked ? "text-gray-700" : `text-${world.color}-800`}`}>
                          {world.displayName}
                        </h3>
                        <span
                          className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
                            isLocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {isLocked ? "Locked" : "Unlocked"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">{world.level}</div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{world.description}</p>

                <button
                  onClick={() => showConfirmModal(world.name)}
                  disabled={actionLoading[world.name]}
                  className={`w-full py-2.5 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                    isLocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-600 hover:bg-gray-700 text-white"
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
                      {isLocked ? "Unlock World" : "Lock World"}
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {confirmAction.isLocked ? (
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                    <Unlock className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-4">
                    <Lock className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {confirmAction.isLocked ? "Unlock" : "Lock"} {confirmAction.world.displayName}
                  </h3>
                  <p className="text-sm text-gray-600">{confirmAction.world.level}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {confirmAction.isLocked
                  ? `Are you sure you want to unlock ${confirmAction.world.displayName}? Students will be able to access this level in Roblox.`
                  : `Are you sure you want to lock ${confirmAction.world.displayName}? Students will not be able to access this level in Roblox.`}
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => toggleWorldLock(confirmAction.worldName, confirmAction.isLocked)}
                  className={`px-4 py-2 rounded-lg text-white font-medium ${
                    confirmAction.isLocked ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {confirmAction.isLocked ? "Yes, Unlock" : "Yes, Lock"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {leaderboardModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                  <Trophy className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedClass ? `${selectedClass.grade} - ${selectedClass.section}` : "Class"} Leaderboard
                </h2>
              </div>
              <button
                onClick={() => setLeaderboardModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto flex-1 max-h-[60vh]">
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">Showing {students.length} students</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSort("name")}
                    className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${
                      sortField === "name"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Name
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 ml-1" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 ml-1" />
                      ))}
                  </button>
                  <button
                    onClick={() => handleSort("points")}
                    className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${
                      sortField === "points"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Points
                    {sortField === "points" &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="h-3.5 w-3.5 ml-1" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 ml-1" />
                      ))}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg">
                <div className="grid grid-cols-12 text-sm font-medium text-gray-500 border-b border-gray-200 py-3 px-4 sticky top-0 bg-gray-50 z-10">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-7">Student</div>
                  <div className="col-span-4 text-right">Points</div>
                </div>

                <div className="divide-y divide-gray-100 overflow-y-auto max-h-[50vh]">
                  {getSortedStudents().map((student, index) => (
                    <div key={student.id} className="grid grid-cols-12 py-3 px-4 hover:bg-gray-100 transition-colors">
                      <div className="col-span-1 flex items-center">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-sm ${
                            index < 3 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div className="col-span-7 flex items-center">
                        <div>
                          <p className="font-medium text-gray-800">{student.realName}</p>
                          <p className="text-xs text-gray-500">{student.robloxName || "No Roblox ID"}</p>
                        </div>
                      </div>
                      <div className="col-span-4 flex items-center justify-end">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            index < 3 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {student.points || Math.floor(Math.random() * 100)} pts
                        </div>
                      </div>
                    </div>
                  ))}

                  {students.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No students available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setLeaderboardModalOpen(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview
