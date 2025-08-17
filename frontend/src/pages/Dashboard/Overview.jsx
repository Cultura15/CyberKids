"use client"

import { useState } from "react"
import fetchWithAuth from "../../jwt/authInterceptor"

// Custom hooks
import { useWorldStatus } from "../../hooks/useWorldStatus"
import { useClasses } from "../../hooks/useClasses"
import { useStudents } from "../../hooks/useStudents"
import { useLeaderboard } from "../../hooks/useLeaderboard"

// Components
import LoadingSpinner from "../../components/Overview/LoadingSpinner"
import ClassSelector from "../../components/Overview/ClassSelector"
import ChallengeSelector from "../../components/Overview/ChallengeSelector"
import StatsCards from "../../components/Overview/StatsCards"
import GameWorldsSection from "../../components/Overview/GameWorldsSection"
import ConfirmationModal from "../../components/Overview/ConfirmationModal"
import LeaderboardModal from "../../components/Overview/LeaderboardModal"

// Utils and config
import { GAME_WORLDS, poppinsFont } from "../../utils/gameWorldsConfig"

const API_BASE_URL = process.env.REACT_APP_API_URL

const Overview = () => {
  // Custom hooks
  const { worldStatus, updateWorldStatus } = useWorldStatus(GAME_WORLDS)
  const { classes, selectedClass, setSelectedClass, loading: classesLoading } = useClasses()
  const { students, loading: studentsLoading, fetchStudentsForClass } = useStudents(selectedClass)
  const { sortField, sortDirection, handleSort, getSortedStudents } = useLeaderboard(students)

  // Local state for UI interactions
  const [actionLoading, setActionLoading] = useState({})
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState(GAME_WORLDS[0])
  const [challengeDropdownOpen, setChallengeDropdownOpen] = useState(false)
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  // Handle class selection
  const handleClassSelect = (classObj) => {
    setSelectedClass(classObj)
    setClassDropdownOpen(false)
    fetchStudentsForClass(classObj.grade, classObj.section)
  }

  // Handle challenge selection
  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge)
    setChallengeDropdownOpen(false)
  }

  // Show confirmation modal for locking/unlocking world
  const showConfirmModal = (worldName) => {
    const isLocked = worldStatus[worldName]
    const world = GAME_WORLDS.find((w) => w.name === worldName)

    setConfirmAction({
      worldName,
      isLocked,
      world,
    })
    setConfirmModalOpen(true)
  }

  // Lock/unlock world
  const toggleWorldLock = async (worldName, isLocked) => {
    setConfirmModalOpen(false)
    setActionLoading((prev) => ({ ...prev, [worldName]: true }))

    try {
      const endpoint = isLocked ? "unlock-world" : "lock-world"

      const response = await fetchWithAuth(`${API_BASE_URL}/api/teacher/${endpoint}?worldName=${worldName}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isLocked ? "unlock" : "lock"} world`)
      }

      // Add a delay to ensure the world is fully locked/unlocked
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update world status
      updateWorldStatus(worldName, !isLocked)
    } catch (err) {
      console.error(`Error toggling world lock for ${worldName}:`, err)
      alert(`Failed to ${worldStatus[worldName] ? "unlock" : "lock"} the world. Please try again.`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [worldName]: false }))
    }
  }

  // Handle confirmation modal actions
  const handleConfirmAction = () => {
    if (confirmAction) {
      toggleWorldLock(confirmAction.worldName, confirmAction.isLocked)
    }
  }

  // Loading state
  if (classesLoading && classes.length === 0 && students.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6 mt-6" style={poppinsFont}>
      {/* Page Header with Class Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
        </div>

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

      {/* Main Dashboard Content */}
      <StatsCards
        students={students}
        selectedChallenge={selectedChallenge}
        getSortedStudents={getSortedStudents}
        onLeaderboardOpen={() => setLeaderboardModalOpen(true)}
      />

      {/* Game Worlds Section */}
      <GameWorldsSection
        gameWorlds={GAME_WORLDS}
        worldStatus={worldStatus}
        actionLoading={actionLoading}
        onWorldToggle={showConfirmModal}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        confirmAction={confirmAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModalOpen(false)}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={leaderboardModalOpen}
        selectedClass={selectedClass}
        students={students}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        getSortedStudents={getSortedStudents}
        onClose={() => setLeaderboardModalOpen(false)}
      />
    </div>
  )
}

export default Overview
