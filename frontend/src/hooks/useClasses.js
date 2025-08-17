"use client"

import { useState, useEffect } from "react"
import fetchWithAuth from "../jwt/authInterceptor"

const API_BASE_URL = process.env.REACT_APP_API_URL

export const useClasses = () => {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/classes/my-classes`)
        if (!response.ok) {
          throw new Error("Failed to fetch classes")
        }
        const data = await response.json()
        setClasses(data)

        // Select first class by default if available
        if (data.length > 0) {
          setSelectedClass(data[0])
        }
      } catch (err) {
        console.error("Error fetching classes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  return {
    classes,
    selectedClass,
    setSelectedClass,
    loading,
  }
}
