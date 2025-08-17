"use client"
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, ArrowUp, ArrowDown, ChevronDown } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const StudentDetail = ({
  selectedStudent,
  chartMetric,
  setChartMetric,
  chartTimeframe,
  setChartTimeframe,
  chartChallenge,
  setChartChallenge,
  performanceStatus,
  historySortField,
  setHistorySortField,
  historySortDirection,
  setHistorySortDirection,
  challengeAttemptCounts,
  challengeFilter,
  setChallengeFilter,
  challengeSortDropdownOpen,
  setChallengeSortDropdownOpen,
  statusHistory,
  showStatusHistory,
  setShowStatusHistory,
  loadingStatusHistory,
  handleBackToStudents,
  fetchStudentStatusHistory,
  LEVEL_COLORS,
  PERFORMANCE_THRESHOLDS,
  poppinsFont,
  getOnlineStatus,
}) => {
  // Safe defaults for all props
  const safeSelectedStudent = selectedStudent || {}
  const safePerformanceStatus = performanceStatus || { status: "neutral", message: "No data available" }
  const safeChallengeAttemptCounts = challengeAttemptCounts || {}
  const safeStatusHistory = statusHistory || []
  const safeLevelColors = LEVEL_COLORS || {}
  const safePerformanceThresholds = PERFORMANCE_THRESHOLDS || {
    points: { good: 80, average: 60 },
    time: { good: 120, average: 300 },
  }

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString()
    } catch (e) {
      return "Invalid Date"
    }
  }

  // Format time from seconds
  const formatTimeFromSeconds = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!safeSelectedStudent.challengeAttempts || safeSelectedStudent.challengeAttempts.length === 0) {
      return []
    }

    let filteredAttempts = safeSelectedStudent.challengeAttempts.filter(
      (attempt) => attempt && attempt.completionStatus === "Completed",
    )

    if (chartChallenge && chartChallenge !== "all") {
      filteredAttempts = filteredAttempts.filter((attempt) => attempt.challengeType === chartChallenge)
    }

    // Group by timeframe
    const groupedData = {}
    filteredAttempts.forEach((attempt) => {
      if (!attempt.dateCompleted) return

      const date = new Date(attempt.dateCompleted)
      let key

      if (chartTimeframe === "day") {
        key = date.toDateString()
      } else if (chartTimeframe === "month") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`
      } else {
        key = date.getFullYear().toString()
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          date: key,
          attempts: [],
          totalPoints: 0,
          totalTime: 0,
          count: 0,
        }
      }

      groupedData[key].attempts.push(attempt)
      groupedData[key].totalPoints += attempt.points || 0
      groupedData[key].totalTime += attempt.timeTaken || 0
      groupedData[key].count++
    })

    // Convert to chart format
    return Object.values(groupedData)
      .map((group) => ({
        date: group.date,
        [chartMetric]:
          chartMetric === "points"
            ? Math.round(group.totalPoints / group.count)
            : Math.round(group.totalTime / group.count),
        count: group.count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  // Calculate challenge stats
  const calculateChallengeStats = () => {
    if (!safeSelectedStudent.challengeAttempts || challengeFilter === "all") {
      return { avgPoints: "N/A", totalPoints: "N/A", avgTime: "N/A" }
    }

    const filteredAttempts = safeSelectedStudent.challengeAttempts.filter(
      (attempt) => attempt && attempt.challengeType === challengeFilter && attempt.completionStatus === "Completed",
    )

    if (filteredAttempts.length === 0) {
      return { avgPoints: "N/A", totalPoints: "N/A", avgTime: "N/A" }
    }

    const totalPoints = filteredAttempts.reduce((sum, attempt) => sum + (attempt.points || 0), 0)
    const totalTime = filteredAttempts.reduce((sum, attempt) => sum + (attempt.timeTaken || 0), 0)

    return {
      avgPoints: Math.round(totalPoints / filteredAttempts.length),
      totalPoints: totalPoints,
      avgTime: formatTimeFromSeconds(totalTime / filteredAttempts.length),
    }
  }

  // Handle history sort
  const handleHistorySort = (field) => {
    if (historySortField === field) {
      setHistorySortDirection(historySortDirection === "asc" ? "desc" : "asc")
    } else {
      setHistorySortField(field)
      setHistorySortDirection("asc")
    }
  }

  // Sort challenge attempts
  const sortedChallengeAttempts = () => {
    if (!safeSelectedStudent.challengeAttempts) return []

    let filtered = [...safeSelectedStudent.challengeAttempts]

    if (challengeFilter !== "all") {
      filtered = filtered.filter((attempt) => attempt && attempt.challengeType === challengeFilter)
    }

    return filtered.sort((a, b) => {
      if (!a || !b) return 0

      let aValue = a[historySortField]
      let bValue = b[historySortField]

      if (historySortField === "dateCompleted") {
        aValue = new Date(aValue || 0)
        bValue = new Date(bValue || 0)
      }

      if (historySortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  if (!safeSelectedStudent.id) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={poppinsFont}>
        <div className="text-center">
          <p className="text-gray-600">No student selected</p>
          <button
            onClick={handleBackToStudents}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Students
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-8" style={poppinsFont}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBackToStudents}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {safeSelectedStudent.realName || "Unknown Student"}
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-lg text-gray-600">
                  {safeSelectedStudent.grade && safeSelectedStudent.section
                    ? `${safeSelectedStudent.grade} - ${safeSelectedStudent.section}`
                    : "No class assigned"}
                </p>
                <div className="flex items-center">
                  <div
                    className={`h-3 w-3 rounded-full mr-2 ${
                      getOnlineStatus && getOnlineStatus(safeSelectedStudent) === "online"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-base text-gray-700 capitalize">
                    {getOnlineStatus ? getOnlineStatus(safeSelectedStudent) : "offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => fetchStudentStatusHistory && fetchStudentStatusHistory(safeSelectedStudent.id)}
              disabled={loadingStatusHistory}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-base font-medium"
            >
              {loadingStatusHistory ? "Loading..." : "View Status History"}
            </button>
          </div>
        </div>
      </div>

      {/* Status History Modal */}
      {showStatusHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Status History</h3>
                <button
                  onClick={() => setShowStatusHistory(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              {safeStatusHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {safeStatusHistory.map((log, index) => (
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
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">No status history available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-gray-800">Performance Chart</h3>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={chartMetric || "points"}
              onChange={(e) => setChartMetric && setChartMetric(e.target.value)}
            >
              <option value="points">Points</option>
              <option value="time">Time Taken</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={chartTimeframe || "day"}
              onChange={(e) => setChartTimeframe && setChartTimeframe(e.target.value)}
            >
              <option value="day">By Day</option>
              <option value="month">By Month</option>
              <option value="year">By Year</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={chartChallenge || "all"}
              onChange={(e) => setChartChallenge && setChartChallenge(e.target.value)}
            >
              <option value="all">All Challenges</option>
              <option value="INFORMATION_CLASSIFICATION_SORTING">Information Classification</option>
              <option value="PASSWORD_SECURITY">Password Security</option>
              <option value="PHISHING_IDENTIFICATION">Phishing Identification</option>
            </select>
          </div>
        </div>

        {/* Performance Indicator */}
        <div
          className={`mb-4 p-3 rounded-lg flex items-center ${
            safePerformanceStatus.status === "good"
              ? "bg-green-50 text-green-800"
              : safePerformanceStatus.status === "average"
                ? "bg-yellow-50 text-yellow-800"
                : safePerformanceStatus.status === "struggling"
                  ? "bg-red-50 text-red-800"
                  : "bg-gray-50 text-gray-800"
          }`}
        >
          {safePerformanceStatus.status === "good" && <CheckCircle className="h-5 w-5 mr-2" />}
          {safePerformanceStatus.status === "average" && <Clock className="h-5 w-5 mr-2" />}
          {safePerformanceStatus.status === "struggling" && <AlertTriangle className="h-5 w-5 mr-2" />}
          <span className="text-sm font-medium">{safePerformanceStatus.message}</span>
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
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => {
                  if (chartTimeframe === "day") return new Date(value).toLocaleDateString()
                  if (chartTimeframe === "month")
                    return new Date(value).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                  return value
                }}
                formatter={(value, name) => [
                  chartMetric === "time" ? formatTimeFromSeconds(value) : value,
                  chartMetric === "points" ? "Average Points" : "Average Time",
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={chartMetric}
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#4f46e5", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Challenge History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h3 className="text-xl font-medium text-gray-800">Challenge History</h3>
          <div className="relative">
            <button
              onClick={() => setChallengeSortDropdownOpen && setChallengeSortDropdownOpen(!challengeSortDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              <span>Filter: {challengeFilter === "all" ? "All Challenges" : challengeFilter.split("_").join(" ")}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {challengeSortDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 border border-gray-100">
                <div className="py-1">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setChallengeFilter && setChallengeFilter("all")
                      setChallengeSortDropdownOpen && setChallengeSortDropdownOpen(false)
                    }}
                  >
                    All Challenges
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setChallengeFilter && setChallengeFilter("INFORMATION_CLASSIFICATION_SORTING")
                      setChallengeSortDropdownOpen && setChallengeSortDropdownOpen(false)
                    }}
                  >
                    Information Classification
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setChallengeFilter && setChallengeFilter("PASSWORD_SECURITY")
                      setChallengeSortDropdownOpen && setChallengeSortDropdownOpen(false)
                    }}
                  >
                    Password Security
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setChallengeFilter && setChallengeFilter("PHISHING_IDENTIFICATION")
                      setChallengeSortDropdownOpen && setChallengeSortDropdownOpen(false)
                    }}
                  >
                    Phishing Identification
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
                Total Attempts: {safeChallengeAttemptCounts[challengeFilter] || 0}
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

        {safeSelectedStudent.challengeAttempts && safeSelectedStudent.challengeAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedChallengeAttempts().map((attempt, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(attempt.dateCompleted)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {attempt.challengeType ? attempt.challengeType.split("_").join(" ") : "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attempt.completionStatus === "Completed"
                            ? "bg-green-100 text-green-800"
                            : attempt.completionStatus === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {attempt.completionStatus || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {attempt.points !== null && attempt.points !== undefined ? attempt.points : "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatTimeFromSeconds(attempt.timeTaken)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No challenge attempts found for this student.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDetail
