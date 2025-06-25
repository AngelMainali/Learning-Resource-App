"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, BookOpen, FileText, ArrowRight, AlertCircle } from "lucide-react"
import { API_URL } from "../config"

const SemesterDetail = () => {
  const { id } = useParams()
  const [semester, setSemester] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    console.log("SemesterDetail: Component mounted with ID:", id)
    console.log("SemesterDetail: API_URL:", API_URL)
    fetchSemester()
  }, [id])

  const fetchSemester = async () => {
    try {
      setLoading(true)
      setError("")

      console.log(`SemesterDetail: Fetching semester data from: ${API_URL}/api/semesters/${id}/`)

      const response = await fetch(`${API_URL}/api/semesters/${id}/`)

      console.log("SemesterDetail: Response status:", response.status)
      console.log("SemesterDetail: Response ok:", response.ok)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Semester with ID ${id} not found`)
        } else if (response.status === 500) {
          throw new Error("Server error - please try again later")
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      const data = await response.json()
      console.log("SemesterDetail: Raw semester data received:", data)
      console.log("SemesterDetail: Semester subjects:", data.subjects)
      console.log("SemesterDetail: Subjects count:", data.subjects ? data.subjects.length : "undefined")
      console.log("SemesterDetail: Total subjects property:", data.total_subjects)

      // Add API endpoint debugging
      console.log("SemesterDetail: Full API URL used:", `${API_URL}/api/semesters/${id}/`)

      setSemester(data)
      setError("")
    } catch (error) {
      console.error("SemesterDetail: Error fetching semester:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Add this function after fetchSemester
  const fetchSubjectsSeparately = async () => {
    try {
      console.log("Fetching subjects separately...")
      const response = await fetch(`${API_URL}/api/subjects/?semester=${id}`)
      if (response.ok) {
        const subjects = await response.json()
        console.log("Subjects fetched separately:", subjects)
        setSemester((prev) => ({ ...prev, subjects: subjects }))
      }
    } catch (error) {
      console.error("Failed to fetch subjects separately:", error)
    }
  }

  const retryFetch = () => {
    console.log("SemesterDetail: Retrying fetch...")
    fetchSemester()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading semester details...</p>
          <p className="text-xs text-gray-500 mt-2">Semester ID: {id}</p>
          <p className="text-xs text-gray-500">API: {API_URL}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Semester</h1>
          <p className="text-gray-600 mt-2 mb-4">{error}</p>

          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-sm text-left max-w-md mx-auto">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>Semester ID: {id}</p>
            <p>API URL: {API_URL}</p>
            <p>
              Full URL: {API_URL}/api/semesters/{id}/
            </p>
          </div>

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
          <h1 className="text-2xl font-bold text-gray-900">Semester not found</h1>
          <p className="text-gray-600 mt-2">Semester ID: {id}</p>
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
              <p className="text-gray-600 mb-4">{semester.description || "No description available"}</p>

              {/* Debug info */}
              <div className="text-xs text-gray-500">
                <p>Semester ID: {semester.id}</p>
                <p>Subjects count: {semester.subjects ? semester.subjects.length : "undefined"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Debug Section */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">🔍 Debug Information</h4>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>
              <strong>Semester ID from URL:</strong> {id}
            </p>
            <p>
              <strong>Semester Number:</strong> {semester?.number}
            </p>
            <p>
              <strong>API URL:</strong> {API_URL}/api/semesters/{id}/
            </p>
            <p>
              <strong>Subjects Array Exists:</strong> {semester?.subjects ? "Yes" : "No"}
            </p>
            <p>
              <strong>Subjects Count:</strong> {semester?.subjects?.length || 0}
            </p>
            <p>
              <strong>Total Subjects Property:</strong> {semester?.total_subjects || 0}
            </p>
            <p>
              <strong>Raw Semester Keys:</strong> {semester ? Object.keys(semester).join(", ") : "None"}
            </p>
          </div>

          {/* Test API Button */}
          <button
            onClick={() => {
              console.log("Testing API endpoint directly...")
              fetch(`${API_URL}/api/semesters/${id}/`)
                .then((res) => res.json())
                .then((data) => {
                  console.log("Direct API test result:", data)
                  alert(`API Response: ${JSON.stringify(data, null, 2)}`)
                })
                .catch((err) => {
                  console.error("Direct API test failed:", err)
                  alert(`API Error: ${err.message}`)
                })
            }}
            className="mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-xs hover:bg-yellow-300"
          >
            🧪 Test API Directly
          </button>
        </div>
        <button
          onClick={fetchSubjectsSeparately}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-4"
        >
          🔄 Fetch Subjects Manually
        </button>
        {!semester.subjects ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects data</h3>
            <p className="text-gray-600">The subjects property is missing from the API response.</p>
            <div className="mt-4 text-xs text-gray-500">
              <p>Raw semester data structure:</p>
              <pre className="bg-gray-100 p-2 rounded text-left inline-block">{JSON.stringify(semester, null, 2)}</pre>
            </div>
          </div>
        ) : semester.subjects.length === 0 ? (
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {subject.name}
                    </h3>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{subject.description || "No description"}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {subject.total_notes || 0} Notes
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
