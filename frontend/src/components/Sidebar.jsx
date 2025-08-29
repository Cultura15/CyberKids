"use client"

import { Award, Settings, BookOpen, Shield } from "lucide-react"
import { useNavigate } from "react-router-dom"

// Constants
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Award },
  { id: "class", label: "Class", icon: BookOpen },
  { id: "questions", label: "Questions", icon: BookOpen },
  { id: "settings", label: "Settings", icon: Settings },
]

// Cybersecurity font style
const cyberFont = {
  fontFamily: "'Orbitron', sans-serif",
  letterSpacing: "1px",
}

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate()

  // Logout handler
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("jwtToken")
    localStorage.removeItem("tokenExpiry")
    localStorage.removeItem("teacherData")

    navigate("/login")
  }

  return (
    <div className="bg-white w-64 flex-shrink-0 h-screen flex flex-col transition-all duration-300 ease-in-out shadow-lg border-r border-gray-100">
      {/* Logo and Heading */}
      <div className="mb-8 text-center pt-6">
        <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
          <div className="relative">
            {/* Cybersecurity Shield Logo */}
            <Shield className="w-7 h-7 text-white" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full opacity-80"></div>
            </div>
            {/* Circuit pattern overlay */}
            <div className="absolute -top-1 -right-1 w-2 h-2 border border-white opacity-60 rounded-sm"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 border border-white opacity-40 rounded-sm"></div>
          </div>
        </div>
        <h1
          className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
          style={cyberFont}
        >
          CyberKids
        </h1>
  
      </div>

      {/* Navigation */}
      <div className="px-4 flex-grow">
        <nav>
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                    activeTab === item.id
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center h-8 w-8 rounded-md mr-3 transition-all ${
                      activeTab === item.id
                        ? "bg-indigo-500 text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-500"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="font-medium">{item.label}</span>

                  {activeTab === item.id && <span className="ml-auto w-1.5 h-8 bg-indigo-500 rounded-full"></span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Footer with Logout */}
      <div className="mt-auto p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium rounded-lg transition flex items-center justify-center hover:bg-indigo-50"
        >
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17L21 12L16 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Logout
        </button>
        <div className="flex items-center justify-center mt-4">
          <span className="text-xs text-gray-400">Teacher Dashboard v1.0</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
