// "use client"

// import { useState } from "react"

// export const useLeaderboard = (students) => {
//   const [sortField, setSortField] = useState("points")
//   const [sortDirection, setSortDirection] = useState("desc")

//   // Handle sorting for leaderboard
//   const handleSort = (field) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc")
//     } else {
//       setSortField(field)
//       setSortDirection("desc") // Default to descending for new sort field
//     }
//   }

//   // Get sorted students for leaderboard
//   const getSortedStudents = () => {
//     if (!students || students.length === 0) return []

//     return [...students].sort((a, b) => {
//       // For demo purposes, generate random points
//       const aPoints = a.points || Math.floor(Math.random() * 100)
//       const bPoints = b.points || Math.floor(Math.random() * 100)

//       if (sortField === "name") {
//         const aName = a.realName || ""
//         const bName = b.realName || ""
//         return sortDirection === "asc" ? aName.localeCompare(bName) : bName.localeCompare(aName)
//       } else {
//         // Sort by points
//         return sortDirection === "asc" ? aPoints - bPoints : bPoints - aPoints
//       }
//     })
//   }

//   return {
//     sortField,
//     sortDirection,
//     handleSort,
//     getSortedStudents,
//   }
// }
