"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, Users, ArrowRight, GraduationCap } from "lucide-react"
import axios from "axios"

const Home = () => {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSemesters()
  }, [])

  const fetchSemesters = async () => {
    try {
      console.log("Fetching semesters from: /api/semesters/")
      const response = await axios.get("/api/semesters/")
      console.log("Semesters response:", response.data)

      // Handle both paginated and non-paginated responses
      const semestersData = response.data.results || response.data || []

      // Create array for semesters 1-8, filling missing ones
      const allSemesters = []
      for (let i = 1; i <= 8; i++) {
        const existingSemester = semestersData.find((sem) => sem.number === i)
        if (existingSemester) {
          allSemesters.push(existingSemester)
        } else {
          // Create placeholder for missing semester
          allSemesters.push({
            id: `placeholder-${i}`,
            number: i,
            name: `Semester ${i}`,
            description: "No subjects added yet",
            total_subjects: 0,
            total_notes: 0,
            is_placeholder: true,
          })
        }
      }

      setSemesters(allSemesters)
      setError("")
    } catch (error) {
      console.error("Error fetching semesters:", error)
      console.error("Error details:", error.response?.data)
      setError(`Failed to load semesters: ${error.message}. Make sure Django backend is running on port 8000.`)

      // Create placeholder semesters if API fails
      const placeholderSemesters = []
      for (let i = 1; i <= 8; i++) {
        placeholderSemesters.push({
          id: `placeholder-${i}`,
          number: i,
          name: `Semester ${i}`,
          description: "Backend not connected",
          total_subjects: 0,
          total_notes: 0,
          is_placeholder: true,
        })
      }
      setSemesters(placeholderSemesters)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading semesters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Academic Notes Hub</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Choose your semester, select your subject, and access comprehensive study materials instantly.
            </p>
            <div className="text-lg text-blue-200">📚 Simple Navigation: Semester → Subject → Notes</div>
          </div>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <section className="py-4 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-yellow-800">⚠️ {error}</p>
          </div>
        </section>
      )}

      {/* Semesters Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Semester</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select from 8 semesters to access organized study materials for your academic journey
            </p>
          </div>

          {/* 8 Semester Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {semesters.map((semester) => (
              <SemesterCard key={semester.id} semester={semester} />
            ))}
          </div>

          {/* Debug Section - Remove after testing */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">🔍 Debug Info:</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>Total semesters loaded: {semesters.length}</p>
              {semesters.map((sem, index) => (
                <p key={index}>
                  • Semester {sem.number}: ID={sem.id}, Subjects={sem.total_subjects}, Clickable=
                  {!sem.is_placeholder || sem.total_subjects > 0 ? "Yes" : "No"}
                </p>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {semesters.reduce((total, sem) => total + (sem.total_subjects || 0), 0)}
                </div>
                <div className="text-gray-600">Total Subjects</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {semesters.reduce((total, sem) => total + (sem.total_notes || 0), 0)}
                </div>
                <div className="text-gray-600">Total Notes</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">8</div>
                <div className="text-gray-600">Semesters Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Semester Card Component
const SemesterCard = ({ semester }) => {
  const isPlaceholder = semester.is_placeholder
  const hasContent = semester.total_subjects > 0

  // Don't make placeholder semesters without content clickable
  if (isPlaceholder && !hasContent) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 text-center opacity-60 cursor-not-allowed">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-gray-400">{semester.number}</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">{semester.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{semester.description}</p>
        <div className="text-xs text-gray-400">No subjects added yet</div>
      </div>
    )
  }

  // For real semesters with content, make them clickable
  return (
    <Link
      to={`/semester/${semester.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group text-center cursor-pointer"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <span className="text-2xl font-bold text-white">{semester.number}</span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {semester.name}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{semester.description}</p>

      <div className="flex justify-center space-x-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-1" />
          {semester.total_subjects || 0} Subjects
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          {semester.total_notes || 0} Notes
        </div>
      </div>

      <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-700">
        <span className="text-sm font-medium mr-1">Explore</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

export default Home
