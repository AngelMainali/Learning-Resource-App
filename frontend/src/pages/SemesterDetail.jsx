"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, BookOpen, FileText, ArrowRight, AlertCircle } from "lucide-react"
import { API_URL } from "../config"

const SemesterDetail = () => {
  const { id } = useParams() // This is now the semester NUMBER (1, 2, 3, etc.)
  const [semester, setSemester] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    console.log("SemesterDetail: Component mounted with semester number:", id)
    fetchSemester()
  }, [id])

  const fetchSemester = async () => {
    try {
      setLoading(true)
      setError("")

      console.log(`Fetching semester details for semester number: ${id}`)

      // Fetch semester by NUMBER (backend now handles this)
      const response = await fetch(`${API_URL}/api/semesters/${id}/`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Semester ${id} not found`)
      }

      const data = await response.json()
      console.log("Semester data received:", data)

      setSemester(data)

      // If subjects are not included, fetch them separately
      if (!data.subjects || data.subjects.length === 0) {
        console.log("Fetching subjects separately...")
        await fetchSubjectsForSemester(id)
      }
    } catch (error) {
      console.error("Error fetching semester:", error)
      setError(`Failed to load semester ${id}: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjectsForSemester = async (semesterNumber) => {
    try {
      console.log(`Fetching subjects for semester number: ${semesterNumber}`)

      const response = await fetch(`${API_URL}/api/semesters/${semesterNumber}/subjects/`)

      if (response.ok) {
        const subjectsData = await response.json()
        console.log("Subjects data received:", subjectsData)

        const subjects = subjectsData.results || subjectsData || []

        setSemester((prev) => ({
          ...prev,
          subjects: subjects,
          total_subjects: subjects.length,
        }))
      } else {
        console.error("Failed to fetch subjects:", response.status)
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
    }
  }

  const retryFetch = () => {
    setError("")
    fetchSemester()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Semester {id}...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Semester {id}</h1>
          <p className="text-gray-600 mt-2 mb-4">{error}</p>

          <div className="space-x-4">
            <button
              onClick={retryFetch}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors inline-block"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!semester) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Semester {id} not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
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
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{semester.number}</span>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Semester {semester.number}</h1>
              <div className="text-sm text-gray-500">{semester.subjects?.length || 0} subjects available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!semester.subjects || semester.subjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects available</h3>
            <p className="text-gray-600">
              {!semester.subjects
                ? "Subjects data is not being loaded from the API."
                : "No subjects have been added to this semester yet."}
            </p>
            <p className="text-sm text-gray-500 mt-2">Add subjects through the Django admin panel</p>

            <button
              onClick={() => fetchSubjectsForSemester(id)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              🔄 Retry Loading Subjects
            </button>
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
                    <div className="text-sm text-blue-600 font-medium mb-1">{subject.code}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {subject.name}
                    </h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {subject.total_notes || 0} Notes
                    </div>
                    {subject.credits && <div className="text-xs">{subject.credits} Credits</div>}
                  </div>
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
