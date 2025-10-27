"use client"

import React from "react"
import { ChevronDown, Target, Check } from "lucide-react"

const ChallengeSelector = ({ challenges, selectedChallenge, onChallengeSelect, isOpen, onToggle }) => {
  return (
    <div className="flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
        <Target className="h-4 w-4 text-emerald-500" />
        <span>Challenge</span>
      </div>
      
      <div className="relative">
        <button
          onClick={onToggle}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-100 text-emerald-700 rounded-xl hover:from-emerald-100 hover:to-teal-200 text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 border border-emerald-200/50"
        >
          <span className="truncate max-w-[180px]">
            {selectedChallenge?.level || "Select Challenge"}
          </span>
          <ChevronDown 
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={onToggle}
            ></div>
            
            {/* Dropdown */}
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 border border-gray-200 overflow-hidden animate-slideDown">
              <div className="p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-200">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide px-2">
                  Select Challenge Level
                </p>
              </div>
              
              <div className="max-h-96 overflow-y-auto custom-scrollbar p-2">
                {challenges && challenges.length > 0 ? (
                  <div className="space-y-1">
                    {challenges.map((world) => {
                      const isSelected = selectedChallenge?.name === world.name
                      
                      return (
                        <button
                          key={world.name}
                          className={`group/item w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700'
                          }`}
                          onClick={() => onChallengeSelect(world)}
                        >
                          <div className="flex items-center gap-3">
                            {world.icon && (
                              <div className={`rounded-lg p-2 ${
                                isSelected 
                                  ? 'bg-white/20' 
                                  : 'bg-emerald-100 group-hover/item:bg-emerald-200'
                              }`}>
                                {typeof world.icon === "function" &&
                                  React.createElement(world.icon, {
                                    className: `h-5 w-5 ${isSelected ? 'text-white' : 'text-emerald-600'}`
                                  })}
                              </div>
                            )}
                            <div className="text-left">
                              <p className="font-bold">{world.level}</p>
                              {world.displayName && world.displayName !== world.level && (
                                <p className={`text-xs ${
                                  isSelected ? 'text-white/80' : 'text-gray-500'
                                }`}>
                                  {world.displayName}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {isSelected && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No challenges available</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
        }
      `}</style>
    </div>
  )
}

export default ChallengeSelector