import { Link } from "react-router-dom"
import "./NoteCard.css"

const NoteCard = ({ note }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>,
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>,
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star">
          ☆
        </span>,
      )
    }

    return stars
  }

  return (
    <div className="note-card">
      {note.is_featured && <div className="featured-badge">Featured</div>}

      {note.thumbnail && (
        <div className="note-thumbnail">
          <img src={note.thumbnail || "/placeholder.svg"} alt={note.title} />
        </div>
      )}

      <div className="note-content">
        <div className="note-header">
          <h3 className="note-title">
            <Link to={`/note/${note.id}`}>{note.title}</Link>
          </h3>
          <div className="note-badges">
            <span className="subject-code">{note.subject_code}</span>
            <span className="note-type">{note.note_type}</span>
          </div>
        </div>

        <p className="note-description">{note.description}</p>

        {note.chapter && (
          <div className="note-chapter">
            <span className="chapter-badge">📖 {note.chapter}</span>
          </div>
        )}

        {note.tags && (
          <div className="note-tags">
            {note.tags.split(",").map((tag, index) => (
              <span key={index} className="tag">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="note-meta">
          <div className="note-rating">
            {renderStars(note.average_rating)}
            <span className="rating-text">
              ({note.average_rating.toFixed(1)}) {note.total_ratings} reviews
            </span>
          </div>

          <div className="note-stats">
            <span className="downloads">📥 {note.downloads} downloads</span>
            <span className="date">📅 {formatDate(note.created_at)}</span>
          </div>
        </div>

        <div className="note-actions">
          <Link to={`/note/${note.id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NoteCard
