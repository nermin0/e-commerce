import { createContext, useContext, useState } from 'react'
import { resolveImage } from '../lib/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          productId: product.id,
          name: product.name ?? '',
          price: product.price ?? 0,
          category: product.category ?? '',
          image: product.image ?? resolveImage(product.img) ?? '',
          quantity,
        },
      ]
    })
  }

  const updateQuantity = (productId, delta) => {
    setCartItems(prev =>
      prev
        .map(i => {
          if (i.id === productId || i.productId === productId) {
            const newQty = i.quantity + delta
            return newQty <= 0 ? null : { ...i, quantity: newQty }
          }
          return i
        })
        .filter(Boolean)
    )
  }

  const removeFromCart = (productId) => {
    setCartItems(prev =>
      prev.filter(i => i.id !== productId && i.productId !== productId)
    )
  }

  const clearCart = () => setCartItems([])

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + Number(i.price) * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading: false,
        error: '',
        fetchCart: () => { },
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
