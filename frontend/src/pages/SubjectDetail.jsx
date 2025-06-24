"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, FileText, Download, AlertCircle, RefreshCw } from "lucide-react"
import { API_URL } from "../config"

const SubjectDetail = () => {
  const { id } = useParams()
  const [subject, setSubject] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    console.log("=== SubjectDetail Debug Info ===")
    console.log("Subject ID from URL:", id)
    console.log("API_URL:", API_URL)
    fetchSubject()
    fetchNotes()
  }, [id])

  const fetchSubject = async () => {
    try {
      const url = `${API_URL}/api/subjects/${id}/`
      console.log("🔍 Fetching subject from:", url)

      const response = await fetch(url)
      console.log("📡 Subject response status:", response.status)
      console.log("📡 Subject response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📦 Subject data received:", JSON.stringify(data, null, 2))

      setSubject(data)
      setDebugInfo((prev) => ({ ...prev, subject: data }))
      setError("")
    } catch (error) {
      console.error("❌ Subject fetch error:", error)
      setError(`Failed to load subject: ${error.message}`)
      setDebugInfo((prev) => ({ ...prev, subjectError: error.message }))
    }
  }

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const url = `${API_URL}/api/subjects/${id}/notes/`
      console.log("🔍 Fetching notes from:", url)

      const response = await fetch(url)
      console.log("📡 Notes response status:", response.status)
      console.log("📡 Notes response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📦 Notes data received:", JSON.stringify(data, null, 2))
      console.log(
        "📊 Notes array length:",
        Array.isArray(data) ? data.length : data.results ? data.results.length : "Not an array",
      )

      const notesArray = data.results || data || []
      setNotes(notesArray)
      setDebugInfo((prev) => ({
        ...prev,
        notes: data,
        notesCount: notesArray.length,
        notesStructure: typeof data,
      }))
      setError("")
    } catch (error) {
      console.error("❌ Notes fetch error:", error)
      setError(`Failed to load notes: ${error.message}`)
      setDebugInfo((prev) => ({ ...prev, notesError: error.message }))
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  const retryFetch = () => {
    console.log("🔄 Retrying fetch...")
    setError("")
    setLoading(true)
    setDebugInfo({})
    fetchSubject()
    fetchNotes()
  }

  // Show error state
  if (error && !subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>

          <div className="space-y-2">
            <button onClick={retryFetch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mr-2">
              <RefreshCw className="h-4 w-4 inline mr-1" />
              Retry
            </button>
            <Link to="/" className="text-blue-600 hover:text-blue-700 inline-block">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (loading && !subject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subject details...</p>
        </div>
      </div>
    )
  }

  // Show subject not found
  if (!subject && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Subject not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-yellow-800">⚠️ {error}</p>
          </div>
        </div>
      )}

      {/* Debug Banner (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <details className="text-xs">
              <summary className="cursor-pointer font-bold">Debug Info (Click to expand)</summary>
              <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              to={`/semester/${subject.semester_number || subject.semester?.number || 1}`}
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Semester
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{subject.name}</h1>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading notes...</p>
              <p className="text-xs text-gray-500 mt-1">
                Fetching from: {API_URL}/api/subjects/{id}/notes/
              </p>
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes available</h3>
            <p className="text-gray-600 mb-4">Notes for this subject will be added soon...</p>

            <button onClick={retryFetch} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <RefreshCw className="h-4 w-4 inline mr-1" />
              Retry Loading Notes
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">
                Found {notes.length} note{notes.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => (
                <Link
                  key={note.id}
                  to={`/note/${note.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group hover:border-blue-300"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Download className="h-4 w-4 mr-1" />
                      {note.downloads || 0} downloads
                    </div>
                    <div className="text-sm text-blue-600 font-medium">View Note →</div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SubjectDetail
