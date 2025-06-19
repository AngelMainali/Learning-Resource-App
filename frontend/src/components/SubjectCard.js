import { Link } from "react-router-dom"
import "./SubjectCard.css"

const SubjectCard = ({ subject }) => {
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>,
      )
    }

    const emptyStars = 5 - fullStars
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
    <Link to={`/subject/${subject.id}`} className="subject-card">
      {subject.thumbnail && (
        <div className="subject-thumbnail">
          <img src={subject.thumbnail || "/placeholder.svg"} alt={subject.name} />
        </div>
      )}

      <div className="subject-content">
        <div className="subject-header">
          <div className="subject-code">{subject.code}</div>
          <div className="subject-credits">{subject.credits} Credits</div>
        </div>

        <h3 className="subject-name">{subject.name}</h3>
        <p className="subject-description">{subject.description}</p>

        <div className="subject-stats">
          <div className="stat-row">
            <span className="stat-item">📚 {subject.total_notes} Notes</span>
            <span className="stat-item">📥 {subject.total_downloads} Downloads</span>
          </div>

          {subject.average_rating > 0 && (
            <div className="subject-rating">
              {renderStars(subject.average_rating)}
              <span className="rating-text">({subject.average_rating.toFixed(1)})</span>
            </div>
          )}
        </div>
      </div>

      <div className="subject-arrow">
        <span>→</span>
      </div>
    </Link>
  )
}

export default SubjectCard
