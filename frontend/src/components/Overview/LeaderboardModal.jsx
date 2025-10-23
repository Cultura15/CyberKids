"use client"
import { Trophy, X } from "lucide-react"
import LoadingSpinner from "./LoadingSpinner"

const LeaderboardModal = ({
  isOpen,
  selectedClass,
  selectedLevel,
  students,
  onClose,
  loading,
}) => {
  if (!isOpen) return null

  const getRankColors = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border border-yellow-300"
      case 2:
        return "bg-gray-100 text-gray-700 border border-gray-300"
      case 3:
        return "bg-amber-200 text-amber-800 border border-amber-400"
      default:
        return "bg-indigo-50 text-indigo-700"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl max-h-[90vh] flex flex-col relative">
        {/* === Modal Header === */}
        <div className="flex flex-col p-5 border-b">
          {/* Small Class Info */}
          {selectedClass && (
            <p className="text-sm text-gray-500">
              {selectedClass.grade} - {selectedClass.section}
            </p>
          )}

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                <Trophy className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedLevel ? `${selectedLevel} Leaderboard` : "Leaderboard"}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* === Modal Content === */}
        <div className="p-5 overflow-y-auto flex-1 max-h-[70vh]">
          {/* === Leaderboard Table === */}
          <div className="bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-12 text-sm font-semibold text-gray-600 border-b border-gray-200 py-3 px-4 sticky top-0 bg-gray-50 z-10">
              <div className="col-span-1">Rank</div>
              <div className="col-span-3">Student</div>
              <div className="col-span-2">Roblox Name</div>
              <div className="col-span-2 text-right">Score</div>
              <div className="col-span-2 text-center">Best Time</div>
              <div className="col-span-2 text-center">Level</div>
            </div>

            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[60vh]">
              {students.map((student, index) => (
                <div
                  key={student.globalRank || index}
                  className="grid grid-cols-12 items-center py-3 px-4 hover:bg-gray-100 transition-colors"
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColors(
                        student.globalRank || index + 1
                      )}`}
                    >
                      {student.globalRank || index + 1}
                    </div>
                  </div>

                  {/* Student Name */}
                  <div className="col-span-3 font-medium text-gray-800 truncate">
                    {student.realName}
                  </div>

                  {/* Roblox Name */}
                  <div className="col-span-2 text-gray-600 truncate">
                    {student.robloxName || "—"}
                  </div>

                  {/* Highest Score */}
                  <div className="col-span-2 text-right font-semibold text-gray-900">
                    {student.highestScore ?? 0} pts
                  </div>

                  {/* Best Time */}
                  <div className="col-span-2 text-center text-gray-700">
                    {student.bestTimeTaken || "—"}
                  </div>

                  {/* Level */}
                  <div className="col-span-2 text-center text-gray-700 font-medium">
                    {student.level || "—"}
                  </div>
                </div>
              ))}

              {students.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No students available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === Modal Footer === */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default LeaderboardModal
