import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/AnalyticsPage.css'

// All numbers here are illustrative demo data, not actual warehouse records.
// "actual" rows are sample historical observations; "forecast" rows are
// sample future planning estimates (NOT machine-learning predictions).
const MONTHS = [
  { month: 'Apr', year: 2026, type: 'actual', inventory: 340000, spend: 175000, cogs: 170000, carrying: 44000, demand: 3100, demandForecast: 3410, delivered: 40, onTime: 36, stockout: 3.8 },
  { month: 'May', year: 2026, type: 'actual', inventory: 360000, spend: 183000, cogs: 180000, carrying: 45500, demand: 3250, demandForecast: 3500, delivered: 45, onTime: 42, stockout: 3.5 },
  { month: 'Jun', year: 2026, type: 'actual', inventory: 375000, spend: 202000, cogs: 193000, carrying: 46700, demand: 3420, demandForecast: 3810, delivered: 44, onTime: 41, stockout: 3.2 },
  { month: 'Jul', year: 2026, type: 'actual', inventory: 365000, spend: 195000, cogs: 188000, carrying: 45900, demand: 3350, demandForecast: 3650, delivered: 42, onTime: 39, stockout: 3.6 },
  { month: 'Aug', year: 2026, type: 'actual', inventory: 392000, spend: 220000, cogs: 205000, carrying: 48000, demand: 3680, demandForecast: 3980, delivered: 46, onTime: 42, stockout: 2.9 },
  { month: 'Sep', year: 2026, type: 'actual', inventory: 405000, spend: 235000, cogs: 217000, carrying: 49700, demand: 3860, demandForecast: 4260, delivered: 48, onTime: 45, stockout: 2.7 },
  { month: 'Oct', year: 2026, type: 'actual', inventory: 420000, spend: 248000, cogs: 229000, carrying: 51500, demand: 4050, demandForecast: 4510, delivered: 50, onTime: 46, stockout: 2.5 },
  { month: 'Nov', year: 2026, type: 'forecast', inventory: 440000, spend: 260000, holding: 53500, ordering: 26500, stockoutCost: 16000, stockout: 2.4 },
  { month: 'Dec', year: 2026, type: 'forecast', inventory: 455000, spend: 275000, holding: 55000, ordering: 28000, stockoutCost: 15000, stockout: 2.2 },
  { month: 'Jan', year: 2027, type: 'forecast', inventory: 465000, spend: 282000, holding: 56500, ordering: 29000, stockoutCost: 14000, stockout: 2.1 },
  { month: 'Feb', year: 2027, type: 'forecast', inventory: 470000, spend: 290000, holding: 58000, ordering: 29500, stockoutCost: 13800, stockout: 2.0 },
  { month: 'Mar', year: 2027, type: 'forecast', inventory: 482000, spend: 298000, holding: 59500, ordering: 30500, stockoutCost: 13000, stockout: 1.9 },
]

const SAMPLE_STOCK_RISKS = [
  { product: 'Organic Green Tea', onHand: 185, reorderPoint: 207 },
  { product: 'Almond Milk 1L', onHand: 92, reorderPoint: 184 },
  { product: 'Oat Cookies', onHand: 214, reorderPoint: 225 },
]

const money = (value) => `Rs. ${Math.round(value).toLocaleString('en-US')}`
const compactMoney = (value) => value >= 1000000
  ? `Rs. ${(value / 1000000).toFixed(1)}m`
  : `Rs. ${Math.round(value / 1000)}k`
const percent = (value) => `${value.toFixed(1)}%`
const average = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)
const total = (items, key) => items.reduce((sum, item) => sum + item[key], 0)

function BarChart({ title, description, data, field }) {
  const max = Math.max(...data.map((item) => item[field]), 1) * 1.16
  const chartHeight = 184
  const chartTop = 20
  const chartBottom = chartTop + chartHeight
  const chartWidth = 600
  const left = 64
  const barGap = (chartWidth - left - 12) / data.length
  const barWidth = Math.min(37, barGap * 0.64)
  const y = (value) => chartBottom - (value / max) * chartHeight

  return (
    <div className="analytics-card analytics-chart-card">
      <h2>{title}</h2>
      <p className="analytics-subtext">{description}</p>
      <div className="analytics-chart-scroll">
        <svg viewBox="0 0 600 250" className="analytics-chart" role="img" aria-label={`${title}, sample actual versus forecast data`}>
          {[0, 0.5, 1].map((part) => {
            const yy = y(max * part)
            return (
              <g key={part}>
                <line x1={left} x2="590" y1={yy} y2={yy} stroke="#e8edf5" />
                <text x={left - 9} y={yy + 4} textAnchor="end" fontSize="11" fill="#75869c">{compactMoney(max * part)}</text>
              </g>
            )
          })}
          {data.map((item, index) => {
            const x = left + index * barGap + (barGap - barWidth) / 2
            const yy = y(item[field])
            return (
              <g key={`${item.month}-${item.year}`}>
                <rect x={x} y={yy} width={barWidth} height={Math.max(chartBottom - yy, 1)} rx="4" fill={item.type === 'actual' ? '#2078f4' : '#169f78'} />
                <text x={x + barWidth / 2} y="224" textAnchor="middle" fontSize="11" fill="#75869c">{item.month}</text>
                <title>{`${item.month} ${item.year} — ${item.type === 'actual' ? 'Actual' : 'Demo forecast'}: ${money(item[field])}`}</title>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="analytics-chart-legend">
        <span><i className="analytics-legend-dot analytics-actual" />Actual (sample)</span>
        <span><i className="analytics-legend-dot analytics-forecast" />Forecast (illustrative)</span>
      </div>
    </div>
  )
}

function Metric({ label, value, footnote, tone = 'neutral' }) {
  return (
    <div className="analytics-card analytics-metric">
      <p className="analytics-metric-label">{label}</p>
      <div className="analytics-metric-value">{value}</div>
      <p className={`analytics-metric-footnote ${tone}`}>{footnote}</p>
    </div>
  )
}

function exportCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [windowSize, setWindowSize] = useState(6)

  const view = useMemo(() => {
    const ranges = { 3: [5, 8], 6: [3, 9], 12: [0, 12] }
    const [start, end] = ranges[windowSize]
    const chartMonths = MONTHS.slice(start, end)
    const history = MONTHS.filter((item) => item.type === 'actual').slice(-windowSize)
    const future = MONTHS.filter((item) => item.type === 'forecast').slice(0, 3)

    // Annualized turnover based on the selected historical lookback.
    const turnover = total(history, 'cogs') / average(history.map((item) => item.inventory)) * (12 / history.length)
    const last = history[history.length - 1]
    const delivered = total(history, 'delivered')
    const onTimeRate = delivered ? (total(history, 'onTime') / delivered) * 100 : 0
    // WAPE-style demo accuracy: 100% minus the weighted absolute percentage error.
    const demandSum = total(history, 'demand')
    const absoluteError = history.reduce((sum, item) => sum + Math.abs(item.demand - item.demandForecast), 0)
    const forecastAccuracy = demandSum ? Math.max(0, (1 - absoluteError / demandSum) * 100) : 0
    const currentStockout = average(history.map((item) => item.stockout))
    const currentCarrying = last.carrying

    // Rule-based DEMO projections, not a trained forecasting model.
    const predictedTurnover = turnover * 1.04
    const predictedStockout = average(future.map((item) => item.stockout))
    const predictedCarrying = average(future.map((item) => item.holding))
    const predictedOnTime = Math.min(100, onTimeRate + 1.2)
    const predictions = [
      { label: 'Inventory turnover (annualized)', current: `${turnover.toFixed(2)}x`, predicted: `${predictedTurnover.toFixed(2)}x`, delta: predictedTurnover - turnover, better: 'up' },
      { label: 'Stockout rate (average)', current: percent(currentStockout), predicted: percent(predictedStockout), delta: predictedStockout - currentStockout, better: 'down' },
      { label: 'On-time supplier delivery', current: percent(onTimeRate), predicted: percent(predictedOnTime), delta: predictedOnTime - onTimeRate, better: 'up' },
      { label: 'Monthly carrying cost', current: money(currentCarrying), predicted: money(predictedCarrying), delta: predictedCarrying - currentCarrying, better: 'down' },
    ]

    return {
      chartMonths, history, future, turnover, last, onTimeRate, forecastAccuracy, currentStockout, currentCarrying, predictions,
      costRows: future.map((item) => ({ ...item, total: item.holding + item.ordering + item.stockoutCost })),
    }
  }, [windowSize])

  const riskCount = SAMPLE_STOCK_RISKS.filter((item) => item.onHand <= item.reorderPoint).length
  const nextQuarterCost = total(view.costRows, 'total')

  function handleExport() {
    exportCsv('intellistock-analytics-demo.csv', [
      ['IntelliStock Analytics — SAMPLE DATA / illustrative forecasts'],
      ['Historical lookback', `${windowSize} months (or all available months)`],
      ['Inventory turnover (annualized)', view.turnover.toFixed(2)],
      ['Latest monthly carrying cost (LKR)', view.currentCarrying],
      ['Supplier on-time delivery (%)', view.onTimeRate.toFixed(1)],
      ['Demand forecast accuracy, WAPE-based (%)', view.forecastAccuracy.toFixed(1)],
      [],
      ['Month', 'Year', 'Source', 'Inventory value (LKR)', 'Procurement spend (LKR)'],
      ...view.chartMonths.map((item) => [item.month, item.year, item.type, item.inventory, item.spend]),
      [],
      ['KPI', 'Current', 'Next quarter (illustrative)'],
      ...view.predictions.map((item) => [item.label, item.current, item.predicted]),
      [],
      ['Forecast month', 'Holding (LKR)', 'Ordering (LKR)', 'Estimated stockout (LKR)', 'Total (LKR)'],
      ...view.costRows.map((item) => [`${item.month} ${item.year}`, item.holding, item.ordering, item.stockoutCost, item.total]),
      ['Quarter total', '', '', '', nextQuarterCost],
    ])
  }

  return (
    <div className="analytics-page">
      <div className="analytics-page-header">
        <div>
          <p className="analytics-eyebrow">ANALYTICS & INTELLIGENCE · DEMO DATA</p>
          <h1>Analytics Overview</h1>
          <p className="analytics-subtext">Warehouse performance, cost projections and operational decision support.</p>
        </div>
        <div className="analytics-header-actions">
          <label htmlFor="analytics-period">Chart view</label>
          <select id="analytics-period" value={windowSize} onChange={(e) => setWindowSize(Number(e.target.value))}>
            <option value={3}>3 months</option>
            <option value={6}>6 months</option>
            <option value={12}>12 months</option>
          </select>
          <button className="analytics-primary-btn" onClick={handleExport}>Export CSV</button>
        </div>
      </div>

      <div className="analytics-metrics-grid">
        <Metric label="Inventory turnover · annualized" value={`${view.turnover.toFixed(2)}x`} footnote="Annualized from selected historical months" />
        <Metric label="Carrying cost · latest actual month" value={money(view.currentCarrying)} footnote={`${view.last.month} ${view.last.year} · sample value`} />
        <Metric label="On-time supplier deliveries" value={percent(view.onTimeRate)} footnote="On-time deliveries ÷ all deliveries" tone="positive" />
        <Metric label="Demand forecast accuracy" value={percent(view.forecastAccuracy)} footnote="100% − WAPE · historical sample" tone="positive" />
      </div>

      <div className="analytics-two-column">
        <BarChart title="Inventory Value Trend" description="Actual inventory value versus illustrative forecast · LKR" data={view.chartMonths} field="inventory" />
        <BarChart title="Procurement Spend Trend" description="Actual procurement spending versus illustrative forecast · LKR" data={view.chartMonths} field="spend" />
      </div>

      <div className="analytics-two-column">
        <section className="analytics-card analytics-table-card">
          <div className="analytics-card-heading">
            <div><h2>KPI Outlook — Next Quarter</h2><p className="analytics-subtext">Simple assumptions for the coming 3 months, not ML predictions.</p></div>
          </div>
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead><tr><th>KPI</th><th>Current</th><th>Projected</th><th>Interpretation</th></tr></thead>
              <tbody>
                {view.predictions.map((item) => {
                  const improving = item.better === 'up' ? item.delta > 0 : item.delta < 0
                  return (
                    <tr key={item.label}>
                      <td>{item.label}</td><td>{item.current}</td><td>{item.predicted}</td>
                      <td><span className={`analytics-status ${improving ? 'good' : 'watch'}`}>{improving ? 'Favorable' : 'Monitor'}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
        <section className="analytics-card analytics-table-card">
          <div className="analytics-card-heading">
            <div><h2>Inventory Cost Outlook — Next Quarter</h2><p className="analytics-subtext">Holding + ordering + estimated stockout costs · LKR</p></div>
          </div>
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead><tr><th>Month</th><th>Holding</th><th>Ordering</th><th>Stockout*</th><th>Total</th></tr></thead>
              <tbody>
                {view.costRows.map((row) => (
                  <tr key={row.month}><td>{row.month}</td><td>{money(row.holding)}</td><td>{money(row.ordering)}</td><td>{money(row.stockoutCost)}</td><td><strong>{money(row.total)}</strong></td></tr>
                ))}
                <tr className="analytics-total-row"><td colSpan={4}>Quarterly total</td><td><strong>{money(nextQuarterCost)}</strong></td></tr>
              </tbody>
            </table>
          </div>
          <p className="analytics-fine-print">*Stockout costs are hypothetical estimates, not actual losses.</p>
        </section>
      </div>

      <section className="analytics-card analytics-insights">
        <div className="analytics-card-heading">
          <div><h2>Insights & Recommended Actions</h2><p className="analytics-subtext">Rule-based suggestions using illustrative inventory and KPI data.</p></div>
        </div>
        <div className="analytics-insights-grid">
          <div className="analytics-insight">
            <span className="analytics-insight-kicker">INVENTORY RISK</span>
            <h3>{riskCount} products at or below reorder threshold</h3>
            <p>Review current stock positions and replenishment priorities.</p>
            <br></br>
            <button onClick={() => navigate('/inventory')}>Review inventory</button>
          </div>
          <div className="analytics-insight">
            <span className="analytics-insight-kicker">COST PLANNING</span>
            <h3>{money(nextQuarterCost)} estimated quarterly inventory cost</h3>
            <p>Review the assumptions behind holding, ordering and possible stockout costs.</p>
            <button onClick={() => navigate('/what-if')}>Open What-If Simulator</button>
          </div>
          <div className="analytics-insight">
            <span className="analytics-insight-kicker">FORECASTING</span>
            <h3>{percent(view.forecastAccuracy)} historical accuracy</h3>
            <p>Inspect forecast quality before using demand projections for planning.</p>
            <br></br>
            <button onClick={() => navigate('/forecasting')}>Open forecasting</button>
          </div>
        </div>
      </section>


    </div>
  )
}
