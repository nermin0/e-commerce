import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './register.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await register(name.trim(), email.trim(), password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      {/* Left – image */}
      <div className="register-left">
        <img
          src="https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=900&q=80"
          alt="Dining room"
          className="register-bg-img"
        />
        <div className="register-quote">
          "Furniture that earns its place in your life—one day at a time."
        </div>
      </div>

      {/* Right – form */}
      <div className="register-right">
        <div className="register-form-wrap">
          <div className="register-brand">Alder &amp; Form</div>

          <p className="register-eyebrow">CREATE ACCOUNT</p>
          <h1 className="register-title">Join the collection.</h1>
          <p className="register-subtitle">
            Create an account to save your favourites and manage your pieces.
          </p>

          {error && (
            <div className="form-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="register-form" noValidate>
            <div className="form-field">
              <label className="form-label" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="e.g. Nora"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="pass-wrap">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="register-submit-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="register-login-link">
            Already have an account?{' '}
            <Link to="/login" className="link-accent">Sign in</Link>
          </p>

          <Link to="/" className="register-back">
            ‹ Back to store
          </Link>
        </div>
      </div>
    </div>
  )
}
