"use client"
import { Lock, Unlock } from "lucide-react"

const GameWorldsSection = ({ gameWorlds, worldStatus, actionLoading, onWorldToggle }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="mr-3">
            <img src="/roblox-logo.png" alt="Roblox Logo" className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Roblox Game Worlds</h2>
            <p className="text-sm text-gray-500">Manage access to CyberKids learning environments</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gameWorlds.map((world) => {
          const isLocked = worldStatus[world.name]
          const IconComponent = world.icon
          return (
            <div
              key={world.name}
              className={`rounded-xl p-5 border transition-all ${
                isLocked ? "bg-gray-50 border-gray-200" : `bg-${world.color}-50 border-${world.color}-200`
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div
                    className={`p-3 rounded-lg ${isLocked ? "bg-gray-200" : `bg-${world.color}-100`} mr-3 shadow-sm`}
                  >
                    <IconComponent className={`h-6 w-6 ${isLocked ? "text-gray-500" : `text-${world.color}-600`}`} />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className={`text-lg font-bold ${isLocked ? "text-gray-700" : `text-${world.color}-800`}`}>
                        {world.displayName}
                      </h3>
                      <span
                        className={`ml-2 text-xs font-medium px-2 py-1 rounded-full ${
                          isLocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isLocked ? "Locked" : "Unlocked"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{world.level}</div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{world.description}</p>

              <button
                onClick={() => onWorldToggle(world.name)}
                disabled={actionLoading[world.name]}
                className={`w-full py-2.5 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  isLocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
              >
                {actionLoading[world.name] ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {isLocked ? "Unlocking..." : "Locking..."}
                  </>
                ) : (
                  <>
                    {isLocked ? <Unlock className="h-4 w-4 mr-1.5" /> : <Lock className="h-4 w-4 mr-1.5" />}
                    {isLocked ? "Unlock World" : "Lock World"}
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GameWorldsSection
