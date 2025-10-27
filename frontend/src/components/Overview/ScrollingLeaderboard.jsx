"use client"

import { Trophy, Star, Medal, Crown, TrendingUp, Info } from "lucide-react"
import { motion, useAnimation } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { useOverallLeaderboard } from "../../hooks/useOverallLeaderboard"

const ScrollingLeaderboard = () => {
  const { leaderboard, loading, error } = useOverallLeaderboard()
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef(null)
  const controls = useAnimation()
  const [contentHeight, setContentHeight] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return {
          badge: "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/50",
          card: "bg-gradient-to-r from-yellow-50 via-white to-yellow-50 border-yellow-300 shadow-md",
          glow: "ring-2 ring-yellow-400/50",
        }
      case 2:
        return {
          badge: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 text-white shadow-lg shadow-gray-500/50",
          card: "bg-gradient-to-r from-gray-50 via-white to-gray-50 border-gray-300 shadow-md",
          glow: "ring-2 ring-gray-400/50",
        }
      case 3:
        return {
          badge: "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/50",
          card: "bg-gradient-to-r from-amber-50 via-white to-amber-50 border-amber-300 shadow-md",
          glow: "ring-2 ring-amber-400/50",
        }
      default:
        return {
          badge: "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300",
          card: "bg-white border-gray-200",
          glow: "",
        }
    }
  }

  const renderLeaderboard = () =>
    leaderboard.map((student, index) => {
      const actualRank = student.globalRank || index + 1
      const styles = getRankStyle(actualRank)
      const isTopThree = actualRank <= 3

      return (
        <div
          key={`${student.globalRank}-${student.robloxName}-${index}`}
          className={`${styles.card} ${styles.glow} border rounded-xl p-3.5 hover:scale-[1.02] transition-all duration-300 group cursor-default`}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center font-extrabold text-base ${styles.badge} transition-transform group-hover:scale-110`}
              >
                {isTopThree ? getRankIcon(actualRank) : <span>#{actualRank}</span>}
              </div>
              {isTopThree && (
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Star className="h-2.5 w-2.5 text-yellow-500 fill-yellow-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={`text-sm font-bold truncate ${
                    isTopThree ? "text-gray-900" : "text-gray-800"
                  }`}
                >
                  {student.realName || "Anonymous"}
                </h4>
                {isTopThree && (
                  <div className="flex-shrink-0">
                    <div className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-full">
                      TOP {actualRank}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 truncate">
                  {student.robloxName || "No Roblox ID"}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <p
                  className={`text-xl font-extrabold ${
                    isTopThree
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                      : "text-indigo-600"
                  }`}
                >
                  {student.highestScore || 0}
                </p>
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              </div>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                Points
              </p>
            </div>
          </div>
        </div>
      )
    })

  // 🌀 Scroll Animation Controller
  useEffect(() => {
    if (!scrollRef.current || leaderboard.length === 0) return

    const container = scrollRef.current
    const content = container.firstElementChild
    if (!content) return

    const updateHeights = () => {
      setContentHeight(content.scrollHeight)
      setContainerHeight(container.clientHeight)
    }

    updateHeights()
    window.addEventListener("resize", updateHeights)
    return () => window.removeEventListener("resize", updateHeights)
  }, [leaderboard])

  // Auto-scroll using Framer Motion + manual scrolling
  useEffect(() => {
    if (isPaused || leaderboard.length === 0 || !contentHeight) return

    const distance = contentHeight - containerHeight
    if (distance <= 0) return

    const scrollDuration = Math.max(15, distance / 20) // dynamic speed
    controls.start({
      y: [-distance, 0],
      transition: {
        duration: scrollDuration,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      },
    })
  }, [isPaused, contentHeight, containerHeight, leaderboard])

  return (
    <div className="relative bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
     {/* Header */}
<div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 relative z-[50]">
  <div className="flex items-center justify-between">
    {/* Left: Title */}
    <div className="flex items-center gap-3">
      <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
        <Trophy className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white">Overall Rankings</h3>
        <p className="text-xs text-indigo-100">All Classes Leaderboard</p>
      </div>
    </div>

   {/* Right: Info Icon with Tooltip */}
    <div className="relative group">
      <Info className="h-5 w-5 text-white cursor-help transition-transform duration-200 group-hover:scale-110" />

      {/* Tooltip */}
      <div className="absolute right-0 top-full mt-3 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
        <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
        <p className="font-semibold mb-1">About Overall Rankings</p>
        <p className="text-gray-300 leading-relaxed">
          Displays all ranked students across every class, based on their best performance across all levels.
        </p>
      </div>
    </div>
  </div>
</div>


      {/* Scrolling Area */}
      <div
        ref={scrollRef}
        className="h-[420px] overflow-y-auto relative custom-scrollbar"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p>Loading rankings...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <Trophy className="h-10 w-10 mb-2" />
            <p>{error}</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Trophy className="h-10 w-10 mb-2" />
            <p>No rankings yet</p>
          </div>
        ) : (
          <motion.div animate={controls} className="space-y-2.5 py-3">
            {renderLeaderboard()}
          </motion.div>
        )}
      </div>

      {/* Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #818cf8, #6366f1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}

export default ScrollingLeaderboard
