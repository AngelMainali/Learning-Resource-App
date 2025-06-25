"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { BookOpen, ArrowRight, Youtube, Users, Award } from "lucide-react"
import axios from "axios"
import { API_URL } from "../config"
import logoImage from "/Logo.jpg"

const Home = () => {
  const [semesters, setSemesters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSemesters()
  }, [])

  const fetchSemesters = async () => {
    try {
      console.log("API_URL from config:", API_URL)
      console.log("Attempting to fetch from:", `${API_URL}/api/semesters/`)

      const response = await axios.get(`${API_URL}/api/semesters/`, {
        timeout: 15000,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        withCredentials: false,
      })

      console.log("API Response status:", response.status)
      console.log("API Response data:", response.data)

      const semestersData = response.data.results || response.data || []
      console.log("Processed semesters data:", semestersData)

      // Create a map of all 8 semesters, using semester NUMBER for URLs
      const allSemesters = []
      for (let i = 1; i <= 8; i++) {
        const existingSemester = semestersData.find((sem) => sem.number === i)
        if (existingSemester) {
          allSemesters.push({
            ...existingSemester,
            is_placeholder: false,
          })
        } else {
          allSemesters.push({
            id: `placeholder-${i}`,
            number: i,
            name: `Semester ${i}`,
            total_subjects: 0,
            total_notes: 0,
            is_placeholder: true,
          })
        }
      }

      console.log("Final semesters array:", allSemesters)
      setSemesters(allSemesters)
      setError("")
    } catch (error) {
      console.error("Detailed error information:")
      console.error("Error message:", error.message)

      if (error.response) {
        if (error.response.status === 0) {
          setError("CORS Error: Backend not accessible from frontend domain")
        } else if (error.response.status >= 500) {
          setError(`Server Error (${error.response.status}): Backend server issue`)
        } else if (error.response.status === 404) {
          setError("API Endpoint not found - Check backend URL")
        } else {
          setError(`HTTP Error ${error.response.status}: ${error.response.statusText}`)
        }
      } else if (error.request) {
        setError("Network Error: No response from backend server")
      } else if (error.code === "ECONNABORTED") {
        setError("Request Timeout: Backend server is too slow")
      } else {
        setError(`Connection Error: ${error.message}`)
      }

      // Always show placeholder semesters on error
      const placeholderSemesters = []
      for (let i = 1; i <= 8; i++) {
        placeholderSemesters.push({
          id: `placeholder-${i}`,
          number: i,
          name: `Semester ${i}`,
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

  const retryConnection = () => {
    setLoading(true)
    setError("")
    fetchSemesters()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading semesters...</p>
          <p className="text-sm text-gray-400 mt-2">Connecting to: {API_URL}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-6">
              <img
                src={logoImage || "/placeholder.svg"}
                alt="Engineer Sathi Logo"
                className="h-24 w-24 mx-auto object-contain mb-4 rounded-lg shadow-lg"
                onError={(e) => {
                  console.log("Logo failed to load, using placeholder")
                  e.target.src = "/placeholder.svg?height=96&width=96"
                }}
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Engineer Sathi</h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">Your Engineering Study Companion</p>

            <div className="flex justify-center mb-8">
              <a
                href="https://www.youtube.com/@EngineerSathi-o9m"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Youtube className="h-6 w-6" />
                <span>Watch Our YouTube Channel</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Engineer Sathi */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Engineer Sathi</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Engineer Sathi is your trusted companion for engineering studies. We provide comprehensive study
              materials, notes, and resources to help engineering students excel in their academic journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Notes</h3>
              <p className="text-gray-600">Comprehensive study materials for all engineering subjects</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
              <p className="text-gray-600">Join thousands of engineering students in our community</p>
            </div>
            <div className="text-center">
              <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Success</h3>
              <p className="text-gray-600">Helping students achieve academic excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Error Message */}
      {error && (
        <section className="py-6 bg-red-50 border-l-4 border-red-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-800 font-medium">⚠️ {error}</p>
              </div>
              <button
                onClick={retryConnection}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Semesters Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Semester</h2>
            <p className="text-gray-600">
              {error ? "Showing placeholder semesters (offline mode)" : "Select a semester to view subjects and notes"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {semesters.map((semester) => (
              <SemesterCard key={semester.number} semester={semester} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

// Semester Card Component - Now uses semester NUMBER in URL
const SemesterCard = ({ semester }) => {
  const isPlaceholder = semester.is_placeholder
  const hasContent = semester.total_subjects > 0

  if (isPlaceholder && !hasContent) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-8 text-center opacity-60 cursor-not-allowed relative">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-gray-400">{semester.number}</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-400">Semester {semester.number}</h3>
        <p className="text-xs text-gray-400 mt-2">Not available</p>
      </div>
    )
  }

  return (
    <Link
      to={`/semester/${semester.number}`} // Use semester NUMBER, not database ID
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group text-center cursor-pointer hover:border-blue-300 relative"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <span className="text-3xl font-bold text-white">{semester.number}</span>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
        Semester {semester.number}
      </h3>

      <div className="text-xs text-gray-400 mt-1">{semester.total_subjects || 0} Subjects</div>

      <div className="mt-4 flex items-center justify-center text-blue-600 group-hover:text-blue-700">
        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

export default Home
