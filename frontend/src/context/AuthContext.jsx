import { createContext, useContext, useEffect, useState } from 'react'
import { DEMO_ACCOUNTS, DEMO_PASSWORD, needsApproval } from '../config/roles'

const VERIFY_TTL = 24 * 60 * 60 * 1000 // links last 24 hours
const RESEND_COOLDOWN = 60 * 1000 // 60 seconds between resends
const STORE = 'intellistock_auth'
const SESSION = 'intellistock_session'

const seedUsers = Object.entries(DEMO_ACCOUNTS).map(([role, d]) => ({
  name: d.name,
  email: d.email,
  role,
  status: 'Active',
  verified: true,
  password: DEMO_PASSWORD,
}))

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE))
    if (saved?.users) return saved
  } catch {
    // ignore a corrupted save and start fresh
  }
  return { users: seedUsers, usedTokens: {} }
}

const newToken = () => ({
  token: 'vt_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
  expires: Date.now() + VERIFY_TTL,
  resendAt: Date.now() + RESEND_COOLDOWN,
})

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [data, setData] = useState(load)
  const [currentEmail, setCurrentEmail] = useState(() => sessionStorage.getItem(SESSION))
  const { users, usedTokens } = data

  // Save accounts after every change so a refresh doesn't lose them
  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(data))
  }, [data])

  const findUser = (email) => users.find((u) => u.email === email.trim().toLowerCase())

  const patchUser = (email, patch) =>
    setData((d) => ({
      ...d,
      users: d.users.map((u) => (u.email === email ? { ...u, ...patch } : u)),
    }))

  // Only an Active account counts as signed in. If an admin suspends you, you lose access.
  const currentUser = users.find((u) => u.email === currentEmail && u.status === 'Active') ?? null

  const register = ({ name, email, password, role }) => {
    email = email.trim().toLowerCase()
    const existing = findUser(email)
    if (existing && existing.status !== 'Unverified') return { ok: false, code: 'exists' }
    if (existing) {
      patchUser(email, { name, role, password, ...newToken() })
    } else {
      setData((d) => ({
        ...d,
        users: [
          ...d.users,
          { name, email, role, password, status: 'Unverified', verified: false, ...newToken() },
        ],
      }))
    }
    return { ok: true, email }
  }

  const login = (email, password) => {
    const user = findUser(email)
    if (!user || user.password !== password) return { ok: false, code: 'invalid' }
    const blocked = {
      Unverified: 'unverified',
      'Pending approval': 'pending',
      Suspended: 'suspended',
      Archived: 'archived',
    }[user.status]
    if (blocked) return { ok: false, code: blocked, email: user.email }
    sessionStorage.setItem(SESSION, user.email)
    setCurrentEmail(user.email)
    return { ok: true, user }
  }

  const logout = () => {
    sessionStorage.removeItem(SESSION)
    setCurrentEmail(null)
  }

  // ---- used in Part 2 (verification) ----
  const resend = (email) => {
    const u = findUser(email)
    if (!u || u.status !== 'Unverified') return { ok: false }
    const wait = Math.ceil((u.resendAt - Date.now()) / 1000)
    if (wait > 0) return { ok: false, wait }
    patchUser(email, newToken())
    return { ok: true }
  }

  const changeEmail = (oldEmail, newEmail) => {
    newEmail = newEmail.trim().toLowerCase()
    if (findUser(newEmail)) return { ok: false, code: 'taken' }
    patchUser(oldEmail, { email: newEmail, ...newToken() })
    return { ok: true, email: newEmail }
  }

  const verifyToken = (token) => {
    const u = users.find((x) => x.token === token)
    if (!u) {
      const used = usedTokens[token]
      return used ? { status: 'used', email: used } : { status: 'invalid' }
    }
    if (Date.now() > u.expires) return { status: 'expired', email: u.email }
    const pending = needsApproval(u.role)
    setData((d) => ({
      usedTokens: { ...d.usedTokens, [token]: u.email },
      users: d.users.map((x) =>
        x.email === u.email
          ? { ...x, verified: true, status: pending ? 'Pending approval' : 'Active', token: null }
          : x,
      ),
    }))
    return { status: pending ? 'pending' : 'ok', email: u.email }
  }

  // ---- used in Administration ----
  const setStatus = (email, status) => {
    const u = findUser(email)
    if (!u || email === currentEmail) return { ok: false }
    patchUser(email, { status: status === 'Active' && !u.verified ? 'Unverified' : status })
    return { ok: true }
  }

  const value = {
    users,
    currentUser,
    findUser,
    register,
    login,
    logout,
    resend,
    changeEmail,
    verifyToken,
    setStatus,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)