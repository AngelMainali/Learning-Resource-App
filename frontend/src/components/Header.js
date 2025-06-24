"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { API_URL } from "../config"

const Header = () => {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      console.log("Fetching stats from:", `${API_URL}/api/stats/`)

      const response = await fetch(`${API_URL}/api/stats/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Stats response:", data)

      setStats(data)
      setError("")
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError("Failed to load stats")
      // Set default stats on error
      setStats({
        total_notes: 0,
        total_downloads: 0,
        total_comments: 0,
        total_ratings: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>📚 Notes Hub</h1>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/feedback" className="nav-link">
              Feedback
            </Link>
          </nav>
        </div>

        <div className="stats-bar">
          {error && (
            <div className="stat-item">
              <span className="text-red-500 text-sm">⚠️ Stats unavailable</span>
            </div>
          )}

          {!error && (
            <>
              <div className="stat-item">
                <span className="stat-number">{loading ? "..." : stats.total_notes || 0}</span>
                <span className="stat-label">Notes</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{loading ? "..." : stats.total_downloads || 0}</span>
                <span className="stat-label">Downloads</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{loading ? "..." : stats.total_comments || 0}</span>
                <span className="stat-label">Comments</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{loading ? "..." : stats.total_ratings || 0}</span>
                <span className="stat-label">Ratings</span>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
