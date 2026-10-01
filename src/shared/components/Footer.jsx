import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">Alder &amp; Form</div>
          <p className="footer-tagline">
            Considered furniture, honest materials, and pieces made to settle into your life.
          </p>
        </div>

        <div className="footer-col">
          <div className="footer-col-title">Shop</div>
          <Link to="/products" className="footer-link">All furniture</Link>
          <Link to="/cart" className="footer-link">Your cart</Link>
        </div>

        <div className="footer-col">
          <div className="footer-col-title">Visit us</div>
          <p className="footer-text">Mon–Sat, 10–6</p>
          <p className="footer-text">Design District</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Alder &amp; Form. UI preview with mock data.</span>
      </div>
    </footer>
  )
}
