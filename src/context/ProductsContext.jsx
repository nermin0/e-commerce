import { createContext, useContext, useState, useCallback } from 'react'
import { apiFetch, authHeaders, resolveImage } from '../lib/api'

const ProductsContext = createContext(null)

const norm = (p) => ({
  id: p.id,
  name: p.name ?? '',
  price: p.price ?? 0,
  category: p.category ?? '',
  description: p.description ?? '',
  quantity: p.countOfPices ?? 0,
  image: resolveImage(p.img),
})

export function ProductsProvider({ children }) {
  const [myProducts, setMyProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /** GET /api/Product/user — returns only the current user's products */
  const fetchMyProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/api/Product/user', {
        headers: { ...authHeaders() },
      })
      const arr = Array.isArray(data) ? data : data?.data ?? []
      setMyProducts(arr.map(norm))
    } catch (err) {
      setError(err.message || 'Failed to load your products.')
    } finally {
      setLoading(false)
    }
  }, [])

  const removeMyProduct = (id) =>
    setMyProducts(prev => prev.filter(p => p.id !== id))

  const updateMyProduct = (id, fields) =>
    setMyProducts(prev => prev.map(p => (p.id === id ? { ...p, ...fields } : p)))

  return (
    <ProductsContext.Provider value={{
      myProducts, loading, error,
      fetchMyProducts, removeMyProduct, updateMyProduct,
    }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useMyProducts() {
  return useContext(ProductsContext)
}
