// Calculate completion rate for a specific challenge
export const calculateCompletionRate = (students, challengeType) => {
  if (!students || students.length === 0) return { percentage: 0, completed: 0, total: 0 }

  const completedCount = students.filter(
    (student) =>
      student.challengeAttempts &&
      student.challengeAttempts.some(
        (attempt) => attempt.challengeType === challengeType && attempt.completionStatus === "Completed"
      )
  ).length

  return {
    percentage: students.length > 0 ? Math.round((completedCount / students.length) * 100) : 0,
    completed: completedCount,
    total: students.length,
  }
}

// Get progress bar color based on completion percentage
export const getProgressBarColor = (percentage) => {
  if (percentage >= 71) return "bg-green-500"
  if (percentage >= 41) return "bg-yellow-500"
  return "bg-red-500"
}

// Get sorted students for leaderboard
export const getSortedStudents = (students, sortField, sortDirection) => {
  if (!students || students.length === 0) return []

  return [...students].sort((a, b) => {
    // For demo purposes, generate random points
    const aPoints = a.points || Math.floor(Math.random() * 100)
    const bPoints = b.points || Math.floor(Math.random() * 100)

    if (sortField === "name") {
      const aName = a.realName || ""
      const bName = b.realName || ""
      return sortDirection === "asc" ? aName.localeCompare(bName) : bName.localeCompare(aName)
    } else {
      // Sort by points
      return sortDirection === "asc" ? aPoints - bPoints : bPoints - aPoints
    }
  })
}

// Get icon component by name
export const getIconByName = (iconName, iconMap) => {
  return iconMap[iconName] || iconMap.Shield
}