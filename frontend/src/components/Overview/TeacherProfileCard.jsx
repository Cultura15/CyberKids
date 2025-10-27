"use client"

import { Mail, Users, Calendar, Award, TrendingUp, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

const TeacherProfileCard = () => {
  const [teacherData, setTeacherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalClasses, setTotalClasses] = useState(0)

  // Fetch Teacher Profile
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const token = localStorage.getItem("jwtToken")
        if (!token) throw new Error("Authentication token not found")

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        const response = await axios.get(`${API_URL}/api/teacher/profile`, { headers })
        setTeacherData(response.data)
      } catch (error) {
        console.error("Error fetching teacher profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherProfile()
  }, [])

  // Fetch total classes and total students
  useEffect(() => {
    const fetchClassAndStudentStats = async () => {
      try {
        const token = localStorage.getItem("jwtToken")
        if (!token) return

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }

        // Get all classes for teacher
        const classesResponse = await axios.get(`${API_URL}/api/classes/my-classes`, { headers })
        const classes = classesResponse.data || []
        setTotalClasses(classes.length)

        // Count total students across all classes
        let total = 0
        for (const cls of classes) {
          try {
            const studentsResponse = await axios.get(
              `${API_URL}/api/classes/grade/${cls.grade}/section/${cls.section}/students/summary`,
              { headers }
            )
            total += studentsResponse.data?.length || 0
          } catch (err) {
            console.error(`Error fetching students for ${cls.grade}-${cls.section}:`, err)
          }
        }

        setTotalStudents(total)
      } catch (error) {
        console.error("Error fetching class and student stats:", error)
      }
    }

    if (!loading && teacherData) {
      fetchClassAndStudentStats()
    }
  }, [loading])

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="h-12 w-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 h-12 w-12 border-4 border-transparent border-b-indigo-600 rounded-full animate-spin animation-delay-150"></div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback for profile picture
  const getProfilePicture = () => {
    if (teacherData?.profilePicture) return teacherData.profilePicture
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      teacherData?.name || "Teacher"
    )}&background=7c3aed&color=fff&size=200&bold=true`
  }

  // Get member duration
  const getMemberDuration = () => {
    if (!teacherData?.createdAt) return "Recently"
    const created = new Date(teacherData.createdAt)
    const now = new Date()
    const months = Math.floor((now - created) / (1000 * 60 * 60 * 24 * 30))
    
    if (months < 1) return "This month"
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`
    const years = Math.floor(months / 12)
    return `${years} year${years > 1 ? 's' : ''}`
  }

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* Header with Gradient Background */}
      <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 p-6 pb-20">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
        
        {/* Status Badge */}
        <div className="flex justify-end mb-2">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-white">Active</span>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="relative inline-block">
          <div className="relative">
            <img
              src={getProfilePicture()}
              alt={teacherData?.name || "Teacher"}
              className="h-20 w-20 rounded-2xl border-4 border-white shadow-xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-gradient-to-br from-green-400 to-green-500 rounded-lg border-2 border-white flex items-center justify-center shadow-lg">
              <Award className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>

        {/* Teacher Name */}
        <div className="mt-4">
          <h3 className="text-xl font-extrabold text-white mb-1">
            {teacherData?.name || "Teacher Name"}
          </h3>
          <p className="text-purple-200 text-sm font-semibold flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {teacherData?.email || "teacher@school.com"}
          </p>
        </div>
      </div>

      {/* Stats Cards - Overlapping Header */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          {/* Total Students */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {totalStudents}
            </p>
            <p className="text-xs text-gray-600 font-semibold mt-1">Students</p>
          </div>

          {/* Total Classes */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {totalClasses}
            </p>
            <p className="text-xs text-gray-600 font-semibold mt-1">Classes</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Profile Details
          </h4>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>

        <div className="space-y-3">
          {/* Email Detail */}
          <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-bold mb-0.5">Email Address</p>
              <p className="text-sm font-bold text-gray-800 truncate">
                {teacherData?.email || "N/A"}
              </p>
            </div>
          </div>

          {/* Total Classes Detail */}
          <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-bold mb-0.5">Managing Classes</p>
              <p className="text-sm font-bold text-gray-800">
                {totalClasses} {totalClasses === 1 ? 'Class' : 'Classes'}
              </p>
            </div>
          </div>

          {/* Member Since Detail */}
          <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all cursor-pointer">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-bold mb-0.5">Member Since</p>
              <p className="text-sm font-bold text-gray-800">
                {teacherData?.createdAt
                  ? new Date(teacherData.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "Recently"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {getMemberDuration()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Footer */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 p-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-purple-700">
          <Award className="h-5 w-5" />
          <p className="text-sm font-bold">Dedicated Educator</p>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </div>
  )
}

export default TeacherProfileCard