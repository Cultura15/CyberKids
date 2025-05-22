"use client"

import { useState, useEffect } from "react"
import { Search, ArrowUpDown, User, Clock, Award, X } from "lucide-react"
import fetchWithAuth from "../../JWT/authInterceptor"

const API_BASE_URL = "https://cyberkids.onrender.com"

const Students = () => {
  // State management
  const [students, setStudents] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState({ key: "realName", direction: "ascending" })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentDetailLoading, setStudentDetailLoading] = useState(false)

  // Fetch students data on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/student`)
        if (!response.ok) {
          throw new Error("Failed to fetch students")
        }
        const data = await response.json()
        setStudents(data)
      } catch (err) {
        console.error("Error fetching students:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Fetch individual student details
  const fetchStudentDetails = async (studentId) => {
    setStudentDetailLoading(true)
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/student/${studentId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch student details")
      }
      const data = await response.json()
      setSelectedStudent(data)
    } catch (err) {
      console.error("Error fetching student details:", err)
      setError(err.message)
    } finally {
      setStudentDetailLoading(false)
    }
  }

  // Handle student selection
  const handleStudentSelect = (student) => {
    fetchStudentDetails(student.id)
  }

  // Close student details panel
  const closeStudentDetails = () => {
    setSelectedStudent(null)
  }

  // Sort handler
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "ascending" ? "descending" : "ascending"
    setSortConfig({ key, direction })
  }

  // Sort and filter students
  const sortedStudents = () => {
    const filteredStudents = students.filter(
      (student) =>
        (student.realName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (student.robloxName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (student.section?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
    )

    return [...filteredStudents].sort((a, b) => {
      // Handle missing values
      const valueA = a[sortConfig.key] || ""
      const valueB = b[sortConfig.key] || ""

      if (valueA < valueB) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (valueA > valueB) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
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

  // Render loading state
  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )

  // Render error state
  if (error)
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        <p className="font-medium">Error loading students</p>
        <p>{error}</p>
      </div>
    )

  // Main component render
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800">Students</h2>
        <p className="text-gray-600">View and manage student performance</p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {sortedStudents().length} of {students.length} students
          </div>
        </div>
      </div>

      {/* Main content area - conditionally show student details or list */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Students list - always visible but resized when details are shown */}
        <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${selectedStudent ? "lg:w-1/2" : "w-full"}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("realName")}
                  >
                    <div className="flex items-center">
                      Student Name
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("robloxName")}
                  >
                    <div className="flex items-center">
                      Roblox Name
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("section")}
                  >
                    <div className="flex items-center">
                      Section
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents().length > 0 ? (
                  sortedStudents().map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.realName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.robloxName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.section || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleStudentSelect(student)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* Student details panel - conditionally rendered */}
        {selectedStudent && (
          <div className="bg-white rounded-lg shadow-sm lg:w-1/2">
            {studentDetailLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedStudent.realName || selectedStudent.realNameOrFallback}
                    </h3>
                    <p className="text-gray-500">{selectedStudent.section || "No section"}</p>
                  </div>
                  <button onClick={closeStudentDetails} className="p-1 rounded-full hover:bg-gray-100">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-indigo-500 mr-2" />
                      <h4 className="font-medium text-gray-700">Roblox Info</h4>
                    </div>
                    <p className="text-sm text-gray-600">ID: {selectedStudent.robloxId || "N/A"}</p>
                    <p className="text-sm text-gray-600">Name: {selectedStudent.robloxName || "N/A"}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Award className="h-5 w-5 text-indigo-500 mr-2" />
                      <h4 className="font-medium text-gray-700">Performance</h4>
                    </div>
                    <p className="text-sm text-gray-600">Total Points: {getTotalPoints(selectedStudent)}</p>
                    <p className="text-sm text-gray-600">
                      Challenges Completed:{" "}
                      {selectedStudent.scores?.filter((score) => score.completionStatus === "Completed").length || 0}
                    </p>
                  </div>
                </div>

                {/* Scores Section */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Challenge Scores</h4>
                  {selectedStudent.scores && selectedStudent.scores.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Challenge
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Points
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedStudent.scores.map((score) => (
                            <tr key={score.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {score.challengeType}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    score.completionStatus === "Completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {score.completionStatus}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(score.dateCompleted)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No scores available</p>
                  )}
                </div>

                {/* Timers Section */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Challenge Timers</h4>
                  {selectedStudent.timers && selectedStudent.timers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Challenge
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time Taken
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Start Time
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              End Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedStudent.timers.map((timer) => (
                            <tr key={timer.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {timer.challengeType}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                  <span>{timer.timeTaken || "In progress"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(timer.startTime)}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {timer.endTime ? formatDate(timer.endTime) : "Not completed"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No timer data available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Students
