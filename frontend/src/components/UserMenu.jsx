import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

export default function UserMenu() {
  const { currentUser, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close the menu when clicking outside it or pressing Escape
  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!currentUser) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={currentUser.name}
        className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 hover:ring-2 hover:ring-blue-200"
      >
        {initials(currentUser.name)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 z-30 w-60 rounded-xl border border-gray-200 bg-white p-2 shadow-xl"
        >
          <div className="border-b border-gray-100 px-3 py-2.5">
            <p className="truncate text-sm font-bold text-slate-800">{currentUser.name}</p>
            <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
            <span className="mt-2 inline-block rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
              {currentUser.role}
            </span>
          </div>
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            My profile
          </Link>
          <button
            role="menuitem"
            onClick={logout}
            className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}