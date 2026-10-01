import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../../context/OrdersContext'
import './my-orders.css'

const TABS = [
  { key: 'on-the-way', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
]

function statusColor(status) {
  if (status === 'on-the-way') return 'badge-blue'
  if (status === 'delivered') return 'badge-green'
  return 'badge-red'
}

function statusLabel(status) {
  if (status === 'on-the-way') return 'On the way'
  if (status === 'delivered') return 'Delivered'
  return 'Cancelled'
}

function OrderCard({ order }) {
  return (
    <div className="mo-card">
      {/* Card header */}
      <div className="mo-card-header">
        <div className="mo-card-meta">
          <span className="mo-order-num">#{order.orderNumber}</span>
          <span className="mo-order-date">{order.date}</span>
        </div>
        <span className={`mo-badge ${statusColor(order.status)}`}>
          {statusLabel(order.status)}
        </span>
      </div>

      {/* Items */}
      <div className="mo-items">
        {order.items.map(item => (
          <div key={item.id} className="mo-item">
            <img
              src={item.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&q=60'}
              alt={item.name}
              className="mo-item-img"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=120&q=60' }}
            />
            <div className="mo-item-info">
              <p className="mo-item-name">{item.name}</p>
              <p className="mo-item-qty">Qty: {item.quantity}</p>
            </div>
            <p className="mo-item-price">
              ${(Number(item.price) * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mo-card-footer">
        <div className="mo-delivery-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{order.customerInfo.address}, {order.customerInfo.city}</span>
        </div>
        <div className="mo-total">
          Total: <strong>${order.total.toLocaleString()}</strong>
        </div>
      </div>
    </div>
  )
}

export default function MyOrders() {
  const { onTheWay, delivered, cancelled } = useOrders()
  const [activeTab, setActiveTab] = useState('on-the-way')

  const lists = {
    'on-the-way': onTheWay,
    'delivered': delivered,
    'cancelled': cancelled,
  }

  const current = lists[activeTab]

  return (
    <div className="mo-page">
      <div className="mo-container">
        {/* Page header */}
        <div className="mo-header">
          <p className="mo-eyebrow">ACCOUNT</p>
          <h1 className="mo-title">My Orders</h1>
        </div>

        {/* Tabs */}
        <div className="mo-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`mo-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {lists[tab.key].length > 0 && (
                <span className="mo-tab-count">{lists[tab.key].length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list */}
        <div className="mo-list">
          {current.length === 0 ? (
            <div className="mo-empty">
              <div className="mo-empty-icon">
                {activeTab === 'on-the-way' && (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <path d="M16 8h4l3 4v4h-7V8z" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                )}
                {activeTab === 'delivered' && (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {activeTab === 'cancelled' && (
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                )}
              </div>
              <p className="mo-empty-text">No {activeTab.replace('-', ' ')} orders yet.</p>
              <Link to="/products" className="mo-shop-link">Browse the collection →</Link>
            </div>
          ) : (
            current.map(order => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </div>
    </div>
  )
}
