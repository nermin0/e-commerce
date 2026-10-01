import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { apiFetch, authHeaders, resolveImage } from '../../lib/api'
import './home.css'

// Furniture fallback images — used when API image is missing or broken
const FURNITURE_FALLBACKS = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', // sofa
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80', // chair
  'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=80', // coffee table
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80', // bedroom
]

// Normalise raw API product
const norm = (p, idx) => ({
  id: p.id,
  name: p.name ?? '',
  description: p.description ?? '',
  price: p.price ?? 0,
  category: p.category ?? '',
  image: resolveImage(p.img),
  fallback: FURNITURE_FALLBACKS[idx % FURNITURE_FALLBACKS.length],
  quantity: p.countOfPices ?? p.quantity ?? 0,
})

export default function Home() {
  const { addToCart } = useCart()
  const [featured, setFeatured] = useState([])
  const [addedMap, setAddedMap] = useState({})

  useEffect(() => {
    apiFetch('/api/Product', { headers: { ...authHeaders() } })
      .then(data => {
        const all = Array.isArray(data) ? data : data?.data ?? []
        setFeatured(all.slice(0, 4).map((p, idx) => norm(p, idx)))
      })
      .catch(() => {
        // silently fallback to empty — home page doesn't show errors
        setFeatured([])
      })
  }, [])

  const handleAdd = (product) => {
    addToCart(product)
    setAddedMap(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAddedMap(prev => ({ ...prev, [product.id]: false })), 1200)
  }

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">NEW COLLECTION · AUTUMN 2026</p>
          <h1 className="hero-title">
            Rooms that feel unmistakably yours.
          </h1>
          <p className="hero-subtitle">
            Furniture with a quiet point of view—crafted from honest materials
            and made for everyday rituals.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">
              Shop collection →
            </Link>
            <Link to="/products" className="btn-ghost">
              Explore categories
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-value">10 yr</span>
              <span className="stat-label">Frame warranty</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value stat-accent">FSC</span>
              <span className="stat-label">Certified timber</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">4.9</span>
              <span className="stat-label">Customer rating</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <img
            src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"
            alt="Modern sofa"
            className="hero-img"
          />
          <div className="hero-tag">
            {featured[0] ? (
              <>
                <p className="hero-tag-title">{featured[0].name.toUpperCase()}</p>
                <p className="hero-tag-desc">{featured[0].description}</p>
              </>
            ) : (
              <>
                <p className="hero-tag-title">THE VALE SOFA</p>
                <p className="hero-tag-desc">Soft structure, generous comfort.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Featured Pieces ── */}
      <section className="featured">
        <div className="featured-header">
          <div>
            <p className="section-eyebrow">FEATURED PIECES</p>
            <h2 className="section-title">Made to live with.</h2>
          </div>
          <Link to="/products" className="view-all-link">
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          /* Skeleton placeholders while loading */
          <div className="featured-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="product-card">
                <div className="card-img-skeleton" />
                <div className="card-body">
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line medium" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="featured-grid">
            {featured.map(product => (
              <div key={product.id} className="product-card">
                <Link to={`/products/${product.id}`} className="card-img-wrap">
                  <img
                    src={product.image || product.fallback}
                    alt={product.name}
                    className="card-img"
                    onError={e => { e.target.onerror = null; e.target.src = product.fallback }}
                  />
                </Link>
                <div className="card-body">
                  <div className="card-top">
                    <p className="card-cat">{product.category.toUpperCase()}</p>
                    <span className="card-price">${Number(product.price).toLocaleString()}</span>
                  </div>
                  <Link to={`/products/${product.id}`} className="card-name">
                    {product.name}
                  </Link>
                  <p className="card-desc">{product.description}</p>
                  <div className="card-actions">
                    <button
                      className={`btn-add ${addedMap[product.id] ? 'btn-added' : ''}`}
                      onClick={() => handleAdd(product)}
                    >
                      {addedMap[product.id] ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Added
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                          </svg>
                          Add
                        </>
                      )}
                    </button>
                    <Link to={`/products/${product.id}`} className="btn-details">
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── About Section ── */}
      <section className="about">
        <div className="about-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1449247709967-d4461a6a6103?w=700&q=80"
            alt="Dining room"
            className="about-img"
          />
        </div>
        <div className="about-content">
          <p className="section-eyebrow">OUR POINT OF VIEW</p>
          <h2 className="about-title">Better materials. Fewer compromises.</h2>
          <p className="about-text">
            We work with small workshops and responsible mills to create furniture
            that grows more personal with time. Every detail earns its place.
          </p>
          <div className="about-checks">
            <div className="about-check">
              <span className="check-icon">✓</span>
              <span>Crafted with care</span>
            </div>
            <div className="about-check">
              <span className="check-icon">✓</span>
              <span>Timeless materials</span>
            </div>
            <div className="about-check">
              <span className="check-icon">✓</span>
              <span>Everyday living</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="newsletter">
        <div className="newsletter-inner">
          <div className="newsletter-text">
            <h3 className="newsletter-title">Notes for a considered home.</h3>
            <p className="newsletter-sub">
              New pieces, material stories, and thoughtful spaces—occasionally.
            </p>
          </div>
          <form
            className="newsletter-form"
            onSubmit={e => {
              e.preventDefault()
              alert('Thank you for subscribing!')
            }}
          >
            <div className="newsletter-input-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9a9a9a" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                placeholder="you@example.com"
                className="newsletter-input"
              />
            </div>
            <button type="submit" className="btn-subscribe">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  )
}
