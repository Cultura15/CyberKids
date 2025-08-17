"use client"

import { useState, useEffect, useRef } from "react"
import fetchWithAuth from "../../../JWT/authInterceptor"
import ClassList from "./ClassList"
import StudentList from "./StudentList"
import StudentDetail from "./StudentDetail"
import WebSocketManager from "./WebSocketManager"

// API endpoints
const API_BASE_URL = "https://cyberkids.onrender.com/api/classes"
const TEACHER_API_URL = "https://cyberkids.onrender.com/api/teacher"
const WS_ENDPOINT = "https://cyberkids.onrender.com/ws"

// Constants
const LEVEL_COLORS = {
  "Main Menu": "bg-gray-100 text-gray-800",
  "Level 1": "bg-emerald-100 text-emerald-800",
  "Level 2": "bg-blue-100 text-blue-800",
  "Level 3": "bg-purple-100 text-purple-800",
}

const LEVEL_CHALLENGES = {
  "Main Menu": "MAIN_MENU",
  "Level 1": "INFORMATION_CLASSIFICATION_SORTING",
  "Level 2": "PASSWORD_SECURITY",
  "Level 3": "PHISHING_IDENTIFICATION",
}

const LEVEL_TO_WORLD = {
  "Main Menu": "CyberKids0",
  "Level 1": "CyberKids1",
  "Level 2": "CyberKids2",
  "Level 3": "CyberKids3",
}

const LEVEL_TO_NUMBER = {
  "Main Menu": 0,
  "Level 1": 1,
  "Level 2": 2,
  "Level 3": 3,
}

const PERFORMANCE_THRESHOLDS = {
  points: {
    good: 80,
    average: 60,
  },
  time: {
    good: 120,
    average: 300,
  },
}

const poppinsFont = {
  fontFamily: "'Poppins', sans-serif",
}

const ClassManagement = () => {
  // State management
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [isEditingClass, setIsEditingClass] = useState(false)
  const [newGrade, setNewGrade] = useState("")
  const [newSection, setNewSection] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [viewMode, setViewMode] = useState("classes")
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
  const [statusHistory, setStatusHistory] = useState([])
  const [showStatusHistory, setShowStatusHistory] = useState(false)
  const [loadingStatusHistory, setLoadingStatusHistory] = useState(false)
  const [studentStatuses, setStudentStatuses] = useState({})

  // WebSocket ref
  const stompClientRef = useRef(null)
  const isConnectingRef = useRef(false)

  // Fetch classes on component mount
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

  // Initialize student statuses from fetched data
  useEffect(() => {
    if (students && students.length > 0) {
      // Initialize the online status from the student data
      const initialStatus = {}
      students.forEach((student) => {
        if (student.robloxId && (student.online === true || student.online === 1)) {
          initialStatus[student.robloxId] = true
        }
      })

      // Only update if we have any online students
      if (Object.keys(initialStatus).length > 0) {
        setStudentStatuses((prev) => ({
          ...prev,
          ...initialStatus,
        }))
      }

      console.log("Initialized student online status:", initialStatus)
    }
  }, [students])

  // API Functions
  const createClass = async () => {
    if (!newGrade.trim() || !newSection.trim()) {
      alert("Please enter both grade and section")
      return
    }

    try {
      const response = await fetchWithAuth(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade: newGrade.trim(),
          section: newSection.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create class")
      }

      const newClass = await response.json()
      setClasses([...classes, newClass])
      setNewGrade("")
      setNewSection("")
      setIsCreatingClass(false)
    } catch (err) {
      console.error("Error creating class:", err)
      alert(err.message)
    }
  }

  const updateClass = async () => {
    if (!newGrade.trim() || !newSection.trim()) {
      alert("Please enter both grade and section")
      return
    }

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/${selectedClass}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade: newGrade.trim(),
          section: newSection.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update class")
      }

      const updatedClass = await response.json()
      setClasses(classes.map((c) => (c.id === selectedClass ? updatedClass : c)))
      setNewGrade("")
      setNewSection("")
      setIsEditingClass(false)
      setSelectedClass(null)
    } catch (err) {
      console.error("Error updating class:", err)
      alert(err.message)
    }
  }

  const deleteClass = async (classId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/${classId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete class")
      }

      setClasses(classes.filter((c) => c.id !== classId))
    } catch (err) {
      console.error("Error deleting class:", err)
      alert(err.message)
    }
  }

  const fetchStudentsForClass = async (grade, section) => {
    setLoading(true)
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/grade/${grade}/section/${section}/students`)
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

  const moveStudentToWorld = async (student, level) => {
    if (!student.robloxId) {
      alert("Cannot assign player: No Roblox ID found for this student.")
      return
    }

    const worldName = LEVEL_TO_WORLD[level]
    const levelNumber = LEVEL_TO_NUMBER[level]
    const levelKey = `${student.id}-${level}`

    setMovingStudent((prev) => ({
      ...prev,
      [levelKey]: true,
    }))

    try {
      const response = await fetchWithAuth(`${TEACHER_API_URL}/move-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          robloxId: student.robloxId,
          targetWorld: worldName,
          targetLevel: levelNumber,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to assign player")
      }

      setMoveSuccess((prev) => ({
        ...prev,
        [levelKey]: true,
      }))

      setTimeout(() => {
        setMoveSuccess((prev) => ({
          ...prev,
          [levelKey]: false,
        }))
      }, 3000)
    } catch (err) {
      console.error("Error assigning player:", err)
      alert(`Failed to assign player: ${err.message}`)
    } finally {
      setMovingStudent((prev) => ({
        ...prev,
        [levelKey]: false,
      }))
    }
  }

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

  const calculatePerformanceStatus = () => {
    if (!selectedStudent || !selectedStudent.challengeAttempts) {
      setPerformanceStatus({ status: "neutral", message: "No data available" })
      return
    }

    let filteredAttempts = selectedStudent.challengeAttempts
    if (chartChallenge !== "all") {
      filteredAttempts = filteredAttempts.filter((attempt) => attempt.challengeType === chartChallenge)
    }

    if (filteredAttempts.length === 0) {
      setPerformanceStatus({ status: "neutral", message: "No data for selected challenge" })
      return
    }

    const latestAttempts = filteredAttempts.slice(-5)
    const avgValue =
      latestAttempts.reduce((sum, attempt) => sum + (attempt[chartMetric] || 0), 0) / latestAttempts.length

    const threshold = PERFORMANCE_THRESHOLDS[chartMetric]
    let status, message

    if (chartMetric === "time") {
      if (avgValue <= threshold.good) {
        status = "good"
        message = `Excellent! Average completion time: ${Math.round(avgValue)}s`
      } else if (avgValue <= threshold.average) {
        status = "average"
        message = `Good progress. Average completion time: ${Math.round(avgValue)}s`
      } else {
        status = "struggling"
        message = `Needs support. Average completion time: ${Math.round(avgValue)}s`
      }
    } else {
      if (avgValue >= threshold.good) {
        status = "good"
        message = `Excellent! Average score: ${Math.round(avgValue)} points`
      } else if (avgValue >= threshold.average) {
        status = "average"
        message = `Good progress. Average score: ${Math.round(avgValue)} points`
      } else {
        status = "struggling"
        message = `Needs support. Average score: ${Math.round(avgValue)} points`
      }
    }

    setPerformanceStatus({ status, message })
  }

  const copyClassCode = async (classCode) => {
    try {
      await navigator.clipboard.writeText(classCode)
      setCopiedClassCode(classCode)
      setTimeout(() => setCopiedClassCode(null), 2000)
    } catch (err) {
      console.error("Failed to copy class code:", err)
    }
  }

  // Navigation functions
  const handleClassSelect = async (classId) => {
    const classObj = classes.find((c) => c.id === classId)
    if (classObj) {
      setSelectedClass(classId)
      setViewMode("students")
      await fetchStudentsForClass(classObj.grade, classObj.section)
    }
  }

  const handleStudentSelect = (student) => {
    setSelectedStudent(student)
    setViewMode("studentDetail")
  }

  const handleBackToClasses = () => {
    setViewMode("classes")
    setSelectedClass(null)
    setStudents([])
  }

  const handleBackToStudents = () => {
    setViewMode("students")
    setSelectedStudent(null)
  }

  const handleEditClass = () => {
    if (isEditingClass) {
      updateClass()
    } else {
      startEditClass()
    }
  }

  const startEditClass = () => {
    const classToEdit = classes.find((cls) => cls.id === selectedClass)
    if (classToEdit) {
      setNewGrade(classToEdit.grade)
      setNewSection(classToEdit.section)
      setIsEditingClass(true)
    }
  }

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

        handleBackToClasses()
      } catch (err) {
        console.error("Error deleting class:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  // Get online status function
  const getOnlineStatus = (student) => {
    if (!student || !student.robloxId) return "offline"

    // If we have real-time status for this student, use it
    if (studentStatuses.hasOwnProperty(student.robloxId)) {
      return studentStatuses[student.robloxId] ? "online" : "offline"
    }

    // Otherwise use the online property from the student object if available
    if (student.hasOwnProperty("online")) {
      // Convert to boolean in case it's a number (1/0) from the database
      return student.online === true || student.online === 1 ? "online" : "offline"
    }

    // Fallback to offline as default
    return "offline"
  }

  // Render different views based on viewMode
  if (viewMode === "classes") {
    return (
      <div style={poppinsFont}>
        <WebSocketManager
          stompClientRef={stompClientRef}
          isConnectingRef={isConnectingRef}
          setStudentStatuses={setStudentStatuses}
          setStudents={setStudents}
          WS_ENDPOINT={WS_ENDPOINT}
        />
        <ClassList
          classes={classes}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isCreatingClass={isCreatingClass}
          setIsCreatingClass={setIsCreatingClass}
          isEditingClass={isEditingClass}
          setIsEditingClass={setIsEditingClass}
          newGrade={newGrade}
          setNewGrade={setNewGrade}
          newSection={newSection}
          setNewSection={setNewSection}
          loading={loading}
          error={error}
          createClass={createClass}
          updateClass={updateClass}
          deleteClass={deleteClass}
          handleClassSelect={handleClassSelect}
          handleEditClass={startEditClass}
          copyClassCode={copyClassCode}
          copiedClassCode={copiedClassCode}
          poppinsFont={poppinsFont}
        />
      </div>
    )
  }

  if (viewMode === "students") {
    return (
      <div style={poppinsFont}>
        <WebSocketManager
          stompClientRef={stompClientRef}
          isConnectingRef={isConnectingRef}
          setStudentStatuses={setStudentStatuses}
          setStudents={setStudents}
          WS_ENDPOINT={WS_ENDPOINT}
        />
        {loading || !classes || classes.length === 0 ? (
          <div className="flex items-center justify-center h-64" style={poppinsFont}>
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <StudentList
            students={students || []}
            selectedClass={selectedClass}
            classes={classes || []}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortField={sortField}
            setSortField={setSortField}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            expandedProgress={expandedProgress}
            setExpandedProgress={setExpandedProgress}
            movingStudent={movingStudent}
            moveSuccess={moveSuccess}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            levelDropdownOpen={levelDropdownOpen}
            setLevelDropdownOpen={setLevelDropdownOpen}
            studentStatuses={studentStatuses}
            loading={loading}
            error={error}
            handleBackToClasses={handleBackToClasses}
            handleStudentSelect={handleStudentSelect}
            moveStudentToWorld={moveStudentToWorld}
            refreshStudentList={refreshStudentList}
            isEditingClass={isEditingClass}
            setIsEditingClass={setIsEditingClass}
            newGrade={newGrade}
            setNewGrade={setNewGrade}
            newSection={newSection}
            setNewSection={setNewSection}
            startEditClass={startEditClass}
            handleEditClass={handleEditClass}
            handleDeleteClass={handleDeleteClass}
            LEVEL_COLORS={LEVEL_COLORS}
            LEVEL_CHALLENGES={LEVEL_CHALLENGES}
            poppinsFont={poppinsFont}
          />
        )}
      </div>
    )
  }

  if (viewMode === "studentDetail") {
    return (
      <div style={poppinsFont}>
        <WebSocketManager
          stompClientRef={stompClientRef}
          isConnectingRef={isConnectingRef}
          setStudentStatuses={setStudentStatuses}
          setStudents={setStudents}
          WS_ENDPOINT={WS_ENDPOINT}
        />
        <StudentDetail
          selectedStudent={selectedStudent}
          chartMetric={chartMetric}
          setChartMetric={setChartMetric}
          chartTimeframe={setChartTimeframe}
          chartChallenge={chartChallenge}
          setChartChallenge={setChartChallenge}
          performanceStatus={performanceStatus}
          historySortField={historySortField}
          setHistorySortField={setHistorySortField}
          historySortDirection={historySortDirection}
          setHistorySortDirection={setHistorySortDirection}
          challengeAttemptCounts={challengeAttemptCounts}
          challengeFilter={challengeFilter}
          setChallengeFilter={setChallengeFilter}
          challengeSortDropdownOpen={challengeSortDropdownOpen}
          setChallengeSortDropdownOpen={setChallengeSortDropdownOpen}
          statusHistory={statusHistory}
          showStatusHistory={showStatusHistory}
          setShowStatusHistory={setShowStatusHistory}
          loadingStatusHistory={loadingStatusHistory}
          handleBackToStudents={handleBackToStudents}
          fetchStudentStatusHistory={fetchStudentStatusHistory}
          LEVEL_COLORS={LEVEL_COLORS}
          PERFORMANCE_THRESHOLDS={PERFORMANCE_THRESHOLDS}
          poppinsFont={poppinsFont}
          getOnlineStatus={getOnlineStatus}
        />
      </div>
    )
  }

  return null
}

export default ClassManagement
