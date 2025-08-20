"use client"

import { LogOut, ChevronDown } from "lucide-react"

const ProfileDropdown = ({
  teacherProfile,
  userData,
  dropdownOpen,
  setDropdownOpen,
  onLogout,
  getTeacherName,
  getProfilePicture,
}) => {
  return (
    <>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <img
          src={getProfilePicture() || "/placeholder.svg"}
          alt="Profile"
          className="h-8 w-8 rounded-full object-cover border-2 border-indigo-100"
        />
        <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">{getTeacherName()}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center">
              <img
                src={getProfilePicture() || "/placeholder.svg"}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-indigo-100 mr-3"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{getTeacherName()}</p>
                <p className="text-xs text-gray-500">
                  {teacherProfile?.email || userData?.email || "teacher@example.com"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      )}
    </>
  )
}

export default ProfileDropdown
