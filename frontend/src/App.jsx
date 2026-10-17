import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import InventoryPage from './pages/InventoryPage.jsx'
// Import other team members' pages here as they build them:
// import ForecastingPage from './pages/ForecastingPage.jsx'
// import ProcurementPage from './pages/ProcurementPage.jsx'
// import AnalyticsPage from './pages/AnalyticsPage.jsx'

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        
        {/* Sidebar stays visible on the left across all pages */}
        <Sidebar />

        {/* Main content area dynamically changes based on the active route */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <Routes>
            {/* Default redirect or landing page */}
            <Route path="/" element={<InventoryPage />} />
            
            {/* Module 2: Inventory Optimization (Your Page) */}
            <Route path="/inventory" element={<InventoryPage />} />

            {/* Placeholders for your teammates' pages */}
            {/* <Route path="/forecasting" element={<ForecastingPage />} /> */}
            {/* <Route path="/suppliers" element={<ProcurementPage />} /> */}
            {/* <Route path="/analytics" element={<AnalyticsPage />} /> */}
          </Routes>
        </main>

      </div>
    </Router>
  )
}

export default App