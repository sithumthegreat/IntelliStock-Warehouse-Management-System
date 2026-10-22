import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import { useAuth } from './context/AuthContext'
import { landingFor } from './config/roles'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleGuard from './components/RoleGuard'
import Login from './pages/auth/Login'
import DemandForecasting from './pages/DemandForecasting'
import InventoryPage from './pages/InventoryPage'
import IncomingRequestsPage from './pages/IncomingRequestsPage'
import Placeholder from './pages/Placeholder'
import { NAV_GROUPS } from './config/navigation'

const otherPages = NAV_GROUPS.flatMap((g) => g.items).filter(
  (i) => i.path !== '/forecasting' && i.path !== '/inventory' && i.path !== '/requests'
)

function HomeRedirect() {
  const { currentUser } = useAuth()
  return <Navigate to={landingFor(currentUser.role)} replace />
}

export default function App() {
  return (
    <RoleProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route element={<RoleGuard />}>
                <Route path="/forecasting" element={<DemandForecasting />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/requests" element={<IncomingRequestsPage />} />
                {otherPages.map((p) => (
                  <Route key={p.path} path={p.path} element={<Placeholder title={p.title} />} />
                ))}
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </RoleProvider>
  )
}