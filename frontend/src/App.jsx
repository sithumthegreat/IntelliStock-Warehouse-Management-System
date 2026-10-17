import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DemandForecasting from './pages/DemandForecasting'
import Placeholder from './pages/Placeholder'
import { NAV_GROUPS } from './config/navigation'

const otherPages = NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.path !== '/forecasting')

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/forecasting" replace />} />
        <Route path="/forecasting" element={<DemandForecasting />} />
        {otherPages.map((p) => (
          <Route key={p.path} path={p.path} element={<Placeholder title={p.title} />} />
        ))}
      </Route>
    </Routes>
  )
}