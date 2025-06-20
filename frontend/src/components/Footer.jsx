import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-brand">
            <img src="/logo.jpg" alt="Engineer Sathi Logo" className="footer-logo" />
            <h3>Engineer Sathi</h3>
          </div>
          <p>
            Your trusted companion for engineering education. Access quality notes, resources, and materials to excel in
            your academic journey.
          </p>

          <div className="social-links">
            <a
              href="https://www.youtube.com/@EngineerSathi-o9m"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link youtube-link"
              title="YouTube Channel"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/">🏠 Home</a>
            </li>
            <li>
              <a href="/feedback">💬 Feedback</a>
            </li>
          </ul>  
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <p>📧 Email: engineersathi07@gmail.com</p>
          <p>📱 Phone: 9804937789</p>
          <p>🕒 Available: 24/7 Online Support</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 Engineer Sathi. All rights reserved. | Made with ❤️ for Engineering Students</p>
      </div>
    </footer>
  )
}

export default Footer
