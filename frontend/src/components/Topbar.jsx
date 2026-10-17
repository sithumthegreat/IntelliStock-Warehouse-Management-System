import { useLocation } from 'react-router-dom'
import { NAV_GROUPS } from '../config/navigation'

export default function Topbar() {
  const { pathname } = useLocation()
  const page = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.path === pathname)

  return (
    <header className="top">
      <h1>{page ? page.title : 'IntelliStock'}</h1>
      <div className="userchip">
        <span className="avatar">WM</span>
        <div>
          <b>Demo user</b>
          <small>Warehouse Manager</small>
        </div>
      </div>
    </header>
  )
}