
import { useMemo, useState } from 'react'

// Demo data. Replace with API data when integration is ready.
const PRODUCTS = [
  { id: 1, name: 'Premium Arabica Coffee', dailyDemand: 30, leadTime: 5, stock: 1280, deviation: 8 },
  { id: 2, name: 'Organic Green Tea', dailyDemand: 20, leadTime: 5, stock: 185, deviation: 6 },
  { id: 3, name: 'Wholegrain Crackers', dailyDemand: 15, leadTime: 6, stock: 740, deviation: 5 },
  { id: 4, name: 'Almond Milk 1L', dailyDemand: 18, leadTime: 4, stock: 92, deviation: 5 },
  { id: 5, name: 'Dark Chocolate 70%', dailyDemand: 10, leadTime: 5, stock: 360, deviation: 3 },
  { id: 6, name: 'Oat Cookies', dailyDemand: 12, leadTime: 6, stock: 214, deviation: 4 },
  { id: 7, name: 'Sparkling Water', dailyDemand: 25, leadTime: 4, stock: 980, deviation: 7 },
]

const PERIODS = {
  Daily: 1,
  Weekly: 7,
  Monthly: 30,
  Quarterly: 90,
  Yearly: 365,
}

const SERVICE_FACTORS = {
  90: 1.282,
  95: 1.645,
  99: 2.326,
}

const DEFAULTS = {
  product: 'all',
  period: 'Monthly',
  demandChange: 36,
  leadTimeChange: 2,
  serviceLevel: 95,
}

const numberFormat = new Intl.NumberFormat('en-US')

function calculateProduct(product, demandChange, leadTimeChange, serviceLevel) {
  const demandFactor = 1 + demandChange / 100
  const dailyDemand = product.dailyDemand * demandFactor
  const dailyDeviation = product.deviation * demandFactor

  // Lead time cannot be less than one day in this demo model.
  const leadTime = Math.max(1, product.leadTime + leadTimeChange)

  const z = SERVICE_FACTORS[serviceLevel]

  // Assumes independent daily demand variation and fixed lead time.
  const safetyStock = Math.ceil(
    z * dailyDeviation * Math.sqrt(leadTime)
  )

  const reorderPoint = Math.ceil(
    dailyDemand * leadTime + safetyStock
  )

  const needsReorder = product.stock <= reorderPoint

  return {
    ...product,
    dailyDemand,
    leadTime,
    safetyStock,
    reorderPoint,
    needsReorder,
  }
}

function calculateScenario(products, demandChange, leadTimeChange, serviceLevel, period) {
  const rows = products.map((product) =>
    calculateProduct(
      product,
      demandChange,
      leadTimeChange,
      serviceLevel
    )
  )

  const periodDays = PERIODS[period]

  const expectedDemand = rows.reduce(
    (total, product) => total + product.dailyDemand * periodDays,
    0
  )

  const safetyStock = rows.reduce(
    (total, product) => total + product.safetyStock,
    0
  )

  const reorderCount = rows.filter(
    (product) => product.needsReorder
  ).length

  return {
    rows,
    expectedDemand,
    safetyStock,
    reorderCount,
  }
}

function downloadCSV(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\r\n')

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export default function WhatIfSimulator() {
  const [selectedProduct, setSelectedProduct] = useState(DEFAULTS.product)
  const [period, setPeriod] = useState(DEFAULTS.period)
  const [demandChange, setDemandChange] = useState(DEFAULTS.demandChange)
  const [leadTimeChange, setLeadTimeChange] = useState(DEFAULTS.leadTimeChange)
  const [serviceLevel, setServiceLevel] = useState(DEFAULTS.serviceLevel)

  const selectedProducts = useMemo(() => {
    if (selectedProduct === 'all') return PRODUCTS

    return PRODUCTS.filter(
      (product) => product.id === Number(selectedProduct)
    )
  }, [selectedProduct])

  const baseline = useMemo(
    () => calculateScenario(selectedProducts, 0, 0, 95, period),
    [selectedProducts, period]
  )

  const scenario = useMemo(
    () =>
      calculateScenario(
        selectedProducts,
        demandChange,
        leadTimeChange,
        serviceLevel,
        period
      ),
    [selectedProducts, demandChange, leadTimeChange, serviceLevel, period]
  )

  const demandDifference =
    scenario.expectedDemand - baseline.expectedDemand

  const safetyStockDifference =
    scenario.safetyStock - baseline.safetyStock

  const reorderDifference =
    scenario.reorderCount - baseline.reorderCount

  function resetScenario() {
    setSelectedProduct(DEFAULTS.product)
    setPeriod(DEFAULTS.period)
    setDemandChange(DEFAULTS.demandChange)
    setLeadTimeChange(DEFAULTS.leadTimeChange)
    setServiceLevel(DEFAULTS.serviceLevel)
  }

  function exportResults() {
    const rows = [
      ['IntelliStock What-If Scenario Report'],
      ['Simulation period', period],
      ['Period days', PERIODS[period]],
      ['Product selection', selectedProduct === 'all' ? 'All products' : selectedProducts[0].name],
      ['Demand change (%)', demandChange],
      ['Supplier lead-time change (days)', leadTimeChange],
      ['Target service level (%)', serviceLevel],
      [],
      ['Metric', 'Baseline', 'Scenario'],
      ['Expected period demand', Math.round(baseline.expectedDemand), Math.round(scenario.expectedDemand)],
      ['Safety stock', baseline.safetyStock, scenario.safetyStock],
      ['Products needing reorder', baseline.reorderCount, scenario.reorderCount],
      [],
      ['Product', 'Available stock', 'Safety stock', 'Reorder point', 'Action'],
      ...scenario.rows.map((product) => [
        product.name,
        product.stock,
        product.safetyStock,
        product.reorderPoint,
        product.needsReorder ? 'Review reorder' : 'No reorder needed',
      ]),
    ]

    downloadCSV(
      `intellistock-what-if-${period.toLowerCase()}.csv`,
      rows
    )
  }

  const formatSigned = (value, suffix = '') =>
    `${value > 0 ? '+' : ''}${value}${suffix}`

  const formatDifference = (value, unit) =>
    `${value >= 0 ? '+' : ''}${numberFormat.format(Math.round(value))} ${unit}`

  return (
    <div className="w-full text-[#172b4d]">

      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
            Analytics & Intelligence
          </p>

          <h1 className="text-2xl font-bold">
            What-If Scenario Simulator
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Explore how demand, lead time and service level affect your inventory decisions.
          </p>
        </div>

        <button
          type="button"
          onClick={exportResults}
          className="px-5 py-2.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 font-medium cursor-pointer"
        >
          Export results
        </button>
      </div>

      {/* SCENARIO CONFIGURATION */}
      <section className="bg-white border border-[#e5eaf2] rounded-xl p-6 mb-5">
        <h2 className="text-base font-bold">1. Configure your scenario</h2>

        <p className="text-xs text-slate-500 mt-1">
          Choose products and adjust the conditions you want to test.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 mt-6">

          {/* PRODUCT SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">
              Products
            </label>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-3 bg-white text-sm"
            >
              <option value="all">
                All products · {PRODUCTS.length} SKUs
              </option>

              {PRODUCTS.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* SIMULATION PERIOD */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">
              Simulation period
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {Object.keys(PERIODS).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPeriod(item)}
                  aria-pressed={period === item}
                  className={`py-3 px-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                    period === item
                      ? 'bg-[#1677ff] border-[#1677ff] text-white'
                      : 'bg-white border-slate-200 text-[#172b4d] hover:bg-blue-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Showing expected demand over {PERIODS[period]} days.
            </p>
          </div>
        </div>

        {/* SLIDERS AND SERVICE LEVEL */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_230px] gap-7 mt-8">

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-semibold">
                Expected demand change
              </label>
              <span className="text-sm text-[#1677ff] font-bold">
                {formatSigned(demandChange, '%')}
              </span>
            </div>

            <input
              type="range"
              min="-50"
              max="100"
              step="1"
              value={demandChange}
              onChange={(e) => setDemandChange(Number(e.target.value))}
              className="w-full accent-[#1677ff] cursor-pointer"
              aria-label="Expected demand change"
            />

            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>-50%</span>
              <span>+100%</span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              {Math.abs(demandChange)}% {demandChange < 0 ? 'less' : 'more'} demand than current levels.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-semibold">
                Supplier lead-time change
              </label>
              <span className="text-sm text-[#1677ff] font-bold">
                {formatSigned(leadTimeChange)} days
              </span>
            </div>

            <input
              type="range"
              min="-5"
              max="10"
              step="1"
              value={leadTimeChange}
              onChange={(e) => setLeadTimeChange(Number(e.target.value))}
              className="w-full accent-[#1677ff] cursor-pointer"
              aria-label="Supplier lead-time change"
            />

            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>-5 days</span>
              <span>+10 days</span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Applied to each product's current supplier lead time.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-3">
              Target service level
            </label>

            <select
              value={serviceLevel}
              onChange={(e) => setServiceLevel(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-4 py-3 bg-white w-full text-sm font-medium"
            >
              <option value={90}>90%</option>
              <option value={95}>95%</option>
              <option value={99}>99%</option>
            </select>

            <button
              type="button"
              onClick={resetScenario}
              className="border border-slate-200 rounded-lg px-5 py-2.5 mt-3 bg-white hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Reset scenario
            </button>
          </div>
        </div>
      </section>

      {/* SCENARIO RESULTS */}
      <section className="bg-white border border-[#e5eaf2] rounded-xl p-6 mb-5">
        <h2 className="text-base font-bold">2. What would happen?</h2>

        <p className="text-xs text-slate-500 mt-1">
          {selectedProduct === 'all'
            ? `All ${PRODUCTS.length} products`
            : selectedProducts[0].name}
          {' · '}{period}
          {' · '}Demand {formatSigned(demandChange, '%')}
          {' · '}Delivery {formatSigned(leadTimeChange)} days
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

          {/* DEMAND */}
          <div className="rounded-xl bg-[#f5f7fb] p-5">
            <p className="text-xs text-slate-500">
              Expected {period.toLowerCase()} demand
            </p>

            <h3 className="text-2xl font-bold mt-2">
              {numberFormat.format(Math.round(scenario.expectedDemand))} units
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              {formatDifference(demandDifference, 'units')} versus current demand
            </p>
          </div>

          {/* SAFETY STOCK */}
          <div className="rounded-xl bg-[#f5f7fb] p-5">
            <p className="text-xs text-slate-500">
              Recommended safety stock
            </p>

            <h3 className="text-2xl font-bold mt-2">
              {numberFormat.format(scenario.safetyStock)} units
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              {formatDifference(safetyStockDifference, 'units')} versus baseline
            </p>
          </div>

          {/* REORDER COUNT */}
          <div className="rounded-xl bg-[#f5f7fb] p-5">
            <p className="text-xs text-slate-500">
              Products to reorder
            </p>

            <h3 className="text-2xl font-bold mt-2">
              {scenario.reorderCount} {scenario.reorderCount === 1 ? 'product' : 'products'}
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              {reorderDifference === 0
                ? 'Same as current settings'
                : `${formatSigned(reorderDifference)} versus baseline`}
            </p>
          </div>
        </div>
      </section>

      {/* PRODUCT RECOMMENDATIONS */}
      <section className="bg-white border border-[#e5eaf2] rounded-xl p-6">
        <h2 className="text-base font-bold">3. Product recommendations</h2>

        <p className="text-xs text-slate-500 mt-1">
          The reorder point is the stock level that triggers a new order.
        </p>

        <div className="overflow-x-auto mt-5">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead className="bg-[#f5f7fb] text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Available now</th>
                <th className="px-4 py-3">Reorder at</th>
                <th className="px-4 py-3">Suggested action</th>
              </tr>
            </thead>

            <tbody>
              {scenario.rows.map((product, index) => (
                <tr
                  key={product.id}
                  className={
                    index % 2 === 0 ? 'bg-white' : 'bg-[#f7f9fc]'
                  }
                >
                  <td className="px-4 py-4 font-medium">
                    {product.name}
                  </td>

                  <td className="px-4 py-4">
                    {numberFormat.format(product.stock)} units
                  </td>

                  <td className="px-4 py-4">
                    {numberFormat.format(product.reorderPoint)} units
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={
                        product.needsReorder
                          ? 'text-amber-600 font-semibold'
                          : 'text-emerald-600 font-semibold'
                      }
                    >
                      {product.needsReorder
                        ? 'Review reorder'
                        : 'No reorder needed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* REPLENISHMENT SUMMARY */}
      <div className="bg-[#e8f1ff] text-[#175cd3] text-sm px-5 py-4 rounded-lg mt-4">
        {scenario.reorderCount} of {scenario.rows.length}{' '}
        {scenario.rows.length === 1 ? 'product' : 'products'}{' '}
        {scenario.reorderCount === 1 ? 'needs' : 'need'} replenishment review
        under this scenario.
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Demo simulation using sample product data. Recommendations are hypothetical
        and do not update real inventory or purchase orders.
      </p>
    </div>
  )
}
