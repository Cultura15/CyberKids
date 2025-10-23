"use client"

import { useState } from "react"
import { useWorldStatus } from "../../hooks/useWorldStatus"
import { useClasses } from "../../hooks/useClasses"
import { useGlobalLeaderboard } from "../../hooks/useGlobalLeaderboard"

import LoadingSpinner from "../../components/Overview/LoadingSpinner"
import ClassSelector from "../../components/Overview/ClassSelector"
import ChallengeSelector from "../../components/Overview/ChallengeSelector"
import StatsCards from "../../components/Overview/StatsCards"
import GameWorldsSection from "../../components/Overview/GameWorldsSection"
import ConfirmationModal from "../../components/Overview/ConfirmationModal"
import LeaderboardModal from "../../components/Overview/LeaderboardModal"
import { GAME_WORLDS, poppinsFont } from "../../utils/gameWorldsConfig"

const Overview = () => {
  const [actionLoading, setActionLoading] = useState({})
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)
  const [challengeDropdownOpen, setChallengeDropdownOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState(GAME_WORLDS[0])
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  // Custom hooks
  const { worldStatus, updateWorldStatus } = useWorldStatus(GAME_WORLDS)
  const { classes, selectedClass, setSelectedClass, loading: classesLoading } = useClasses()
  const {
    leaderboard,
    loading: leaderboardLoading,
    sortField,
    sortDirection,
    handleSort,
    getSortedStudents,
  } = useGlobalLeaderboard(selectedClass, selectedChallenge?.level)

  // Handle class/challenge selection
  const handleClassSelect = (classObj) => setSelectedClass(classObj)
  const handleChallengeSelect = (challenge) => setSelectedChallenge(challenge)

  // Confirmation modal
  const showConfirmModal = (worldName) => {
    const isLocked = worldStatus[worldName]
    const world = GAME_WORLDS.find((w) => w.name === worldName)
    setConfirmAction({ worldName, isLocked, world })
    setConfirmModalOpen(true)
  }

  const toggleWorldLock = async (worldName, isLocked) => {
    setConfirmModalOpen(false)
    setActionLoading((prev) => ({ ...prev, [worldName]: true }))

    try {
      const endpoint = isLocked ? "unlock-world" : "lock-world"
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/teacher/${endpoint}?worldName=${worldName}`, { method: "POST" })
      if (!response.ok) throw new Error(`Failed to ${isLocked ? "unlock" : "lock"} world`)
      updateWorldStatus(worldName, !isLocked)
    } catch (err) {
      console.error(err)
      alert(`Failed to ${worldStatus[worldName] ? "unlock" : "lock"} the world`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [worldName]: false }))
    }
  }

  const handleConfirmAction = () => confirmAction && toggleWorldLock(confirmAction.worldName, confirmAction.isLocked)

  if (classesLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6 mt-6" style={poppinsFont}>
      {/* Header */}
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

      {/* Stats & Leaderboard */}
      <StatsCards
        students={leaderboard}
        leaderboard={leaderboard}
        selectedChallenge={selectedChallenge}
        getSortedStudents={getSortedStudents}
        onLeaderboardOpen={() => setLeaderboardModalOpen(true)}
      />

      {/* Game Worlds */}
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
        students={leaderboard}          // pass the full leaderboard
        onClose={() => setLeaderboardModalOpen(false)}
        loading={leaderboardLoading}    // loading state
      />
    </div>
  )
}

export default Overview
