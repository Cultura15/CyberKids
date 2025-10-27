import { Shield, Key, Eye } from "lucide-react"

// Game world definitions with correct backend world names
export const GAME_WORLDS = [
  {
    name: "CyberKids1", // Correct backend world name
    displayName: "Information Sorting Game",
    level: "Level 1",
    icon: Shield, // ✅ component, not object
    color: "emerald",
    challengeType: "INFORMATION_CLASSIFICATION_SORTING",
    description: "Learn to classify information and protect sensitive data",
  },
  {
    name: "CyberKids2", // Correct backend world name
    displayName: "Password Security Game",
    level: "Level 2",
    icon: Key, // ✅ component, not object
    color: "blue",
    challengeType: "PASSWORD_SECURITY",
    description: "Master the art of creating and managing secure passwords",
  },
  {
    name: "CyberKids3", // Correct backend world name
    displayName: "Phishing Awareness Game",
    level: "Level 3",
    icon: Eye, // ✅ component, not object
    color: "purple",
    challengeType: "PHISHING_IDENTIFICATION",
    description: "Identify and avoid phishing attempts and online scams",
  },
]

// Font style to apply Poppins font
export const poppinsFont = {
  fontFamily: "'Poppins', sans-serif",
}
