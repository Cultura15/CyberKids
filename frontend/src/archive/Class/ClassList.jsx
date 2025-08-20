"use client"

import { Plus, Users, GraduationCap, CopyIcon, CheckCircle } from "lucide-react"

const ClassList = ({
  classes,
  searchQuery,
  setSearchQuery,
  isCreatingClass,
  setIsCreatingClass,
  isEditingClass,
  setIsEditingClass,
  newClassName,
  setNewClassName,
  newGrade,
  setNewGrade,
  newSection,
  setNewSection,
  loading,
  error,
  createClass,
  updateClass,
  deleteClass,
  handleClassSelect,
  handleEditClass,
  copyClassCode,
  copiedClassCode,
  poppinsFont,
}) => {
  // 🔹 Show full-page loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={poppinsFont}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  // 🔹 Show error state
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700" style={poppinsFont}>
        <p className="font-medium text-lg">Error loading class data</p>
        <p className="text-base">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-8" style={poppinsFont}>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold text-gray-800">Class Management</h2>
        <p className="text-lg text-gray-600">Create and manage student classes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 🔹 Create New Class Form / Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-dashed border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
          {isCreatingClass ? (
            <div className="w-full">
              <div className="mb-4">
                <label htmlFor="grade" className="block text-base font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <input
                  id="grade"
                  type="text"
                  placeholder="e.g. Grade 5"
                  className="w-full p-2 border border-gray-300 rounded-lg text-base"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="section" className="block text-base font-medium text-gray-700 mb-1">
                  Section
                </label>
                <input
                  id="section"
                  type="text"
                  placeholder="e.g. A"
                  className="w-full p-2 border border-gray-300 rounded-lg text-base"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={createClass}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex-1 text-base flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Create"
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsCreatingClass(false)
                    setNewGrade("")
                    setNewSection("")
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreatingClass(true)}
              className="flex flex-col items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <Plus className="h-7 w-7" />
              </div>
              <span className="font-medium text-lg">Create New Class</span>
            </button>
          )}
        </div>

        {/* 🔹 Class List */}
        {classes.map((cls) => (
          <div
            key={cls.id}
            onClick={() => handleClassSelect(cls.id)}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-transparent hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex flex-col items-center justify-center text-center">
                <GraduationCap className="h-14 w-14 mb-2" />
                <h3 className="font-bold text-2xl mb-1">
                  {cls.grade} - {cls.section}
                </h3>

                {cls.classCode && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-mono font-bold tracking-wider">Code: {cls.classCode}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyClassCode(cls.classCode)
                      }}
                      className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      title="Copy class code"
                    >
                      {copiedClassCode === cls.classCode ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <CopyIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span className="text-base">{cls.students ? cls.students.length : 0} students</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
              <span className="text-indigo-600 font-medium text-base">Click to view students</span>
            </div>
          </div>
        ))}

        {/* 🔹 Empty State */}
        {classes.length === 0 && !isCreatingClass && (
          <div className="col-span-full bg-gray-50 rounded-lg p-8 text-center">
            <GraduationCap className="h-14 w-14 mx-auto text-gray-300 mb-3" />
            <h3 className="text-xl font-medium text-gray-700 mb-1">No Classes Found</h3>
            <p className="text-lg text-gray-500 mb-4">Create your first class to get started.</p>
            <button
              onClick={() => setIsCreatingClass(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-base"
            >
              Create Class
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClassList
