import { createContext, useContext, useState, useCallback } from 'react'
import { apiFetch, authHeaders, resolveImage } from '../lib/api'

const ProductsContext = createContext(null)

const MY_IDS_KEY = 'myProductIds'

function loadMyIds() {
  try { return JSON.parse(localStorage.getItem(MY_IDS_KEY) || '[]') } catch { return [] }
}
function saveMyIds(ids) {
  try { localStorage.setItem(MY_IDS_KEY, JSON.stringify(ids)) } catch { }
}

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

  const fetchMyProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (!localStorage.getItem('token')) { setMyProducts([]); return }

      const data = await apiFetch('/api/Product', { headers: { ...authHeaders() } })
      const all = Array.isArray(data) ? data : data?.data ?? []

      // Filter by IDs the user added this session
      const myIds = loadMyIds()
      const mine = myIds.length > 0
        ? all.filter(p => myIds.includes(p.id))
        : []

      setMyProducts(mine.map(norm))
    } catch (err) {
      setError(err.message || 'Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [])

  /** Called after successful POST — saves the new ID */
  const registerMyProduct = (id) => {
    const ids = loadMyIds()
    if (!ids.includes(id)) {
      const updated = [id, ...ids]
      saveMyIds(updated)
    }
  }

  /** Called after successful DELETE */
  const removeMyProduct = (id) => {
    const ids = loadMyIds().filter(i => i !== id)
    saveMyIds(ids)
    setMyProducts(prev => prev.filter(p => p.id !== id))
  }

  /** Local optimistic update */
  const updateMyProduct = (id, fields) => {
    setMyProducts(prev => prev.map(p => (p.id === id ? { ...p, ...fields } : p)))
  }

  return (
    <ProductsContext.Provider value={{
      myProducts, loading, error,
      fetchMyProducts, registerMyProduct, removeMyProduct, updateMyProduct,
    }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useMyProducts() {
  return useContext(ProductsContext)
}
