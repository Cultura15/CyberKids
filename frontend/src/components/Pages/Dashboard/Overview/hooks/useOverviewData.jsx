import { useState, useEffect, useCallback } from "react"
import fetchWithAuth from "../../../../JWT/authInterceptor"
import { API_BASE_URL } from "../constants"

export const useOverviewData = () => {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState(null)

  // Fetch classes on component mount
  const fetchClasses = useCallback(async () => {
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
        fetchStudentsForClass(data[0].grade, data[0].section)
      } else {
        setLoading(false)
      }
    } catch (err) {
      console.error("Error fetching classes:", err)
      setLoading(false)
    }
  }, [])

  // Fetch students for a specific class
  const fetchStudentsForClass = useCallback(async (grade, section) => {
    setLoading(true)
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/classes/grade/${grade}/section/${section}/students`
      )
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
  }, [])

  // Handle class selection
  const handleClassSelect = useCallback((classObj) => {
    setSelectedClass(classObj)
    fetchStudentsForClass(classObj.grade, classObj.section)
  }, [fetchStudentsForClass])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  return {
    students,
    classes,
    loading,
    selectedClass,
    handleClassSelect,
    fetchStudentsForClass,
  }
}