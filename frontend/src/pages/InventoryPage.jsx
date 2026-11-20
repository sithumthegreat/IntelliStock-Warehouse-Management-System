import React, { useState } from 'react'

/*
INVENTORY OPTIMIZATION PAGE (Part 2)
Owner: Kandage S.N. (Index: 245046B)
Purpose: This component displays KPI metrics, current stock levels, safety parameters,
and automated replenishment recommendations.
Note for Team: This component has no sidebar/navbar so it can be imported
directly into the main application layout. All data is currently mocked for the
Oct 21st prototype review.
*/

export default function InventoryPage() {
  const [kpis] = useState([
    { title: 'Total SKUs', value: '7', subtitle: 'Across 4 categories', type: 'neutral' },
    { title: 'Low stock', value: '2', subtitle: 'Replenishment review', type: 'warning' },
    { title: 'Critical items', value: '1', subtitle: 'Prioritize today', type: 'danger' },
    { title: 'Inventory value', value: 'Rs. 455,150', subtitle: 'Demo valuation', type: 'neutral' },
  ])

  const [inventoryData] = useState([
    { sku: 'SKU-1001', product: 'Premium Arabica Coffee', category: 'Beverages', onHand: 1280, safetyStock: 400, status: 'Healthy' },
    { sku: 'SKU-1002', product: 'Organic Green Tea', category: 'Beverages', onHand: 185, safetyStock: 250, status: 'Low stock' },
    { sku: 'SKU-1003', product: 'Wholegrain Crackers', category: 'Snacks', onHand: 740, safetyStock: 200, status: 'Healthy' },
    { sku: 'SKU-1004', product: 'Almond Milk 1L', category: 'Dairy alternatives', onHand: 92, safetyStock: 180, status: 'Critical' },
    { sku: 'SKU-1005', product: 'Dark Chocolate 70%', category: 'Confectionery', onHand: 360, safetyStock: 150, status: 'Healthy' },
    { sku: 'SKU-1006', product: 'Oat Cookies', category: 'Snacks', onHand: 214, safetyStock: 200, status: 'Low stock' },
    { sku: 'SKU-1007', product: 'Sparkling Water', category: 'Beverages', onHand: 980, safetyStock: 300, status: 'Healthy' },
  ])

  const [optimizationData] = useState([
    { product: 'Premium Arabica Coffee', demand: 42, lead: '4 d', safety: 30, reorder: 198, eoq: 875, minmax: '30 - 1073', cover: '30 d', risk: 'Review - overstock' },
    { product: 'Organic Green Tea', demand: 18, lead: '5 d', safety: 22, reorder: 112, eoq: 592, minmax: '22 - 704', cover: '10 d', risk: 'Healthy' },
    { product: 'Wholegrain Crackers', demand: 25, lead: '3 d', safety: 14, reorder: 89, eoq: 740, minmax: '14 - 829', cover: '30 d', risk: 'Healthy' },
    { product: 'Almond Milk 1L', demand: 14, lead: '6 d', safety: 20, reorder: 104, eoq: 510, minmax: '20 - 614', cover: '7 d', risk: 'Low - reorder now' },
    { product: 'Dark Chocolate 70%', demand: 12, lead: '4 d', safety: 10, reorder: 58, eoq: 468, minmax: '10 - 526', cover: '30 d', risk: 'Healthy' },
    { product: 'Oat Cookies', demand: 16, lead: '4 d', safety: 13, reorder: 77, eoq: 613, minmax: '13 - 690', cover: '13 d', risk: 'Healthy' },
    { product: 'Sparkling Water', demand: 30, lead: '2 d', safety: 14, reorder: 74, eoq: 936, minmax: '14 - 1010', cover: '33 d', risk: 'Healthy' },
  ])

  const [replenishments] = useState([
    { product: 'Organic Green Tea', detail: '185 units on hand - reorder point 112 - suggested order 592 units' },
    { product: 'Almond Milk 1L', detail: '92 units on hand - reorder point 104 - suggested order 510 units' },
    { product: 'Oat Cookies', detail: '214 units on hand - reorder point 77 - suggested order 613 units' },
  ])

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-100 text-emerald-700'
      case 'Low stock':
        return 'bg-amber-100 text-amber-700'
      case 'Critical':
        return 'bg-red-100 text-red-700'
      case 'Review - overstock':
        return 'bg-blue-100 text-blue-700'
      case 'Low - reorder now':
        return 'bg-amber-100 text-amber-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="w-full px-6 md:px-10 py-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-1">
          </div>
          <h1 className="text-3xl font-extrabold text-[#0f172a]">Inventory Optimization</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor stock levels and replenishment recommendations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{kpi.title}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">{kpi.value}</h3>
            <p className={`text-xs mt-1 font-medium ${kpi.type === 'neutral' ? 'text-emerald-600' : 'text-slate-500'}`}>
              {kpi.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Product inventory</h3>
            <p className="text-xs text-slate-500">Monitor stock on hand and replenishment thresholds</p>
          </div>
          <button className="bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            Add product
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search SKU, product or category..."
            className="w-72 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-gray-200">
                <th className="p-4">SKU</th>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">On Hand</th>
                <th className="p-4">Safety Stock</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {inventoryData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-700">{item.sku}</td>
                  <td className="p-4 text-slate-600">{item.product}</td>
                  <td className="p-4 text-slate-500">{item.category}</td>
                  <td className="p-4 text-slate-700 font-medium">{item.onHand.toLocaleString()}</td>
                  <td className="p-4 text-slate-500">{item.safetyStock}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide ${getBadgeStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-slate-800">Inventory optimization</h3>
          <p className="text-xs text-slate-500">Safety stock, reorder point, EOQ and min-max levels from the approved forecast (95% service level)</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-gray-200">
                <th className="p-4">Product</th>
                <th className="p-4">Next Month Demand</th>
                <th className="p-4">Reorder Point</th>
                <th className="p-4">EOQ</th>
                <th className="p-4">Min - Max</th>
                <th className="p-4">Days of Cover</th>
                <th className="p-4">Risk</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {optimizationData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium text-slate-700">{item.product}</td>
                  <td className="p-4 text-slate-600">{item.demand}</td>
                  <td className="p-4 text-slate-600">{item.reorder}</td>
                  <td className="p-4 text-slate-600">{item.eoq}</td>
                  <td className="p-4 text-slate-500">{item.minmax}</td>
                  <td className="p-4 text-slate-500">{item.cover}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide ${getBadgeStyle(item.risk)}`}>
                      {item.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* <div className="p-4 bg-blue-50/50 text-xs text-blue-600 border-t border-blue-100 m-4 rounded-lg">
          Safety stock = Z × σ × √lead time • Reorder point = demand × lead time + safety stock • EOQ = √(2DS / H). Values use illustrative demand parameters.
        </div> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800">Replenishment recommendations</h3>
          <p className="text-xs text-slate-500 mb-6">Suggested actions based on stock thresholds</p>
          <div className="space-y-4">
            {replenishments.map((rec, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">{rec.product}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{rec.detail}</p>
                </div>
                <button className="border border-gray-300 hover:bg-gray-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                  Create PO
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800">Inventory policy</h3>
          <p className="text-xs text-slate-500 mb-6">Demo policy settings</p>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-slate-600">Safety stock method</span>
              <span className="font-bold text-slate-800">Service-level based</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-slate-600">ABC/XYZ classification</span>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">Illustrative</span>
            </div>
            <div className="flex justify-between items-center pb-3">
              <span className="text-slate-600">Reorder threshold</span>
              <span className="font-bold text-slate-800">Product-specific</span>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50/50 text-xs text-blue-600 border border-blue-100 rounded-lg">
            Values are illustrative prototype data, not operational inventory advice.
          </div>
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-400 border-t border-gray-200 pt-6">
        <span>© 2026 IntelliStock - University project prototype</span>
        <span>Demo data - Not connected to live systems</span>
      </div>
    </div>
  )
}