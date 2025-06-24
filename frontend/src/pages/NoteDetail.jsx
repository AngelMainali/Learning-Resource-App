"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Eye } from "lucide-react"
import DocumentViewer from "../components/DocumentViewer"
import { API_URL } from "../config"

const NoteDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNote()
  }, [id])

  const fetchNote = async () => {
    try {
      console.log("Fetching note from:", `${API_URL}/api/notes/${id}/`)
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_URL}/api/notes/${id}/`)

      console.log("Note fetch response status:", response.status)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Note not found")
        } else if (response.status >= 500) {
          throw new Error("Server error - please try again later")
        } else {
          throw new Error(`Failed to load note (${response.status})`)
        }
      }

      const data = await response.json()
      console.log("Note data received:", data)
      setNote(data)
    } catch (error) {
      console.error("Error fetching note:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      console.log("Starting download from:", `${API_URL}/api/notes/${id}/download/`)

      const response = await fetch(`${API_URL}/api/notes/${id}/download/`)

      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = note.file?.split("/").pop() || "download"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      console.log("Download completed successfully")
    } catch (error) {
      console.error("Download error:", error)
      alert("Download failed: " + error.message)
    }
  }

  const handleDownloadCountUpdate = (newCount) => {
    // Update the note state with new download count
    setNote((prevNote) => ({
      ...prevNote,
      downloads: newCount,
    }))
  }

  const handleBackToSubject = () => {
    if (note?.subject) {
      navigate(`/subject/${note.subject}`)
    } else {
      navigate(-1)
    }
  }

  const handleRetry = () => {
    fetchNote()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading note...</p>
          <p className="text-sm text-gray-400 mt-2">From: {API_URL}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Note Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-400 mb-6">API: {API_URL}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Retry
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header with Back Button and Title */}
        <div className="mb-6">
          <button
            onClick={handleBackToSubject}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Subject
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{note.title}</h1>
              {note.description && <p className="text-gray-600 text-lg mb-4">{note.description}</p>}

              {/* Quick Info - Only Downloads */}
              <div className="flex items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {note.downloads || 0} downloads
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <DocumentViewer note={note} onDownload={handleDownload} onDownloadCountUpdate={handleDownloadCountUpdate} />

        {/* Tags Section (if exists) */}
        {note.tags && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {note.tags.split(",").map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteDetail
