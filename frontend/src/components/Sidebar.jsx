import { NavLink } from 'react-router-dom'
import { NAV_GROUPS } from '../config/navigation'
import { canAccess } from '../config/roles'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
    const { currentUser } = useAuth()
  // Keep only the pages this role may open, and drop groups that end up empty
  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => canAccess(currentUser?.role, i.path)),
  })).filter((g) => g.items.length > 0)
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[245px] flex-col overflow-y-auto border-r border-line bg-white px-3 py-[18px]">
      <div className="flex items-center gap-[11px] px-1.5 pb-1.5">
        <div className="grid size-[38px] place-items-center rounded-[10px] bg-brand font-extrabold text-white shadow-lg shadow-brand/20">
          IS
        </div>
        <div>
          <b>IntelliStock</b>
          <small className="mt-[3px] block text-[10px] text-[#8794a6]">Inventory intelligence</small>
        </div>
      </div>

            {groups.map((group) => (
        <div key={group.label}>
          <div className="mx-2.5 mb-2 mt-[17px] text-[9px] font-extrabold uppercase tracking-[1px] text-[#9aa5b5]">
            {group.label}
          </div>
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mb-0.5 flex items-center gap-2.5 rounded-[9px] p-2.5 font-semibold no-underline ${
                  isActive ? 'bg-[#eaf2ff] text-brand' : 'text-[#4a5568] hover:bg-[#f3f6fb]'
                }`
              }
            >
              <span className="w-[18px] text-center">{item.icon}</span>
              {item.title}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="mt-auto border-t border-[#f0f3f8] pt-3.5 text-[10px] leading-[1.7] text-[#7c8ba0]">
        © 2026 IntelliStock | The Code Alchemy <br /> All rights reserved.
      </div>
    </aside>
  )
}