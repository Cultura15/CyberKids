"use client"
import { Lock, Unlock } from "lucide-react"

const ConfirmationModal = ({ isOpen, confirmAction, onConfirm, onCancel }) => {
  if (!isOpen || !confirmAction) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center mb-4">
            {confirmAction.isLocked ? (
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                <Unlock className="h-6 w-6" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-4">
                <Lock className="h-6 w-6" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {confirmAction.isLocked ? "Unlock" : "Lock"} {confirmAction.world.displayName}
              </h3>
              <p className="text-sm text-gray-600">{confirmAction.world.level}</p>
            </div>
          </div>

          <p className="text-gray-700 mb-6">
            {confirmAction.isLocked
              ? `Are you sure you want to unlock ${confirmAction.world.displayName}? Students will be able to access this level in Roblox.`
              : `Are you sure you want to lock ${confirmAction.world.displayName}? Students will not be able to access this level in Roblox.`}
          </p>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-white font-medium ${
                confirmAction.isLocked ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {confirmAction.isLocked ? "Yes, Unlock" : "Yes, Lock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
