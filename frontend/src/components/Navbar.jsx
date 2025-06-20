"use client"

import { Link } from "react-router-dom"
import { MessageSquare } from "lucide-react"

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/Logo.jpg" alt="Engineer Sathi Logo" className="h-10 w-10 object-contain rounded" />
            <span className="text-xl font-bold text-gray-900">Engineer Sathi</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link
              to="/feedback"
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
