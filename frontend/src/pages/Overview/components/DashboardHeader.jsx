import React from "react"
import { ChevronDown } from "lucide-react"
import { POPPINS_FONT } from "../constants"

const DashboardHeader = ({
  classes,
  selectedClass,
  classDropdownOpen,
  setClassDropdownOpen,
  onClassSelect,
  challenges,
  selectedChallenge,
  challengeDropdownOpen,
  setChallengeDropdownOpen,
  onChallengeSelect,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4" style={POPPINS_FONT}>
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard Overview</h2>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        {/* Class Selector Dropdown */}
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-600 mr-2">Class:</span>
          <div className="relative">
            <button
              onClick={() => setClassDropdownOpen(!classDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
            >
              <span>{selectedClass ? `${selectedClass.grade} - ${selectedClass.section}` : "Select Class"}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {classDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-100">
                <div className="py-1">
                  {classes.map((classObj) => (
                    <button
                      key={classObj.id}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => onClassSelect(classObj)}
                    >
                      {classObj.grade} - {classObj.section}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Challenge Filter Dropdown */}
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-600 mr-2">Challenge:</span>
          <div className="relative">
            <button
              onClick={() => setChallengeDropdownOpen(!challengeDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-sm font-medium"
            >
              <span>{selectedChallenge.level}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {challengeDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-100">
                <div className="py-1">
                  {challenges.map((challenge) => (
                    <button
                      key={challenge.name}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => onChallengeSelect(challenge)}
                    >
                      {challenge.level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(DashboardHeader)