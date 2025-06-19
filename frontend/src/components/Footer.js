import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Notes Hub</h3>
            <p>Your go-to platform for accessing and sharing educational notes.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/feedback">Feedback</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>Email: admin@noteshub.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Notes Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
