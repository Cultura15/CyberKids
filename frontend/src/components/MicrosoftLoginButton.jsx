"use client"
import { useState } from "react"
import jwtUtils from '../jwt/jwtUtils' // Adjust path as needed

const MicrosoftLoginButton = ({ className, loading: externalLoading }) => {
  const [loading, setLoading] = useState(false);

  const handleMicrosoftLogin = () => {
    setLoading(true);
    // Use the corrected method from jwtUtils
    jwtUtils.loginWithMicrosoft();
  };

  const isLoading = loading || externalLoading;

  return (
    <button
      type="button"
      onClick={handleMicrosoftLogin}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
          <path d="M11 11H0V0h11v11z" fill="#F25022" />
          <path d="M23 11H12V0h11v11z" fill="#7FBA00" />
          <path d="M11 23H0V12h11v11z" fill="#00A4EF" />
          <path d="M23 23H12V12h11v11z" fill="#FFB900" />
        </svg>
      )}
      <span>{isLoading ? 'Connecting...' : 'Continue with Microsoft'}</span>
    </button>
  );
};

export default MicrosoftLoginButton;