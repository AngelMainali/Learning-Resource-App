"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Download, Calendar, FileText } from "lucide-react"
import axios from "axios"
import DocumentViewer from "../components/DocumentViewer"

const NoteDetail = () => {
  const { id } = useParams()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNote()
  }, [id])

  const fetchNote = async () => {
    try {
      const response = await axios.get(`/api/notes/${id}/`)
      setNote(response.data)
    } catch (error) {
      console.error("Error fetching note:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/notes/${id}/download/`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${note.title}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      fetchNote() // Refresh to update download count
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Note not found</h1>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Home
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {note.subject_code}
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {note.note_type}
                </span>
                {note.chapter && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    📖 {note.chapter}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">{note.title}</h1>
              <p className="text-gray-600 mb-4">{note.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  {note.downloads} downloads
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {note.file ? "File Available" : "Text Only"}
                </div>
              </div>
            </div>

            {note.file && (
              <button onClick={handleDownload} className="btn btn-primary px-6 py-3 text-lg">
                <Download className="h-5 w-5 mr-2" />
                Download Note
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content */}
        {note.content && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />📝 Note Content
            </h2>
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-6 rounded-lg border">
                {note.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                    {paragraph || "\u00A0"}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Document Viewer */}
        <DocumentViewer note={note} onDownload={handleDownload} />

        {/* Tags */}
        {note.tags && (
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🏷️ Tags</h3>
            <div className="flex flex-wrap gap-2">
              {note.tags.split(",").map((tag, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
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
