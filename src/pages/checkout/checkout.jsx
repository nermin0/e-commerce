import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrdersContext'
import './checkout.css'

const STEPS = ['Customer Info', 'Payment', 'Confirmation']

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const { addOrder } = useOrders()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)

  // Step 1 – customer info
  const [info, setInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  })
  const [infoErrors, setInfoErrors] = useState({})

  // Step 2 – payment
  const [payment, setPayment] = useState('card') // 'card' | 'cash'
  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  })
  const [cardErrors, setCardErrors] = useState({})

  // ── Validate step 1 ─────────────────────────────────────
  const validateInfo = () => {
    const e = {}
    if (!info.fullName.trim()) e.fullName = 'Full name is required.'
    if (!info.email.trim()) e.email = 'Email is required.'
    if (!info.phone.trim()) e.phone = 'Phone number is required.'
    if (!info.address.trim()) e.address = 'Address is required.'
    if (!info.city.trim()) e.city = 'City is required.'
    return e
  }

  // ── Validate step 2 (card only) ─────────────────────────
  const validateCard = () => {
    if (payment !== 'card') return {}
    const e = {}
    const digits = card.number.replace(/\s/g, '')
    if (digits.length < 16) e.number = 'Enter a valid 16-digit card number.'
    if (!card.name.trim()) e.name = 'Cardholder name is required.'
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'Use MM/YY format.'
    if (card.cvv.length < 3) e.cvv = 'Enter a valid CVV.'
    return e
  }

  const handleInfoNext = () => {
    const e = validateInfo()
    if (Object.keys(e).length) { setInfoErrors(e); return }
    setInfoErrors({})
    setStep(2)
  }

  const handlePayNext = () => {
    const e = validateCard()
    if (Object.keys(e).length) { setCardErrors(e); return }
    setCardErrors({})
    setStep(3)
  }

  const [orderNumber, setOrderNumber] = useState('')

  const handlePlaceOrder = () => {
    // Generate a random order number like ORD-2026-XXXXX
    const rand = Math.floor(10000 + Math.random() * 90000)
    const newOrderNumber = `ORD-2026-${rand}`
    setOrderNumber(newOrderNumber)
    // Save order to OrdersContext
    addOrder({
      orderNumber: newOrderNumber,
      items: cartItems,
      total: totalPrice,
      customerInfo: info,
      paymentMethod: payment,
    })
    clearCart()
    setStep(4) // success screen
  }

  // ── Format card number with spaces ──────────────────────
  const formatCard = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  // ── Success screen ───────────────────────────────────────
  if (step === 4) {
    return (
      <div className="checkout-page">
        <div className="co-container">
          <div className="co-success">
            <div className="co-success-icon">✓</div>
            <h2 className="co-success-title">Thank you, {info.fullName}!</h2>
            <div className="co-order-number">
              Order #{orderNumber}
            </div>
            <p className="co-success-sub">
              Your order has been confirmed and will be delivered to{' '}
              <strong>{info.address}, {info.city}</strong>.
            </p>
            <p className="co-success-sub" style={{ marginTop: 8 }}>
              A confirmation will be sent to <strong>{info.email}</strong>.
            </p>
            <Link to="/products" className="co-home-btn">← Back to store</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="co-container">

        {/* ── Progress bar ── */}
        <div className="co-steps">
          {STEPS.map((label, i) => (
            <div key={label} className="co-step-wrap">
              <div className={`co-step-circle ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`co-step-label ${step === i + 1 ? 'active' : ''}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`co-step-line ${step > i + 1 ? 'done' : ''}`} />}
            </div>
          ))}
        </div>

        <div className="co-layout">
          {/* ── Left: form ── */}
          <div className="co-form-col">

            {/* ═══ STEP 1: Customer Info ═══ */}
            {step === 1 && (
              <div className="co-card">
                <h2 className="co-card-title">Customer Information</h2>

                <div className="co-row">
                  <div className="form-field">
                    <label className="form-label">Full name</label>
                    <input className={`form-input ${infoErrors.fullName ? 'input-error' : ''}`}
                      placeholder="Nora Ahmed"
                      value={info.fullName}
                      onChange={e => setInfo(p => ({ ...p, fullName: e.target.value }))} />
                    {infoErrors.fullName && <p className="field-error">{infoErrors.fullName}</p>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">Email</label>
                    <input className={`form-input ${infoErrors.email ? 'input-error' : ''}`}
                      type="email" placeholder="you@example.com"
                      value={info.email}
                      onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} />
                    {infoErrors.email && <p className="field-error">{infoErrors.email}</p>}
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Phone number</label>
                  <input className={`form-input ${infoErrors.phone ? 'input-error' : ''}`}
                    placeholder="+20 100 000 0000"
                    value={info.phone}
                    onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} />
                  {infoErrors.phone && <p className="field-error">{infoErrors.phone}</p>}
                </div>

                <div className="form-field">
                  <label className="form-label">Street address</label>
                  <input className={`form-input ${infoErrors.address ? 'input-error' : ''}`}
                    placeholder="123 El Nasr St, Apt 4"
                    value={info.address}
                    onChange={e => setInfo(p => ({ ...p, address: e.target.value }))} />
                  {infoErrors.address && <p className="field-error">{infoErrors.address}</p>}
                </div>

                <div className="co-row">
                  <div className="form-field">
                    <label className="form-label">City</label>
                    <input className={`form-input ${infoErrors.city ? 'input-error' : ''}`}
                      placeholder="Cairo"
                      value={info.city}
                      onChange={e => setInfo(p => ({ ...p, city: e.target.value }))} />
                    {infoErrors.city && <p className="field-error">{infoErrors.city}</p>}
                  </div>
                  <div className="form-field">
                    <label className="form-label">ZIP / Postal code <span className="co-optional">(optional)</span></label>
                    <input className="form-input"
                      placeholder="11511"
                      value={info.zip}
                      onChange={e => setInfo(p => ({ ...p, zip: e.target.value }))} />
                  </div>
                </div>

                <div className="co-actions">
                  <Link to="/cart" className="co-back-btn">← Back to cart</Link>
                  <button className="co-next-btn" onClick={handleInfoNext}>
                    Continue to payment →
                  </button>
                </div>
              </div>
            )}

            {/* ═══ STEP 2: Payment ═══ */}
            {step === 2 && (
              <div className="co-card">
                <h2 className="co-card-title">Payment Method</h2>

                {/* Method selector */}
                <div className="co-pay-methods">
                  <button
                    className={`co-pay-method ${payment === 'card' ? 'selected' : ''}`}
                    onClick={() => setPayment('card')}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Credit / Debit Card
                  </button>
                  <button
                    className={`co-pay-method ${payment === 'cash' ? 'selected' : ''}`}
                    onClick={() => setPayment('cash')}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="6" width="20" height="12" rx="2" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="M6 12h.01M18 12h.01" />
                    </svg>
                    Cash on Delivery
                  </button>
                </div>

                {/* Card form */}
                {payment === 'card' && (
                  <div className="co-card-form">
                    <div className="form-field">
                      <label className="form-label">Card number</label>
                      <input className={`form-input co-card-input ${cardErrors.number ? 'input-error' : ''}`}
                        placeholder="1234 5678 9012 3456"
                        value={card.number}
                        onChange={e => setCard(p => ({ ...p, number: formatCard(e.target.value) }))} />
                      {cardErrors.number && <p className="field-error">{cardErrors.number}</p>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Cardholder name</label>
                      <input className={`form-input ${cardErrors.name ? 'input-error' : ''}`}
                        placeholder="NORA AHMED"
                        value={card.name}
                        onChange={e => setCard(p => ({ ...p, name: e.target.value.toUpperCase() }))} />
                      {cardErrors.name && <p className="field-error">{cardErrors.name}</p>}
                    </div>
                    <div className="co-row">
                      <div className="form-field">
                        <label className="form-label">Expiry date</label>
                        <input className={`form-input ${cardErrors.expiry ? 'input-error' : ''}`}
                          placeholder="MM/YY"
                          value={card.expiry}
                          onChange={e => setCard(p => ({ ...p, expiry: formatExpiry(e.target.value) }))} />
                        {cardErrors.expiry && <p className="field-error">{cardErrors.expiry}</p>}
                      </div>
                      <div className="form-field">
                        <label className="form-label">CVV</label>
                        <input className={`form-input ${cardErrors.cvv ? 'input-error' : ''}`}
                          placeholder="123" maxLength={4}
                          value={card.cvv}
                          onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))} />
                        {cardErrors.cvv && <p className="field-error">{cardErrors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {payment === 'cash' && (
                  <div className="co-cash-note">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    You will pay in cash when your order arrives. No payment info needed.
                  </div>
                )}

                <div className="co-actions">
                  <button className="co-back-btn" onClick={() => setStep(1)}>← Back</button>
                  <button className="co-next-btn" onClick={handlePayNext}>
                    Review order →
                  </button>
                </div>
              </div>
            )}

            {/* ═══ STEP 3: Confirmation ═══ */}
            {step === 3 && (
              <div className="co-card">
                <h2 className="co-card-title">Review your order</h2>

                <div className="co-review-section">
                  <div className="co-review-header">
                    <span className="co-review-label">Delivery to</span>
                    <button className="co-edit-btn" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <p className="co-review-value">{info.fullName}</p>
                  <p className="co-review-value">{info.address}, {info.city} {info.zip}</p>
                  <p className="co-review-value">{info.phone}</p>
                  <p className="co-review-value">{info.email}</p>
                </div>

                <div className="co-review-section">
                  <div className="co-review-header">
                    <span className="co-review-label">Payment</span>
                    <button className="co-edit-btn" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  {payment === 'card' ? (
                    <p className="co-review-value">
                      Card ending in {card.number.replace(/\s/g, '').slice(-4)}
                    </p>
                  ) : (
                    <p className="co-review-value">Cash on delivery</p>
                  )}
                </div>

                <div className="co-review-section">
                  <div className="co-review-header">
                    <span className="co-review-label">Items ({cartItems.length})</span>
                  </div>
                  {cartItems.map(item => (
                    <div key={item.id} className="co-review-item">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=60'}
                        alt={item.name}
                        className="co-review-img"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&q=60' }}
                      />
                      <div className="co-review-item-info">
                        <p className="co-review-item-name">{item.name}</p>
                        <p className="co-review-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="co-review-item-price">
                        ${(Number(item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="co-actions">
                  <button className="co-back-btn" onClick={() => setStep(2)}>← Back</button>
                  <button className="co-place-btn" onClick={handlePlaceOrder}>
                    Place order →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: order summary ── */}
          <div className="co-summary">
            <h3 className="co-summary-title">Order summary</h3>
            <div className="co-summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="co-summary-row">
                  <span className="co-summary-name">{item.name} × {item.quantity}</span>
                  <span className="co-summary-price">
                    ${(Number(item.price) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="co-summary-divider" />
            <div className="co-summary-total">
              <span>Total</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
