"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "./FeaturedNotes.css"

const FeaturedNotes = () => {
  const [featuredNotes, setFeaturedNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedNotes()
  }, [])

  const fetchFeaturedNotes = async () => {
    try {
      const response = await axios.get("/api/featured-notes/")
      setFeaturedNotes(response.data)
    } catch (error) {
      console.error("Error fetching featured notes:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>,
      )
    }

    const emptyStars = 5 - fullStars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star">
          ☆
        </span>,
      )
    }

    return stars
  }

  if (loading || featuredNotes.length === 0) {
    return null
  }

  return (
    <div className="featured-section">
      <h2>⭐ Featured Notes</h2>
      <div className="featured-grid">
        {featuredNotes.map((note) => (
          <Link key={note.id} to={`/note/${note.id}`} className="featured-note">
            <div className="featured-badge">Featured</div>

            {note.thumbnail && (
              <div className="featured-thumbnail">
                <img src={note.thumbnail || "/placeholder.svg"} alt={note.title} />
              </div>
            )}

            <div className="featured-content">
              <div className="featured-meta">
                <span className="subject-code">{note.subject_code}</span>
                <span className="note-type">{note.note_type}</span>
              </div>

              <h4 className="featured-title">{note.title}</h4>
              <p className="featured-description">{note.description}</p>

              <div className="featured-stats">
                <div className="rating">
                  {renderStars(note.average_rating)}
                  <span className="rating-text">({note.total_ratings})</span>
                </div>
                <span className="downloads">📥 {note.downloads}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default FeaturedNotes
