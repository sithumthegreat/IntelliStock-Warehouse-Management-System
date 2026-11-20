import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="ml-[245px] min-h-screen">
        <Topbar />
        <main className="p-7">
          <Outlet />
        </main>
      </div>
    </div>
  )
}