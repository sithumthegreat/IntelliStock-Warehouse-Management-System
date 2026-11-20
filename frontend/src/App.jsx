
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
import StockMovementsPage from './pages/StockMovementsPage'
import Placeholder from './pages/Placeholder'
import { NAV_GROUPS } from './config/navigation'
import ImportCenter from './pages/ImportCenter'
import WhatIfSimulator from './pages/WhatIfSimulator'
import AnalyticsPage from './pages/AnalyticsPage'

const implementedPaths = [
  '/forecasting',
  '/inventory',
  '/requests',
  '/what-if',
  '/analytics',
  '/stock-movements',
  '/import'
]

const otherPages = NAV_GROUPS
  .flatMap((g) => g.items)
  .filter((item) => !implementedPaths.includes(item.path))

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
                <Route path="/stock-movements" element={<StockMovementsPage />} />
                <Route path="/import" element={<ImportCenter />} />
                <Route path="/what-if" element={<WhatIfSimulator />} />
                <Route path="/analytics" element={<AnalyticsPage />} />

                {otherPages.map((page) => (
                  <Route
                    key={page.path}
                    path={page.path}
                    element={<Placeholder title={page.title} />}
                  />
                ))}
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </RoleProvider>
  )
}
