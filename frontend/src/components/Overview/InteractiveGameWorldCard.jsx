"use client"

import { useNavigate } from "react-router-dom"
import { Lock, Unlock, ArrowRight } from "lucide-react"
import { useState } from "react"

const InteractiveGameWorldCard = ({ world, isLocked, onToggle, isLoading }) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent = world.icon

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
    >
      <div
        className={`relative h-full rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-2xl ${
          isLocked
            ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300"
            : `bg-gradient-to-br from-${world.color}-50 to-${world.color}-100 border-${world.color}-200 hover:border-${world.color}-400`
        } ${isHovered ? "-translate-y-2" : ""}`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl transition-all duration-300 shadow-md ${
                  isLocked
                    ? "bg-gray-200"
                    : `bg-${world.color}-200 group-hover:bg-${world.color}-300 group-hover:scale-110`
                }`}
              >
                <IconComponent
                  className={`h-6 w-6 transition-all duration-300 ${
                    isLocked ? "text-gray-500" : `text-${world.color}-700`
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`text-lg font-bold transition-colors duration-300 ${
                    isLocked ? "text-gray-600" : `text-${world.color}-800`
                  }`}
                >
                  {world.displayName}
                </h3>
                <p className="text-xs text-gray-500 font-medium">{world.level}</p>
              </div>
            </div>

            {/* Status Badge */}
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full transition-all duration-300 ${
                isLocked
                  ? "bg-red-100 text-red-700 group-hover:bg-red-200"
                  : "bg-green-100 text-green-700 group-hover:bg-green-200"
              }`}
            >
              {isLocked ? "Locked" : "Unlocked"}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-6 line-clamp-2">{world.description}</p>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200 border-opacity-50">
            <button
              onClick={() => navigate(`/dashboard/world-management/${world.name}`)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                isLocked
                  ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  : `bg-${world.color}-500 text-white hover:bg-${world.color}-600 hover:shadow-lg`
              }`}
            >
              Manage
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggle(world.name)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 text-sm ${
                isLocked ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isLocked ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveGameWorldCard
