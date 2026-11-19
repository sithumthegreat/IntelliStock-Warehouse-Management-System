import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PRODUCTS = [
  { sku: 'SKU-1001', name: 'Premium Arabica Coffee', category: 'Beverages', stock: 1280 },
  { sku: 'SKU-1002', name: 'Organic Green Tea', category: 'Beverages', stock: 185 },
  { sku: 'SKU-1003', name: 'Wholegrain Crackers', category: 'Snacks', stock: 740 },
  { sku: 'SKU-1004', name: 'Almond Milk 1L', category: 'Dairy alternatives', stock: 92 },
  { sku: 'SKU-1005', name: 'Dark Chocolate 70%', category: 'Confectionery', stock: 360 },
]

const INITIAL_MOVEMENTS = [
  {
    id: 'TRX-9082',
    timestamp: '19 Oct 2026, 11:45 AM',
    dateKey: 'TODAY',
    sku: 'SKU-1001',
    productName: 'Premium Arabica Coffee',
    type: 'GOODS_RECEIVED',
    badgeText: '+ IN (GOODS RECEIVED)',
    direction: 'IN',
    quantity: 400,
    reference: 'PO-8821',
    performedBy: 'S.N. Kandage',
    reasonCode: 'Supplier Delivery Receipt',
    notes: 'Supplier shipment verified and received via Goods Received module.',
  },
  {
    id: 'TRX-9081',
    timestamp: '19 Oct 2026, 10:15 AM',
    dateKey: 'TODAY',
    sku: 'SKU-1002',
    productName: 'Organic Green Tea',
    type: 'OUTLET_REQUEST',
    badgeText: '- OUT (OUTLET REQUEST)',
    direction: 'OUT',
    quantity: 50,
    reference: 'REQ-0285',
    performedBy: 'Auto-System',
    reasonCode: 'Approved Outlet Request',
    notes: 'Automatically dispatched upon Warehouse Manager approval for Colombo 03 Outlet.',
  },
  {
    id: 'TRX-9080',
    timestamp: '19 Oct 2026, 09:30 AM',
    dateKey: 'TODAY',
    sku: 'SKU-1004',
    productName: 'Almond Milk 1L',
    type: 'DAMAGED',
    badgeText: '- OUT (DAMAGED)',
    direction: 'OUT',
    quantity: 5,
    reference: 'DISP-1042',
    performedBy: 'Warehouse Staff',
    reasonCode: 'Damaged in Transit / Expiry',
    notes: 'Seal broken during unloading at Bay 2. Approved for disposal.',
  },
  {
    id: 'TRX-9079',
    timestamp: '18 Oct 2026, 04:20 PM',
    dateKey: 'LAST_7_DAYS',
    sku: 'SKU-1005',
    productName: 'Dark Chocolate 70%',
    type: 'RETURN',
    badgeText: '+ IN (RETURN)',
    direction: 'IN',
    quantity: 10,
    reference: 'RET-0012',
    performedBy: 'Warehouse Staff',
    reasonCode: 'Customer / Outlet Return',
    notes: 'Unopened excess stock returned from retail outlet.',
  },
  {
    id: 'TRX-9078',
    timestamp: '18 Oct 2026, 01:15 PM',
    dateKey: 'LAST_7_DAYS',
    sku: 'SKU-1003',
    productName: 'Wholegrain Crackers',
    type: 'WAREHOUSE_TRANSFER',
    badgeText: '- OUT (TRANSFER)',
    direction: 'OUT',
    quantity: 45,
    reference: 'TRF-0309',
    performedBy: 'Warehouse Staff',
    reasonCode: 'Warehouse Transfer',
    notes: 'Internal stock transfer to Cold Storage Annex B.',
  },
  {
    id: 'TRX-9077',
    timestamp: '17 Oct 2026, 09:00 AM',
    dateKey: 'LAST_7_DAYS',
    sku: 'SKU-1004',
    productName: 'Almond Milk 1L',
    type: 'PRODUCT_ADDED',
    badgeText: '+ IN (PRODUCT ADDED)',
    direction: 'IN',
    quantity: 100,
    reference: 'INIT-1004',
    performedBy: 'S.N. Kandage',
    reasonCode: 'Initial Catalog Registration',
    notes: 'Initial opening stock registered when product was added in Inventory Optimization.',
  },
]

const DISPATCH_TYPES = [
  {
    value: 'CUSTOMER_ORDER',
    label: 'Outgoing: Customer Order',
    summaryLabel: 'Customer order',
    badgeText: '- OUT (CUSTOMER ORDER)',
    direction: 'OUT',
    defaultReason: 'Direct Customer Order Fulfillment',
  },
  {
    value: 'DAMAGED',
    label: 'Outgoing: Damaged / Expired',
    summaryLabel: 'Damaged / Expired',
    badgeText: '- OUT (DAMAGED)',
    direction: 'OUT',
    defaultReason: 'Damaged in Transit / Expiry',
  },
  {
    value: 'WAREHOUSE_TRANSFER',
    label: 'Outgoing: Warehouse Transfer',
    summaryLabel: 'Stock transfer',
    badgeText: '- OUT (TRANSFER)',
    direction: 'OUT',
    defaultReason: 'Internal Warehouse Transfer',
  },
  {
    value: 'RETURN',
    label: 'Incoming: Customer Return',
    summaryLabel: 'Customer return',
    badgeText: '+ IN (RETURN)',
    direction: 'IN',
    defaultReason: 'Customer / Outlet Return',
  },
  {
    value: 'AUDIT_CORRECTION',
    label: 'Adjustment: Audit Correction',
    summaryLabel: 'Audit correction',
    badgeText: 'ADJ (AUDIT CORRECTION)',
    direction: 'ADJ',
    defaultReason: 'Physical Cycle Count Variance',
  },
]

const REASON_OPTIONS = [
  'Direct Customer Order Fulfillment',
  'Damaged in Transit / Expiry',
  'Internal Warehouse Transfer',
  'Customer / Outlet Return',
  'Physical Cycle Count Variance',
  'Approved Outlet Request Override',
  'Other Operational Adjustment',
]

export default function StockMovementsPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  // View toggle: 'history' | 'dispatch' | 'recorded'
  const [activeView, setActiveView] = useState('history')

  const [movements, setMovements] = useState(INITIAL_MOVEMENTS)
  const [products, setProducts] = useState(PRODUCTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')
  const [selectedRow, setSelectedRow] = useState(null)

  // Stores details of the newly created movement for the confirmation screen
  const [recordedSummary, setRecordedSummary] = useState(null)
  const [manualCount, setManualCount] = useState(0)

  // Form state for in-page Record Stock Dispatch / Adjustment view
  const [formData, setFormData] = useState({
    type: 'DAMAGED',
    sku: 'SKU-1004',
    quantity: '',
    reference: '',
    reasonCode: 'Damaged in Transit / Expiry',
    notes: '',
  })
  const [formError, setFormError] = useState('')

  const filteredMovements = useMemo(() => {
    return movements.filter((item) => {
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter
      const matchesDate =
        dateFilter === 'ALL' ||
        (dateFilter === 'TODAY' && item.dateKey === 'TODAY') ||
        (dateFilter === 'LAST_7_DAYS' &&
          (item.dateKey === 'TODAY' || item.dateKey === 'LAST_7_DAYS'))

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.productName.toLowerCase().includes(q) ||
        item.reference.toLowerCase().includes(q) ||
        item.performedBy.toLowerCase().includes(q)

      return matchesType && matchesDate && matchesSearch
    })
  }, [movements, searchQuery, typeFilter, dateFilter])

  const selectedProduct = products.find((p) => p.sku === formData.sku)

  function getBadgeClasses(type, direction) {
    if (type === 'AUDIT_CORRECTION') {
      return direction === 'IN'
        ? 'bg-[#dcfce7] text-[#15803d]'
        : 'bg-[#fef3c7] text-[#b45309]'
    }
    switch (type) {
      case 'GOODS_RECEIVED':
      case 'PRODUCT_ADDED':
        return 'bg-[#dcfce7] text-[#15803d]'
      case 'OUTLET_REQUEST':
      case 'CUSTOMER_ORDER':
        return 'bg-[#dbeafe] text-[#1d4ed8]'
      case 'DAMAGED':
        return 'bg-[#fee2e2] text-[#dc2626]'
      case 'RETURN':
        return 'bg-[#f3e8ff] text-[#7e22ce]'
      case 'WAREHOUSE_TRANSFER':
        return 'bg-[#fef3c7] text-[#b45309]'
      default:
        return 'bg-[#f1f5f9] text-[#475569]'
    }
  }

  function handleDispatchTypeChange(newType) {
    const meta = DISPATCH_TYPES.find((d) => d.value === newType)
    setFormError('')
    setFormData((prev) => ({
      ...prev,
      type: newType,
      reasonCode: meta ? meta.defaultReason : prev.reasonCode,
    }))
  }

  function openDispatchView() {
    setFormError('')
    setActiveView('dispatch')
  }

  function backToHistoryView() {
    setFormError('')
    setActiveView('history')
  }

  function handleExportCsv() {
    const headers = [
      'TRX ID',
      'Timestamp',
      'SKU',
      'Product Name',
      'Movement Type',
      'Qty Change',
      'Reference',
      'Performed By',
    ]
    const rows = filteredMovements.map((m) => [
      m.id,
      `"${m.timestamp}"`,
      m.sku,
      `"${m.productName}"`,
      `"${m.badgeText}"`,
      m.direction === 'IN' ? `+${m.quantity}` : `-${m.quantity}`,
      m.reference,
      `"${m.performedBy}"`,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', 'intellistock_stock_movements.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleSubmitDispatch(e) {
    e.preventDefault()
    setFormError('')

    const rawQty = Number(formData.quantity)
    const option = DISPATCH_TYPES.find((o) => o.value === formData.type)
    if (!selectedProduct || !option) return

    if (!rawQty || Number.isNaN(rawQty)) {
      setFormError('Please enter a valid non-zero quantity.')
      return
    }

    if (option.direction !== 'ADJ' && rawQty <= 0) {
      setFormError('Quantity must be greater than 0.')
      return
    }

    // Determine effective direction and absolute quantity
    let effectiveDirection = option.direction
    const absQty = Math.abs(rawQty)
    let badgeText = option.badgeText

    if (option.direction === 'ADJ') {
      effectiveDirection = rawQty > 0 ? 'IN' : 'OUT'
      badgeText = rawQty > 0 ? '+ IN (AUDIT ADJ)' : '- OUT (AUDIT ADJ)'
    }

    if (effectiveDirection === 'OUT' && absQty > selectedProduct.stock) {
      setFormError(
        `Insufficient stock. Only ${selectedProduct.stock} units currently on hand for ${selectedProduct.name}.`
      )
      return
    }

    // 1. Update live inventory stock balance
    setProducts((prev) =>
      prev.map((p) =>
        p.sku === selectedProduct.sku
          ? {
              ...p,
              stock: effectiveDirection === 'IN' ? p.stock + absQty : p.stock - absQty,
            }
          : p
      )
    )

    // 2. Generate Movement ID (e.g., MOV-0269) & prepend to Movement History
    const movementId = `MOV-${String(269 + manualCount).padStart(4, '0')}`
    setManualCount((prev) => prev + 1)

    const now = new Date()
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const newRecord = {
      id: movementId,
      timestamp: `${formattedDate}, ${formattedTime}`,
      dateKey: 'TODAY',
      sku: selectedProduct.sku,
      productName: selectedProduct.name,
      type: option.value,
      badgeText,
      direction: effectiveDirection,
      quantity: absQty,
      reference:
        formData.reference.trim() || `DISP-2026-${Math.floor(100 + Math.random() * 900)}`,
      performedBy: currentUser?.name || 'Warehouse Staff',
      reasonCode: formData.reasonCode,
      notes: formData.notes.trim() || formData.reasonCode,
    }

    setMovements((prev) => [newRecord, ...prev])

    // 3. Save summary for confirmation screen & switch to 'recorded' view
    setRecordedSummary({
      id: movementId,
      typeLabel: option.summaryLabel,
      status: 'Recorded',
    })

    setFormData({
      type: 'DAMAGED',
      sku: 'SKU-1004',
      quantity: '',
      reference: '',
      reasonCode: 'Damaged in Transit / Expiry',
      notes: '',
    })
    setActiveView('recorded')
  }

  return (
    <div className="space-y-6">
      {/* Shared Top Context Bar + Page Title + Dynamic Header CTA */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#8794a6]">
              SATURDAY, 19 OCTOBER 2026
            </span>
            {activeView !== 'recorded' && (
              <span className="rounded-md bg-[#dcfce7] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.5px] text-[#15803d]">
                • DEMO ENVIRONMENT
              </span>
            )}
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#0f172a]">
            {activeView === 'recorded' ? 'Movement Recorded' : 'Stock Movements & Dispatches'}
          </h1>
          <p className="mt-1 text-[13.5px] text-[#64748b]">
            {activeView === 'recorded'
              ? 'The stock movement has been added to the prototype activity log.'
              : 'Track inventory movements and manually record stock adjustments.'}
          </p>
        </div>

        {activeView === 'history' && (
          <button
            onClick={openDispatchView}
            className="mt-2 rounded-[9px] bg-brand px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Record Manual Dispatch
          </button>
        )}

        {activeView === 'dispatch' && (
          <button
            onClick={backToHistoryView}
            className="mt-2 rounded-[9px] bg-brand px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Back to History
          </button>
        )}
      </div>

      {/* VIEW 1: MOVEMENT HISTORY TABLE */}
      {activeView === 'history' && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
          <div className="mb-5">
            <h2 className="text-[17px] font-bold text-[#0f172a]">Movement History</h2>
            <p className="mt-0.5 text-[12.5px] text-[#64748b]">
              Complete audit trail of all inventory changes.
            </p>
          </div>

          {/* Filter & Export Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748b]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movements..."
                  className="w-[230px] rounded-[9px] border border-line bg-white py-2 pl-9 pr-3.5 text-[12.5px] font-medium text-[#1e293b] placeholder-[#64748b] outline-none transition focus:border-brand"
                />
              </div>

              {/* Movement Type Dropdown */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none rounded-[9px] border border-line bg-white py-2 pl-4 pr-9 text-[12.5px] font-semibold text-[#1e293b] outline-none transition focus:border-brand"
                >
                  <option value="ALL">All Movement Types</option>
                  <option value="PRODUCT_ADDED">+ IN (Product Added)</option>
                  <option value="GOODS_RECEIVED">+ IN (Goods Received)</option>
                  <option value="RETURN">+ IN (Return)</option>
                  <option value="OUTLET_REQUEST">- OUT (Outlet Request)</option>
                  <option value="CUSTOMER_ORDER">- OUT (Customer Order)</option>
                  <option value="DAMAGED">- OUT (Damaged)</option>
                  <option value="WAREHOUSE_TRANSFER">- OUT (Transfer)</option>
                  <option value="AUDIT_CORRECTION">ADJ (Audit Correction)</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#475569]">
                  ▼
                </span>
              </div>

              {/* Date Filter Dropdown */}
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="appearance-none rounded-[9px] border border-line bg-white py-2 pl-4 pr-9 text-[12.5px] font-semibold text-[#1e293b] outline-none transition focus:border-brand"
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today</option>
                  <option value="LAST_7_DAYS">Last 7 Days</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#475569]">
                  ▼
                </span>
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-[9px] border border-line bg-white px-4 py-2 text-[12.5px] font-semibold text-[#1e293b] transition hover:bg-[#f8fafc]"
            >
              <span>↓</span>
              <span>Export</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-y border-[#f1f5f9] bg-[#f8fafc] text-[10.5px] font-bold uppercase tracking-[0.6px] text-[#64748b]">
                  <th className="px-4 py-3.5">TIMESTAMP & TRX ID</th>
                  <th className="px-4 py-3.5">PRODUCT & SKU</th>
                  <th className="px-4 py-3.5 text-center">MOVEMENT TYPE</th>
                  <th className="px-4 py-3.5 text-right">QTY CHANGE</th>
                  <th className="px-4 py-3.5">SOURCE/REFERENCE</th>
                  <th className="px-4 py-3.5">PERFORMED BY</th>
                  <th className="px-4 py-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-[13px]">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[13px] text-[#94a3b8]">
                      No inventory movement records found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((row) => (
                    <tr key={row.id} className="transition hover:bg-[#f8fafc]/70">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#1e293b]">{row.timestamp}</div>
                        <div className="mt-0.5 text-[11px] font-medium text-[#94a3b8]">{row.id}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-[#0f172a]">{row.productName}</div>
                        <div className="mt-0.5 text-[11px] font-medium text-[#94a3b8]">{row.sku}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block min-w-[185px] rounded-md px-3.5 py-1.5 text-center text-[10.5px] font-extrabold uppercase tracking-[0.4px] ${getBadgeClasses(
                            row.type,
                            row.direction
                          )}`}
                        >
                          {row.badgeText}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-extrabold">
                        <span
                          className={
                            row.direction === 'IN' ? 'text-[#16a34a]' : 'text-[#0f172a]'
                          }
                        >
                          {row.direction === 'IN' ? `+${row.quantity}` : `-${row.quantity}`}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-[#334155]">{row.reference}</td>
                      <td className="px-4 py-4 font-medium text-[#334155]">{row.performedBy}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setSelectedRow(row)}
                          className="rounded-[8px] border border-line bg-white px-4 py-1.5 text-[12px] font-semibold text-[#1e293b] transition hover:bg-[#f8fafc]"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: IN-PAGE RECORD STOCK DISPATCH / ADJUSTMENT FORM */}
      {activeView === 'dispatch' && (
        <div className="rounded-2xl border border-line bg-white p-6 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
          <div className="mb-6">
            <h2 className="text-[17px] font-bold text-[#0f172a]">
              Record Stock Dispatch / Adjustment
            </h2>
            <p className="mt-0.5 text-[12.5px] text-[#64748b]">
              Manually record outgoing stock, damage write-offs, transfers, or inventory corrections.
            </p>
          </div>

          <form onSubmit={handleSubmitDispatch} className="space-y-6">
            {formError && (
              <div className="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[12.5px] font-semibold text-[#dc2626]">
                {formError}
              </div>
            )}

            {/* 1. DISPATCH TYPE */}
            <div>
              <label className="mb-2.5 block text-[10.5px] font-bold uppercase tracking-[0.7px] text-[#64748b]">
                1. DISPATCH TYPE
              </label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {DISPATCH_TYPES.map((option) => {
                  const isSelected = formData.type === option.value
                  return (
                    <label
                      key={option.value}
                      onClick={() => handleDispatchTypeChange(option.value)}
                      className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-[13px] transition ${
                        isSelected
                          ? 'border-brand bg-[#f8fbff] font-semibold text-[#0f172a]'
                          : 'border-line bg-white font-medium text-[#334155] hover:bg-[#f8fafc]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dispatchType"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => handleDispatchTypeChange(option.value)}
                        className="h-4 w-4 accent-brand"
                      />
                      <span>{option.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* 2. PRODUCT SELECTION */}
            <div>
              <label className="mb-2 block text-[10.5px] font-bold uppercase tracking-[0.7px] text-[#64748b]">
                2. PRODUCT SELECTION
              </label>
              <div className="relative">
                <select
                  value={formData.sku}
                  onChange={(e) => {
                    setFormError('')
                    setFormData({ ...formData, sku: e.target.value })
                  }}
                  className="w-full appearance-none rounded-[10px] border border-line bg-white px-4 py-2.5 pr-10 text-[13px] font-medium text-[#0f172a] outline-none transition focus:border-brand"
                >
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[#475569]">
                  ▼
                </span>
              </div>
              {selectedProduct && (
                <p className="mt-2 text-[12px] text-[#64748b]">
                  Current Stock On Hand:{' '}
                  <span className="font-bold text-[#0f172a]">
                    {selectedProduct.stock.toLocaleString()} units
                  </span>
                </p>
              )}
            </div>

            {/* 3. QUANTITY & 4. REFERENCE / TRACKING # */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10.5px] font-bold uppercase tracking-[0.7px] text-[#64748b]">
                  3. QUANTITY
                </label>
                <input
                  type="number"
                  min={formData.type === 'AUDIT_CORRECTION' ? undefined : '1'}
                  required
                  value={formData.quantity}
                  onChange={(e) => {
                    setFormError('')
                    setFormData({ ...formData, quantity: e.target.value })
                  }}
                  placeholder={formData.type === 'AUDIT_CORRECTION' ? 'e.g. 5 or -5' : 'e.g. 5'}
                  className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition focus:border-brand"
                />
                {formData.type === 'AUDIT_CORRECTION' && (
                  <p className="mt-1 text-[11px] text-[#64748b]">
                    Enter a positive value (e.g. 10) to add stock or negative (e.g. -5) to deduct.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-[10.5px] font-bold uppercase tracking-[0.7px] text-[#64748b]">
                  4. REFERENCE / TRACKING #
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="e.g. DISP-2026-109"
                  className="w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[13px] font-medium text-[#0f172a] outline-none transition focus:border-brand"
                />
              </div>
            </div>

            {/* 5. REASON & REMARKS */}
            <div>
              <label className="mb-2 block text-[10.5px] font-bold uppercase tracking-[0.7px] text-[#64748b]">
                5. REASON & REMARKS
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <select
                    value={formData.reasonCode}
                    onChange={(e) => setFormData({ ...formData, reasonCode: e.target.value })}
                    className="w-full appearance-none rounded-[10px] border border-line bg-white px-4 py-2.5 pr-10 text-[13px] font-medium text-[#0f172a] outline-none transition focus:border-brand"
                  >
                    {REASON_OPTIONS.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-[#475569]">
                    ▼
                  </span>
                </div>

                <textarea
                  rows={3}
                  required
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Seal broken during unloading at Bay 2. Approved for disposal."
                  className="w-full rounded-[10px] border border-line bg-white px-4 py-3 text-[13px] text-[#0f172a] outline-none transition focus:border-brand"
                />
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-[#f1f5f9] pt-5">
              <button
                type="button"
                onClick={backToHistoryView}
                className="rounded-[9px] border border-line bg-white px-5 py-2.5 text-[13px] font-semibold text-[#1e293b] transition hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-[9px] bg-brand px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Submit & Update Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: MOVEMENT RECORDED CONFIRMATION SCREEN */}
      {activeView === 'recorded' && recordedSummary && (
        <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-line bg-white px-8 py-12 shadow-[0_1px_3px_rgba(16,24,40,0.03)]">
          {/* Circular Checkmark Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7]">
            <svg
              className="h-7 w-7 text-[#16a34a]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.8}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Confirmation Title & Subtitle */}
          <div className="mt-6 text-center">
            <h2 className="text-[20px] font-extrabold text-[#0f172a]">
              Stock movement recorded
            </h2>
            <p className="mt-1.5 text-[13px] text-[#64748b]">
              Movement ID <span className="font-semibold text-[#334155]">{recordedSummary.id}</span> has been created successfully.
            </p>
          </div>

          {/* Summary Box */}
          <div className="mx-auto mt-7 max-w-xl rounded-xl border border-[#f1f5f9] bg-[#f8fafc] px-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.7px] text-[#64748b]">
                  TYPE
                </div>
                <div className="mt-1 text-[13.5px] font-bold text-[#0f172a]">
                  {recordedSummary.typeLabel}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-[0.7px] text-[#64748b]">
                  STATUS
                </div>
                <div className="mt-1 text-[13.5px] font-bold text-[#16a34a]">
                  {recordedSummary.status}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/inventory')}
              className="rounded-[9px] border border-line bg-white px-5 py-2.5 text-[12.5px] font-semibold text-[#1e293b] transition hover:bg-[#f8fafc]"
            >
              Back to Inventory
            </button>
            <button
              type="button"
              onClick={backToHistoryView}
              className="rounded-[9px] bg-brand px-5 py-2.5 text-[12.5px] font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              Back to Stock Movement
            </button>
          </div>
        </div>
      )}

      {/* Row Selection Details Modal (from Movement History table) */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#f1f5f9] pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-[#0f172a]">
                  Transaction Details — {selectedRow.id}
                </h3>
                <p className="text-[11.5px] text-[#64748b]">{selectedRow.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="rounded-lg px-2 py-1 text-sm font-bold text-[#64748b] hover:bg-[#f1f5f9]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#64748b]">Product</span>
                <span className="font-bold text-[#0f172a]">
                  {selectedRow.productName} ({selectedRow.sku})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Movement Type</span>
                <span
                  className={`rounded-md px-2.5 py-1 text-[10.5px] font-extrabold ${getBadgeClasses(
                    selectedRow.type,
                    selectedRow.direction
                  )}`}
                >
                  {selectedRow.badgeText}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Quantity Change</span>
                <span
                  className={`font-extrabold ${
                    selectedRow.direction === 'IN' ? 'text-[#16a34a]' : 'text-[#0f172a]'
                  }`}
                >
                  {selectedRow.direction === 'IN'
                    ? `+${selectedRow.quantity}`
                    : `-${selectedRow.quantity}`}{' '}
                  units
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Source / Reference</span>
                <span className="font-semibold text-[#1e293b]">{selectedRow.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">Performed By</span>
                <span className="font-semibold text-[#1e293b]">{selectedRow.performedBy}</span>
              </div>
              {selectedRow.reasonCode && (
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Reason Category</span>
                  <span className="font-semibold text-[#1e293b]">{selectedRow.reasonCode}</span>
                </div>
              )}
              <div className="pt-1">
                <span className="block text-[#64748b]">Audit Notes</span>
                <p className="mt-1.5 rounded-lg border border-[#f1f5f9] bg-[#f8fafc] p-3 text-[12.5px] text-[#334155]">
                  {selectedRow.notes}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedRow(null)}
                className="rounded-[9px] border border-line bg-white px-4 py-2 text-[12.5px] font-semibold text-[#1e293b] hover:bg-[#f8fafc]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}