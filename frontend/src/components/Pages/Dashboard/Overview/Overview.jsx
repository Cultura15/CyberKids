"use client"

import React, { useState, useCallback } from "react"
import { GAME_WORLDS, POPPINS_FONT } from "./constants"
import { useOverviewData } from "./hooks/useOverviewData"
import { useWorldStatus } from "./hooks/useWorldStatus"
import DashboardHeader from "./components/DashboardHeader"
import DashboardCards from "./components/DashboardCards"
import GameWorlds from "./components/GameWorlds"
import LoadingSpinner from "./components/LoadingSpinner"
import { ConfirmationModal, LeaderboardModal } from "./components/Modals"

const Overview = () => {
  // Custom hooks for data management
  const { students, classes, loading, selectedClass, handleClassSelect } = useOverviewData()
  const { worldStatus, actionLoading, toggleWorldLock } = useWorldStatus()

  // Local state for UI interactions
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState(GAME_WORLDS[0])
  const [challengeDropdownOpen, setChallengeDropdownOpen] = useState(false)
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false)
  const [sortField, setSortField] = useState("points")
  const [sortDirection, setSortDirection] = useState("desc")
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  // Handle class selection with dropdown management
  const handleClassSelectWithDropdown = useCallback((classObj) => {
    handleClassSelect(classObj)
    setClassDropdownOpen(false)
  }, [handleClassSelect])

  // Handle challenge selection
  const handleChallengeSelect = useCallback((challenge) => {
    setSelectedChallenge(challenge)
    setChallengeDropdownOpen(false)
  }, [])

  // Show confirmation modal for locking/unlocking world
  const showConfirmModal = useCallback((worldName) => {
    const isLocked = worldStatus[worldName]
    const world = GAME_WORLDS.find((w) => w.name === worldName)

    setConfirmAction({
      worldName,
      isLocked,
      world,
    })
    setConfirmModalOpen(true)
  }, [worldStatus])

  // Handle world lock toggle with confirmation
  const handleWorldLockToggle = useCallback(async () => {
    if (!confirmAction) return
    
    setConfirmModalOpen(false)
    await toggleWorldLock(confirmAction.worldName, confirmAction.isLocked)
    setConfirmAction(null)
  }, [confirmAction, toggleWorldLock])

  // Handle sorting for leaderboard
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }, [sortField, sortDirection])

  // Loading state
  if (loading && classes.length === 0 && students.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6 mt-6" style={POPPINS_FONT}>
      {/* Dashboard Header */}
      <DashboardHeader
        classes={classes}
        selectedClass={selectedClass}
        classDropdownOpen={classDropdownOpen}
        setClassDropdownOpen={setClassDropdownOpen}
        onClassSelect={handleClassSelectWithDropdown}
        challenges={GAME_WORLDS}
        selectedChallenge={selectedChallenge}
        challengeDropdownOpen={challengeDropdownOpen}
        setChallengeDropdownOpen={setChallengeDropdownOpen}
        onChallengeSelect={handleChallengeSelect}
      />

      {/* Dashboard Cards */}
      <DashboardCards
        students={students}
        selectedChallenge={selectedChallenge}
        sortField={sortField}
        sortDirection={sortDirection}
        onLeaderboardOpen={() => setLeaderboardModalOpen(true)}
      />

      {/* Game Worlds Section */}
      <GameWorlds
        worldStatus={worldStatus}
        actionLoading={actionLoading}
        onWorldLockToggle={showConfirmModal}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        confirmAction={confirmAction}
        onClose={() => {
          setConfirmModalOpen(false)
          setConfirmAction(null)
        }}
        onConfirm={handleWorldLockToggle}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={leaderboardModalOpen}
        onClose={() => setLeaderboardModalOpen(false)}
        selectedClass={selectedClass}
        students={students}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  )
}

export default Overview