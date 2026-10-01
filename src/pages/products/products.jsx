import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { apiFetch, authHeaders, resolveImage } from '../../lib/api'
import './products.css'

const CATEGORIES = ['All', 'Living Room', 'Bed Room', 'Dining Room', 'Kitchen', 'Test']

// Map raw API product → normalised shape
const norm = (p) => ({
  id: p.id,
  name: p.name ?? '',
  description: p.description ?? '',
  price: p.price ?? 0,
  category: p.category ?? '',
  image: resolveImage(p.img),
  userId: p.appUserId ?? p.userId ?? null,
  quantity: p.countOfPices ?? p.quantity ?? 0,
})

export default function Products() {
  const { addToCart } = useCart()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [addedMap, setAddedMap] = useState({})

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch('/api/Product', {
          headers: { ...authHeaders() },
        })
        setProducts(Array.isArray(data) ? data : data?.data ?? [])
      } catch (err) {
        setError(err.message || 'Failed to load products.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const filtered =
    activeCategory === 'All'
      ? products
      : products.filter(p =>
        (p.category || '').toLowerCase() === activeCategory.toLowerCase()
      )

  const handleAdd = (product) => {
    const p = norm(product)
    addToCart(p)
    setAddedMap(prev => ({ ...prev, [p.id]: true }))
    setTimeout(() => setAddedMap(prev => ({ ...prev, [p.id]: false })), 1200)
  }

  return (
    <div className="products-page">
      <div className="products-container">
        <div className="products-header">
          <div>
            <p className="page-eyebrow">COLLECTION</p>
            <h1 className="page-title">All furniture</h1>
            {!loading && !error && (
              <p className="page-sub">{filtered.length} pieces available</p>
            )}
          </div>
        </div>

        {/* Category filters — built dynamically from real data */}
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'filter-active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="products-loading">
            <div className="loading-spinner" />
            <p>Loading products…</p>
          </div>
        )}

        {!loading && error && (
          <div className="products-error">
            <p>{error}</p>
            <button className="btn-primary-sm" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state">
            <p>No products in this category yet.</p>
            <button className="btn-primary-sm" onClick={() => setActiveCategory('All')}>
              View all
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="products-grid">
            {filtered.map(raw => {
              const p = norm(raw)
              return (
                <div key={p.id} className="product-card">
                  <Link to={`/products/${p.id}`} className="card-img-wrap">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'}
                      alt={p.name}
                      className="card-img"
                      onError={e => {
                        e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'
                      }}
                    />
                  </Link>
                  <div className="card-body">
                    <div className="card-top">
                      <p className="card-cat">{p.category.toUpperCase()}</p>
                      <span className="card-price">${Number(p.price).toLocaleString()}</span>
                    </div>
                    <Link to={`/products/${p.id}`} className="card-name">{p.name}</Link>
                    <p className="card-desc">{p.description}</p>
                    <div className="card-actions">
                      <button
                        className={`btn-add ${addedMap[p.id] ? 'btn-added' : ''}`}
                        onClick={() => handleAdd(raw)}
                      >
                        {addedMap[p.id] ? (
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
                      <Link to={`/products/${p.id}`} className="btn-details">Details →</Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
