"use client"

const formatRelativeTime = (timestamp) => {
  if (timestamp === "Just now") return timestamp

  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

const NotificationDropdown = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onShowNotificationModal,
}) => {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-10 border border-gray-100">
      <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-medium text-gray-800">Notifications</h3>
        {unreadCount > 0 && (
          <button onClick={onMarkAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            Mark all as read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer ${
                !notification.read ? "bg-indigo-50" : ""
              }`}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.time)}</p>
                </div>
                {!notification.read && <span className="h-2 w-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></span>}
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-gray-500">No notifications</div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-gray-100 text-center">
        <button onClick={onShowNotificationModal} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          See all notifications
        </button>
      </div>
    </div>
  )
}

export default NotificationDropdown
