"use client"

import { Search, ArrowLeft, Users, ChevronDown, Home, CopyIcon, Edit, Trash2 } from "lucide-react"

const StudentList = ({
  students = [], // Added default empty array
  selectedClass,
  classes = [], // Added default empty array
  searchQuery,
  setSearchQuery,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  expandedProgress,
  setExpandedProgress,
  movingStudent,
  moveSuccess,
  selectedLevel,
  setSelectedLevel,
  levelDropdownOpen,
  setLevelDropdownOpen,
  studentStatuses = {}, // Added default empty object
  loading,
  error,
  handleBackToClasses,
  handleStudentSelect,
  moveStudentToWorld,
  refreshStudentList,
  handleEditClass,
  handleDeleteClass,
  isEditingClass,
  LEVEL_COLORS = {}, // Added default empty object
  LEVEL_CHALLENGES = {}, // Added default empty object
  poppinsFont,
}) => {
  const safeClasses = classes || []
  const safeStudents = students || []
  const safeLevelChallenges = LEVEL_CHALLENGES || {}
  const safeStudentStatuses = studentStatuses || {}

  const classObj = safeClasses.length > 0 ? safeClasses.find((c) => c && c.id === selectedClass) : null

  const filteredStudents =
    safeStudents.length > 0
      ? safeStudents.filter(
          (student) =>
            student &&
            (student.realName?.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
              student.username?.toLowerCase().includes(searchQuery?.toLowerCase() || "") ||
              student.robloxId?.toString().includes(searchQuery || "")),
        )
      : []

  const sortedStudents = () => {
    return [...filteredStudents].sort((a, b) => {
      if (!a || !b) return 0

      let aValue = a[sortField]
      let bValue = b[sortField]

      if (sortField === "realName") {
        aValue = aValue?.toLowerCase() || ""
        bValue = bValue?.toLowerCase() || ""
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleProgressDropdown = (studentId) => {
    setExpandedProgress((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }))
  }

  const toggleLevelSelection = (studentId, level) => {
    const levelKey = `${studentId}-${level}`
    setSelectedLevel((prev) => ({
      ...prev,
      [levelKey]: !prev[levelKey],
    }))
  }

  const getOnlineStatus = (student) => {
    if (!student || !student.robloxId) return "offline"

    // If we have real-time status for this student, use it
    if (safeStudentStatuses.hasOwnProperty(student.robloxId)) {
      return safeStudentStatuses[student.robloxId] ? "online" : "offline"
    }

    // Otherwise use the online property from the student object if available
    if (student.hasOwnProperty("online")) {
      // Convert to boolean in case it's a number (1/0) from the database
      return student.online === true || student.online === 1 ? "online" : "offline"
    }

    // Fallback to offline as default
    return "offline"
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        style={poppinsFont}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        style={poppinsFont}
      >
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-8" style={poppinsFont}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={handleBackToClasses} className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
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
                      // copyClassCode(classObj.classCode)
                    }}
                    className="p-1 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors text-indigo-600"
                    title="Copy class code"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              <p className="text-lg text-gray-600">{safeStudents.length} students</p>
            </div>
          </div>

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
                handleEditClass()
              }}
              className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
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
        </div>
      </div>

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
                  {safeLevelChallenges &&
                    Object.entries(safeLevelChallenges).map(([level, challenge]) => (
                      <button
                        key={level}
                        className="block w-full text-left px-4 py-2 text-base text-gray-700 hover:bg-gray-100"
                        onClick={() => {
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

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="h-[600px] flex flex-col">
            {safeStudents.length > 0 ? (
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
                                              disabled={movingStudent[`${student.id}-Main Menu`] || !student}
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
                                      {safeLevelChallenges &&
                                        Object.entries(safeLevelChallenges)
                                          .filter(([level]) => level !== "Main Menu")
                                          .map(([level, challenge]) => {
                                            const hasCompleted = student.challengeAttempts?.some(
                                              (score) =>
                                                score.challengeType === challenge &&
                                                score.completionStatus === "Completed",
                                            )

                                            const formattedChallenge = challenge
                                              .split("_")
                                              .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                                              .join(" ")

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
                                                      disabled={isMoving || !student}
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
                                onClick={() => handleStudentSelect(student)}
                                className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-base font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        )
                      })}

                      {/* Add empty rows to maintain consistent height */}
                      {safeStudents.length < 10 &&
                        Array.from({ length: 10 - safeStudents.length }).map((_, index) => (
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

export default StudentList
