import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, authHeaders } from '../../lib/api'
import { useMyProducts } from '../../context/ProductsContext'
import './add-product.css'

const CATEGORIES = ['Living Room', 'Bedroom', 'Dining', 'Lighting', 'Storage', 'Outdoor']

export default function AddProduct() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { fetchMyProducts } = useMyProducts()

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: 'Living Room',
    image: null,
    imagePreview: null,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm(prev => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      errs.price = 'Enter a valid price.'
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) < 1)
      errs.quantity = 'Enter a valid quantity.'
    if (!form.image) errs.image = 'Product image is required.'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('Name', form.name.trim())
      fd.append('Description', form.description.trim())
      fd.append('Price', form.price)
      fd.append('quantity', form.quantity)
      fd.append('category', form.category)
      fd.append('Img', form.image)

      await apiFetch('/api/Product', {
        method: 'POST',
        headers: { ...authHeaders() },
        body: fd,
      })

      await fetchMyProducts()
      setSubmitted(true)
      setTimeout(() => navigate('/my-products'), 1600)
    } catch (err) {
      setApiError(err.message || 'Failed to add product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ───────────────────────────────────────
  if (submitted) {
    return (
      <div className="add-product-page">
        <div className="ap-container">
          <div className="ap-success">
            <div className="ap-success-icon">✓</div>
            <h2 className="ap-success-title">Product added!</h2>
            <p className="ap-success-sub">Redirecting to your collection…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="add-product-page">
      <div className="ap-container">
        <div className="ap-header">
          <p className="ap-eyebrow">YOUR COLLECTION</p>
          <h1 className="ap-title">Add a new product.</h1>
          <p className="ap-subtitle">Fill in all fields to list your product.</p>
        </div>

        {apiError && <div className="ap-api-error">{apiError}</div>}

        <form className="ap-form" onSubmit={handleSubmit} noValidate>
          <div className="ap-form-left">

            {/* Name */}
            <div className="form-field">
              <label className="form-label" htmlFor="ap-name">Product name</label>
              <input id="ap-name" name="name" type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Rowan Lounge Chair"
                value={form.name} onChange={handleChange} disabled={loading} />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="form-field">
              <label className="form-label" htmlFor="ap-desc">Description</label>
              <textarea id="ap-desc" name="description" rows={4}
                className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe the product…"
                value={form.description} onChange={handleChange} disabled={loading} />
              {errors.description && <p className="field-error">{errors.description}</p>}
            </div>

            {/* Price & Quantity */}
            <div className="ap-row">
              <div className="form-field" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="ap-price">Price ($)</label>
                <input id="ap-price" name="price" type="number" min="0" step="0.01"
                  className={`form-input ${errors.price ? 'input-error' : ''}`}
                  placeholder="0.00"
                  value={form.price} onChange={handleChange} disabled={loading} />
                {errors.price && <p className="field-error">{errors.price}</p>}
              </div>

              <div className="form-field" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="ap-qty">Quantity</label>
                <input id="ap-qty" name="quantity" type="number" min="1"
                  className={`form-input ${errors.quantity ? 'input-error' : ''}`}
                  placeholder="1"
                  value={form.quantity} onChange={handleChange} disabled={loading} />
                {errors.quantity && <p className="field-error">{errors.quantity}</p>}
              </div>
            </div>

            {/* Category */}
            <div className="form-field">
              <label className="form-label" htmlFor="ap-category">Category</label>
              <select id="ap-category" name="category"
                className="form-input form-select"
                value={form.category} onChange={handleChange} disabled={loading}>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="ap-buttons">
              <button type="button" className="ap-cancel-btn"
                onClick={() => navigate(-1)} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="ap-submit-btn" disabled={loading}>
                {loading ? 'Adding product…' : 'Add product'}
              </button>
            </div>
          </div>

          {/* Image upload */}
          <div className="ap-form-right">
            <label className="form-label">Product image <span style={{ color: 'var(--red)' }}>*</span></label>
            <div className={`ap-image-drop ${errors.image ? 'ap-image-error' : ''}`}
              onClick={() => !loading && fileInputRef.current.click()}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && !loading && fileInputRef.current.click()}>
              {form.imagePreview ? (
                <img src={form.imagePreview} alt="Preview" className="ap-image-preview" />
              ) : (
                <div className="ap-upload-placeholder">
                  <div className="ap-upload-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <p className="ap-upload-label">Choose a product image</p>
                  <p className="ap-upload-hint">JPG or PNG, under 5 MB</p>
                </div>
              )}
            </div>
            {errors.image && <p className="field-error">{errors.image}</p>}
            <input ref={fileInputRef} type="file" accept="image/*"
              className="ap-file-input" onChange={handleImageChange} />
            {form.imagePreview && (
              <button type="button" className="ap-remove-img"
                onClick={() => setForm(prev => ({ ...prev, image: null, imagePreview: null }))}
                disabled={loading}>
                Remove image
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
