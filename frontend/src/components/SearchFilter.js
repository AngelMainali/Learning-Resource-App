"use client"

import { useState, useEffect } from "react"
import { API_URL } from "../config"
import "./SearchFilter.css"

const SearchFilter = ({ onFilterChange }) => {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, category })
    }, 500)

    return () => clearTimeout(timer)
  }, [search, category, onFilterChange])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      console.log("Fetching categories from:", `${API_URL}/api/categories/`)

      const response = await fetch(`${API_URL}/api/categories/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Categories response:", data)

      setCategories(data.results || data || [])
      setError("")
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError("Failed to load categories")
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSearch("")
    setCategory("")
  }

  return (
    <div className="search-filter">
      <div className="filter-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="category-filter">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-control"
            disabled={loading}
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {error && <div className="text-red-500 text-xs mt-1">Categories unavailable</div>}
        </div>

        <button onClick={handleReset} className="btn btn-secondary">
          Reset
        </button>

        {error && (
          <button onClick={fetchCategories} className="btn btn-outline" disabled={loading}>
            {loading ? "Loading..." : "Retry"}
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchFilter
