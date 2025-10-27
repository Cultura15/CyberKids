// src/components/Class/ClassSidebar.jsx
"use client"

import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Users, HelpCircle, Layout, Shield, Key, Eye } from "lucide-react"

const ClassSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // Determine if we're in world management mode
  const isWorldManagement = location.pathname.startsWith("/dashboard/world-management")

  // Class menu items
  const classMenuItems = [
    { label: "My Class", icon: Users, path: "/dashboard/myclass" },
    { label: "Create Class", icon: Layout, path: "/dashboard/myclass/create-class" },
    { label: "Create Questions", icon: HelpCircle, path: "/dashboard/questions" },
  ]

  // World management menu items
  const worldMenuItems = [
    { 
      label: "Game World 1", 
      subtitle: "Info Classification",
      icon: Shield, 
      path: "/dashboard/world-management/CyberKids1",
      color: "text-emerald-600"
    },
    { 
      label: "Game World 2", 
      subtitle: "Password Security",
      icon: Key, 
      path: "/dashboard/world-management/CyberKids2",
      color: "text-blue-600"
    },
    { 
      label: "Game World 3", 
      subtitle: "Phishing ID",
      icon: Eye, 
      path: "/dashboard/world-management/CyberKids3",
      color: "text-purple-600"
    },
  ]

  const menuItems = isWorldManagement ? worldMenuItems : classMenuItems

  const handleNavigation = (path) => navigate(path)

  return (
    <aside
      className="
        fixed left-0 top-0 w-56 lg:w-64 h-screen z-40
        bg-white border-r border-gray-200
        shadow-[6px_0_25px_rgba(0,0,0,0.05),10px_0_40px_rgba(0,0,0,0.04)]
        flex flex-col transition-all duration-300
      "
    >
      {/* Header */}
      <div className="px-5 py-6 border-b border-gray-200">
        <h2 className="text-gray-800 text-base font-semibold uppercase tracking-wide">
          {isWorldManagement ? "Game Worlds" : "Class Menu"}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {isWorldManagement ? "Select a game world" : "Manage your classroom tools"}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-8 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard/myclass" && location.pathname.startsWith(item.path))

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`relative w-full group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-300
                ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-md"
                    : "text-gray-700 hover:bg-gray-50 hover:text-indigo-700 hover:shadow-sm"
                }`}
            >
              {/* Animated shimmer background on hover */}
              <span
                className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
              )}

              {/* Icon */}
              <Icon
                className={`h-5 w-5 relative z-10 transition-transform duration-200 ${
                  isActive
                    ? item.color || "text-indigo-600 scale-110"
                    : `${item.color || "text-gray-500"} group-hover:text-indigo-600 group-hover:scale-110`
                }`}
              />

              {/* Label */}
              <div className="relative z-10 flex-1 text-left transition-transform duration-200 group-hover:translate-x-0.5">
                <div className="font-medium">{item.label}</div>
                {item.subtitle && (
                  <div className="text-xs text-gray-500 mt-0.5">{item.subtitle}</div>
                )}
              </div>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default ClassSidebar