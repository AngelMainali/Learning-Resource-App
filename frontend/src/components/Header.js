"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./Header.css"

const Header = () => {
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/stats/")
      setStats(response.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
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
          <div className="stat-item">
            <span className="stat-number">{stats.total_notes || 0}</span>
            <span className="stat-label">Notes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.total_downloads || 0}</span>
            <span className="stat-label">Downloads</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.total_comments || 0}</span>
            <span className="stat-label">Comments</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.total_ratings || 0}</span>
            <span className="stat-label">Ratings</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
