import { createContext, useContext, useState, useCallback } from 'react'
import { apiFetch, authHeaders, resolveImage } from '../lib/api'

const ProductsContext = createContext(null)

const norm = (p) => ({
  id: p.id,
  name: p.name ?? '',
  price: p.price ?? 0,
  category: p.category ?? '',
  description: p.description ?? '',
  image: resolveImage(p.img),
})

export function ProductsProvider({ children }) {
  const [myProducts, setMyProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /** Fetch the current user's products from the API */
  const fetchMyProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      if (!token) { setMyProducts([]); return }

      const data = await apiFetch('/api/Product', {
        headers: { ...authHeaders() },
      })
      const all = Array.isArray(data) ? data : data?.data ?? []

      // Get current user id from JWT
      let currentUserId = null
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        currentUserId =
          payload.sub ||
          payload.nameid ||
          payload.userId ||
          payload.UserId ||
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
          null
      } catch { /* ignore */ }

      const mine = currentUserId
        ? all.filter(p => {
          const uid =
            p.appUserId ?? p.AppUserId ??
            p.userId ?? p.UserId ??
            p.ownerId ?? p.OwnerId ?? null
          return String(uid) === String(currentUserId)
        })
        : all

      setMyProducts(mine.map(norm))
    } catch (err) {
      setError(err.message || 'Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [])

  /** Called from my-products after a successful DELETE */
  const removeMyProduct = (id) => {
    setMyProducts(prev => prev.filter(p => p.id !== id))
  }

  /** Called from edit modal to update product fields locally */
  const updateMyProduct = (id, fields) => {
    setMyProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...fields } : p))
    )
  }

  return (
    <ProductsContext.Provider value={{
      myProducts,
      loading,
      error,
      fetchMyProducts,
      removeMyProduct,
      updateMyProduct,
    }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useMyProducts() {
  return useContext(ProductsContext)
}
