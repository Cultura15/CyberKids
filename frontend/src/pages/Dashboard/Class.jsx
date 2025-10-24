"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Users,
  ArrowLeft,
  GraduationCap,
  Edit,
  Trash2,
  ChevronDown,
  Home,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  CopyIcon,
} from "lucide-react"
import fetchWithAuth from "../../jwt/authInterceptor"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts"
import { useStudentStatusContext } from "../../context/StudentStatusContext";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
const TEACHER_API_URL = process.env.REACT_APP_TEACHER_API_URL

// Level badge colors
const LEVEL_COLORS = {
  "Main Menu": "bg-gray-100 text-gray-800",
  "Level 1": "bg-emerald-100 text-emerald-800",
  "Level 2": "bg-blue-100 text-blue-800",
  "Level 3": "bg-purple-100 text-purple-800",
}

// Challenge types for each level
const LEVEL_CHALLENGES = {
  "Main Menu": "MAIN_MENU",
  "Level 1": "INFORMATION_CLASSIFICATION_SORTING",
  "Level 2": "PASSWORD_SECURITY",
  "Level 3": "PHISHING_IDENTIFICATION",
}

// World mapping for teleportation
const LEVEL_TO_WORLD = {
  "Main Menu": "CyberKids0",
  "Level 1": "CyberKids1",
  "Level 2": "CyberKids2",
  "Level 3": "CyberKids3",
}

// Level number mapping
const LEVEL_TO_NUMBER = {
  "Main Menu": 0,
  "Level 1": 1,
  "Level 2": 2,
  "Level 3": 3,
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  points: {
    good: 80, // 80+ points is good
    average: 60, // 60-79 points is average
    // below 60 is struggling
  },
  time: {
    // For time, lower is better (in seconds)
    good: 120, // Under 2 minutes is good
    average: 300, // 2-5 minutes is average
    // over 5 minutes is struggling
  },
}

// Font style to apply Poppins font
const poppinsFont = {
  fontFamily: "'Poppins', sans-serif",
}

const ClassComponent = () => {
  // State management
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [isEditingClass, setIsEditingClass] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [newGrade, setNewGrade] = useState("")
  const [newSection, setNewSection] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [viewMode, setViewMode] = useState("classes") // 'classes', 'students', 'studentDetail'
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false)
  const [sortField, setSortField] = useState("realName")
  const [sortDirection, setSortDirection] = useState("asc")
  const [expandedProgress, setExpandedProgress] = useState({})
  const [movingStudent, setMovingStudent] = useState({})
  const [moveSuccess, setMoveSuccess] = useState({})
  const [selectedLevel, setSelectedLevel] = useState({})
  const [chartMetric, setChartMetric] = useState("points")
  const [chartTimeframe, setChartTimeframe] = useState("day")
  const [chartChallenge, setChartChallenge] = useState("all")
  const [performanceStatus, setPerformanceStatus] = useState({ status: "neutral", message: "No data available" })
  const [historySortField, setHistorySortField] = useState("dateCompleted")
  const [historySortDirection, setHistorySortDirection] = useState("desc")
  const [challengeAttemptCounts, setChallengeAttemptCounts] = useState({})
  const [challengeFilter, setChallengeFilter] = useState("all")
  const [challengeSortDropdownOpen, setChallengeSortDropdownOpen] = useState(false)
  const [copiedClassCode, setCopiedClassCode] = useState(null)

  // Add a new state for status history
  const [statusHistory, setStatusHistory] = useState([])
  const [showStatusHistory, setShowStatusHistory] = useState(false)
  const [loadingStatusHistory, setLoadingStatusHistory] = useState(false)

  const { studentStatuses, initializeStatuses, getOnlineStatus } = useStudentStatusContext();


  // const [studentStatuses, setStudentStatuses] = useState({})
  // const stompClientRef = useRef(null)
  // const isConnectingRef = useRef(false)

  // Add this function to copy class code to clipboard
  const copyClassCode = async (classCode) => {
    try {
      await navigator.clipboard.writeText(classCode)
      setCopiedClassCode(classCode)
      setTimeout(() => setCopiedClassCode(null), 2000) // Clear after 2 seconds
    } catch (err) {
      console.error("Failed to copy class code:", err)
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = classCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopiedClassCode(classCode)
      setTimeout(() => setCopiedClassCode(null), 2000)
    }
  }

  // Add this function to fetch student status history
  const fetchStudentStatusHistory = async (studentId) => {
    setLoadingStatusHistory(true)
    try {
      const response = await fetchWithAuth(`${TEACHER_API_URL}/student-status-history/${studentId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch status history")
      }
      const data = await response.json()
      setStatusHistory(data)
      setShowStatusHistory(true)
    } catch (err) {
      console.error("Error fetching student status history:", err)
      setError(err.message)
    } finally {
      setLoadingStatusHistory(false)
    }
  }

  // Fetch teacher's classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/my-classes`)
        if (!response.ok) {
          throw new Error("Failed to fetch classes")
        }
        const data = await response.json()
        setClasses(data)
      } catch (err) {
        console.error("Error fetching classes:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  // Update performance status when chart metric or student changes
  useEffect(() => {
    if (selectedStudent) {
      calculatePerformanceStatus()
    }
  }, [chartMetric, selectedStudent, chartChallenge])

  // Calculate challenge attempt counts when student changes
  useEffect(() => {
    if (selectedStudent && selectedStudent.challengeAttempts) {
      const counts = {}
      selectedStudent.challengeAttempts.forEach((attempt) => {
        if (!counts[attempt.challengeType]) {
          counts[attempt.challengeType] = 0
        }
        counts[attempt.challengeType]++
      })
      setChallengeAttemptCounts(counts)
    }
  }, [selectedStudent])

  useEffect(() => {
    if (students && students.length > 0) {
      initializeStatuses(students)
    }
  }, [students])

  // Calculate student performance status
  const calculatePerformanceStatus = () => {
    if (!selectedStudent || !selectedStudent.challengeAttempts || selectedStudent.challengeAttempts.length === 0) {
      setPerformanceStatus({ status: "neutral", message: "No data available" })
      return
    }

    let relevantData = selectedStudent.challengeAttempts.filter(
      (attempt) => attempt.points !== null && attempt.completionStatus === "Completed",
    )
    if (chartChallenge !== "all") {
      relevantData = relevantData.filter((attempt) => attempt.challengeType === chartChallenge)
    }

    if (relevantData.length === 0) {
      setPerformanceStatus({ status: "neutral", message: "No data available for selected challenge" })
      return
    }

    if (chartMetric === "points") {
      // Calculate average points
      const avgPoints = relevantData.reduce((sum, attempt) => sum + (attempt.points || 0), 0) / relevantData.length

      if (avgPoints >= PERFORMANCE_THRESHOLDS.points.good) {
        setPerformanceStatus({
          status: "good",
          message: `Great performance! Average score: ${avgPoints.toFixed(1)} points`,
          value: avgPoints,
        })
      } else if (avgPoints >= PERFORMANCE_THRESHOLDS.points.average) {
        setPerformanceStatus({
          status: "average",
          message: `Average performance. Score: ${avgPoints.toFixed(1)} points`,
          value: avgPoints,
        })
      } else {
        setPerformanceStatus({
          status: "struggling",
          message: `Student may be struggling. Low score: ${avgPoints.toFixed(1)} points`,
          value: avgPoints,
        })
      }
    } else {
      // For time metric
      const attemptsWithTime = relevantData.filter((attempt) => attempt.timeTaken && attempt.endTime)

      if (attemptsWithTime.length === 0) {
        setPerformanceStatus({ status: "neutral", message: "No time data available" })
        return
      }

      // Calculate average time
      const avgTime =
        attemptsWithTime.reduce((sum, attempt) => {
          const timeParts = attempt.timeTaken.split(":")
          const timeInSeconds = Number.parseInt(timeParts[0]) * 60 + Number.parseInt(timeParts[1])
          return sum + timeInSeconds
        }, 0) / attemptsWithTime.length

      if (avgTime <= PERFORMANCE_THRESHOLDS.time.good) {
        setPerformanceStatus({
          status: "good",
          message: `Fast completion! Average time: ${formatTimeFromSeconds(avgTime)}`,
          value: avgTime,
        })
      } else if (avgTime <= PERFORMANCE_THRESHOLDS.time.average) {
        setPerformanceStatus({
          status: "average",
          message: `Average completion time: ${formatTimeFromSeconds(avgTime)}`,
          value: avgTime,
        })
      } else {
        setPerformanceStatus({
          status: "struggling",
          message: `Student may need help. Slow time: ${formatTimeFromSeconds(avgTime)}`,
          value: avgTime,
        })
      }
    }
  }

  const getChallengesCompletedCount = (attempts) => {
  if (!attempts || attempts.length === 0) return 0

  // Create a Set of unique challenge types that are marked as Completed
  const completedChallenges = new Set()

  attempts.forEach((attempt) => {
   if (
      attempt.completionStatus &&
      attempt.completionStatus.toLowerCase() === "completed"
    ) {
      completedChallenges.add(attempt.challengeType)
    }
  })

  return completedChallenges.size
}


  // Format time from seconds to MM:SS
  const formatTimeFromSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Fetch students for a specific class
  const fetchStudentsForClass = async (grade, section) => {
    setLoading(true)
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/grade/${grade}/section/${section}/students/summary`)
      if (!response.ok) {
        throw new Error("Failed to fetch students for this class")
      }
      const data = await response.json()
      setStudents(data)
      return data
    } catch (err) {
      console.error("Error fetching students for class:", err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Refresh student list
  const refreshStudentList = async () => {
    if (selectedClass) {
      const classObj = classes.find((c) => c.id === selectedClass)
      if (classObj) {
        setLoading(true)
        try {
          const refreshedStudents = await fetchStudentsForClass(classObj.grade, classObj.section)
          setStudents(refreshedStudents)
        } catch (err) {
          console.error("Error refreshing student list:", err)
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
    }
  }

  // Move student to a specific world
const moveStudentToWorld = async (student, level) => {
  if (!student.robloxId) {
    alert("Cannot assign player: No Roblox ID found for this student.")
    return
  }

  const worldName = LEVEL_TO_WORLD[level]
  const levelNumber = LEVEL_TO_NUMBER[level]
  const levelKey = `${student.id}-${level}`

  // Set loading state for this specific student and level
  setMovingStudent((prev) => ({
    ...prev,
    [levelKey]: true,
  }))

  try {
    const response = await fetchWithAuth(`${TEACHER_API_URL}/move-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        robloxId: student.robloxId,
        targetWorld: worldName,
        targetLevel: levelNumber,
      }),
    })

    const message = await response.text()

    if (!response.ok) {
      // ✅ Specific handling for offline error
      if (message.includes("Player is offline")) {
        alert("⚠️ Player cannot be moved because they are offline.")
      } else if (message.includes("Student not found")) {
        alert("❌ Student record not found in the database.")
      } else {
        alert(`❌ Failed to assign player: ${message}`)
      }
      return
    }

    // ✅ Success
    setMoveSuccess((prev) => ({ ...prev, [levelKey]: true }))
    setTimeout(() => {
      setMoveSuccess((prev) => ({ ...prev, [levelKey]: false }))
    }, 3000)
  } catch (err) {
    console.error("Error assigning player:", err)
    alert(`Failed to assign player: ${err.message}`)
  } finally {
    setMovingStudent((prev) => ({ ...prev, [levelKey]: false }))
  }
}


  // Change student level
  const changeStudentLevel = (studentId, newLevel) => {
    // In a real app, you would make an API call here
    setStudents((prevStudents) =>
      prevStudents.map((student) => (student.id === studentId ? { ...student, level: newLevel } : student)),
    )
  }

  // Create new class
  const handleCreateClass = async () => {
    if (!newGrade.trim() || !newSection.trim()) {
      alert("Please enter both grade and section")
      return
    }

    setLoading(true)
    try {
      const response = await fetchWithAuth(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade: newGrade,
          section: newSection,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create class")
      }

      const createdClass = await response.json()

      // Refresh the classes list
      const classesResponse = await fetchWithAuth(`${API_BASE_URL}/my-classes`)
      if (classesResponse.ok) {
        const updatedClasses = await classesResponse.json()
        setClasses(updatedClasses)
      }

      setNewGrade("")
      setNewSection("")
      setIsCreatingClass(false)
    } catch (err) {
      console.error("Error creating class:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Edit class name - Note: This would need a backend endpoint to update class info
  const handleEditClass = () => {
    // This is a placeholder. In a real implementation, you would make an API call
    // to update the class information on the server
    alert("Edit functionality would require an additional API endpoint")
    setIsEditingClass(false)
  }

  // Delete class
  const handleDeleteClass = async () => {
    if (window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      setLoading(true)
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${selectedClass}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete class")
        }

        // Refresh the classes list
        const classesResponse = await fetchWithAuth(`${API_BASE_URL}/my-classes`)
        if (classesResponse.ok) {
          const updatedClasses = await classesResponse.json()
          setClasses(updatedClasses)
        }

        backToClasses()
      } catch (err) {
        console.error("Error deleting class:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  // Start editing class
  const startEditClass = () => {
    const classToEdit = classes.find((cls) => cls.id === selectedClass)
    if (classToEdit) {
      setNewGrade(classToEdit.grade)
      setNewSection(classToEdit.section)
      setIsEditingClass(true)
    }
  }

  // View class students
  const viewClassStudents = async (classObj) => {
    setSelectedClass(classObj.id)
    await fetchStudentsForClass(classObj.grade, classObj.section)
    setViewMode("students")
  }

  // View student details
  const viewStudentDetails = async (student) => {
    setLoading(true)
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/students/${student.id}/details`)
      if (!response.ok) {
        throw new Error("Failed to fetch student details")
      }
      const fullStudentData = await response.json()
      setSelectedStudent(fullStudentData)
      setViewMode("studentDetail")
    } catch (err) {
      console.error("Error fetching student details:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Go back to classes view
  const backToClasses = () => {
    setSelectedClass(null)
    setViewMode("classes")
    setIsEditingClass(false)
  }

  // Go back to students view
  const backToStudents = () => {
    setSelectedStudent(null)
    setViewMode("studentDetail")
    setViewMode("students")
  }

  // Get total points for a student
  const getTotalPoints = (student) => {
    if (!student || !student.challengeAttempts || !Array.isArray(student.challengeAttempts)) {
      return 0
    }
    return student.challengeAttempts.reduce((total, attempt) => total + (attempt.points || 0), 0)
  }

  // Format date for display with +8 hour advance
  const formatDate = (dateString, options = { showTime: true, showDate: true }) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const adjustedDate = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  
  const opts = {};
  if (options.showDate) opts.dateStyle = "short";
  if (options.showTime) opts.timeStyle = "short";

  return adjustedDate.toLocaleString("en-US", opts);
};


  // Get online status from WebSocket data or fallback to stored status
  // const getOnlineStatus = (student) => {
  //   if (!student || !student.robloxId) return "offline"

  //   // If we have real-time status for this student, use it
  //   if (studentStatuses.hasOwnProperty(student.robloxId)) {
  //     return studentStatuses[student.robloxId] ? "online" : "offline"
  //   }

  //   // Otherwise use the online property from the student object if available
  //   if (student.hasOwnProperty("online")) {
  //     // Convert to boolean in case it's a number (1/0) from the database
  //     return student.online === true || student.online === 1 ? "online" : "offline"
  //   }

  //   // Fallback to offline as default
  //   return "offline"
  // }

  // Prepare data for the performance chart
  const prepareChartData = () => {
    if (!selectedStudent) return []

    const data = []

    // Use challengeAttempts instead of scores and timers
    if (selectedStudent.challengeAttempts) {
      selectedStudent.challengeAttempts.forEach((attempt) => {
        // Filter by challenge if needed
        if (chartChallenge !== "all" && attempt.challengeType !== chartChallenge) {
          return
        }

        // Skip attempts without points or completion date
        if (!attempt.points || !attempt.dateCompleted) {
          return
        }

        const timeTaken = attempt.timeTaken
          ? typeof attempt.timeTaken === "string"
            ? Number.parseInt(attempt.timeTaken.split(":")[0]) * 60 + Number.parseInt(attempt.timeTaken.split(":")[1])
            : attempt.timeTaken
          : null

        const date = new Date(attempt.dateCompleted)
        let dateKey

        // Group by timeframe
        if (chartTimeframe === "day") {
          dateKey = date.toISOString().split("T")[0] // YYYY-MM-DD
        } else if (chartTimeframe === "month") {
          dateKey = `${date.getFullYear()}-${date.getMonth() + 1}` // YYYY-MM
        } else {
          dateKey = date.getFullYear().toString() // YYYY
        }

        // Find if we already have an entry for this date
        const existingEntry = data.find((item) => {
          if (chartTimeframe === "day") return item.date.split("T")[0] === dateKey
          if (chartTimeframe === "month")
            return `${new Date(item.date).getFullYear()}-${new Date(item.date).getMonth() + 1}` === dateKey
          return new Date(item.date).getFullYear().toString() === dateKey
        })

        if (existingEntry) {
          // Update existing entry
          existingEntry.points = (existingEntry.points + attempt.points) / 2 // Average
          if (timeTaken && existingEntry.time) {
            existingEntry.time = (existingEntry.time + timeTaken) / 2 // Average
          } else if (timeTaken) {
            existingEntry.time = timeTaken
          }
          existingEntry.count += 1
        } else {
          // Create new entry
          data.push({
            date: attempt.dateCompleted,
            points: attempt.points,
            time: timeTaken,
            count: 1,
            challenge: attempt.challengeType,
          })
        }
      })
    }

    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date))

    return data
  }

  // Handle sorting for challenge history
  const handleHistorySort = (field) => {
    if (historySortField === field) {
      setHistorySortDirection(historySortDirection === "asc" ? "desc" : "asc")
    } else {
      setHistorySortField(field)
      setHistorySortDirection("asc")
    }
  }

  // Assign chronological attempt numbers once
const getChronologicalAttempts = (attempts) => {
  if (!attempts) return []

  // Sort by earliest date/time
  const sortedByTime = [...attempts].sort((a, b) => {
    const dateA = a.dateCompleted
      ? new Date(a.dateCompleted)
      : a.startTime
      ? new Date(a.startTime)
      : new Date(0)
    const dateB = b.dateCompleted
      ? new Date(b.dateCompleted)
      : b.startTime
      ? new Date(b.startTime)
      : new Date(0)
    return dateA - dateB // oldest first
  })

  // Assign attemptNumber (1 = first)
  return sortedByTime.map((attempt, index) => ({
    ...attempt,
    attemptNumber: index + 1,
  }))
}


 const sortedChallengeAttempts = () => {
  if (!selectedStudent || !selectedStudent.challengeAttempts) return []

  // Always start from chronologically numbered attempts
  let filteredAttempts = getChronologicalAttempts(selectedStudent.challengeAttempts)

  // Apply challenge filter (Level 1, 2, 3)
  if (challengeFilter !== "all") {
    filteredAttempts = filteredAttempts.filter(
      (attempt) => attempt.challengeType === challengeFilter
    )
  }

  // Then apply your normal sort logic (points, time, etc.)
  filteredAttempts.sort((a, b) => {
    let aValue = a[historySortField]
    let bValue = b[historySortField]

    // same logic you already had …
    if (
      historySortField === "dateCompleted" ||
      historySortField === "startTime" ||
      historySortField === "endTime"
    ) {
      aValue = aValue ? new Date(aValue) : new Date(0)
      bValue = bValue ? new Date(bValue) : new Date(0)
    } else if (historySortField === "points") {
      aValue = aValue !== null ? aValue : -1
      bValue = bValue !== null ? bValue : -1
    } else if (historySortField === "timeTaken") {
      const toSeconds = (v) => {
        if (!v) return -1
        const parts = v.split(":").map(Number)
        return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 60
      }
      aValue = toSeconds(aValue)
      bValue = toSeconds(bValue)
    }

    return historySortDirection === "asc"
      ? aValue - bValue
      : bValue - aValue
  })

  return filteredAttempts
}



  // Calculate statistics for the selected challenge
  const calculateChallengeStats = () => {
    if (!selectedStudent || !selectedStudent.challengeAttempts || challengeFilter === "all") {
      return { avgPoints: 0, totalPoints: 0, avgTime: "0:00" }
    }

    const filteredAttempts = selectedStudent.challengeAttempts.filter(
      (attempt) => attempt.challengeType === challengeFilter,
    )

    if (filteredAttempts.length === 0) {
      return { avgPoints: 0, totalPoints: 0, avgTime: "0:00" }
    }

    // Calculate total points
    const totalPoints = filteredAttempts.reduce((sum, attempt) => sum + (attempt.points || 0), 0)

    // Calculate average points
    const avgPoints = Math.round(totalPoints / filteredAttempts.length)

    // Calculate average time
    const attemptsWithTime = filteredAttempts.filter((attempt) => attempt.timeTaken)
    let avgTimeString = "0:00"

    if (attemptsWithTime.length > 0) {
      const totalSeconds = attemptsWithTime.reduce((sum, attempt) => {
        if (!attempt.timeTaken) return sum
        const timeParts = attempt.timeTaken.split(":")
        return sum + (Number.parseInt(timeParts[0]) * 60 + Number.parseInt(timeParts[1]))
      }, 0)

      const avgSeconds = Math.round(totalSeconds / attemptsWithTime.length)
      const minutes = Math.floor(avgSeconds / 60)
      const seconds = avgSeconds % 60
      avgTimeString = `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    return {
      avgPoints,
      totalPoints,
      avgTime: avgTimeString,
    }
  }

  // Add this function to handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Add this function to toggle progress dropdown
  const toggleProgressDropdown = (studentId) => {
    setExpandedProgress((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }))
  }

  // Add this function to sort students
  const sortedStudents = () => {
    if (!students || students.length === 0) return []

    return [...students]
      .filter((student) => (student.realName?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        let aValue = a[sortField]
        let bValue = b[sortField]

        // Handle special cases
        if (sortField === "status") {
          aValue = getOnlineStatus(a)
          bValue = getOnlineStatus(b)
        } else if (sortField === "class") {
          aValue = `${a.grade || ""} - ${a.section || ""}`
          bValue = `${b.grade || ""} - ${b.section || ""}`
        }

        // Handle null or undefined values
        if (aValue === undefined || aValue === null) aValue = ""
        if (bValue === undefined || bValue === null) bValue = ""

        // Convert to strings for comparison
        aValue = String(aValue).toLowerCase()
        bValue = String(bValue).toLowerCase()

        // Compare based on direction
        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue)
        }
      })
  }

  // Add this new function after the other toggle functions:
  const toggleLevelSelection = (studentId, level) => {
    const key = `${studentId}-${level}`
    setSelectedLevel((prev) => {
      const newState = { ...prev }
      // Clear any previous selections for this student
      Object.keys(newState).forEach((k) => {
        if (k.startsWith(`${studentId}-`)) {
          delete newState[k]
        }
      })
      // Toggle the selected level
      newState[key] = !prev[key]
      return newState
    })
  }

  // Render loading state
  if (loading && viewMode === "classes") {
    return (
      <div className="flex items-center justify-center h-64" style={poppinsFont}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // Render error state
  if (error && viewMode === "classes") {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700" style={poppinsFont}>
        <p className="font-medium text-lg">Error loading class data</p>
        <p className="text-base">{error}</p>
      </div>
    )
  }

  // Render classes view
  if (viewMode === "classes") {
    return (
      <div className="space-y-6 mt-8" style={poppinsFont}>
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800">Class Management</h2>
          <p className="text-lg text-gray-600">Create and manage student classes</p>
        </div>

        {/* Class Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Class Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
            {isCreatingClass ? (
              <div className="w-full">
                <div className="mb-4">
                  <label htmlFor="grade" className="block text-base font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <input
                    id="grade"
                    type="text"
                    placeholder="e.g. Grade 5"
                    className="w-full p-2 border border-gray-300 rounded-lg text-base"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="section" className="block text-base font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <input
                    id="section"
                    type="text"
                    placeholder="e.g. A"
                    className="w-full p-2 border border-gray-300 rounded-lg text-base"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateClass}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex-1 text-base"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingClass(false)
                      setNewGrade("")
                      setNewSection("")
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingClass(true)}
                className="flex flex-col items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                  <Plus className="h-7 w-7" />
                </div>
                <span className="font-medium text-lg">Create New Class</span>
              </button>
            )}
          </div>

          {/* Class Cards */}
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => viewClassStudents(cls)}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-transparent hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
            >
              {/* Class Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex flex-col items-center justify-center text-center">
                  <GraduationCap className="h-14 w-14 mb-2" />
                  <h3 className="font-bold text-2xl mb-1">
                    {cls.grade} - {cls.section}
                  </h3>

                  {/* Class Code Display */}
                  {cls.classCode && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-mono font-bold tracking-wider">Code: {cls.classCode}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyClassCode(cls.classCode)
                        }}
                        className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        title="Copy class code"
                      >
                        {copiedClassCode === cls.classCode ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span className="text-base">{cls.students ? cls.students.length : 0} students</span>
                  </div>
                </div>
              </div>

              {/* Class Footer */}
              <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
                <span className="text-indigo-600 font-medium text-base">Click to view students</span>
              </div>
            </div>
          ))}

          {/* Empty state if no classes */}
          {classes.length === 0 && !isCreatingClass && (
            <div className="col-span-full bg-gray-50 rounded-lg p-8 text-center">
              <GraduationCap className="h-14 w-14 mx-auto text-gray-300 mb-3" />
              <h3 className="text-xl font-medium text-gray-700 mb-1">No Classes Found</h3>
              <p className="text-lg text-gray-500 mb-4">Create your first class to get started.</p>
              <button
                onClick={() => setIsCreatingClass(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base"
              >
                Create Class
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render students view
  if (viewMode === "students") {
    const classObj = classes.find((c) => c.id === selectedClass)

    return (
      <div className="space-y-6 mt-8" style={poppinsFont}>
        {/* Page Header with Back Button, Edit and Delete */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={backToClasses} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              {isEditingClass ? (
                <div className="flex items-center">
                  <div className="mr-2">
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg px-3 py-1 mr-2 text-base"
                      placeholder="Grade"
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                    />
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg px-3 py-1 text-base"
                      placeholder="Section"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleEditClass}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingClass(false)
                      setNewGrade("")
                      setNewSection("")
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-base"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {classObj?.grade} - {classObj?.section}
                  </h2>

                  {/* Class Code Display in Students View */}
                  {classObj?.classCode && (
                    <div className="flex items-center space-x-2">
                      <div className="bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                        <span className="text-sm font-mono font-bold text-indigo-700 tracking-wider">
                          {classObj.classCode}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyClassCode(classObj.classCode)
                        }}
                        className="p-1 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors text-indigo-600"
                        title="Copy class code"
                      >
                        {copiedClassCode === classObj.classCode ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  )}

                  <p className="text-lg text-gray-600">{students.length} students</p>
                </div>
              )}
            </div>

            {!isEditingClass && (
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    refreshStudentList()
                  }}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  title="Refresh Students"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M3 21v-5h5"></path>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startEditClass()
                  }}
                  className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  title="Edit Class"
                >
                  <Edit className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClass()
                  }}
                  className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  title="Delete Class"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Level Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="relative flex-1">
              <Search className="h-6 w-6 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students by name..."
                className="pl-12 pr-4 py-3 w-full border border-gray-300 rounded-lg text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
                className="flex items-center space-x-2 px-5 py-3 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-base"
              >
                <span>Level</span>
                <ChevronDown className="h-5 w-5" />
              </button>
              {levelDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 border border-gray-100">
                  <div className="py-1">
                    <div className="px-4 py-2 text-base text-gray-700 font-medium border-b border-gray-100">
                      Filter by Level
                    </div>
                    {Object.entries(LEVEL_CHALLENGES).map(([level, challenge]) => (
                      <button
                        key={level}
                        className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          // Filter logic would go here
                          setLevelDropdownOpen(false)
                        }}
                      >
                        <span className="font-medium">{level}:</span>{" "}
                        {level === "Main Menu" ? "Main Menu" : challenge.split("_").join(" ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col">
              {students.length > 0 ? (
                <div className="overflow-x-auto flex-1">
                  <div className="overflow-y-auto h-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-16">
                            #
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("realName")}
                          >
                            <div className="flex items-center">
                              Name
                              {sortField === "realName" && (
                                <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("class")}
                          >
                            <div className="flex items-center">
                              Class
                              {sortField === "class" && (
                                <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                              )}
                            </div>
                          </th>
                          <th
                            className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center">
                              Status
                              {sortField === "status" && (
                                <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                              )}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedStudents().map((student, index) => {
                          const onlineStatus = getOnlineStatus(student)
                          return (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="text-lg font-medium text-gray-800">{student.realName || "Unknown"}</div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="text-base text-gray-800">
                                  {student.grade && student.section ? `${student.grade} - ${student.section}` : "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div
                                    className={`h-3 w-3 rounded-full mr-2 ${
                                      onlineStatus === "online" ? "bg-green-500" : "bg-red-500"
                                    }`}
                                  ></div>
                                  <span className="text-base text-gray-700 capitalize">{onlineStatus}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="relative">
                                  <button
                                    onClick={() => toggleProgressDropdown(student.id)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-base font-medium flex items-center"
                                  >
                                    View Progress
                                    <ChevronDown
                                      className={`h-5 w-5 ml-2 transition-transform ${expandedProgress[student.id] ? "rotate-180" : ""}`}
                                    />
                                  </button>

                                  {expandedProgress[student.id] && (
                                    <div className="absolute z-10 mt-1 w-96 bg-white rounded-lg shadow-lg border border-gray-100">
                                      <div className="p-3">
                                        {/* Main Menu Option */}
                                        <div key="Main Menu" className="mb-2 last:mb-0">
                                          <div
                                            className={`flex flex-col md:flex-row md:justify-between md:items-center p-3 rounded-md hover:bg-gray-50 gap-2 cursor-pointer ${
                                              selectedLevel[`${student.id}-Main Menu`] ? "bg-indigo-50" : ""
                                            }`}
                                            onClick={() => toggleLevelSelection(student.id, "Main Menu")}
                                          >
                                            <div className="flex-1 min-w-0 flex items-center">
                                              <Home className="h-5 w-5 mr-2 text-gray-500" />
                                              <div>
                                                <div className="text-base font-medium">Main Menu</div>
                                                <div className="text-sm text-gray-500 break-words">
                                                  Return to main lobby
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {selectedLevel[`${student.id}-Main Menu`] && (
                                            <div className="mt-1 ml-3 pl-3 border-l-2 border-indigo-200">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  moveStudentToWorld(student, "Main Menu")
                                                }}
                                                disabled={movingStudent[`${student.id}-Main Menu`]}
                                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full ${
                                                  moveSuccess[`${student.id}-Main Menu`]
                                                    ? "bg-green-500 text-white"
                                                    : "bg-indigo-500 hover:bg-indigo-600 text-white"
                                                }`}
                                              >
                                                {movingStudent[`${student.id}-Main Menu`] ? (
                                                  <>
                                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                    Assigning Player...
                                                  </>
                                                ) : moveSuccess[`${student.id}-Main Menu`] ? (
                                                  "Player Assigned!"
                                                ) : (
                                                  <>Assign Player</>
                                                )}
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        {/* Level 1-3 Options */}
                                        {Object.entries(LEVEL_CHALLENGES)
                                          .filter(([level]) => level !== "Main Menu")
                                          .map(([level, challenge]) => {
                                            // Check if student has completed this level
                                            const hasCompleted = student.challengeAttempts?.some(
                                              (score) =>
                                                score.challengeType === challenge &&
                                                score.completionStatus === "Completed",
                                            )

                                            // Format the challenge name to be more readable
                                            const formattedChallenge = challenge
                                              .split("_")
                                              .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                                              .join(" ")

                                            // Create a unique key for this student-level combination
                                            const levelKey = `${student.id}-${level}`
                                            const isLevelSelected = selectedLevel[levelKey]
                                            const isMoving = movingStudent[levelKey]
                                            const moveSucceeded = moveSuccess[levelKey]

                                            return (
                                              <div key={level} className="mb-2 last:mb-0">
                                                <div
                                                  className={`flex flex-col md:flex-row md:justify-between md:items-center p-3 rounded-md hover:bg-gray-50 gap-2 cursor-pointer ${
                                                    isLevelSelected ? "bg-indigo-50" : ""
                                                  }`}
                                                  onClick={() => toggleLevelSelection(student.id, level)}
                                                >
                                                  <div className="flex-1 min-w-0">
                                                    <div className="text-base font-medium">{level}</div>
                                                    <div className="text-sm text-gray-500 break-words">
                                                      {formattedChallenge}
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-col md:flex-row gap-2 items-end md:items-center">
                                                    <div
                                                      className={`text-sm px-3 py-1 rounded-full whitespace-nowrap ${
                                                        hasCompleted
                                                          ? "bg-green-100 text-green-800"
                                                          : "bg-gray-100 text-gray-800"
                                                      }`}
                                                    >
                                                      {hasCompleted ? "Completed" : "Not Started"}
                                                    </div>
                                                  </div>
                                                </div>

                                                {isLevelSelected && (
                                                  <div className="mt-1 ml-3 pl-3 border-l-2 border-indigo-200">
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        moveStudentToWorld(student, level)
                                                      }}
                                                      disabled={isMoving}
                                                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors w-full ${
                                                        moveSucceeded
                                                          ? "bg-green-500 text-white"
                                                          : "bg-indigo-500 hover:bg-indigo-600 text-white"
                                                      }`}
                                                    >
                                                      {isMoving ? (
                                                        <>
                                                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                          Assigning Player...
                                                        </>
                                                      ) : moveSucceeded ? (
                                                        "Player Assigned!"
                                                      ) : (
                                                        <>Assign Player</>
                                                      )}
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            )
                                          })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-5 whitespace-nowrap">
                                <button
                                  onClick={() => viewStudentDetails(student)}
                                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-base font-medium"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          )
                        })}

                        {/* Add empty rows to maintain a consistent height when there are fewer than 10 students */}
                        {students.length < 10 &&
                          Array.from({ length: 10 - students.length }).map((_, index) => (
                            <tr key={`empty-${index}`} className="h-[72px]">
                              <td colSpan={6}></td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 flex-1 flex flex-col justify-center">
                  <Users className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-xl font-medium text-gray-700 mb-1">No students in this class</h3>
                  <p className="text-lg text-gray-500">Students will appear here once they're added to this class.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render student detail view
  if (viewMode === "studentDetail" && selectedStudent) {
    return (
      <div className="space-y-6 mt-8" style={poppinsFont}>
        {/* Page Header with Back Button */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <button onClick={backToStudents} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{selectedStudent.realName || "Student"}</h2>
              <p className="text-lg text-gray-600">{selectedStudent.section || "No section"}</p>
            </div>
          </div>
        </div>

        {/* Student Information and Performance Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Student Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Real Name:</span>
                <span className="text-lg font-medium text-gray-800">{selectedStudent.realName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Roblox Name:</span>
                <span className="text-lg font-medium text-gray-800">{selectedStudent.robloxName || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Roblox ID:</span>
                <span className="text-lg font-medium text-gray-800">{selectedStudent.robloxId || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Grade:</span>
                <span className="text-lg font-medium text-gray-800">{selectedStudent.grade || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Section:</span>
                <span className="text-lg font-medium text-gray-800">{selectedStudent.section || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Level:</span>
                <span
                  className={`px-3 py-1 rounded-full text-base font-medium ${
                    selectedStudent.level ? LEVEL_COLORS[selectedStudent.level] : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedStudent.level || "No Level"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Status:</span>
                <div className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full mr-2 ${
                      getOnlineStatus(selectedStudent) === "online" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-lg font-medium text-gray-800 capitalize">
                    {getOnlineStatus(selectedStudent)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Total Points:</span>
                <span className="text-lg font-medium text-gray-800">{getTotalPoints(selectedStudent)}</span>
              </div>
             <div className="flex justify-between">
              <span className="text-lg text-gray-500">Challenges Completed:</span>
              <span
                className={`text-lg font-medium ${
                  getChallengesCompletedCount(selectedStudent.challengeAttempts) === 3
                    ? "text-green-600"
                    : "text-indigo-600"
                }`}
              >
                {getChallengesCompletedCount(selectedStudent.challengeAttempts)} / 3
              </span>
            </div>

              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Average Score:</span>
                <span className="text-lg font-medium text-gray-800">
                  {selectedStudent.challengeAttempts && selectedStudent.challengeAttempts.length > 0
                    ? Math.round(
                        selectedStudent.challengeAttempts
                          .filter((attempt) => attempt.points !== null)
                          .reduce((sum, attempt) => sum + (attempt.points || 0), 0) /
                          selectedStudent.challengeAttempts.filter((attempt) => attempt.points !== null).length,
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Last Activity:</span>
                <span className="text-lg font-medium text-gray-800">
                  {selectedStudent.challengeAttempts && selectedStudent.challengeAttempts.length > 0
                    ? (() => {
                        const completedAttempts = selectedStudent.challengeAttempts.filter(
                          (attempt) => attempt.dateCompleted,
                        )
                        return completedAttempts.length > 0
                          ? formatDate(
                              completedAttempts.sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted))[0]
                                .dateCompleted,
                            )
                          : "N/A"
                      })()
                    : "N/A"}
                </span>
              </div>
              {/* Add this to the Performance Summary Card in the student detail view, right after the "Last Activity:" section */}
              <div className="flex justify-between items-center relative">
                {/* <span className="text-lg text-gray-500">Status History:</span> */}
                {/* <button
                  onClick={() => {
                    if (!showStatusHistory) {
                      fetchStudentStatusHistory(selectedStudent.id)
                    } else {
                      setShowStatusHistory(false)
                    }
                  }}
                  className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center relative z-50"
                >
                  {showStatusHistory ? "Hide History" : "View History"}
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${showStatusHistory ? "rotate-180" : ""}`}
                  />
                </button> */}

                {/* Status History Expandable Section */}
                {showStatusHistory && (
                  <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg overflow-hidden bg-white shadow-lg z-50">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <h4 className="font-medium text-gray-700">Online/Offline Status History</h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {loadingStatusHistory ? (
                        <div className="flex justify-center items-center p-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                      ) : statusHistory.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {statusHistory.map((log, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(log.timestamp)}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  <div className="flex items-center">
                                    <div
                                      className={`h-2 w-2 rounded-full mr-2 ${log.isOnline ? "bg-green-500" : "bg-red-500"}`}
                                    ></div>
                                    <span className={`${log.isOnline ? "text-green-700" : "text-red-700"} font-medium`}>
                                      {log.isOnline ? "Online" : "Offline"}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-4 text-center text-gray-500">No status history available</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart - Full Width */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h3 className="text-xl font-medium text-gray-800">Performance Chart</h3>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={chartMetric}
                onChange={(e) => setChartMetric(e.target.value)}
              >
                <option value="points">Points</option>
                <option value="time">Time Taken</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={chartTimeframe}
                onChange={(e) => setChartTimeframe(e.target.value)}
              >
                <option value="day">By Day</option>
                <option value="month">By Month</option>
                <option value="year">By Year</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={chartChallenge}
                onChange={(e) => setChartChallenge(e.target.value)}
              >
                <option value="all">All Challenges</option>
                {Object.entries(LEVEL_CHALLENGES)
                  .filter(([level]) => level !== "Main Menu")
                  .map(([_, challenge]) => (
                    <option key={challenge} value={challenge}>
                      {challenge.split("_").join(" ")}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          

          {/* Performance Indicator */}
          <div
            className={`mb-4 p-3 rounded-lg flex items-center ${
              performanceStatus.status === "good"
                ? "bg-green-50 text-green-800"
                : performanceStatus.status === "average"
                  ? "bg-yellow-50 text-yellow-800"
                  : performanceStatus.status === "struggling"
                    ? "bg-red-50 text-red-800"
                    : "bg-gray-50 text-gray-800"
            }`}
          >
            {performanceStatus.status === "good" && <CheckCircle className="h-5 w-5 mr-2" />}
            {performanceStatus.status === "average" && <Clock className="h-5 w-5 mr-2" />}
            {performanceStatus.status === "struggling" && <AlertTriangle className="h-5 w-5 mr-2" />}
            <span className="text-sm font-medium">{performanceStatus.message}</span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepareChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    if (chartTimeframe === "day") return new Date(value).toLocaleDateString()
                    if (chartTimeframe === "month")
                      return new Date(value).toLocaleDateString(undefined, { month: "short" })
                    return new Date(value).getFullYear().toString()
                  }}
                >
                  {/* <Label value="Date" position="bottom" offset={5} /> */}
                  
                </XAxis>
                <YAxis
                  label={{
                    value: chartMetric === "points" ? "Points" : "Time (seconds)",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />

                <Tooltip
                  formatter={(value, name) => {
                    if (name === "points") return [`${value} points`, "Score"]
                    if (name === "time") return [`${value} seconds`, "Time Taken"]
                    return [value, name]
                  }}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={chartMetric}
                  stroke={
                    performanceStatus.status === "good"
                      ? "#10B981" // green
                      : performanceStatus.status === "average"
                        ? "#F59E0B" // yellow
                        : performanceStatus.status === "struggling"
                          ? "#EF4444" // red
                          : "#6366F1" // default indigo
                  }
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  name={chartMetric === "points" ? "Points" : "Time Taken"}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Combined Challenge History Table - Full Width */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h3 className="text-xl font-medium text-gray-800">Challenge History</h3>
            <div className="relative">
              <button
                onClick={() => setChallengeSortDropdownOpen(!challengeSortDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-base font-medium"
              >
                <span>
                  {challengeFilter === "all"
                    ? "All Challenges"
                    : challengeFilter === "INFORMATION_CLASSIFICATION_SORTING"
                      ? "Level 1"
                      : challengeFilter === "PASSWORD_SECURITY"
                        ? "Level 2"
                        : "Level 3"}
                </span>
                <ChevronDown className="h-5 w-5" />
              </button>
              {challengeSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-100">
                  <div className="py-1">
                    <button
                      className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setChallengeFilter("all")
                        setChallengeSortDropdownOpen(false)
                      }}
                    >
                      All Challenges
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setChallengeFilter("INFORMATION_CLASSIFICATION_SORTING")
                        setChallengeSortDropdownOpen(false)
                      }}
                    >
                      Level 1: Information Classification
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setChallengeFilter("PASSWORD_SECURITY")
                        setChallengeSortDropdownOpen(false)
                      }}
                    >
                      Level 2: Password Security
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setChallengeFilter("PHISHING_IDENTIFICATION")
                        setChallengeSortDropdownOpen(false)
                      }}
                    >
                      Level 3: Phishing Identification
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {challengeFilter !== "all" && (
            <div className="mb-6 flex flex-wrap gap-x-8 gap-y-2">
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-indigo-500 mr-2"></div>
                <span className="text-sm text-gray-700">
                  Total Attempts: {challengeAttemptCounts[challengeFilter] || 0}
                </span>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-700">Average Points: {calculateChallengeStats().avgPoints}</span>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-sm text-gray-700">Total Points: {calculateChallengeStats().totalPoints}</span>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-700">Average Time: {calculateChallengeStats().avgTime}</span>
              </div>
            </div>
          )}

          {selectedStudent.challengeAttempts && selectedStudent.challengeAttempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>

                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                        Attempt
                      </th>
                      
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleHistorySort("dateCompleted")}
                    >
                      <div className="flex items-center">
                        Date
                        {historySortField === "dateCompleted" &&
                          (historySortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleHistorySort("challengeType")}
                    >
                      <div className="flex items-center">
                        Challenge
                        {historySortField === "challengeType" &&
                          (historySortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleHistorySort("completionStatus")}
                    >
                      <div className="flex items-center">
                        Status
                        {historySortField === "completionStatus" &&
                          (historySortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleHistorySort("points")}
                    >
                      <div className="flex items-center">
                        Points
                        {historySortField === "points" &&
                          (historySortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleHistorySort("timeTaken")}
                    >
                      <div className="flex items-center">
                        Time Taken
                        {historySortField === "timeTaken" &&
                          (historySortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleHistorySort("startTime")}
                    >
                      <div className="flex items-center">
                        Start Time
                        {historySortField === "startTime" &&
                          (historySortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleHistorySort("endTime")}
                    >
                      <div className="flex items-center">
                        End Time
                        {historySortField === "endTime" &&
                          (historySortDirection === "asc" ? (
                            <ArrowUp className="h-3 w-3 ml-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 ml-1" />
                          ))}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedChallengeAttempts()
                    .slice(0, 15)
                    .map((attempt, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center justify-center">
                              <span className="h-6 w-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-medium text-xs">
                                     {attempt.attemptNumber}
                              </span>
                            </div>
                          </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                         {attempt.dateCompleted ? formatDate(attempt.dateCompleted, { showDate: true, showTime: false }) : "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{attempt.challengeType}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              attempt.completionStatus === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {attempt.completionStatus || "In Progress"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {attempt.points !== null ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                attempt.points >= 80
                                  ? "bg-green-100 text-green-800"
                                  : attempt.points >= 60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {attempt.points}
                            </span>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {attempt.timeTaken ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                {attempt.timeTaken.includes(":")
                                  ? attempt.timeTaken
                                  : `${attempt.timeTaken} minutes`}
                              </span>
                            ) : (
                              "N/A"
                            )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {attempt.startTime ? formatDate(attempt.startTime, { showDate: false, showTime: true }) : "N/A"}

                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {attempt.endTime ? formatDate(attempt.endTime, { showDate: false, showTime: true }) : "N/A"}

                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {sortedChallengeAttempts().length > 15 && (
                <div className="text-center py-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Showing 15 of {sortedChallengeAttempts().length} attempts. Scroll to see more.
                  </p>
                  <div className="mt-2 max-h-[300px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedChallengeAttempts()
                          .slice(15)
                          .map((attempt, index) => (
                            <tr key={index + 15} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {attempt.dateCompleted ? formatDate(attempt.dateCompleted, { showDate: true, showTime: false }) : "N/A"}

                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {attempt.challengeType}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    attempt.completionStatus === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {attempt.completionStatus || "In Progress"}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                {attempt.points !== null ? (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      attempt.points >= 80
                                        ? "bg-green-100 text-green-800"
                                        : attempt.points >= 60
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {attempt.points}
                                  </span>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {attempt.timeTaken ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                      {attempt.timeTaken.includes(":")
                                        ? attempt.timeTaken
                                        : `${attempt.timeTaken} minutes`}
                                    </span>
                                  ) : (
                                    "N/A"
                                  )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                               {attempt.startTime ? formatDate(attempt.startTime, { showDate: false, showTime: true }) : "N/A"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {attempt.endTime ? formatDate(attempt.endTime, { showDate: false, showTime: true }) : "N/A"}

                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-lg text-gray-500 py-4">No challenge history available for this student.</p>
          )}
        </div>
      </div>
    )
  }

  return null
}

export default ClassComponent
