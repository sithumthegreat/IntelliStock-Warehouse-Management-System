
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import Layout from './components/Layout'
import DemandForecasting from './pages/DemandForecasting'
import InventoryPage from './pages/InventoryPage'
import IncomingRequestsPage from './pages/IncomingRequestsPage'
import WhatIfSimulator from './pages/WhatIfSimulator'
import Placeholder from './pages/Placeholder'
import { NAV_GROUPS } from './config/navigation'

const implementedPaths = [
  '/forecasting',
  '/inventory',
  '/requests',
  '/what-if',
]

const otherPages = NAV_GROUPS
  .flatMap((g) => g.items)
  .filter((item) => !implementedPaths.includes(item.path))

export default function App() {
  return (
    <RoleProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/inventory" replace />} />

            <Route path="/forecasting" element={<DemandForecasting />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/requests" element={<IncomingRequestsPage />} />
            <Route path="/what-if" element={<WhatIfSimulator />} />

            {otherPages.map((page) => (
              <Route
                key={page.path}
                path={page.path}
                element={<Placeholder title={page.title} />}
              />
            ))}
          </Route>
        </Routes>
      </Router>
    </RoleProvider>
  )
}
