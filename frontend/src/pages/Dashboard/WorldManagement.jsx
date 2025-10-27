// src/pages/Dashboard/WorldManagement.jsx
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Lock, Unlock, Users, ChevronDown, Activity } from "lucide-react"
import { useClasses } from "../../hooks/useClasses"

const API_URL = process.env.REACT_APP_API_URL

// Game world configurations
const GAME_WORLDS = [
  {
    name: "CyberKids1",
    displayName: "Information Sorting Game",
    level: "Level 1",
    color: "#002f5c",
    image: "/info_sort.jpeg",
    description: "Identify safe information to share online.",
    objectives: [
      "Identify public vs private information",
      "Sort data by sensitivity levels",
      "Apply classification rules",
    ],
  },
  {
    name: "CyberKids2",
    displayName: "Password Security Game",
    level: "Level 2",
    color: "#3f2a00",
    image: "/pass_sec.jpeg",
    description: "Create strong passwords to stay protected.",
    objectives: [
      "Create strong passwords",
      "Identify password vulnerabilities",
      "Use password managers effectively",
    ],
  },
  {
    name: "CyberKids3",
    displayName: "Phishing Identification Game",
    level: "Level 3",
    color: "#551303",
    image: "/phishing_aware.jpeg",
    description: "Spot fake messages that try to trick players.",
    objectives: [
      "Spot phishing emails and links",
      "Verify sender authenticity",
      "Report suspicious content",
    ],
  },
]

const WorldManagement = () => {
  const { worldName } = useParams()
  const { classes, selectedClass, setSelectedClass, loading: classesLoading } = useClasses()

  const [updating, setUpdating] = useState(false)
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const currentWorld = GAME_WORLDS.find((w) => w.name === worldName) || GAME_WORLDS[0]
  const isLocked = selectedClass?.lockedWorlds?.includes(currentWorld.name) || false

  // Default select first class
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0])
    }
  }, [classes, selectedClass, setSelectedClass])

  // Fetch students
  useEffect(() => {
    const fetchStudentsForClass = async () => {
      if (!selectedClass?.grade || !selectedClass?.section) return
      setLoadingStudents(true)
      try {
        const token = localStorage.getItem("jwtToken")
        const response = await fetch(
          `${API_URL}/api/classes/grade/${selectedClass.grade}/section/${selectedClass.section}/students/summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        if (response.ok) {
          const data = await response.json()
          setStudents(data)
        }
      } catch (error) {
        console.error("Error fetching students for class:", error)
      } finally {
        setLoadingStudents(false)
      }
    }
    fetchStudentsForClass()
  }, [selectedClass])

  // Lock / Unlock world
  const toggleWorldLock = async () => {
    if (!selectedClass) {
      alert("Please select a class first")
      return
    }
    setUpdating(true)
    try {
      const token = localStorage.getItem("jwtToken")
      const endpoint = isLocked ? "unlock-world" : "lock-world"
      const response = await fetch(
        `${API_URL}/api/classes/${selectedClass.classCode}/${endpoint}?worldName=${currentWorld.name}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      if (response.ok) {
        setSelectedClass((prevClass) => {
          const updatedLockedWorlds = new Set(prevClass.lockedWorlds || [])
          if (isLocked) updatedLockedWorlds.delete(currentWorld.name)
          else updatedLockedWorlds.add(currentWorld.name)
          return { ...prevClass, lockedWorlds: Array.from(updatedLockedWorlds) }
        })
        alert(`World ${isLocked ? "unlocked" : "locked"} successfully!`)
      } else {
        const errorData = await response.json()
        alert(errorData.error || "Failed to update world status")
      }
    } catch (error) {
      console.error("Error toggling world lock:", error)
      alert("Error updating world status")
    } finally {
      setUpdating(false)
    }
  }

  if (classesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 py-4" style={{ fontFamily: "Nunito, sans-serif" }}>
      {/* Header with Image Banner */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6 animate-fade-in">
        <div className="relative h-56 overflow-hidden">
          {/* Game Image Header */}
          <img
            src={currentWorld.image}
            alt={currentWorld.displayName}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Level Badge - Top Right */}
          <div className="absolute top-4 right-4">
            <div
              className="px-4 py-2 rounded-xl border-2 font-bold text-white shadow-lg text-sm backdrop-blur-sm"
              style={{ backgroundColor: currentWorld.color, borderColor: "rgba(255,255,255,0.3)" }}
            >
              {currentWorld.level}
            </div>
          </div>

          {/* Title Overlay - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
            <h1 className="text-2xl font-bold text-white mb-1">{currentWorld.displayName}</h1>
            <p className="text-gray-200 text-xs">{currentWorld.description}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Sidebar */}
        <div className="space-y-5">
          {/* Class Selection */}
          <div className="bg-white rounded-2xl shadow-md p-5 animate-slide-up">
            <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Select Class
            </h3>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-200"
              >
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {selectedClass ? `${selectedClass.grade} - ${selectedClass.section}` : "Choose a class..."}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-20 max-h-60 overflow-auto animate-dropdown-enter">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      onClick={() => {
                        setSelectedClass(cls)
                        setDropdownOpen(false)
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-semibold text-gray-900">{`${cls.grade} - ${cls.section}`}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {cls.classCode} • {cls.studentCount || 0} students
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Access Control */}
          {selectedClass ? (
            <div className="bg-white rounded-2xl shadow-md p-5 animate-slide-up">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="h-5 w-5 text-purple-600" />
                Access Control
              </h3>

              <div
                className={`mb-3 p-3 rounded-xl border-2 ${
                  isLocked ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      isLocked ? "bg-red-500 animate-pulse" : "bg-green-500"
                    }`}
                  ></div>
                  <p className="text-sm font-bold text-gray-900">
                    {isLocked ? "Access Denied" : "Access Granted"}
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  {isLocked ? "Students cannot access this world" : "Students can access this world"}
                </p>
              </div>

              <button
                onClick={toggleWorldLock}
                disabled={updating}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                  isLocked
                    ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                } text-white disabled:opacity-50 hover:scale-105 active:scale-95 shadow-lg`}
              >
                {updating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isLocked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    <span>{isLocked ? "Unlock World" : "Lock World"}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md border-2 border-dashed border-gray-300 p-6 text-center">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-600">Select a class to manage access</p>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="text-base font-bold text-gray-900 mb-3">Preview</h3>
            <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 font-semibold text-sm">Game Preview Video</p>
                  <p className="text-gray-600 text-xs mt-1">Coming soon</p>
                </div>
              </div>
            </div>

            {selectedClass && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-purple-100 text-purple-800 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold mb-0.5">
                    {loadingStudents ? "..." : students.length}
                  </p>
                  <p className="text-xs font-semibold">Students Enrolled</p>
                </div>
                <div className="bg-blue-100 text-blue-800 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold mb-0.5">{isLocked ? "Locked" : "Active"}</p>
                  <p className="text-xs font-semibold">Current Status</p>
                </div>
              </div>
            )}

            <div className="text-gray-700 text-sm leading-relaxed">
              <h4 className="font-bold text-gray-900 mb-2">Learning Objectives:</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                {currentWorld.objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorldManagement
