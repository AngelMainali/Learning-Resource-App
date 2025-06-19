import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import SemesterDetail from "./pages/SemesterDetail"
import SubjectDetail from "./pages/SubjectDetail"
import NoteDetail from "./pages/NoteDetail"
import Feedback from "./pages/Feedback"
import "./index.css"

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/semester/:id" element={<SemesterDetail />} />
          <Route path="/subject/:id" element={<SubjectDetail />} />
          <Route path="/note/:id" element={<NoteDetail />} />
          <Route path="/feedback" element={<Feedback />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
