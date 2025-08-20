"use client"

import React from "react"
import { Users, Trophy, Maximize2 } from "lucide-react"
import { calculateCompletionRate, getProgressBarColor } from "../../utils/completionUtils"

const StatsCards = ({ students, selectedChallenge, getSortedStudents, onLeaderboardOpen }) => {
  return (
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
                    {calculateCompletionRate(students, selectedChallenge.challengeType).completed} of{" "}
                    {calculateCompletionRate(students, selectedChallenge.challengeType).total} students completed
                  </p>
                </div>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No students have played this challenge yet</div>
              ) : (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                    <div
                      className={`${getProgressBarColor(calculateCompletionRate(students, selectedChallenge.challengeType).percentage)} h-4 rounded-full transition-all duration-300`}
                      style={{
                        width: `${calculateCompletionRate(students, selectedChallenge.challengeType).percentage}%`,
                      }}
                    ></div>
                  </div>

                  <p className="text-xl font-bold text-gray-900">
                    {calculateCompletionRate(students, selectedChallenge.challengeType).percentage}%
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
            onClick={onLeaderboardOpen}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            title="Maximize Leaderboard"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[250px] overflow-y-auto pr-2">
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
  )
}

export default StatsCards
