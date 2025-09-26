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

const poppinsFont = {
  fontFamily: "'Poppins', sans-serif",  
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

  if (currentView === "questions" && selectedClassForQuestions) {
    const classQuestions = questionsByClass[selectedClassForQuestions.id] || []

    return (
      <div className="space-y-6 mt-6" style={poppinsFont}>
        {questionsLoading && (
          <motion.div
            className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold">Loading questions...</h2>
          </motion.div>
        )}

        <motion.div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={navigateBackToClasses}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <GraduationCap className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">
                {selectedClassForQuestions.grade} - {selectedClassForQuestions.section}
              </h2>
              <p className="text-indigo-100 text-sm">Questions Management</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedClass(selectedClassForQuestions)
              setIsCreatingQuestion(true)
            }}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Question</span>
          </button>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedClassForQuestions.grade} - {selectedClassForQuestions.section}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {selectedClassForQuestions.students ? selectedClassForQuestions.students.length : 0} students
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HelpCircle className="h-4 w-4" />
                    <span>{classQuestions.length} questions</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedClassForQuestions.classCode && (
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-mono font-bold">Code: {selectedClassForQuestions.classCode}</span>
                </div>
                <button
                  onClick={() => copyClassCode(selectedClassForQuestions.classCode)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  title="Copy class code"
                >
                  {copiedClassCode === selectedClassForQuestions.classCode ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {classQuestions.length > 0 ? (
          classQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start">
                <div
                  className="flex-1 cursor-pointer group"
                  onClick={() => setViewingQuestionDetail(question)}
                >
                  <p className="text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors leading-relaxed">
                    {question.content}
                  </p>

                  {/* ✅ Show correct answer inline */}
                  <p className="text-sm mt-1">
                    Correct Answer:{" "}
                    <span
                      className={
                        question.correctAnswer === "SAFE"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {question.correctAnswer}
                    </span>
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                    <span>
                      Created: {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view details →
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setViewingQuestionDetail(question)}
                    className="text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingQuestion(question.id)}
                    className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Edit Question"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteQuestion(question.id, selectedClassForQuestions.id)
                    }
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No questions yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start building your question bank for this class
            </p>
            <button
              onClick={() => {
                setSelectedClass(selectedClassForQuestions);
                setIsCreatingQuestion(true);
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Question</span>
            </button>
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Add Question for {selectedClass.grade} - {selectedClass.section}
              </h3>

              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Type your question here..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
                rows="4"
                autoFocus
              />

              {/* New dropdown for SAFE/UNSAFE */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <select
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                >
                  <option value="SAFE">SAFE</option>
                  <option value="UNSAFE">UNSAFE</option>
                </select>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={handleCreateQuestion}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
                >
                  Save Question
                </button>
                <button
                  onClick={handleCancelCreation}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    )
  }

  return (
    <div className="space-y-6 mt-6" style={poppinsFont}>
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
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
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
