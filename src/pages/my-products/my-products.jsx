import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch, authHeaders } from '../../lib/api'
import { useMyProducts } from '../../context/ProductsContext'
import './my-products.css'

const CATEGORIES = ['Living Room', 'Bedroom', 'Dining', 'Lighting', 'Storage', 'Outdoor']

export default function MyProducts() {
  const { myProducts, loading, error, fetchMyProducts, removeMyProduct } = useMyProducts()

  // ── Delete state ─────────────────────────────────────────
  const [confirmId, setConfirmId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // ── Edit state ───────────────────────────────────────────
  const [editProduct, setEditProduct] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editErrors, setEditErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => { fetchMyProducts() }, [fetchMyProducts])

  // ── Open edit modal ──────────────────────────────────────
  const openEdit = (product) => {
    setEditProduct(product)
    setEditForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity || 1,
      category: product.category,
      description: product.description || '',
    })
    setEditErrors({})
    setSaveError('')
  }

  const validateEdit = () => {
    const e = {}
    if (!editForm.name?.trim()) e.name = 'Name is required.'
    if (!editForm.price || isNaN(editForm.price) || Number(editForm.price) <= 0)
      e.price = 'Enter a valid price.'
    if (!editForm.quantity || isNaN(editForm.quantity) || Number(editForm.quantity) < 1)
      e.quantity = 'Enter a valid quantity.'
    return e
  }

  // PUT /api/Product — Id goes in the FormData body (not URL)
  const handleSaveEdit = async () => {
    const e = validateEdit()
    if (Object.keys(e).length) { setEditErrors(e); return }

    setSaving(true)
    setSaveError('')
    try {
      const fd = new FormData()
      fd.append('Id', editProduct.id)
      fd.append('Name', editForm.name.trim())
      fd.append('Description', editForm.description.trim())
      fd.append('Price', editForm.price)
      fd.append('quantity', editForm.quantity)
      fd.append('category', editForm.category)
      // Img is optional — omit to keep existing image

      await apiFetch('/api/Product', {
        method: 'PUT',
        headers: { ...authHeaders() },
        body: fd,
      })

      await fetchMyProducts()
      setEditProduct(null)
    } catch (err) {
      setSaveError(err.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  // DELETE /api/Product/{productId} — returns 204 No Content
  const handleConfirmDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    setDeleteError('')
    try {
      await apiFetch(`/api/Product/${confirmId}`, {
        method: 'DELETE',
        headers: { ...authHeaders() },
      })
      removeMyProduct(confirmId)
      setConfirmId(null)
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete product.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="my-products-page">
      <div className="mp-container">

        {/* Header */}
        <div className="mp-header">
          <div>
            <p className="mp-eyebrow">SELLER SPACE</p>
            <h1 className="mp-title">My Products</h1>
            <p className="mp-subtitle">
              {myProducts.length} product{myProducts.length !== 1 ? 's' : ''} in your collection
            </p>
          </div>
          <Link to="/add-product" className="mp-add-btn">+ Add product</Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mp-loading">
            <div className="loading-spinner" />
            <p>Loading your products…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mp-error">
            <p>{error}</p>
            <button className="btn-primary-sm" onClick={fetchMyProducts}>Try again</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && myProducts.length === 0 && (
          <div className="mp-empty">
            <div className="mp-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <p className="mp-empty-text">You haven't added any products yet.</p>
            <Link to="/add-product" className="mp-empty-link">Add your first product →</Link>
          </div>
        )}

        {/* Grid */}
        {myProducts.length > 0 && (
          <div className="mp-grid">
            {myProducts.map(product => (
              <div key={product.id} className="mp-card">
                <div className="mp-card-img-wrap">
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'}
                    alt={product.name}
                    className="mp-card-img"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' }}
                  />
                  <div className="mp-card-overlay">
                    <button className="mp-overlay-btn mp-edit-btn" onClick={() => openEdit(product)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button className="mp-overlay-btn mp-del-btn"
                      onClick={() => { setDeleteError(''); setConfirmId(product.id) }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mp-card-body">
                  <p className="mp-card-cat">{(product.category || '').toUpperCase()}</p>
                  <p className="mp-card-name">{product.name}</p>
                  <p className="mp-card-price">${Number(product.price).toLocaleString()}</p>
                  {product.quantity > 0 && (
                    <p className="mp-card-qty">Qty: {product.quantity}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editProduct && (
        <div className="mp-overlay-bg" onClick={() => !saving && setEditProduct(null)}>
          <div className="mp-modal" onClick={e => e.stopPropagation()}>
            <div className="mp-modal-header">
              <h3 className="mp-modal-title">Edit product</h3>
              <button className="mp-modal-close" onClick={() => setEditProduct(null)}>✕</button>
            </div>
            <div className="mp-modal-body">
              <div className="mp-edit-preview">
                <img
                  src={editProduct.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=60'}
                  alt={editProduct.name} className="mp-edit-img"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=60' }}
                />
              </div>

              <div className="form-field">
                <label className="form-label">Product name</label>
                <input className={`form-input ${editErrors.name ? 'input-error' : ''}`}
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  disabled={saving} />
                {editErrors.name && <p className="field-error">{editErrors.name}</p>}
              </div>

              <div className="mp-edit-row">
                <div className="form-field">
                  <label className="form-label">Price ($)</label>
                  <input type="number" min="0" step="0.01"
                    className={`form-input ${editErrors.price ? 'input-error' : ''}`}
                    value={editForm.price}
                    onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))}
                    disabled={saving} />
                  {editErrors.price && <p className="field-error">{editErrors.price}</p>}
                </div>
                <div className="form-field">
                  <label className="form-label">Quantity</label>
                  <input type="number" min="1"
                    className={`form-input ${editErrors.quantity ? 'input-error' : ''}`}
                    value={editForm.quantity}
                    onChange={e => setEditForm(p => ({ ...p, quantity: e.target.value }))}
                    disabled={saving} />
                  {editErrors.quantity && <p className="field-error">{editErrors.quantity}</p>}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Category</label>
                <select className="form-input form-select" value={editForm.category}
                  onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                  disabled={saving}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="form-field">
                <label className="form-label">Description</label>
                <textarea className="form-input form-textarea" rows={3}
                  value={editForm.description}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  disabled={saving} />
              </div>

              {saveError && <p className="field-error">{saveError}</p>}
            </div>
            <div className="mp-modal-actions">
              <button className="mp-modal-cancel" onClick={() => setEditProduct(null)} disabled={saving}>
                Cancel
              </button>
              <button className="mp-modal-save" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {confirmId && (
        <div className="mp-overlay-bg" onClick={() => !deleting && setConfirmId(null)}>
          <div className="mp-modal mp-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="mp-modal-title">Delete product?</h3>
            <p className="mp-modal-text">This will permanently remove the product.</p>
            {deleteError && <p className="mp-delete-error">{deleteError}</p>}
            <div className="mp-modal-actions">
              <button className="mp-modal-cancel" onClick={() => setConfirmId(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="mp-modal-confirm" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
