"use client"
import { ChevronDown } from "lucide-react"

const ChallengeSelector = ({ challenges, selectedChallenge, onChallengeSelect, isOpen, onToggle }) => {
  return (
    <div className="flex items-center">
      <span className="text-sm font-medium text-gray-600 mr-2">Challenge:</span>
      <div className="relative">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
        >
          <span>{selectedChallenge.level}</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-100">
            <div className="py-1">
              {challenges.map((world) => (
                <button
                  key={world.name}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => onChallengeSelect(world)}
                >
                  {world.level}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChallengeSelector
