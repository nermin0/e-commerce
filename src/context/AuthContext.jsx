import { createContext, useContext, useState } from 'react'
import { apiFetch } from '../lib/api'

const AuthContext = createContext(null)

const API_BASE = 'https://graduationecommerce.runasp.net'

/** Fetch real name + email from /api/Account/profile using the token */
async function fetchProfile(token) {
  try {
    const res = await fetch(`${API_BASE}/api/Account/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return await res.json() // { id, name, email }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  // Restore session from localStorage on page refresh
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      const name = localStorage.getItem('userName') || 'User'
      const email = localStorage.getItem('userEmail') || ''
      return { name, email, token }
    } catch {
      return null
    }
  })

  // POST /api/Account/register
  const register = async (name, email, password) => {
    await apiFetch('/api/Account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    // Register returns no token — redirect to login
    return null
  }

  // POST /api/Account/login → then GET /api/Account/profile for real name
  const login = async (email, password) => {
    const data = await apiFetch('/api/Account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const token = typeof data === 'string' ? data : data?.token || data?.Token || null
    if (!token) throw new Error('No token received. Check your credentials.')

    // Get real name from profile endpoint
    const profile = await fetchProfile(token)
    const name = profile?.name || email.split('@')[0]
    const userEmail = profile?.email || email

    localStorage.setItem('token', token)
    localStorage.setItem('userName', name)
    localStorage.setItem('userEmail', userEmail)

    const loggedIn = { name, email: userEmail, token }
    setUser(loggedIn)
    return loggedIn
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
