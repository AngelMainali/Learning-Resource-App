import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import Home from "./pages/Home"
import SemesterDetail from "./pages/SemesterDetail"
import SubjectDetail from "./pages/SubjectDetail"
import NoteDetail from "./pages/NoteDetail"
import Feedback from "./pages/Feedback"
import ScrollToTop from "./components/ScrollToTop"
import "./index.css"

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/semester/:id" element={<SemesterDetail />} />
            <Route path="/subject/:id" element={<SubjectDetail />} />
            <Route path="/note/:id" element={<NoteDetail />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
