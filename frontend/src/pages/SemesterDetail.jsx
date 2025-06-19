"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, BookOpen, FileText, ArrowRight } from "lucide-react"
import axios from "axios"

const SemesterDetail = () => {
  const { id } = useParams()
  const [semester, setSemester] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSemester()
  }, [id])

  const fetchSemester = async () => {
    try {
      const response = await axios.get(`/api/semesters/${id}/`)
      setSemester(response.data)
    } catch (error) {
      console.error("Error fetching semester:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!semester) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Semester not found</h1>
          <Link to="/" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Home
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{semester.number}</span>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{semester.name}</h1>
              <p className="text-gray-600 mb-4">{semester.description}</p>

              <div className="flex space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  {semester.total_subjects} Subjects
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {semester.total_notes} Total Notes
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📖 Subjects</h2>
          <p className="text-gray-600">Choose a subject to access study materials and notes</p>
        </div>

        {semester.subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects available</h3>
            <p className="text-gray-600">Subjects for this semester will be added through the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {semester.subjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subject/${subject.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-xs font-medium">
                        {subject.code}
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        {subject.credits} Credits
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {subject.name}
                    </h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{subject.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {subject.total_notes} Notes
                  </div>
                  <div className="text-xs text-gray-400">Click to explore →</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SemesterDetail
