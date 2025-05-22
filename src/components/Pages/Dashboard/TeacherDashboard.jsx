"use client"

import { useState, useEffect, useRef } from "react"
import { LogOut, Filter, ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "./Sidebar"
import Overview from "./Overview"
import Students from "./Students"
import Class from "./Class"
import ChallengePerformance from "./ChallengePerformance"
import Settings from "./Settings"

// Constants
const API_URL = "https://cyberkids.onrender.com"
const CHALLENGE_TYPES = ["ALL", "INFORMATION_CLASSIFICATION_SORTING"]
const CHALLENGE_NAMES = {
  INFORMATION_CLASSIFICATION_SORTING: "Info Classification Challenge",
  PASSWORD_SECURITY: "Password Security (Not Yet Implemented)",
  PHISHING_IDENTIFICATION: "Phishing ID (Not Yet Implemented)",
}

const TeacherDashboard = ({ onLogout, userData }) => {
  // State management
  const [students, setStudents] = useState([])
  const [scores, setScores] = useState([])
  const [timers, setTimers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedChallenge, setSelectedChallenge] = useState("ALL")
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Refs and hooks
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Handle logout - use the provided onLogout callback
  const handleLogout = () => {
    if (onLogout) onLogout() // Call the parent's logout function to update app state
    navigate("/login") // Redirect to login page
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Get auth token from localStorage
        const token = localStorage.getItem("jwtToken")

        if (!token) {
          throw new Error("Authentication token not found")
        }

        // Create headers with auth token
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        // Fetch data in parallel for better performance
        const [studentsResponse, scoresResponse, timersResponse] = await Promise.all([
          axios.get(`${API_URL}/api/students`, { headers }),
          axios.get(`${API_URL}/api/scores?challengeType=INFORMATION_CLASSIFICATION_SORTING`, { headers }),
          axios.get(`${API_URL}/api/timer/all?challengeType=INFORMATION_CLASSIFICATION_SORTING`, { headers }),
        ])

        setStudents(studentsResponse.data)
        setScores(scoresResponse.data)
        setTimers(timersResponse.data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error.response?.data?.message || error.message || "Failed to load dashboard data")

        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          handleLogout()
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // Main component render
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">CyberKids Dashboard</h1>
              {userData && <p className="text-sm text-gray-500">Welcome back, {userData.fullName}</p>}
            </div>

            {/* User dropdown menu - Simplified to only show dropdown icon */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Challenge Filter - Only show when not in settings tab */}
        {activeTab !== "settings" && activeTab !== "class" && (
          <div className="mx-6 mt-6">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <Filter className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-gray-700 font-medium">Challenge Filter</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Active challenge types */}
                  {CHALLENGE_TYPES.map((type) => (
                    <button
                      key={type}
                      className={`px-4 py-2 rounded-lg text-sm transition-all ${
                        selectedChallenge === type
                          ? "bg-indigo-100 text-indigo-700 font-medium shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      onClick={() => setSelectedChallenge(type)}
                    >
                      {type === "ALL" ? "All Challenges" : CHALLENGE_NAMES[type] || type}
                    </button>
                  ))}

                  {/* Inactive challenge types */}
                  {["PASSWORD_SECURITY", "PHISHING_IDENTIFICATION"].map((type) => (
                    <button
                      key={type}
                      className="px-4 py-2 rounded-lg text-sm bg-gray-100 text-gray-400 cursor-not-allowed opacity-70"
                      disabled
                    >
                      {CHALLENGE_NAMES[type]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 px-6 pb-6 overflow-auto">
          {activeTab === "overview" && (
            <Overview scores={scores} selectedChallenge={selectedChallenge} challengeNames={CHALLENGE_NAMES} />
          )}

          {activeTab === "class" && <Class />}

          {activeTab === "students" && <Students />}

          {activeTab === "challenges" && (
            <ChallengePerformance
              scores={scores}
              timers={timers}
              selectedChallenge={selectedChallenge}
              challengeNames={CHALLENGE_NAMES}
            />
          )}

          {activeTab === "settings" && <Settings userData={userData} />}
        </main>
      </div>
    </div>
  )
}

export default TeacherDashboard
