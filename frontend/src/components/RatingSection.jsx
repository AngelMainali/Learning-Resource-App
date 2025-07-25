"use client"

import { useState } from "react"
import { API_URL } from "../config"

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
    setMessage("")

    try {
      console.log("Submitting rating to:", `${API_URL}/api/notes/${noteId}/ratings/`)

      const response = await fetch(`${API_URL}/api/notes/${noteId}/ratings/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author_name: authorName,
          author_email: authorEmail,
          score: rating,
        }),
      })

      console.log("Rating response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Rating submitted successfully:", data)

        setMessage("Rating submitted successfully!")
        setRating(0)
        setAuthorName("")
        setAuthorEmail("")
        if (onRatingSubmit) onRatingSubmit()
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}))
        setMessage(errorData.detail || "You have already rated this note")
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      setMessage("Failed to submit rating. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    setMessage("")
    handleSubmit({ preventDefault: () => {} })
  }

  return (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Rate this Note</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-2xl transition-colors ${
                  star <= (hoverRating || rating)
                    ? "text-yellow-400 hover:text-yellow-500"
                    : "text-gray-300 hover:text-gray-400"
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={submitting}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="text-sm text-gray-600">
              {rating} star{rating > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="rating-name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="rating-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="rating-email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              type="email"
              id="rating-email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting || rating === 0}
        >
          {submitting ? "Submitting..." : "Submit Rating"}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            message.includes("success")
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message}
          {message.includes("Failed") && (
            <button
              onClick={handleRetry}
              className="ml-2 text-red-600 hover:text-red-800 underline"
              disabled={submitting}
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default RatingSection
