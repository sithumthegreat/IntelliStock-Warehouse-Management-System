
import React, { useState } from "react";

const suppliers = [
  {
    name: "Ceylon Wholesale Ltd.",
    performanceScore: 94,
    leadTime: "3–4 days",
    leadDays: 3.5,
    delivery: "96%",
    payment: "Net 30",
    prices: {
      "Premium Arabica Coffee": 95000,
      "Organic Green Tea": 46625,
      "Packaging Materials": 38000,
      "A4 Printer Paper": 35500,
      "Printer Ink Cartridge": 1950,
      "Office Chairs": 11900,
    },
  },
  {
    name: "Metro Distributors",
    performanceScore: 89,
    leadTime: "2–5 days",
    leadDays: 3.5,
    delivery: "92%",
    payment: "Net 15",
    prices: {
      "Premium Arabica Coffee": 92500,
      "Organic Green Tea": 48000,
      "Packaging Materials": 37100,
      "A4 Printer Paper": 37200,
      "Printer Ink Cartridge": 1720,
      "Office Chairs": 13200,
    },
  },
  {
    name: "Lanka Consumer Goods",
    performanceScore: 84,
    leadTime: "4–6 days",
    leadDays: 5,
    delivery: "88%",
    payment: "Net 30",
    prices: {
      "Premium Arabica Coffee": 97000,
      "Organic Green Tea": 45500,
      "Packaging Materials": 38500,
      "A4 Printer Paper": 39000,
      "Printer Ink Cartridge": 1850,
      "Office Chairs": 12500,
    },
  },
];

const comparisonProducts = [
  "Premium Arabica Coffee",
  "Organic Green Tea",
  "Packaging Materials",
  "A4 Printer Paper",
  "Printer Ink Cartridge",
  "Office Chairs",
];

const initialOrders = [
  {
    number: "PO-2026-045",
    supplier: "Ceylon Wholesale Ltd.",
    itemName: "Premium Arabica Coffee",
    quantity: 1,
    value: 95000,
    approvalStatus: "Pending",
    trackingStatus: "In transit",
    date: "20/10/2026",
    customer: "Customer account",
  },
  {
    number: "PO-2026-041",
    supplier: "Ceylon Wholesale Ltd.",
    itemName: "Organic Green Tea",
    quantity: 4,
    value: 186500,
    approvalStatus: "Pending",
    trackingStatus: "Pending",
    date: "20/10/2026",
    customer: "Customer account",
  },
  {
    number: "PO-2026-040",
    supplier: "Metro Distributors",
    itemName: "Packaging Materials",
    quantity: 2,
    value: 74200,
    approvalStatus: "Accepted",
    trackingStatus: "Accepted",
    date: "15/10/2026",
    customer: "Customer account",
  },
  {
    number: "PO-2026-039",
    supplier: "Lanka Consumer Goods",
    itemName: "Household Consumer Goods",
    quantity: 6,
    value: 231000,
    approvalStatus: "Pending",
    trackingStatus: "In transit",
    date: "12/10/2026",
    customer: "Customer account",
  },
];

const trackingSteps = [
  "Pending",
  "Accepted",
  "In transit",
  "Delivered",
];

const currency = (value) =>
  `Rs. ${Number(value).toLocaleString("en-US")}`;

// SIDEBAR

function Sidebar({ onHome }) {
  const groups = [
    {
      title: "WORKSPACE",
      links: [
        "Dashboard",
        "Demand Forecasting",
        "Import Center",
        "Inventory Optimization",
        "Incoming Requests",
        "Supplier Selection",
        "Goods Received",
      ],
    },
    {
      title: "INSIGHTS & CONTROL",
      links: [
        "Analytics",
        "Supplier Reliability",
        "Reports Center",
        "What-If Simulator",
      ],
    },
    {
      title: "SUPPORT",
      links: ["Help & Support"],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
          IS
        </div>

        <div>
          <p className="text-sm font-bold leading-tight">
            IntelliStock
          </p>
          <p className="text-xs tracking-wider text-slate-500">
            INVENTORY INTELLIGENCE
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="mb-3 text-xs font-bold tracking-wider text-slate-400">
              {group.title}
            </p>

            <div className="space-y-1">
              {group.links.map((link) => (
                <button
                  key={link}
                  onClick={onHome}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    link === "Supplier Selection"
                      ? "bg-blue-50 font-semibold text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4 text-xs text-slate-500">
        <p className="font-semibold">Manager</p>
        <p>Warehouse Manager · Demo account</p>
      </div>
    </aside>
  );
}

// HEADER

function Header({ isDetails, role, setRole }) {
  return (
    <header className="fixed left-56 right-0 top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="text-sm text-slate-500">
        Workspace /{" "}
        <span className="font-semibold text-slate-800">
          {isDetails
            ? "Purchase Order Details"
            : "Supplier Selection & Procurement"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          DEMO ENVIRONMENT
        </span>

        {isDetails ? (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium"
          >
            <option value="Supplier Portal">Supplier Portal</option>
            <option value="Customer Portal">Customer Portal</option>
          </select>
        ) : (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
              M
            </span>
            Warehouse Manager
          </div>
        )}
      </div>
    </header>
  );
}

// STAT CARD

function StatCard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </h3>
      <p className="mt-2 text-sm text-emerald-600">
        {description}
      </p>
    </div>
  );
}

// SUPPLIER COMPARISON

function SupplierComparison() {
  const [selectedProduct, setSelectedProduct] = useState(
    "Premium Arabica Coffee"
  );

  const [requiredQuantity, setRequiredQuantity] = useState(1);

  const comparison = suppliers.map((supplier) => ({
    ...supplier,
    unitPrice: supplier.prices[selectedProduct],
  }));

  const prices = comparison.map((supplier) => supplier.unitPrice);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);

  const scoredSuppliers = comparison
    .map((supplier) => {
      const priceScore =
        highestPrice === lowestPrice
          ? 100
          : (lowestPrice / supplier.unitPrice) * 100;

      const overallScore = Math.round(
        supplier.performanceScore * 0.65 +
          priceScore * 0.35
      );

      return {
        ...supplier,
        priceScore: Math.round(priceScore),
        overallScore,
        totalCost: supplier.unitPrice * requiredQuantity,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);

  const recommendedSupplier = scoredSuppliers[0];

  const cheapestSupplier = [...scoredSuppliers].sort(
    (a, b) => a.unitPrice - b.unitPrice
  )[0];

  const fastestSupplier = [...scoredSuppliers].sort(
    (a, b) => a.leadDays - b.leadDays
  )[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER AND FILTERS */}

      <div className="flex flex-col gap-5 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Supplier comparison
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compare supplier performance, product prices and indicative terms.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[480px]">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Product to compare
            </label>

            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {comparisonProducts.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Required quantity
            </label>

            <input
              type="number"
              min="1"
              value={requiredQuantity}
              onChange={(e) =>
                setRequiredQuantity(
                  Math.max(1, Number(e.target.value) || 1)
                )
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* RECOMMENDED SUPPLIER */}

      <div className="mx-5 mt-5 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
            Recommended supplier
          </p>

          <h3 className="mt-1 text-base font-bold text-slate-900">
            {recommendedSupplier.name}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Best overall match for {selectedProduct}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-medium text-slate-500">
            Combined supplier score
          </p>

          <p className="text-2xl font-bold text-blue-700">
            {recommendedSupplier.overallScore}/100
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid gap-4 p-5 md:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
              Best overall value
            </p>

            <span className="text-lg text-emerald-600">★</span>
          </div>

          <p className="mt-3 text-sm font-bold text-slate-900">
            {recommendedSupplier.name}
          </p>

          <p className="mt-1 text-sm font-semibold text-emerald-700">
            {recommendedSupplier.overallScore}/100 score
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Lowest unit price
            </p>

            <span className="text-lg text-blue-600">↓</span>
          </div>

          <p className="mt-3 text-sm font-bold text-slate-900">
            {cheapestSupplier.name}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            {currency(cheapestSupplier.unitPrice)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Fastest delivery
            </p>

            <span className="text-lg text-violet-600">↗</span>
          </div>

          <p className="mt-3 text-sm font-bold text-slate-900">
            {fastestSupplier.name}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-600">
            {fastestSupplier.leadTime}
          </p>
        </div>
      </div>

      {/* SUPPLIER TABLE */}

      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-slate-50">
            <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-4">Supplier</th>
              <th className="px-4 py-4">Unit price</th>
              <th className="px-4 py-4">Total cost</th>
              <th className="px-4 py-4">Price score</th>
              <th className="px-4 py-4">Overall score</th>
              <th className="px-4 py-4">Lead time</th>
              <th className="px-4 py-4">On-time delivery</th>
              <th className="px-5 py-4">Payment terms</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {scoredSuppliers.map((supplier, index) => (
              <tr
                key={supplier.name}
                className="transition-colors hover:bg-slate-50/80"
              >
                <td className="px-5 py-5">
                  <p className="whitespace-nowrap font-semibold text-slate-800">
                    {supplier.name}
                  </p>

                  {index === 0 && (
                    <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Recommended
                    </span>
                  )}
                </td>

                <td className="whitespace-nowrap px-4 py-5 text-slate-600">
                  {currency(supplier.unitPrice)}
                </td>

                <td className="whitespace-nowrap px-4 py-5 font-semibold text-slate-800">
                  {currency(supplier.totalCost)}
                </td>

                <td className="px-4 py-5 text-slate-600">
                  {supplier.priceScore}/100
                </td>

                <td className="px-4 py-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                      supplier.overallScore >= 85
                        ? "bg-emerald-100 text-emerald-700"
                        : supplier.overallScore >= 75
                        ? "bg-blue-50 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {supplier.overallScore}/100
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-5 text-slate-600">
                  {supplier.leadTime}
                </td>

                <td className="px-4 py-5 text-slate-600">
                  {supplier.delivery}
                </td>

                <td className="whitespace-nowrap px-5 py-5 text-slate-600">
                  {supplier.payment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </section>
  );
}

// PURCHASE ORDERS

function PurchaseOrders({ orders, setOrders, onCreate }) {
  const changeSupplier = (number, supplier) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.number === number ? { ...order, supplier } : order
      )
    );
  };

  const changeApproval = (number, approvalStatus) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.number === number
          ? { ...order, approvalStatus }
          : order
      )
    );
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-5">
        <h2 className="font-bold text-slate-800">
          Purchase orders
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Track procurement lifecycle.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4">PO Number</th>
              <th className="px-5 py-4">Supplier</th>
              <th className="px-5 py-4">Item name</th>
              <th className="px-5 py-4">Quantity</th>
              <th className="px-5 py-4">Value</th>
              <th className="px-5 py-4">Update status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.number}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-5 py-6 font-bold">
                  {order.number}
                </td>

                <td className="px-5 py-6">
                  <select
                    value={order.supplier}
                    onChange={(e) =>
                      changeSupplier(order.number, e.target.value)
                    }
                    className="w-52 rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier.name} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-5 py-6">
                  {order.itemName}
                </td>

                <td className="px-5 py-6">
                  {order.quantity}
                </td>

                <td className="whitespace-nowrap px-5 py-6">
                  {currency(order.value)}
                </td>

                <td className="px-5 py-6">
                  <select
                    value={order.approvalStatus}
                    onChange={(e) =>
                      changeApproval(order.number, e.target.value)
                    }
                    className="w-36 rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                  </select>
                </td>

                <td className="px-5 py-6">
                  <button
                    onClick={() => onCreate(order)}
                    className="whitespace-nowrap rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    Create purchase order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-400">
        {orders.length} open orders · Demo data
      </div>
    </section>
  );
}

// CREATE PURCHASE ORDER MODAL

function CreateOrderModal({ order, onClose, onSubmit }) {
  const [supplier, setSupplier] = useState(order.supplier);
  const [itemName] = useState(order.itemName);
  const [quantity, setQuantity] = useState(String(order.quantity));

  const [unitPrice, setUnitPrice] = useState(
    String(Math.round(order.value / Math.max(order.quantity, 1)))
  );

  const total =
    Math.max(0, Number(quantity) || 0) *
    Math.max(0, Number(unitPrice) || 0);

  const submit = (e) => {
    e.preventDefault();

    if (Number(quantity) <= 0 || Number(unitPrice) <= 0) {
      alert("Please enter a valid quantity and unit price.");
      return;
    }

    onSubmit({
      ...order,
      supplier,
      itemName,
      quantity: Number(quantity),
      value: total,
      approvalStatus: "Pending",
      trackingStatus: "Pending",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-2xl rounded-2xl bg-white p-7 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Create purchase order
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Enter the item and supplier details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Supplier
            </label>

            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-4 py-3"
            >
              {suppliers.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Item name
            </label>

            <input
              value={itemName}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Unit price (Rs.)
              </label>

              <input
                type="number"
                min="1"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-3"
              />
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 p-5">
            <p className="text-sm text-slate-600">
              Estimated order value
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {currency(total)}
            </p>
          </div>
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-5 py-3 font-semibold"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Submit order
          </button>
        </div>
      </form>
    </div>
  );
}

// PURCHASE ORDER DETAILS

function PurchaseOrderDetails({
  order,
  role,
  setRole,
  onBack,
  onStatusChange,
}) {
  const currentStep = trackingSteps.indexOf(order.trackingStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Procurement / Order Details
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Purchase Order Details
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review the order and update delivery progress.
          </p>
        </div>

        <button
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          ← Back to purchase orders
        </button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Purchase order number
            </p>

            <h2 className="text-2xl font-bold">
              {order.number}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Created on {order.date}
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            {order.trackingStatus}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold">
          Order information
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Supplier", order.supplier],
            ["Customer", order.customer],
            ["Item name", order.itemName],
            ["Quantity", order.quantity],
            ["Total order value", currency(order.value)],
            ["Order reference", order.number],
            ["Order date", order.date],
            ["Current status", order.trackingStatus],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-sm text-slate-500">
                {label}
              </p>

              <p className="mt-2 text-sm font-semibold">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">
              Order tracking
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Follow the order from supplier response through delivery.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
            Step {Math.max(1, currentStep + 1)} of 4
          </span>
        </div>

        <div className="relative mt-10">
          <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 rounded-full bg-slate-200" />

          <div
            className="absolute left-[12.5%] top-5 h-1 rounded-full bg-blue-600 transition-all"
            style={{
              width: `${Math.max(0, currentStep) * 25}%`,
            }}
          />

          <div className="relative grid grid-cols-4 gap-2">
            {trackingSteps.map((step, index) => {
              const completed = currentStep > index;
              const active = currentStep === index;

              return (
                <div
                  key={step}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 text-sm font-bold ${
                      completed || active
                        ? "border-blue-100 bg-blue-600 text-white"
                        : "border-slate-100 bg-slate-100 text-slate-400"
                    }`}
                  >
                    {completed ? "✓" : index + 1}
                  </div>

                  <p
                    className={`mt-3 text-xs font-bold sm:text-sm ${
                      completed || active
                        ? "text-blue-700"
                        : "text-slate-400"
                    }`}
                  >
                    {step}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {completed
                      ? "Completed"
                      : active
                      ? "Current"
                      : "Pending"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {role === "Supplier Portal" ? (
          <div className="mt-9 border-t border-slate-100 pt-6">
            <h3 className="font-bold">
              Update tracking status
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Select the latest delivery status for this order.
            </p>

            <label
              htmlFor="tracking-status"
              className="mt-4 block text-sm font-semibold"
            >
              Delivery status
            </label>

            <select
              id="tracking-status"
              value={order.trackingStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="mt-2 w-full max-w-md rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500"
            >
              {trackingSteps.map((step) => (
                <option key={step} value={step}>
                  {step}
                </option>
              ))}
            </select>

            <p className="mt-3 text-xs text-slate-400">
              Changes immediately update this demo order's tracking timeline.
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            You are viewing this order as a customer. You can view the order
            information and delivery progress. Tracking updates are managed
            by the supplier.
          </div>
        )}
      </section>
    </div>
  );
}

// MAIN APP

export default function App() {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOrder, setModalOrder] = useState(null);
  const [role, setRole] = useState("Supplier Portal");

  const submitOrder = (updatedOrder) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.number === updatedOrder.number
          ? updatedOrder
          : order
      )
    );

    setModalOrder(null);
    setSelectedOrder(updatedOrder);
    setRole("Supplier Portal");
  };

  const updateTrackingStatus = (newStatus) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.number === selectedOrder.number
          ? { ...order, trackingStatus: newStatus }
          : order
      )
    );

    setSelectedOrder((previous) => ({
      ...previous,
      trackingStatus: newStatus,
    }));
  };

  const goBack = () => {
    setSelectedOrder(null);
    setRole("Supplier Portal");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar onHome={goBack} />

      <Header
        isDetails={Boolean(selectedOrder)}
        role={role}
        setRole={setRole}
      />

      <main className="ml-56 pt-16">
        <div className="mx-auto max-w-[1500px] space-y-6 p-6 lg:p-8">
          {selectedOrder ? (
            <PurchaseOrderDetails
              order={selectedOrder}
              role={role}
              setRole={setRole}
              onBack={goBack}
              onStatusChange={updateTrackingStatus}
            />
          ) : (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  DEMO ENVIRONMENT
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                  Supplier Selection & Procurement
                </h1>

                <p className="mt-2 text-slate-500">
                  Compare suppliers and manage purchase orders.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <StatCard
                  title="Active suppliers"
                  value="12"
                  description="Demo directory"
                />

                <StatCard
                  title="Open purchase orders"
                  value={orders.length}
                  description="Across suppliers"
                />

                <StatCard
                  title="Average lead time"
                  value="5 days"
                  description="Illustrative estimate"
                />
              </div>

              <SupplierComparison />

              <PurchaseOrders
                orders={orders}
                setOrders={setOrders}
                onCreate={setModalOrder}
              />

              <footer className="flex flex-wrap justify-between gap-3 text-xs text-slate-400">
                <p>
                  © 2026 IntelliStock · University project prototype
                </p>
                <p>
                  Demo data · Not connected to live systems
                </p>
              </footer>
            </>
          )}
        </div>
      </main>

      {modalOrder && (
        <CreateOrderModal
          order={modalOrder}
          onClose={() => setModalOrder(null)}
          onSubmit={submitOrder}
        />
      )}
    </div>
  );
}
