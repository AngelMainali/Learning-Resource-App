"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./SearchFilter.css"

const SearchFilter = ({ onFilterChange }) => {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState([])

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
      const response = await axios.get("/api/categories/")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
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
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-control">
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleReset} className="btn btn-secondary">
          Reset
        </button>
      </div>
    </div>
  )
}

export default SearchFilter
