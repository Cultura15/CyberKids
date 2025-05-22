"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Users, ArrowLeft, GraduationCap, Edit, Trash2, ChevronDown, Home } from "lucide-react"
import fetchWithAuth from "../../JWT/authInterceptor"

const API_BASE_URL = "https://cyberkids.onrender.com/api/classes"
const TEACHER_API_URL = "https://cyberkids.onrender.com/api/teacher"

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

// Font style to apply Poppins font
const poppinsFont = {
  fontFamily: "'Poppins', sans-serif",
}

const Class = () => {
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

  // Fetch students for a specific class
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
        throw new Error("Failed to assign player")
      }

      // Set success state for this specific student and level
      setMoveSuccess((prev) => ({
        ...prev,
        [levelKey]: true,
      }))

      // Clear success message after 3 seconds
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
      // Clear loading state
      setMovingStudent((prev) => ({
        ...prev,
        [levelKey]: false,
      }))
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
  const viewStudentDetails = (student) => {
    setSelectedStudent(student)
    setViewMode("studentDetail")
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
    if (!student || !student.scores || !Array.isArray(student.scores)) {
      return 0
    }
    return student.scores.reduce((total, score) => total + (score.points || 0), 0)
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get online status (randomly generated for demo)
  const getOnlineStatus = (studentId) => {
    // In a real app, this would be determined by actual online status
    // For demo purposes, we'll use a deterministic approach based on the student ID
    return studentId % 3 === 0 ? "offline" : "online"
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
          aValue = getOnlineStatus(a.id)
          bValue = getOnlineStatus(b.id)
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
                  <p className="text-lg text-gray-600">{students.length} students</p>
                </div>
              )}
            </div>

            {!isEditingClass && (
              <div className="flex space-x-2">
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
                          const onlineStatus = getOnlineStatus(student.id)
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
                                            const hasCompleted = student.scores?.some(
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

        {/* Student Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      getOnlineStatus(selectedStudent.id) === "online" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-lg font-medium text-gray-800 capitalize">
                    {getOnlineStatus(selectedStudent.id)}
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
                <span className="text-lg font-medium text-gray-800">
                  {selectedStudent.scores?.filter((score) => score.completionStatus === "Completed").length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Average Score:</span>
                <span className="text-lg font-medium text-gray-800">
                  {selectedStudent.scores && selectedStudent.scores.length > 0
                    ? Math.round(
                        selectedStudent.scores.reduce((sum, score) => sum + (score.points || 0), 0) /
                          selectedStudent.scores.length,
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-lg text-gray-500">Last Activity:</span>
                <span className="text-lg font-medium text-gray-800">
                  {selectedStudent.scores && selectedStudent.scores.length > 0
                    ? formatDate(
                        selectedStudent.scores.sort((a, b) => new Date(b.dateCompleted) - new Date(a.dateCompleted))[0]
                          .dateCompleted,
                      )
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scores Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-medium text-gray-800 mb-4">Challenge Scores</h3>
          {selectedStudent.scores && selectedStudent.scores.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Challenge
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedStudent.scores.map((score) => (
                    <tr key={score.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{score.challengeType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            score.points >= 80
                              ? "bg-green-100 text-green-800"
                              : score.points >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {score.points}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            score.completionStatus === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {score.completionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {formatDate(score.dateCompleted)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-lg text-gray-500 py-4">No scores available for this student.</p>
          )}
        </div>

        {/* Timers Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-medium text-gray-800 mb-4">Challenge Timers</h3>
          {selectedStudent.timers && selectedStudent.timers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Challenge
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Time Taken
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Start Time
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      End Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedStudent.timers.map((timer) => (
                    <tr key={timer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{timer.challengeType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base font-medium">
                        {timer.timeTaken || "In progress"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {formatDate(timer.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
                        {timer.endTime ? formatDate(timer.endTime) : "Not completed"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-lg text-gray-500 py-4">No timer data available for this student.</p>
          )}
        </div>

        {/* Level Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-medium text-gray-800 mb-4">Level Management</h3>
          <div className="flex flex-wrap gap-3">
            {["Level 1", "Level 2", "Level 3"].map((level) => (
              <button
                key={level}
                onClick={() => changeStudentLevel(selectedStudent.id, level)}
                className={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  selectedStudent.level === level
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default Class
