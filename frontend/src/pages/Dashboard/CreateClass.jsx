"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, GraduationCap, Plus, Palette, Users, Sparkles, Info } from "lucide-react"
import fetchWithAuth from "../../jwt/authInterceptor"

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const nunitoFont = {
  fontFamily: "'Nunito', sans-serif",
}

// Enhanced color theme options
const COLOR_THEMES = [
  { 
    name: "Indigo Purple", 
    gradient: "from-indigo-500 to-purple-600",
    preview: "bg-gradient-to-r from-indigo-500 to-purple-600",
    value: "indigo-purple",
    icon: "💜"
  },
  { 
    name: "Blue Cyan", 
    gradient: "from-blue-500 to-cyan-600",
    preview: "bg-gradient-to-r from-blue-500 to-cyan-600",
    value: "blue-cyan",
    icon: "💙"
  },
  { 
    name: "Green Emerald", 
    gradient: "from-green-500 to-emerald-600",
    preview: "bg-gradient-to-r from-green-500 to-emerald-600",
    value: "green-emerald",
    icon: "💚"
  },
  { 
    name: "Orange Red", 
    gradient: "from-orange-500 to-red-600",
    preview: "bg-gradient-to-r from-orange-500 to-red-600",
    value: "orange-red",
    icon: "🧡"
  },
  { 
    name: "Pink Rose", 
    gradient: "from-pink-500 to-rose-600",
    preview: "bg-gradient-to-r from-pink-500 to-rose-600",
    value: "pink-rose",
    icon: "💗"
  },
  { 
    name: "Violet Fuchsia", 
    gradient: "from-violet-500 to-fuchsia-600",
    preview: "bg-gradient-to-r from-violet-500 to-fuchsia-600",
    value: "violet-fuchsia",
    icon: "💜"
  },
]

const CreateClass = () => {
  const navigate = useNavigate()
  const [newGrade, setNewGrade] = useState("")
  const [newSection, setNewSection] = useState("")
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0])
  const [maxStudents, setMaxStudents] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(false)

  const handleCreateClass = async () => {
    if (!newGrade.trim() || !newSection.trim()) {
      setError("Please enter both grade and section")
      setTimeout(() => setError(null), 3000)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetchWithAuth(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grade: newGrade,
          section: newSection,
          colorTheme: selectedTheme.value,
          maxStudents: maxStudents ? parseInt(maxStudents) : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create class")
      }

      const createdClass = await response.json()

      // Show success animation
      setSuccessMessage(true)
      
      setTimeout(() => {
        navigate("/dashboard/myclass", { state: { refresh: true } })
      }, 1500)
    } catch (err) {
      console.error("Error creating class:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/dashboard/myclass")
  }

  return (
    <div className="space-y-6 mt-8" style={nunitoFont}>
      {/* Page Header with enhanced design */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancel}
            className="group p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 group-hover:text-gray-800 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Create New Class
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 rounded-xl animate-slideIn">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-green-800">Class Created Successfully!</p>
              <p className="text-sm text-green-700">Redirecting to your classes...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 p-4 rounded-xl animate-shake">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-red-500 rounded-full flex items-center justify-center">
              <Info className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-red-800">Error Creating Class</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Class Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition-shadow">
          <div className="space-y-6">
            {/* Grade Input */}
            <div className="group">
              <label htmlFor="grade" className="block text-sm font-extrabold text-gray-700 mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-500" />
                Grade Level <span className="text-red-500">*</span>
              </label>
              <input
                id="grade"
                type="text"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all hover:border-gray-300"
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Section Input */}
            <div className="group">
              <label htmlFor="section" className="block text-sm font-extrabold text-gray-700 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Section <span className="text-red-500">*</span>
              </label>
              <input
                id="section"
                type="text"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all hover:border-gray-300"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Max Students Input */}
            <div className="group">
              <label htmlFor="maxStudents" className="block text-sm font-extrabold text-gray-700 mb-2">
                Maximum Students 
                <span className="text-gray-400 text-xs font-semibold ml-2">(Optional)</span>
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="maxStudents"
                  type="number"
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-gray-300"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                  disabled={loading}
                  min="1"
                />
              </div>
            </div>

            {/* Color Theme Selection */}
            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4 text-pink-500" />
                Color Theme <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    disabled={loading}
                    className={`group/theme relative p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      selectedTheme.value === theme.value
                        ? "border-indigo-500 shadow-lg scale-105 ring-2 ring-indigo-200"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className={`h-16 w-full rounded-lg ${theme.preview} mb-2 shadow-md`}>
                      <div className="h-full w-full bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{theme.icon}</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-700 text-center">{theme.name}</p>
                    {selectedTheme.value === theme.value && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full p-1.5 shadow-lg animate-bounce">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCreateClass}
                disabled={loading || !newGrade.trim() || !newSection.trim()}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all text-sm font-extrabold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
                    Create Class
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all text-sm font-extrabold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
                Preview
              </h3>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            {/* Class Card Preview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 transform hover:scale-105 transition-transform">
              <div className={`bg-gradient-to-br ${selectedTheme.gradient} p-6 text-white relative overflow-hidden`}>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                
                <div className="relative flex flex-col items-center justify-center text-center">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl mb-3">
                    <GraduationCap className="h-10 w-10" />
                  </div>
                  <h3 className="font-extrabold text-xl mb-1">
                    {newGrade || "Grade"} - {newSection || "Section"}
                  </h3>
                  
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mt-3">
                    <span className="text-xs font-extrabold tracking-wider">Code: XXXXX</span>
                  </div>

                  <div className="flex items-center gap-2 mt-3 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-bold">
                      0 / {maxStudents || "∞"} students
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-t-2 border-gray-200 text-center">
                <span className="text-indigo-600 font-extrabold text-xs flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Click to view students
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
              <div className="flex gap-2">
                <Info className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-800 font-semibold">
                  After creating the class, you'll receive a unique class code that students can use to join.
                </p>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-4 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
              <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Quick Tips
              </p>
              <ul className="text-xs text-amber-800 font-semibold space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Choose a distinct color for easy identification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Grade and Section are required fields</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>Set a max limit to control class size</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default CreateClass