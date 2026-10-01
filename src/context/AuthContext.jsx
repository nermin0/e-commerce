import { createContext, useContext, useState } from 'react'
import { apiFetch } from '../lib/api'

const AuthContext = createContext(null)

// Decode JWT payload → extract id, name, email
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('JWT PAYLOAD:', payload) // temporary – shows exact field names
    return {
      id:
        payload.sub ||
        payload.nameid ||
        payload.userId ||
        payload.UserId ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        null,
      name:
        payload.name ||
        payload.unique_name ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        null,
      email:
        payload.email ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        null,
    }
  } catch {
    return null
  }
}

// Pick the token from any response shape the backend might return
function extractToken(data) {
  if (!data) return null
  if (typeof data === 'string' && data.split('.').length === 3) return data
  return (
    data.token || data.Token ||
    data.accessToken || data.AccessToken || data.access_token ||
    data.jwt || data.JWT ||
    data.data?.token || data.data?.Token || data.data?.accessToken ||
    data.result?.token || data.result?.Token ||
    null
  )
}

// Pick the display name from the response body
function extractName(data, fallback) {
  if (!data) return fallback
  const raw =
    data.name || data.Name ||
    data.userName || data.UserName ||
    data.displayName || data.DisplayName ||
    data.data?.name || data.data?.userName ||
    fallback

  // If what we got looks like an email, take just the part before @
  if (raw && raw.includes('@')) {
    return raw.split('@')[0]
  }
  return raw
}

export function AuthProvider({ children }) {
  // Restore session from localStorage on page refresh
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return null
      const decoded = decodeToken(token)
      let savedName = localStorage.getItem('userName') || decoded?.name || 'User'
      // If saved name looks like an email, take just the part before @
      if (savedName.includes('@')) {
        savedName = savedName.split('@')[0]
        localStorage.setItem('userName', savedName) // fix it in storage too
      }
      return {
        ...(decoded ?? {}),
        name: savedName,
        token,
      }
    } catch {
      return null
    }
  })

  // POST /api/account/register
  const register = async (name, email, password) => {
    const data = await apiFetch('/api/account/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const token = extractToken(data)

    if (token) {
      const decoded = decodeToken(token)
      // Always use the name the user typed — not what the API returns
      const userName = name
      localStorage.setItem('token', token)
      localStorage.setItem('userName', userName)
      const loggedIn = { ...(decoded ?? {}), name: userName, email: decoded?.email || email, token }
      setUser(loggedIn)
      return loggedIn
    }

    // No token on register — redirect to login
    return data
  }

  // POST /api/account/login
  const login = async (email, password) => {
    const data = await apiFetch('/api/account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const token = extractToken(data)

    if (!token) {
      throw new Error(
        `No token received. Server responded: ${JSON.stringify(data)}`
      )
    }

    const decoded = decodeToken(token)
    // Try to get a real name; fall back to part before @ in email
    let userName = extractName(data, decoded?.name || '')
    if (!userName || userName === email || userName.includes('@')) {
      userName = email.split('@')[0]
    }
    localStorage.setItem('token', token)
    localStorage.setItem('userName', userName)
    const loggedIn = { ...(decoded ?? {}), name: userName, email: decoded?.email || email, token }
    setUser(loggedIn)
    return loggedIn
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
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
