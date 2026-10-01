import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { apiFetch, authHeaders, resolveImage } from '../../lib/api'
import './product-page.css'

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

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await apiFetch(`/api/Product/${id}`, {
          headers: { ...authHeaders() },
        })
        // Support { data: {...} } wrapper or direct object
        const raw = data?.data ?? data
        setProduct(norm(raw))
      } catch (err) {
        setError(err.message || 'Failed to load product.')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAdd = () => {
    addToCart(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="pd-container">
          <div className="pd-loading">
            <div className="loading-spinner" />
            <p>Loading product…</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="pd-container">
          <div className="pd-not-found">
            <p>{error || 'Product not found.'}</p>
            <Link to="/products" className="pd-back-link">← Back to products</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Product ──────────────────────────────────────────────
  return (
    <div className="product-detail-page">
      <div className="pd-container">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          <Link to="/" className="pd-bread-link">Home</Link>
          <span className="pd-bread-sep">›</span>
          <Link to="/products" className="pd-bread-link">Products</Link>
          <span className="pd-bread-sep">›</span>
          <span className="pd-bread-current">{product.name}</span>
        </nav>

        <div className="pd-grid">
          {/* Image */}
          <div className="pd-image-wrap">
            <img
              src={product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'} alt={product.name}
              className="pd-image"
              onError={e => {
                e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
              }}
            />
          </div>

          {/* Info */}
          <div className="pd-info">
            <p className="pd-category">{product.category.toUpperCase()}</p>
            <h1 className="pd-name">{product.name}</h1>
            <p className="pd-price">${Number(product.price).toLocaleString()}</p>

            <p className="pd-desc">{product.description}</p>

            {/* Quantity selector */}
            <div className="pd-qty-row">
              <label className="pd-label">Quantity</label>
              <div className="pd-qty-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >−</button>
                <span className="qty-value">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty(q => q + 1)}
                >+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="pd-actions">
              <button
                className={`pd-add-btn ${added ? 'pd-added' : ''}`}
                onClick={handleAdd}
                disabled={product.quantity === 0}
              >
                {added ? '✓ Added to cart' : 'Add to cart'}
              </button>
              <button
                className="pd-back-btn"
                onClick={() => navigate('/products')}
              >
                ← Back
              </button>
            </div>

            {/* Details */}
            <div className="pd-details-list">
              <div className="pd-detail-row">
                <span className="pd-detail-key">Category</span>
                <span className="pd-detail-val">{product.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
