"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Users,
  HelpCircle,
  CheckCircle,
  Copy,
  GraduationCap,
  Edit,
  Trash2,
  X,
  Eye,
  ArrowLeft,
} from "lucide-react"
import fetchWithAuth from "../../jwt/authInterceptor"

const nunitoFont = {
  fontFamily: "'Nunito', sans-serif",  
}

const Questions = () => {
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false)
  const [questionText, setQuestionText] = useState("")
  const [selectedClass, setSelectedClass] = useState(null)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [currentView, setCurrentView] = useState("classes") // 'classes' or 'questions'
  const [selectedClassForQuestions, setSelectedClassForQuestions] = useState(null)
  const [viewingQuestionDetail, setViewingQuestionDetail] = useState(null)

  const [classes, setClasses] = useState([])
  const [questionsByClass, setQuestionsByClass] = useState({}) // Store questions organized by class ID
  const [copiedClassCode, setCopiedClassCode] = useState(null)
  const [correctAnswer, setCorrectAnswer] = useState("SAFE")

  const [loading, setLoading] = useState(false)
  const [questionsLoading, setQuestionsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/api/classes/my-classes`)
        if (!response.ok) {
          throw new Error("Failed to fetch classes")
        }
        const data = await response.json()
        setClasses(data)
      } catch (err) {
        console.error("Error fetching classes:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [])

  useEffect(() => {
    const fetchAllQuestions = async () => {
      setQuestionsLoading(true)
      try {
        console.log("Fetching questions from:", `${process.env.REACT_APP_API_URL}/api/scenarios/my-scenarios`)
        const response = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/api/scenarios/my-scenarios`)

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`)
        }

        const questions = await response.json()
        console.log("Fetched questions:", questions)

        const organized = {}
        if (Array.isArray(questions)) {
          questions.forEach((question) => {
            const classId = question.classId
            if (classId) {
              if (!organized[classId]) {
                organized[classId] = []
              }
              organized[classId].push(question)
            }
          })
        }

        console.log("Organized questions by class:", organized)
        setQuestionsByClass(organized)
      } catch (err) {
        console.error("Error fetching questions:", err)
        setError(err.message)
      } finally {
        setQuestionsLoading(false)
      }
    }

    fetchAllQuestions()
  }, [])

  const refreshQuestions = async () => {
    try {
      const response = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/api/scenarios/my-scenarios`)
      if (!response.ok) {
        throw new Error("Failed to refresh questions")
      }
      const questions = await response.json()

      const organized = {}
      if (Array.isArray(questions)) {
        questions.forEach((question) => {
          const classId = question.classId
          if (classId) {
            if (!organized[classId]) {
              organized[classId] = []
            }
            organized[classId].push(question)
          }
        })
      }

      setQuestionsByClass(organized)
    } catch (err) {
      console.error("Error refreshing questions:", err)
    }
  }

  const copyClassCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedClassCode(code)
    setTimeout(() => setCopiedClassCode(null), 2000)
  }

  const handleCreateQuestion = async () => {
    if (!questionText.trim() || !selectedClass) {
      alert("Please write your question and select a class.")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const res = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/api/scenarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: questionText,
          classId: selectedClass.id,
          correctAnswer: correctAnswer,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Failed to create question")
        return
      }

      const newQuestion = await res.json()

      setQuestionsByClass((prev) => ({
        ...prev,
        [selectedClass.id]: [
          ...(prev[selectedClass.id] || []),
          {
            id: newQuestion.id,
            content: newQuestion.content,
            classId: selectedClass.id,
            createdAt: new Date().toISOString(),
          },
        ],
      }))

      setQuestionText("")
      setIsCreatingQuestion(false)
      setSelectedClass(null)

      await refreshQuestions()
    } catch (err) {
      console.error("Error creating question:", err)
    }
  }

  const handleEditQuestion = async (questionId, newContent) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/api/scenarios/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newContent,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Failed to update question")
        return
      }

      setQuestionsByClass((prev) => {
        const updated = { ...prev }
        Object.keys(updated).forEach((classId) => {
          updated[classId] = updated[classId].map((q) => (q.id === questionId ? { ...q, content: newContent } : q))
        })
        return updated
      })

      setEditingQuestion(null)
      if (viewingQuestionDetail && viewingQuestionDetail.id === questionId) {
        setViewingQuestionDetail({ ...viewingQuestionDetail, content: newContent })
      }

      await refreshQuestions()
    } catch (err) {
      console.error("Error updating question:", err)
    }
  }

  const handleDeleteQuestion = async (questionId, classId) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm("Are you sure you want to delete this question?")) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetchWithAuth(`${process.env.REACT_APP_API_URL}/api/scenarios/${questionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || "Failed to delete question")
        return
      }

      setQuestionsByClass((prev) => ({
        ...prev,
        [classId]: prev[classId].filter((q) => q.id !== questionId),
      }))

      if (viewingQuestionDetail && viewingQuestionDetail.id === questionId) {
        setViewingQuestionDetail(null)
      }

      await refreshQuestions()
    } catch (err) {
      console.error("Error deleting question:", err)
    }
  }

  const handleCancelCreation = () => {
    setIsCreatingQuestion(false)
    setQuestionText("")
    setSelectedClass(null)
  }

  const navigateToClassQuestions = (classData) => {
    setSelectedClassForQuestions(classData)
    setCurrentView("questions")
  }

  const navigateBackToClasses = () => {
    setCurrentView("classes")
    setSelectedClassForQuestions(null)
  }

  // Map backend colorTheme to Tailwind gradient classes
const getGradientFromTheme = (theme) => {
  switch (theme) {
    case "indigo-purple": return "from-indigo-500 to-purple-600"
    case "blue-cyan": return "from-blue-500 to-cyan-600"
    case "green-emerald": return "from-green-500 to-emerald-600"
    case "orange-red": return "from-orange-500 to-red-600"
    case "pink-rose": return "from-pink-500 to-rose-600"
    case "violet-fuchsia": return "from-violet-500 to-fuchsia-600"
    default: return "from-gray-500 to-gray-700"
  }
}


  if (currentView === "questions" && selectedClassForQuestions) {
    const classQuestions = questionsByClass[selectedClassForQuestions.id] || []

    return (
      <div className="space-y-6 mt-6" style={nunitoFont}>

        {questionsLoading && (
          <motion.div
            className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold">Loading questions...</h2>
          </motion.div>
        )}

       {/* Quiz Builder Header */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
>
  {/* Top Bar */}
  <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={navigateBackToClasses}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Question Bank</h1>
          <p className="text-indigo-100 text-sm">
            {selectedClassForQuestions.grade} - {selectedClassForQuestions.section}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {selectedClassForQuestions.classCode && (
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <span className="text-sm font-mono font-bold text-white">
              {selectedClassForQuestions.classCode}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                copyClassCode(selectedClassForQuestions.classCode)
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              {copiedClassCode === selectedClassForQuestions.classCode ? (
                <CheckCircle className="h-4 w-4 text-green-300" />
              ) : (
                <Copy className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        )}
        <button
          onClick={() => {
            setSelectedClass(selectedClassForQuestions)
            setIsCreatingQuestion(true)
          }}
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Question</span>
        </button>
      </div>
    </div>
  </div>

  {/* Stats Bar */}
  <div className="grid grid-cols-4 divide-x divide-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50">
    <div className="p-4 text-center hover:bg-white/50 transition-colors">
      <div className="flex items-center justify-center space-x-2 mb-1">
        <HelpCircle className="w-5 h-5 text-indigo-600" />
        <span className="text-2xl font-bold text-gray-900">{classQuestions.length}</span>
      </div>
      <p className="text-xs text-gray-600 font-medium">Total Questions</p>
    </div>
    <div className="p-4 text-center hover:bg-white/50 transition-colors">
      <div className="flex items-center justify-center space-x-2 mb-1">
        <Users className="w-5 h-5 text-green-600" />
        <span className="text-2xl font-bold text-gray-900">
          {selectedClassForQuestions.students ? selectedClassForQuestions.students.length : 0}
        </span>
      </div>
      <p className="text-xs text-gray-600 font-medium">Students</p>
    </div>
    <div className="p-4 text-center hover:bg-white/50 transition-colors">
      <div className="flex items-center justify-center space-x-2 mb-1">
        <CheckCircle className="w-5 h-5 text-blue-600" />
        <span className="text-2xl font-bold text-gray-900">
          {classQuestions.filter(q => q.correctAnswer === "SAFE").length}
        </span>
      </div>
      <p className="text-xs text-gray-600 font-medium">Safe Scenarios</p>
    </div>
    <div className="p-4 text-center hover:bg-white/50 transition-colors">
      <div className="flex items-center justify-center space-x-2 mb-1">
        <X className="w-5 h-5 text-red-600" />
        <span className="text-2xl font-bold text-gray-900">
          {classQuestions.filter(q => q.correctAnswer === "UNSAFE").length}
        </span>
      </div>
      <p className="text-xs text-gray-600 font-medium">Unsafe Scenarios</p>
    </div>
  </div>
</motion.div>

      <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
  {classQuestions.length > 0 ? (
    classQuestions.map((question, index) => (
      <motion.div
        key={question.id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="p-5">
          <div className="flex items-start space-x-4">
            {/* Question Number Badge - Quiz Style */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold">Q{index + 1}</span>
              </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 min-w-0">
              {editingQuestion === question.id ? (
                <div className="space-y-3">
                  <textarea
                    defaultValue={question.content}
                    className="w-full p-3 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-800"
                    rows="4"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleEditQuestion(question.id, e.target.value)
                      }
                      if (e.key === "Escape") {
                        setEditingQuestion(null)
                      }
                    }}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        const textarea = e.target.closest(".space-y-3").querySelector("textarea")
                        handleEditQuestion(question.id, textarea.value)
                      }}
                      className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="bg-gray-500 text-white px-4 py-1.5 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Question Label */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      Question
                    </span>
                  </div>

                  {/* Question Text */}
                  <p
                    onClick={() => setViewingQuestionDetail(question)}
                    className="text-gray-900 text-base font-medium leading-relaxed mb-3 cursor-pointer hover:text-indigo-600 transition-colors"
                  >
                    {question.content}
                  </p>

                  {/* Answer Options Display */}
                  <div className="space-y-2 mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Correct Answer
                    </p>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border-2 ${
                          question.correctAnswer === "SAFE"
                            ? "bg-green-50 border-green-500"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <CheckCircle
                          className={`h-4 w-4 ${
                            question.correctAnswer === "SAFE" ? "text-green-600" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-bold ${
                            question.correctAnswer === "SAFE" ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          SAFE
                        </span>
                      </div>
                      <div
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border-2 ${
                          question.correctAnswer === "UNSAFE"
                            ? "bg-red-50 border-red-500"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <X
                          className={`h-4 w-4 ${
                            question.correctAnswer === "UNSAFE" ? "text-red-600" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-bold ${
                            question.correctAnswer === "UNSAFE" ? "text-red-700" : "text-gray-500"
                          }`}
                        >
                          UNSAFE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Created {new Date(question.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setViewingQuestionDetail(question)}
                className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEditingQuestion(question.id)}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteQuestion(question.id, selectedClassForQuestions.id)}
                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    ))
  ) : (
    <motion.div
      className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-md mx-auto">
        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="h-10 w-10 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No Questions Yet
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Start building your question bank. Create engaging safety scenarios for your students.
        </p>
        <button
          onClick={() => {
            setSelectedClass(selectedClassForQuestions);
            setIsCreatingQuestion(true);
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-bold inline-flex items-center space-x-2"
        >
          <Plus className="h-6 w-6" />
          <span>Create Your First Question</span>
        </button>
      </div>
    </motion.div>
  )}
</motion.div>


        <AnimatePresence>
          {viewingQuestionDetail && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Question Details</h3>
                    <button
                      onClick={() => setViewingQuestionDetail(null)}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {editingQuestion === viewingQuestionDetail.id ? (
                    <div className="space-y-4">
                      <textarea
                        defaultValue={viewingQuestionDetail.content}
                        className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                        rows="6"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) {
                            handleEditQuestion(
                              viewingQuestionDetail.id,
                              e.target.value
                            )
                          }
                          if (e.key === "Escape") {
                            setEditingQuestion(null)
                          }
                        }}
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={(e) => {
                            const textarea = e.target
                              .closest(".space-y-4")
                              .querySelector("textarea")
                            handleEditQuestion(
                              viewingQuestionDetail.id,
                              textarea.value
                            )
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingQuestion(null)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-800 text-lg leading-relaxed">
                          {viewingQuestionDetail.content}
                        </p>
                        {/* ✅ Show the correct answer */}
                        <p className="mt-3 text-sm font-medium">
                          Correct Answer:{" "}
                          <span
                            className={
                              viewingQuestionDetail.correctAnswer === "SAFE"
                                ? "text-green-600 font-bold"
                                : "text-red-600 font-bold"
                            }
                          >
                            {viewingQuestionDetail.correctAnswer}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Created:{" "}
                          {new Date(
                            viewingQuestionDetail.createdAt
                          ).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              setEditingQuestion(viewingQuestionDetail.id)
                            }
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteQuestion(
                                viewingQuestionDetail.id,
                                viewingQuestionDetail.classId
                              )
                              setViewingQuestionDetail(null)
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      <AnimatePresence>
  {isCreatingQuestion && selectedClass && (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleCancelCreation}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Create New Question</h3>
                <p className="text-indigo-100 text-sm">
                  {selectedClass.grade} - {selectedClass.section}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelCreation}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Question Text Area */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Question Scenario
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Describe a scenario for students to evaluate (e.g., 'A stranger asks you to get in their car and offers you candy...')"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all text-gray-700 placeholder-gray-400"
              rows="5"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              {questionText.length} characters
            </p>
          </div>

          {/* Correct Answer Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              What is the correct answer?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCorrectAnswer("SAFE")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  correctAnswer === "SAFE"
                    ? "border-green-500 bg-green-50 shadow-md scale-105"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle
                    className={`h-6 w-6 ${
                      correctAnswer === "SAFE" ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-bold text-lg ${
                      correctAnswer === "SAFE" ? "text-green-700" : "text-gray-600"
                    }`}
                  >
                    SAFE
                  </span>
                </div>
                {correctAnswer === "SAFE" && (
                  <p className="text-xs text-green-600 mt-2">Selected ✓</p>
                )}
              </button>

              <button
                onClick={() => setCorrectAnswer("UNSAFE")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  correctAnswer === "UNSAFE"
                    ? "border-red-500 bg-red-50 shadow-md scale-105"
                    : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <X
                    className={`h-6 w-6 ${
                      correctAnswer === "UNSAFE" ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-bold text-lg ${
                      correctAnswer === "UNSAFE" ? "text-red-700" : "text-gray-600"
                    }`}
                  >
                    UNSAFE
                  </span>
                </div>
                {correctAnswer === "UNSAFE" && (
                  <p className="text-xs text-red-600 mt-2">Selected ✓</p>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleCreateQuestion}
              disabled={!questionText.trim()}
              className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                questionText.trim()
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl hover:scale-105"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Question</span>
              </div>
            </button>
            <button
              onClick={handleCancelCreation}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-6" style={nunitoFont}>
      {loading && (
        <motion.div
          className="flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold">Loading...</h2>
        </motion.div>
      )}

      {questionsLoading && (
        <motion.div
          className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold">Loading questions...</h2>
        </motion.div>
      )}

      {error && (
        <motion.div
          className="flex items-center justify-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold">Error: {error}</h2>
        </motion.div>
      )}
      {!loading && !error && (
        <motion.div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Questions</h2>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classQuestions = questionsByClass[cls.id] || []

          return (
            <motion.div
              key={cls.id}
              onClick={() => navigateToClassQuestions(cls)}
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`bg-gradient-to-r ${getGradientFromTheme(cls.colorTheme)} p-6 text-white`}>


                <div className="flex flex-col items-center justify-center text-center">
                  <GraduationCap className="h-14 w-14 mb-2" />
                  <h3 className="font-bold text-2xl mb-1">
                    {cls.grade} - {cls.section}
                  </h3>

                  {cls.classCode && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-mono font-bold tracking-wider">Code: {cls.classCode}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyClassCode(cls.classCode)
                        }}
                        className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                        title="Copy class code"
                      >
                        {copiedClassCode === cls.classCode ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-2">
                    <Users className="h-5 w-5" />
                    <span className="text-base">{cls.students ? cls.students.length : 0} students</span>
                  </div>
                </div>
              </div>

              <div className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <HelpCircle className="h-5 w-5 text-indigo-600" />
                  <span className="font-semibold text-gray-800">{classQuestions.length} Questions</span>
                </div>
                <p className="text-sm text-gray-500">Click to manage questions</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Questions
