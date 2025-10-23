"use client"

import React from "react"
import { Users, Trophy, Maximize2 } from "lucide-react"
import { getProgressBarColor } from "../../utils/completionUtils"

const StatsCards = ({ leaderboard, selectedChallenge, onLeaderboardOpen }) => {
  // Filter leaderboard by selected challenge level
  const filteredByLevel =
    leaderboard?.filter((s) => s.level === selectedChallenge?.level) || []

  const completed = filteredByLevel.filter((s) => s.highestScore > 0).length
  const total = filteredByLevel.length || 1
  const percentage = Math.round((completed / total) * 100)

  const getRankColors = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800"
      case 2:
        return "bg-gray-100 text-gray-700"
      case 3:
        return "bg-amber-200 text-amber-800"
      default:
        return "bg-indigo-50 text-indigo-700"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Total Students */}
      <div className="bg-white rounded-xl shadow-sm p-3">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-800">Total Students</h3>
            <p className="text-xl font-bold text-gray-900">{leaderboard?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Completion Rates */}
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
                    {completed} of {filteredByLevel.length || 0} students completed
                  </p>
                </div>
              </div>

              {filteredByLevel.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No students have played this challenge yet
                </div>
              ) : (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                    <div
                      className={`${getProgressBarColor(percentage)} h-4 rounded-full transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{percentage}%</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">Leaderboard</h3>
          </div>
          <button
            onClick={onLeaderboardOpen}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Maximize Leaderboard"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-2">
          <div className="space-y-3">
            {filteredByLevel.map((student, index) => (
              <div
                key={student.globalRank || index}
                className="flex items-center p-2 rounded-lg hover:bg-gray-50"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-bold mr-3 ${getRankColors(
                    student.globalRank || index + 1
                  )}`}
                >
                  {student.globalRank || index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {student.realName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {student.robloxName || "No Roblox ID"}
                  </p>
                </div>
                <div className="text-sm font-semibold text-gray-900 text-right">
                  {student.level && (
                    <span className="block text-xs text-gray-500">{student.level}</span>
                  )}
                  {student.highestScore ?? 0} pts
                </div>
              </div>
            ))}

            {filteredByLevel.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No students available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsCards
