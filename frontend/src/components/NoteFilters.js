"use client"

import { useState, useEffect } from "react"
import "./NoteFilters.css"

const NoteFilters = ({ onFilterChange }) => {
  const [search, setSearch] = useState("")
  const [type, setType] = useState("")
  const [chapter, setChapter] = useState("")

  const noteTypes = [
    { value: "lecture", label: "Lecture Notes" },
    { value: "assignment", label: "Assignment" },
    { value: "tutorial", label: "Tutorial" },
    { value: "exam", label: "Exam Paper" },
    { value: "reference", label: "Reference Material" },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, type, chapter })
    }, 500)

    return () => clearTimeout(timer)
  }, [search, type, chapter, onFilterChange])

  const handleReset = () => {
    setSearch("")
    setType("")
    setChapter("")
  }

  return (
    <div className="note-filters">
      <div className="filters-row">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-group">
          <select value={type} onChange={(e) => setType(e.target.value)} className="form-control">
            <option value="">All Types</option>
            {noteTypes.map((noteType) => (
              <option key={noteType.value} value={noteType.value}>
                {noteType.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <input
            type="text"
            placeholder="Chapter/Unit..."
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="form-control"
          />
        </div>

        <button onClick={handleReset} className="btn btn-secondary">
          Reset
        </button>
      </div>
    </div>
  )
}

export default NoteFilters
