"use client"

import { useEffect, useState } from "react"
import { useWorldStatus } from "../../hooks/useWorldStatus"
import { useClasses } from "../../hooks/useClasses"
import { useGlobalLeaderboard } from "../../hooks/useGlobalLeaderboard"
import fetchWithAuth from "../../jwt/authInterceptor"

import LoadingSpinner from "../../components/Overview/LoadingSpinner"
import ClassSelector from "../../components/Overview/ClassSelector"
import ChallengeSelector from "../../components/Overview/ChallengeSelector"
import StatsCards from "../../components/Overview/StatsCards"
import LeaderboardModal from "../../components/Overview/LeaderboardModal"
import TeacherProfileCard from "../../components/Overview/TeacherProfileCard"
import LatestReports from "../../components/Overview/LatestReports"
import ScrollingLeaderboard from "../../components/Overview/ScrollingLeaderboard"
import { GAME_WORLDS, poppinsFont } from "../../utils/gameWorldsConfig"

// 🔹 Lazy load initial values from localStorage before first render
const getInitialChallenge = () => {
  if (typeof window !== "undefined") {
    const savedName = localStorage.getItem("selectedChallengeName")
    if (savedName) {
      const found = GAME_WORLDS.find((w) => w.name === savedName)
      if (found) return found
    }
  }
  return GAME_WORLDS[0] // fallback default
}

const getInitialClass = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("selectedClass")
    if (saved) return JSON.parse(saved)
  }
  return null
}

const Overview = ({ notifications = [], onMarkAsRead, onDeleteNotification }) => {
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)
  const [challengeDropdownOpen, setChallengeDropdownOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState(getInitialChallenge)
  const [selectedClass, setSelectedClass] = useState(getInitialClass)
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false)
  const [totalStudents, setTotalStudents] = useState(null)

  // Custom hooks
  const { worldStatus, updateWorldStatus } = useWorldStatus(GAME_WORLDS)
  const { classes, loading: classesLoading } = useClasses()
  const {
    leaderboard,
    loading: leaderboardLoading,
    getSortedStudents,
  } = useGlobalLeaderboard(selectedClass, selectedChallenge?.level)

  // 🔹 Save selections when changed
  useEffect(() => {
    if (selectedClass)
      localStorage.setItem("selectedClass", JSON.stringify(selectedClass))
    if (selectedChallenge)
      localStorage.setItem("selectedChallengeName", selectedChallenge.name)
  }, [selectedClass, selectedChallenge])

  // 🔹 Handle selection + auto-close dropdowns
  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj)
    setClassDropdownOpen(false)
  }

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge)
    setChallengeDropdownOpen(false)
  }

  // 🆕 Fetch total enrolled students for selected class
  useEffect(() => {
    const fetchStudentCount = async () => {
      if (!selectedClass) return setTotalStudents(null)
      try {
        const response = await fetchWithAuth(
          `${process.env.REACT_APP_API_BASE_URL}/grade/${selectedClass.grade}/section/${selectedClass.section}/students/summary`
        )
        if (response.ok) {
          const data = await response.json()
          setTotalStudents(data.length)
        } else {
          setTotalStudents(0)
        }
      } catch (err) {
        console.error("Error fetching student count:", err)
        setTotalStudents(0)
      }
    }

    fetchStudentCount()
  }, [selectedClass])

  if (classesLoading) return <LoadingSpinner />

  return (
    <div className="flex gap-6" style={poppinsFont}>
      {/* Left Sidebar - Teacher Profile */}
      <div className="w-80 flex-shrink-0">
        <TeacherProfileCard />
      </div>

      {/* Center Content */}
      <div className="flex-1 space-y-6">
        {/* Header with Class and Challenge Selectors */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <ClassSelector
              classes={classes}
              selectedClass={selectedClass}
              onClassSelect={handleClassSelect}
              isOpen={classDropdownOpen}
              onToggle={() => setClassDropdownOpen(!classDropdownOpen)}
            />
            <ChallengeSelector
              challenges={GAME_WORLDS}
              selectedChallenge={selectedChallenge}
              onChallengeSelect={handleChallengeSelect}
              isOpen={challengeDropdownOpen}
              onToggle={() => setChallengeDropdownOpen(!challengeDropdownOpen)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          leaderboard={leaderboard}
          selectedChallenge={selectedChallenge}
          selectedClass={selectedClass}
          getSortedStudents={getSortedStudents}
          onLeaderboardOpen={() => setLeaderboardModalOpen(true)}
          totalStudents={totalStudents}
        />
      </div>

      {/* Right Sidebar - Reports and Scrolling Leaderboard */}
      <div className="w-80 flex-shrink-0 space-y-6">
        <LatestReports 
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onDeleteNotification={onDeleteNotification}
        />
        {/* 🆕 Independent ScrollingLeaderboard - no props needed */}
        <ScrollingLeaderboard />
      </div>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={leaderboardModalOpen}
        selectedClass={selectedClass}
        students={leaderboard}
        onClose={() => setLeaderboardModalOpen(false)}
        loading={leaderboardLoading}
      />
    </div>
  )
}

export default Overview