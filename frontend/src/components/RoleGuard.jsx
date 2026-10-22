import { Outlet, useLocation } from 'react-router-dom'
import { canAccess } from '../config/roles'
import { useAuth } from '../context/AuthContext'
import NoAccess from '../pages/NoAccess'

export default function RoleGuard() {
  const { currentUser } = useAuth()
  const { pathname } = useLocation()
  return canAccess(currentUser.role, pathname) ? <Outlet /> : <NoAccess />
}