"use client"

import { useState } from "react"
import { MessageSquare, Send, CheckCircle, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import axios from "axios"

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback_type: "general",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await axios.post("/api/feedback/", formData)
      setSubmitted(true)
      setFormData({
        name: "",
        email: "",
        feedback_type: "general",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="card">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your feedback has been submitted successfully. We appreciate your input!
            </p>
            <div className="space-y-3">
              <button onClick={() => setSubmitted(false)} className="btn btn-primary w-full">
                Submit Another Feedback
              </button>
              <Link to="/" className="btn btn-secondary w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          <MessageSquare className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Send Feedback</h1>
          <p className="text-lg text-gray-600">
            Help us improve the Academic Notes Hub by sharing your thoughts and suggestions.
          </p>
        </div>

        {/* Feedback Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Type</label>
              <select name="feedback_type" value={formData.feedback_type} onChange={handleChange} className="input">
                <option value="general">General Feedback</option>
                <option value="suggestion">Suggestion</option>
                <option value="bug">Bug Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="input"
                placeholder="Brief description of your feedback"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="input"
                placeholder="Please provide detailed feedback..."
                required
              />
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3 text-lg">
              <Send className="h-5 w-5 mr-2" />
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Feedback
