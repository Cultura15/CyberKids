"use client"

import { useState, useEffect } from "react"
import fetchWithAuth from "../jwt/authInterceptor"

const API_BASE_URL = process.env.REACT_APP_API_URL

export const useStudents = (selectedClass) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch students for a specific class
  const fetchStudentsForClass = async (grade, section) => {
    setLoading(true)
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/classes/grade/${grade}/section/${section}/students/summary`)
      if (!response.ok) {
        throw new Error("Failed to fetch students for this class")
      }
      const data = await response.json()
      setStudents(data)
    } catch (err) {
      console.error("Error fetching students for class:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsForClass(selectedClass.grade, selectedClass.section)
    }
  }, [selectedClass])

  return {
    students,
    loading,
    fetchStudentsForClass,
  }
}
