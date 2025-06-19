"use client"

import { useState } from "react"
import axios from "axios"
import "./RatingSection.css"

const RatingSection = ({ noteId, onRatingSubmit }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      setMessage("Please select a rating")
      return
    }

    setSubmitting(true)
    try {
      await axios.post(`/api/notes/${noteId}/ratings/`, {
        author_name: authorName,
        author_email: authorEmail,
        score: rating,
      })

      setMessage("Rating submitted successfully!")
      setRating(0)
      setAuthorName("")
      setAuthorEmail("")
      onRatingSubmit()
    } catch (error) {
      if (error.response?.status === 400) {
        setMessage("You have already rated this note")
      } else {
        setMessage("Failed to submit rating")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rating-section card">
      <h3>Rate this Note</h3>

      <form onSubmit={handleSubmit}>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${star <= (hoverRating || rating) ? "active" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </button>
          ))}
          <span className="rating-label">{rating > 0 && `${rating} star${rating > 1 ? "s" : ""}`}</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rating-name">Your Name</label>
            <input
              type="text"
              id="rating-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rating-email">Your Email</label>
            <input
              type="email"
              id="rating-email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting || rating === 0}>
          {submitting ? "Submitting..." : "Submit Rating"}
        </button>
      </form>

      {message && <div className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</div>}
    </div>
  )
}

export default RatingSection
