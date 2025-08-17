"use client"
import { Trophy, X, ArrowUp, ArrowDown } from "lucide-react"

const LeaderboardModal = ({
  isOpen,
  selectedClass,
  students,
  sortField,
  sortDirection,
  onSort,
  getSortedStudents,
  onClose,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
              <Trophy className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedClass ? `${selectedClass.grade} - ${selectedClass.section}` : "Class"} Leaderboard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[60vh]">
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">Showing {students.length} students</div>
            <div className="flex gap-2">
              <button
                onClick={() => onSort("name")}
                className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${
                  sortField === "name" ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Name
                {sortField === "name" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5 ml-1" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 ml-1" />
                  ))}
              </button>
              <button
                onClick={() => onSort("points")}
                className={`px-3 py-1.5 rounded text-sm font-medium flex items-center ${
                  sortField === "points"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Points
                {sortField === "points" &&
                  (sortDirection === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5 ml-1" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 ml-1" />
                  ))}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg">
            <div className="grid grid-cols-12 text-sm font-medium text-gray-500 border-b border-gray-200 py-3 px-4 sticky top-0 bg-gray-50 z-10">
              <div className="col-span-1">Rank</div>
              <div className="col-span-7">Student</div>
              <div className="col-span-4 text-right">Points</div>
            </div>

            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[50vh]">
              {getSortedStudents().map((student, index) => (
                <div key={student.id} className="grid grid-cols-12 py-3 px-4 hover:bg-gray-100 transition-colors">
                  <div className="col-span-1 flex items-center">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-sm ${
                        index < 3 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="col-span-7 flex items-center">
                    <div>
                      <p className="font-medium text-gray-800">{student.realName}</p>
                      <p className="text-xs text-gray-500">{student.robloxName || "No Roblox ID"}</p>
                    </div>
                  </div>
                  <div className="col-span-4 flex items-center justify-end">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        index < 3 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {student.points || Math.floor(Math.random() * 100)} pts
                    </div>
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

        {/* Modal Footer */}
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
