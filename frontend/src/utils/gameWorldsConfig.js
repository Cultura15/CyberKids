import { Shield, Key, Eye } from "lucide-react"

// Game world definitions with correct backend world names
export const GAME_WORLDS = [
  {
    name: "CyberKids1", // Correct backend world name
    displayName: "Info Classification",
    level: "Level 1",
    icon: Shield,
    color: "emerald",
    challengeType: "INFORMATION_CLASSIFICATION_SORTING",
    description: "Learn to classify information and protect sensitive data",
  },
  {
    name: "CyberKids2", // Correct backend world name
    displayName: "Password Security",
    level: "Level 2",
    icon: Key,
    color: "blue",
    challengeType: "PASSWORD_SECURITY",
    description: "Master the art of creating and managing secure passwords",
  },
  {
    name: "CyberKids3", // Correct backend world name
    displayName: "Phishing ID",
    level: "Level 3",
    icon: Eye,
    color: "purple",
    challengeType: "PHISHING_IDENTIFICATION",
    description: "Identify and avoid phishing attempts and online scams",
  },
]

// Font style to apply Poppins font
export const poppinsFont = {
  fontFamily: "'Poppins', sans-serif",
}
