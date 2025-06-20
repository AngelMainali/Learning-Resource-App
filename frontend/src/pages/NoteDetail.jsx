"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Eye } from "lucide-react"
import DocumentViewer from "../components/DocumentViewer"

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
      setLoading(true)
      const response = await fetch(`http://127.0.0.1:8000/api/notes/${id}/`)
      if (!response.ok) {
        throw new Error("Note not found")
      }
      const data = await response.json()
      setNote(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/notes/${id}/download/`)
      if (!response.ok) {
        throw new Error("Download failed")
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
    } catch (error) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading note...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Note Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
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
