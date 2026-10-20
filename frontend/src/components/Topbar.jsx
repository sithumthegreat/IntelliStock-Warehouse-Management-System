import { useLocation } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { NAV_GROUPS } from '../config/navigation'

export default function Topbar() {
  const { currentRole, setCurrentRole, ROLES } = useRole()
  const { pathname } = useLocation()
  const page = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.path === pathname)

  return (
    <div className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Left side: breadcrumb now follows the current page */}
      <div className="text-sm">
        <span className="text-slate-400">Workspace / </span>
        <span className="font-bold text-slate-800">{page ? page.title : 'IntelliStock'}</span>
      </div>

      {/* Right side: role switcher & profile */}
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-1 rounded-full uppercase tracking-wide border border-emerald-100">
          • Demo Environment
        </span>

        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
          R
        </div>

        <select
          value={currentRole}
          onChange={(e) => setCurrentRole(e.target.value)}
          className="text-sm font-medium text-slate-700 bg-transparent border border-gray-200 rounded-md py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {Object.values(ROLES).map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>
    </div>
  )
}