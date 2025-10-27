// src/components/GameManagement/GameManagementIntro.jsx
import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"

const GameManagementIntro = ({ onStart }) => {
  const [cardsVisible, setCardsVisible] = useState([false, false, false])
  const [buttonVisible, setButtonVisible] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setCardsVisible([true, false, false]), 300),
      setTimeout(() => setCardsVisible([true, true, false]), 600),
      setTimeout(() => setCardsVisible([true, true, true]), 900),
      setTimeout(() => setButtonVisible(true), 1400),
    ]
    return () => timers.forEach((t) => clearTimeout(t))
  }, [])

  const gameWorlds = [
    {
      image: "/info_sort.jpeg",
      title: "Information Sorting Game",
      level: "Level 1",
      color: "#002f5c",
      description: "Identify safe information to share online.",
    },
    {
      image: "/pass_sec.jpeg",
      title: "Password Security Game",
      level: "Level 2",
      color: "#3f2a00",
      description: "Create strong passwords to stay protected.",
    },
    {
      image: "/phishing_aware.jpeg",
      title: "Phishing Identification Game",
      level: "Level 3",
      color: "#551303",
      description: "Spot fake messages that try to trick players.",
    },
  ]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between text-center px-6 py-12"
      style={{
        backgroundColor: "#54168C",
        fontFamily: "'Baloo 2', cursive",
      }}
    >
      {/* Header */}
      <header className="max-w-3xl animate-fade-in mt-6 px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-3 leading-tight">
          Manage Game Worlds
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-purple-100 leading-relaxed">
          Decide which learning worlds are available for your students to explore.
        </p>
      </header>

      {/* Game World Cards */}
      <main className="flex-grow flex items-center justify-center w-full mt-8 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-7xl px-4 sm:px-6 md:px-10">
          {gameWorlds.map((world, i) => (
            <div
              key={i}
              className={`transform transition-all duration-700 ${
                cardsVisible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div
                className="rounded-3xl overflow-hidden shadow-xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between group mx-auto"
                style={{
                  backgroundColor: world.color,
                  width: "100%",
                  maxWidth: "380px",
                  height: "500px",
                }}
              >
                {/* Image */}
                <div className="relative w-full h-[280px] overflow-hidden">
                  <img
                    src={world.image}
                    alt={world.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/35"></div>

                  {/* Level Badge */}
                  <span
                    className="absolute top-4 left-4 inline-block px-4 py-1 rounded-full text-xs sm:text-sm font-bold text-white shadow-md"
                    style={{
                      backgroundColor: world.color,
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    {world.level}
                  </span>
                </div>

                {/* Text Section */}
                <div className="p-6 text-white text-center flex flex-col justify-center flex-grow">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold mb-3 tracking-wide">
                    {world.title}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed">
                    {world.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Start Button */}
      <footer
        className={`transition-all duration-700 mb-8 ${
          buttonVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <button
          onClick={onStart}
          className="group inline-flex items-center gap-3 px-10 py-4 bg-white text-purple-700 rounded-full font-extrabold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <span>Get Started</span>
          <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap');

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  )
}

export default GameManagementIntro
