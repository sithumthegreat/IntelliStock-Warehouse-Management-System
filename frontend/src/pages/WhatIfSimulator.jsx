
import { useState } from 'react'

const products = [
  { name: 'Premium Arabica Coffee', demand: 30, leadTime: 5, stock: 1280, cost: 450, deviation: 8 },
  { name: 'Organic Green Tea', demand: 20, leadTime: 5, stock: 185, cost: 300, deviation: 6 },
  { name: 'Wholegrain Crackers', demand: 15, leadTime: 6, stock: 740, cost: 180, deviation: 5 },
  { name: 'Almond Milk 1L', demand: 18, leadTime: 4, stock: 92, cost: 350, deviation: 5 },
  { name: 'Dark Chocolate 70%', demand: 10, leadTime: 5, stock: 360, cost: 500, deviation: 3 },
  { name: 'Oat Cookies', demand: 12, leadTime: 6, stock: 214, cost: 220, deviation: 4 },
  { name: 'Sparkling Water', demand: 25, leadTime: 4, stock: 980, cost: 120, deviation: 7 },
]

const serviceFactors = { 90: 1.282, 95: 1.645, 99: 2.326 }

function calculateScenario(demandChange, leadTimeChange, serviceLevel) {
  const factor = 1 + demandChange / 100
  const z = serviceFactors[serviceLevel]

  const rows = products.map((product) => {
    const leadTime = Math.max(1, product.leadTime + leadTimeChange)
    const dailyDemand = product.demand * factor
    const dailyDeviation = product.deviation * factor

    // Simplified model: independent daily demand variation.
    const safetyStock = Math.ceil(z * dailyDeviation * Math.sqrt(leadTime))
    const reorderPoint = Math.ceil(dailyDemand * leadTime + safetyStock)

    return {
      ...product,
      safetyStock,
      reorderPoint,
      status: product.stock <= reorderPoint ? 'Low – reorder' : 'Healthy',
    }
  })

  const totalSafetyStock = rows.reduce((sum, item) => sum + item.safetyStock, 0)

  return { rows, totalSafetyStock }
}

export default function WhatIfSimulator() {
  const [demandChange, setDemandChange] = useState(36)
  const [leadTimeChange, setLeadTimeChange] = useState(2)
  const [serviceLevel, setServiceLevel] = useState(95)

  const baseline = calculateScenario(0, 0, 95)
  const scenario = calculateScenario(demandChange, leadTimeChange, serviceLevel)

  const shortageCount = scenario.rows.filter(
    (item) => item.status === 'Low – reorder'
  ).length

  function resetScenario() {
    setDemandChange(0)
    setLeadTimeChange(0)
    setServiceLevel(95)
  }

  return (
    <div style={{ padding: '24px', color: '#10254b' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        What-If Scenario Simulator
      </h1>
      <p style={{ color: '#64748b', marginTop: 6 }}>
        Test demand, lead-time and service-level scenarios before deciding.
      </p>

      <section style={panelStyle}>
        <h3>Scenario inputs</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginTop: 20 }}>
          <div>
            <label>Demand change: {demandChange > 0 ? '+' : ''}{demandChange}%</label>
            <input
              type="range"
              min="-50"
              max="100"
              value={demandChange}
              onChange={(e) => setDemandChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1478ff' }}
            />
          </div>

          <div>
            <label>
              Supplier lead-time change: {leadTimeChange > 0 ? '+' : ''}
              {leadTimeChange} days
            </label>
            <input
              type="range"
              min="-3"
              max="10"
              value={leadTimeChange}
              onChange={(e) => setLeadTimeChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1478ff' }}
            />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <label>Service level: </label>
          <select
            value={serviceLevel}
            onChange={(e) => setServiceLevel(Number(e.target.value))}
            style={{ padding: 8, borderRadius: 6, marginLeft: 8 }}
          >
            <option value={90}>90%</option>
            <option value={95}>95%</option>
            <option value={99}>99%</option>
          </select>
        </div>

        <button onClick={resetScenario} style={buttonStyle}>
          Reset scenario
        </button>
      </section>

      <section style={panelStyle}>
        <h3>Scenario results</h3>
        <p style={{ color: '#64748b', marginTop: 4 }}>
          Compared with the current baseline
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 20 }}>
          <div style={cardStyle}>
            <small>Total safety stock</small>
            <h2>{scenario.totalSafetyStock} units</h2>
            <p>Baseline: {baseline.totalSafetyStock} units</p>
          </div>

          <div style={cardStyle}>
            <small>Products needing reorder</small>
            <h2>{shortageCount} / {products.length}</h2>
            <p>Based on simulated reorder points</p>
          </div>

          <div style={cardStyle}>
            <small>Demand change</small>
            <h2>{demandChange > 0 ? '+' : ''}{demandChange}%</h2>
            <p>Compared with baseline demand</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', marginTop: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                {['Product', 'Safety stock', 'Reorder point', 'Stock on hand', 'Status'].map((heading) => (
                  <th key={heading} style={cellStyle}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenario.rows.map((item) => (
                <tr key={item.name}>
                  <td style={cellStyle}>{item.name}</td>
                  <td style={cellStyle}>{item.safetyStock}</td>
                  <td style={cellStyle}>{item.reorderPoint}</td>
                  <td style={cellStyle}>{item.stock}</td>
                  <td style={cellStyle}>
                    <span style={{
                      color: item.status === 'Healthy' ? '#16845b' : '#ad6700',
                      fontWeight: 600,
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: 20, color: '#175cd3' }}>
          {shortageCount} of {products.length} products need replenishment under this scenario.
        </p>
      </section>
    </div>
  )
}

const panelStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 20,
  marginTop: 20,
}

const cardStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: 16,
}

const cellStyle = {
  padding: '14px 12px',
  borderBottom: '1px solid #e2e8f0',
  fontSize: 13,
}

const buttonStyle = {
  marginTop: 20,
  background: '#1478ff',
  color: 'white',
  padding: '10px 16px',
  border: 0,
  borderRadius: 8,
  cursor: 'pointer',
}
