"use client"

import { useState } from "react"
import axios from "axios"
import "./CommentSection.css"

const CommentSection = ({ noteId, comments, onCommentSubmit }) => {
  const [authorName, setAuthorName] = useState("")
  const [authorEmail, setAuthorEmail] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    setSubmitting(true)
    try {
      await axios.post(`/api/notes/${noteId}/comments/`, {
        author_name: authorName,
        author_email: authorEmail,
        content: content,
      })

      setMessage("Comment submitted successfully!")
      setAuthorName("")
      setAuthorEmail("")
      setContent("")
      onCommentSubmit()
    } catch (error) {
      setMessage("Failed to submit comment")
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="comment-section card">
      <h3>Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <h4>Add a Comment</h4>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="comment-name">Your Name</label>
            <input
              type="text"
              id="comment-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="comment-email">Your Email</label>
            <input
              type="email"
              id="comment-email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="comment-content">Your Comment</label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-control"
            rows="4"
            placeholder="Share your thoughts about this note..."
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Submitting..." : "Post Comment"}
        </button>
      </form>

      {message && <div className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</div>}

      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <strong className="comment-author">{comment.author_name}</strong>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
              </div>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection
