import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { DEMO_ACCOUNTS, DEMO_PASSWORD, landingFor } from '../../config/roles'
import { useAuth } from '../../context/AuthContext'
import { useRole } from '../../context/RoleContext'
import AuthLayout from './AuthLayout'
import RolePicker from './RolePicker'
import { altBtn, inputClass, labelClass, primaryBtn } from './styles'

const MESSAGES = {
  invalid: 'Incorrect email or password.',
  unverified: 'Please verify your email first.',
  pending:
    'Your account is waiting for administrator approval. You can sign in once it has been approved.',
  suspended: 'This account has been suspended. Please contact an administrator.',
  archived: 'This account is no longer active. Please contact an administrator.',
}

export default function Login() {
  const { currentUser, login } = useAuth()
  const { setCurrentRole } = useRole()
  const { state } = useLocation() // pages like Verify can pre-fill the form

  const [role, setRole] = useState(state?.role ?? 'Warehouse Manager')
  const [email, setEmail] = useState(state?.email ?? DEMO_ACCOUNTS['Warehouse Manager'].email)
  const [password, setPassword] = useState(state?.email ? '' : DEMO_PASSWORD)
  const [message, setMessage] = useState('')

  if (currentUser) {
    return <Navigate to={landingFor(currentUser.role)} replace />
  }

  const pickRole = (r) => {
    setRole(r)
    setEmail(DEMO_ACCOUNTS[r].email)
    setPassword(DEMO_PASSWORD)
    setMessage('')
  }

  const signIn = (e, p) => {
    const result = login(e, p)
    if (!result.ok) {
      setMessage(MESSAGES[result.code])
      return
    }
    setCurrentRole(result.user.role) 
  }

  const submit = (ev) => {
    ev.preventDefault()
    signIn(email, password)
  }

  return (
    <AuthLayout>
      <h1 className="text-[27px] font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 text-[13px] text-[#718096]">Sign in to your IntelliStock workspace.</p>

      <RolePicker label="Sign in as" value={role} onChange={pickRole} />

      <form onSubmit={submit} className="mt-4">
        <label className={labelClass}>
          Email address
          <input
            type="email"
            required
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </label>
        <label className={`${labelClass} mt-3`}>
          Password
          <input
            type="password"
            required
            minLength={8}
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </label>
        <button type="submit" className={primaryBtn}>
          Sign in to workspace
        </button>
      </form>

      <button
        type="button"
        className={altBtn}
        onClick={() => signIn(DEMO_ACCOUNTS[role].email, DEMO_PASSWORD)}
      >
        Continue as demo {role}
      </button>

      <div className="mt-4 flex justify-between text-xs font-semibold">
        <Link to="/signup" className="text-[#1677ff] hover:underline">
          Create account
        </Link>
        <Link to="/forgot-password" className="text-[#1677ff] hover:underline">
          Forgot password?
        </Link>
      </div>

      <p
        role="status"
        className={`mt-4 rounded-[9px] p-3 text-[11px] ${
          message ? 'bg-[#fdecec] text-[#c53030]' : 'bg-[#f6f8fb] text-[#718096]'
        }`}
      >
        {message || 'Demo only · No real authentication, email or password storage is connected.'}
      </p>
    </AuthLayout>
  )
}