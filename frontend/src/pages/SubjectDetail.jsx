"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, FileText, Download, Calendar, Eye } from "lucide-react"
import axios from "axios"

const SubjectDetail = () => {
  const { id } = useParams()
  const [subject, setSubject] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubject()
    fetchNotes()
  }, [id])

  const fetchSubject = async () => {
    try {
      const response = await axios.get(`/api/subjects/${id}/`)
      setSubject(response.data)
    } catch (error) {
      console.error("Error fetching subject:", error)
    }
  }

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/subjects/${id}/notes/`)
      setNotes(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching notes:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-4">
            <Link
              to={`/semester/${subject.semester_number}`}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Semester {subject.semester_number}
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {subject.code}
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  {subject.credits} Credits
                </span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                  Semester {subject.semester_number}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">{subject.name}</h1>
              <p className="text-gray-600 mb-4">{subject.description}</p>

              <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  {subject.total_notes} Notes Available
                </div>
                <div className="flex items-center">
                  <Download className="h-4 w-4 mr-1" />
                  {subject.total_downloads} Total Downloads
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📝 Study Materials</h2>
          <p className="text-gray-600">Access all notes and materials for {subject.name}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes available</h3>
            <p className="text-gray-600">Notes for this subject will be added through the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Link
                key={note.id}
                to={`/note/${note.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* Note Type Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {note.note_type}
                  </span>
                  {note.file && (
                    <div className="flex items-center text-green-600">
                      <FileText className="h-4 w-4 mr-1" />
                      <span className="text-xs">File Available</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {note.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{note.description}</p>

                {/* Chapter/Tags */}
                {note.chapter && (
                  <div className="mb-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                      📖 {note.chapter}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {note.downloads}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center text-primary-600 group-hover:text-primary-700">
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="text-xs">View</span>
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

export default SubjectDetail
