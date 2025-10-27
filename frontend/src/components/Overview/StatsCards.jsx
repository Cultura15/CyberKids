"use client"

import React from "react"
import { Users, Trophy, Maximize2, TrendingUp, Award, Target } from "lucide-react"

// Utility function for progress bar colors
const getProgressBarColor = (percentage) => {
  if (percentage >= 75) return "bg-gradient-to-r from-green-500 to-emerald-500"
  if (percentage >= 50) return "bg-gradient-to-r from-yellow-500 to-amber-500"
  if (percentage >= 25) return "bg-gradient-to-r from-orange-500 to-orange-600"
  return "bg-gradient-to-r from-red-500 to-rose-500"
}

const StatsCards = ({
  leaderboard,
  selectedChallenge,
  onLeaderboardOpen,
  totalStudents,
  selectedClass,
}) => {
  // Filter leaderboard by selected challenge level
  const filteredByLevel =
    leaderboard?.filter((s) => s.level === selectedChallenge?.level) || []

  // Calculate completion metrics
  const completed = filteredByLevel.filter((s) => s.highestScore > 0).length
  const total = totalStudents || 0
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  // Calculate average score
  const avgScore = filteredByLevel.length > 0 
    ? Math.round(filteredByLevel.reduce((sum, s) => sum + (s.highestScore || 0), 0) / filteredByLevel.length)
    : 0

  const getRankColors = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm"
      case 2:
        return "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 shadow-sm"
      case 3:
        return "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 shadow-sm"
      default:
        return "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700"
    }
  }

  const getMedalIcon = (rank) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  return (
    <div 
      className="w-full max-w-[1400px] mx-auto"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Fixed Width Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '20px' }}>
        
        {/* 📊 Total Students Card */}
        <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative p-5" style={{ minHeight: '160px', maxHeight: '160px' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 relative">
                <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300" style={{ width: '48px', height: '48px' }}>
                  <Users style={{ width: '24px', height: '24px' }} />
                </div>
                <div className="absolute bg-green-500 rounded-full border-2 border-white animate-pulse" style={{ top: '-4px', right: '-4px', width: '16px', height: '16px' }}></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Total Enrolled
                </h3>
                {selectedClass && (
                  <div className="inline-flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full">
                    <div className="bg-indigo-500 rounded-full" style={{ width: '6px', height: '6px' }}></div>
                    <p className="text-xs font-semibold text-indigo-700">
                      {selectedClass.grade} - {selectedClass.section}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-auto">
              <p className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {totalStudents ?? 0}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <TrendingUp style={{ width: '12px', height: '12px' }} />
                Active students in class
              </p>
            </div>
          </div>
        </div>

        {/* 📈 Completion Rates Card */}
        <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative p-5 flex flex-col" style={{ minHeight: '160px', maxHeight: '160px' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Completion Rate
              </h3>
              <Target style={{ width: '18px', height: '18px' }} className="text-gray-400" />
            </div>

            {selectedChallenge ? (
              <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="flex-shrink-0 rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300"
                  style={{
                    width: '40px',
                    height: '40px',
                  }}
                >
                  <img
                    src={
                      selectedChallenge.displayName === "Information Sorting Game"
                        ? "/info_sort.jpeg"
                        : selectedChallenge.displayName === "Password Security Game"
                        ? "/pass_sec.jpeg"
                        : selectedChallenge.displayName === "Phishing Awareness Game"
                        ? "/phishing_aware.jpeg"
                        : ""
                    }
                    alt={selectedChallenge.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate">
                    {selectedChallenge.displayName}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium">
                    {completed} of {total} students
                  </p>
                </div>
              </div>


                {total === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <Award style={{ width: '32px', height: '32px' }} className="mb-1 opacity-50" />
                    <p className="text-xs font-medium">No students enrolled</p>
                  </div>
                ) : (
                  <div className="space-y-2 mt-auto">
                    <div className="w-full bg-gray-200 rounded-full overflow-hidden shadow-inner" style={{ height: '10px' }}>
                      <div
                        className={`${getProgressBarColor(percentage)} rounded-full transition-all duration-700 ease-out shadow-md`}
                        style={{ width: `${percentage}%`, height: '10px' }}
                      >
                        <div className="h-full w-full bg-white/20"></div>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-extrabold text-gray-900">{percentage}%</p>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium">Avg Score</p>
                        <p className="text-base font-bold text-gray-700">{avgScore}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Target style={{ width: '32px', height: '32px' }} className="mb-1 opacity-50" />
                <p className="text-xs font-medium">Select a challenge</p>
              </div>
            )}
          </div>
        </div>

        {/* 🏆 Leaderboard Card */}
        <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative p-5 flex flex-col" style={{ minHeight: '160px', maxHeight: '160px' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300" style={{ width: '40px', height: '40px' }}>
                  <Trophy style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Top Performers
                  </h3>
                  <p className="text-xs text-gray-500">{filteredByLevel.length} ranked</p>
                </div>
              </div>
              <button
                onClick={onLeaderboardOpen}
                className="p-2 rounded-lg hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100 text-gray-500 hover:text-amber-700 transition-all flex-shrink-0 group/btn"
                title="View Full Leaderboard"
                aria-label="Open full leaderboard"
              >
                <Maximize2 style={{ width: '18px', height: '18px' }} className="group-hover/btn:scale-110 transition-transform" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="overflow-y-auto pr-1 space-y-1.5 custom-scrollbar" style={{ maxHeight: '100px' }}>
                {filteredByLevel.length > 0 ? (
                  filteredByLevel.slice(0, 3).map((student, index) => {
                    const rank = student.globalRank || index + 1
                    const medal = getMedalIcon(rank)
                    
                    return (
                      <div
                        key={student.globalRank || index}
                        className="group/item flex items-center gap-2 p-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200"
                      >
                        <div className="relative flex-shrink-0">
                          <div
                            className={`rounded-lg flex items-center justify-center font-extrabold text-xs transition-transform group-hover/item:scale-105 ${getRankColors(rank)}`}
                            style={{ width: '32px', height: '32px' }}
                          >
                            {medal || rank}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate group-hover/item:text-indigo-600 transition-colors">
                            {student.realName}
                          </p>
                          <p className="text-xs text-gray-500 truncate" style={{ fontSize: '10px' }}>
                            {student.robloxName || "No Roblox ID"}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0 text-right">
                          {student.level && (
                            <span className="inline-block text-xs font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full mb-0.5" style={{ fontSize: '9px' }}>
                              {student.level}
                            </span>
                          )}
                          <div className="flex items-center gap-0.5 justify-end">
                            <span className="text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {student.highestScore ?? 0}
                            </span>
                            <span className="text-xs text-gray-500 font-medium" style={{ fontSize: '9px' }}>pts</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-gray-400">
                    <Trophy style={{ width: '40px', height: '40px' }} className="mb-2 opacity-30" />
                    <p className="text-xs font-semibold">No rankings yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 10px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
        }
      `}</style>
    </div>
  )
}

export default StatsCards