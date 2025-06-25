import { Link } from "react-router-dom"
import "./SemesterCard.css"

const SemesterCard = ({ semester }) => {
  return (
    <Link to={`/semester/${semester.number}`} className="semester-card">
      <div className="semester-number">
        <span className="number">{semester.number}</span>
      </div>

      <div className="semester-content">
        <h3 className="semester-title">{semester.name}</h3>
        <p className="semester-description">{semester.description}</p>

        <div className="semester-stats">
          <div className="stat">
            <span className="stat-number">{semester.total_subjects}</span>
            <span className="stat-label">Subjects</span>
          </div>
          <div className="stat">
            <span className="stat-number">{semester.total_notes}</span>
            <span className="stat-label">Notes</span>
          </div>
        </div>
      </div>

      <div className="semester-arrow">
        <span>→</span>
      </div>
    </Link>
  )
}

export default SemesterCard
