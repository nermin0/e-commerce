import { createContext, useContext, useState } from 'react'

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState([])

  /**
   * Called from checkout when the user clicks "Place order".
   * status can be: 'on-the-way' | 'delivered' | 'cancelled'
   * New orders always start as 'on-the-way'.
   */
  const addOrder = ({ orderNumber, items, total, customerInfo, paymentMethod }) => {
    const newOrder = {
      id: orderNumber,
      orderNumber,
      items,
      total,
      customerInfo,
      paymentMethod,
      status: 'on-the-way',   // default status for a new order
      date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    }
    setOrders(prev => [newOrder, ...prev])
  }

  /** Allow changing status (for demo purposes) */
  const updateOrderStatus = (orderNumber, status) => {
    setOrders(prev =>
      prev.map(o => (o.orderNumber === orderNumber ? { ...o, status } : o))
    )
  }

  const onTheWay  = orders.filter(o => o.status === 'on-the-way')
  const delivered = orders.filter(o => o.status === 'delivered')
  const cancelled = orders.filter(o => o.status === 'cancelled')

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, onTheWay, delivered, cancelled }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  return useContext(OrdersContext)
}
