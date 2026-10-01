import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import './cart.css'

export default function Cart() {
  const {
    cartItems,
    loading,
    error,
    fetchCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
  } = useCart()

  const [confirmClear, setConfirmClear] = useState(false)

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-loading">
            <div className="loading-spinner" />
            <p>Loading your cart…</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-error">
            <p>{error}</p>
            <button className="btn-primary-sm" onClick={fetchCart}>
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Empty ────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <p className="cart-eyebrow">YOUR BAG</p>
            <h1 className="cart-title">Your cart</h1>
          </div>
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="cart-empty-text">Your cart is empty.</p>
            <Link to="/products" className="cart-shop-link">
              Browse the collection →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Cart with items ──────────────────────────────────────
  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <div>
            <p className="cart-eyebrow">YOUR BAG</p>
            <h1 className="cart-title">Your cart</h1>
            <p className="cart-count">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="cart-clear-btn" onClick={() => setConfirmClear(true)}>
            Clear cart
          </button>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <Link to={`/products/${item.id}`} className="cart-item-img-wrap">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80'}
                    alt={item.name}
                    className="cart-item-img"
                    onError={e => {
                      e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80'
                    }}
                  />
                </Link>
                <div className="cart-item-info">
                  <p className="cart-item-cat">{(item.category || '').toUpperCase()}</p>
                  <Link to={`/products/${item.id}`} className="cart-item-name">
                    {item.name}
                  </Link>
                  <p className="cart-item-unit">
                    ${Number(item.price).toLocaleString()} each
                  </p>
                </div>
                <div className="cart-item-right">
                  <div className="cart-qty-controls">
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.productId ?? item.id, -1)}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="cart-qty-val">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.productId ?? item.id, 1)}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <p className="cart-item-subtotal">
                    ${(Number(item.price) * item.quantity).toLocaleString()}
                  </p>
                  <button
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.productId ?? item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="cart-summary">
            <h3 className="cart-summary-title">Order summary</h3>
            <div className="cart-summary-rows">
              {cartItems.map(item => (
                <div key={item.id} className="cart-summary-row">
                  <span className="cart-summary-label">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="cart-summary-val">
                    ${(Number(item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="cart-divider" />
            <div className="cart-total-row">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-val">${totalPrice.toLocaleString()}</span>
            </div>
            <Link to="/checkout" className="cart-checkout-btn">
              Proceed to checkout
            </Link>
            <Link to="/products" className="cart-continue-link">
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Confirm clear modal */}
      {confirmClear && (
        <div className="cart-overlay" onClick={() => setConfirmClear(false)}>
          <div className="cart-modal" onClick={e => e.stopPropagation()}>
            <h3 className="cart-modal-title">Clear your cart?</h3>
            <p className="cart-modal-text">
              All items will be removed from your cart. This cannot be undone.
            </p>
            <div className="cart-modal-actions">
              <button
                className="cart-modal-cancel"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </button>
              <button
                className="cart-modal-confirm"
                onClick={() => { clearCart(); setConfirmClear(false) }}
              >
                Clear cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
