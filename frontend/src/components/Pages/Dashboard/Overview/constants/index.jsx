// API Configuration
export const API_BASE_URL = "https://cyberkids.onrender.com"

// Local Storage Keys
export const WORLD_STATUS_KEY = "cyberkids_world_status"

// Game world definitions with correct backend world names
export const GAME_WORLDS = [
  {
    name: "CyberKids1",
    displayName: "Info Classification",
    level: "Level 1",
    icon: "Shield",
    color: "emerald",
    challengeType: "INFORMATION_CLASSIFICATION_SORTING",
    description: "Learn to classify information and protect sensitive data",
  },
  {
    name: "CyberKids2",
    displayName: "Password Security",
    level: "Level 2",
    icon: "Key",
    color: "blue",
    challengeType: "PASSWORD_SECURITY",
    description: "Master the art of creating and managing secure passwords",
  },
  {
    name: "CyberKids3",
    displayName: "Phishing ID",
    level: "Level 3",
    icon: "Eye",
    color: "purple",
    challengeType: "PHISHING_IDENTIFICATION",
    description: "Identify and avoid phishing attempts and online scams",
  },
]

// Styling
export const POPPINS_FONT = {
  fontFamily: "'Poppins', sans-serif",
}