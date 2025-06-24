"use client"

import { useState, useEffect } from "react"
import { API_URL } from "../config"

const CommentSection = ({ noteId }) => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchComments()
  }, [noteId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      setError("")
      console.log(`Fetching comments from: ${API_URL}/api/notes/${noteId}/comments/`)

      const response = await fetch(`${API_URL}/api/notes/${noteId}/comments/`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Comments fetched successfully:", data)
      setComments(data.results || data || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
      setError(`Failed to load comments: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newComment.trim()) {
      return
    }

    setSubmitting(true)
    setError("")

    try {
      console.log(`Submitting comment to: ${API_URL}/api/notes/${noteId}/comments/`)

      const response = await fetch(`${API_URL}/api/notes/${noteId}/comments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author_name: authorName,
          author_email: authorEmail,
          content: newComment,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      const newCommentData = await response.json()
      console.log("Comment submitted successfully:", newCommentData)

      // Clear form
      setNewComment("")
      setAuthorName("")
      setAuthorEmail("")

      // Refresh comments
      fetchComments()
    } catch (error) {
      console.error("Error submitting comment:", error)
      setError(`Failed to post comment: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = () => {
    fetchComments()
  }

  return (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Comments</h3>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-red-800 text-sm">{error}</p>
            <button onClick={handleRetry} className="text-red-600 hover:text-red-800 text-sm font-medium">
              Retry
            </button>
          </div>
          <p className="text-red-600 text-xs mt-1">
            API: {API_URL}/api/notes/{noteId}/comments/
          </p>
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="comment-name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="comment-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="comment-email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              type="email"
              id="comment-email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={submitting}
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-1">
            Your Comment
          </label>
          <textarea
            id="comment-content"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            placeholder="Share your thoughts about this note..."
            disabled={submitting}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={submitting || !newComment.trim()}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </p>
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-l-4 border-blue-200 pl-4 py-3 hover:bg-gray-50 rounded-r-md transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{comment.author_name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentSection
