"use client"

const MicrosoftLoginButton = ({ className }) => {
  const handleMicrosoftLogin = () => {
    // Direct implementation without relying on jwtUtils
    window.location.href = process.env.REACT_APP_OAUTH_MICROSOFT;
  }

  return (
    <button
      type="button"
      onClick={handleMicrosoftLogin}
      className={`w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${className || ""}`}
    >
      <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
        <path d="M11 11H0V0h11v11z" fill="#F25022" />
        <path d="M23 11H12V0h11v11z" fill="#7FBA00" />
        <path d="M11 23H0V12h11v11z" fill="#00A4EF" />
        <path d="M23 23H12V12h11v11z" fill="#FFB900" />
      </svg>
      <span>Continue with Microsoft</span>
    </button>
  )
}

export default MicrosoftLoginButton
