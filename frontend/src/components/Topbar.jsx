import { useLocation } from 'react-router-dom'
import { NAV_GROUPS } from '../config/navigation'

export default function Topbar() {
  const { pathname } = useLocation()
  const page = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.path === pathname)

  return (
    <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-line bg-white px-7">
      <h1 className="text-xl font-extrabold">{page ? page.title : 'IntelliStock'}</h1>
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-full bg-[#eaf2ff] text-xs font-extrabold text-brand">
          WM
        </span>
        <div>
          <b>Demo user</b>
          <small className="mt-0.5 block text-[11px] text-muted">Warehouse Manager</small>
        </div>
      </div>
    </header>
  )
}