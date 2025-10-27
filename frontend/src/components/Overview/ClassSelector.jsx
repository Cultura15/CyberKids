"use client"

import { ChevronDown, GraduationCap, Check } from "lucide-react"

const ClassSelector = ({ classes, selectedClass, onClassSelect, isOpen, onToggle }) => {
  return (
    <div className="flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
        <GraduationCap className="h-4 w-4 text-indigo-500" />
        <span>Class</span>
      </div>
      
      <div className="relative">
        <button
          onClick={onToggle}
          className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 rounded-xl hover:from-indigo-100 hover:to-indigo-200 text-sm font-bold shadow-sm hover:shadow-md transition-all duration-200 border border-indigo-200/50"
        >
          <span className="truncate max-w-[180px]">
            {selectedClass ? `${selectedClass.grade} - ${selectedClass.section}` : "Select Class"}
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
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl z-50 border border-gray-200 overflow-hidden animate-slideDown">
              <div className="p-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide px-2">
                  Select Your Class
                </p>
              </div>
              
              <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                {classes && classes.length > 0 ? (
                  <div className="space-y-1">
                    {classes.map((classObj) => {
                      const isSelected = selectedClass?.id === classObj.id
                      
                      return (
                        <button
                          key={classObj.id}
                          className={`group/item w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700'
                          }`}
                          onClick={() => onClassSelect(classObj)}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`rounded-lg p-1.5 ${
                              isSelected 
                                ? 'bg-white/20' 
                                : 'bg-indigo-100 group-hover/item:bg-indigo-200'
                            }`}>
                              <GraduationCap className={`h-4 w-4 ${
                                isSelected ? 'text-white' : 'text-indigo-600'
                              }`} />
                            </div>
                            <span>{classObj.grade} - {classObj.section}</span>
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
                    <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No classes available</p>
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

export default ClassSelector