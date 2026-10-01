import { createContext, useContext, useState, useEffect } from 'react'

const ProductsContext = createContext(null)

const STORAGE_KEY = 'myProducts'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch { /* ignore */ }
}

export function ProductsProvider({ children }) {
  const [myProducts, setMyProducts] = useState(() => loadFromStorage())

  // Persist to localStorage whenever products change
  useEffect(() => {
    saveToStorage(myProducts)
  }, [myProducts])

  /** Called from add-product after a successful API response */
  const addMyProduct = (product) => {
    setMyProducts(prev => {
      const updated = [product, ...prev]
      return updated
    })
  }

  /** Called from my-products after a successful DELETE */
  const removeMyProduct = (id) => {
    setMyProducts(prev => prev.filter(p => p.id !== id))
  }

  /** Called from edit modal to update product fields */
  const updateMyProduct = (id, fields) => {
    setMyProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...fields } : p))
    )
  }

  return (
    <ProductsContext.Provider value={{ myProducts, addMyProduct, removeMyProduct, updateMyProduct }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useMyProducts() {
  return useContext(ProductsContext)
}
