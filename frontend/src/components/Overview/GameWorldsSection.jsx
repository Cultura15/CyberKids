"use client"
import { useNavigate } from "react-router-dom"

const GameWorldsSection = ({ gameWorlds, worldStatus }) => {
  const navigate = useNavigate()

  // Include Main World (CyberKids0) at the top — ensures it's always visible
  const mainWorld = gameWorlds.find((w) => w.name === "CyberKids0")
  const otherWorlds = gameWorlds.filter((w) => w.name !== "CyberKids0")

  // Helper to render a single world card
  const renderWorldCard = (world) => {
    const isLocked = worldStatus[world.name]
    const IconComponent = world.icon

    return (
      <div
        key={world.name}
        onClick={() => navigate(`/dashboard/world-management/${world.name}`)}
        className={`cursor-pointer group rounded-xl p-5 border transition-all transform 
          hover:-translate-y-1 hover:shadow-xl hover:bg-opacity-90 active:scale-95 
          ${isLocked
            ? "bg-gray-50 border-gray-200 hover:border-gray-300"
            : `bg-${world.color}-50 border-${world.color}-200 hover:border-${world.color}-300`
          }`}
      >
        <div className="flex justify-between items-start mb-4">
          {/* Icon + Info */}
          <div className="flex items-center">
            <div
              className={`p-3 rounded-lg transition-colors duration-300 mr-3 shadow-sm 
                ${isLocked ? "bg-gray-200" : `bg-${world.color}-100 group-hover:bg-${world.color}-200`}
              `}
            >
              <IconComponent
                className={`h-6 w-6 transition-colors duration-300 
                  ${isLocked ? "text-gray-500" : `text-${world.color}-600 group-hover:text-${world.color}-800`}
                `}
              />
            </div>
            <div>
              <h3
                className={`text-lg font-bold transition-colors duration-300 
                  ${isLocked ? "text-gray-700" : `text-${world.color}-800 group-hover:text-${world.color}-900`}
                `}
              >
                {world.displayName}
              </h3>
              <div className="text-sm text-gray-600 font-medium">{world.level}</div>
            </div>
          </div>

          {/* Status Tag */}
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full transition-colors duration-300 
              ${isLocked
                ? "bg-red-100 text-red-700 group-hover:bg-red-200"
                : "bg-green-100 text-green-700 group-hover:bg-green-200"
              }`}
          >
            {isLocked ? "Locked" : "Unlocked"}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600">{world.description}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="mr-3">
            <img src="/roblox-logo.png" alt="Roblox Logo" className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Roblox Game Worlds</h2>
            <p className="text-sm text-gray-500">
              Select a world below to manage lock/unlock permissions per class
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Main World Section */}
      {mainWorld && (
        <div className="mb-8">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Main World</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderWorldCard(mainWorld)}
          </div>
        </div>
      )}

      {/* ✅ Other Worlds Section */}
      <div>
        <h3 className="text-md font-semibold text-gray-700 mb-3">Game Worlds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherWorlds.map((world) => renderWorldCard(world))}
        </div>
      </div>
    </div>
  )
}

export default GameWorldsSection
