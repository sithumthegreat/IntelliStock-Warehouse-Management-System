
import { useState } from "react";

const suppliers = [
  { name: "Ceylon Wholesale Ltd.", score: 94, lead: "3–4 days", delivery: "96%", terms: "Net 30" },
  { name: "Metro Distributors", score: 89, lead: "2–5 days", delivery: "92%", terms: "Net 15" },
  { name: "Lanka Consumer Goods", score: 84, lead: "4–6 days", delivery: "88%", terms: "Net 30" },
];

const initialOrders = [
  { number: "PO-2026-045", supplier: "Ceylon Wholesale Ltd.", items: 1, value: 95000, status: "Awaiting response" },
  { number: "PO-2026-041", supplier: "Ceylon Wholesale Ltd.", items: 4, value: 186500, status: "Awaiting response" },
  { number: "PO-2026-040", supplier: "Metro Distributors", items: 2, value: 74200, status: "Accepted" },
  { number: "PO-2026-039", supplier: "Lanka Consumer Goods", items: 6, value: 231000, status: "In transit" },
];

const money = (value) =>
  value ? `Rs. ${Number(value).toLocaleString("en-LK")}` : "Rs. 0";

export default function App() {
  const [orders, setOrders] = useState(initialOrders);
  const [showForm, setShowForm] = useState(false);
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState("1");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");

  function createOrder(event) {
    event.preventDefault();

    if (!supplier) {
      setMessage("Please select a supplier.");
      return;
    }

    const nextNumber = 46 + orders.length - initialOrders.length;

    const newOrder = {
      number: `PO-2026-${String(nextNumber).padStart(3, "0")}`,
      supplier,
      items: Number(items),
      value: Number(value || 0),
      status: "Awaiting response",
    };

    setOrders((current) => [newOrder, ...current]);
    setMessage(`${newOrder.number} created successfully.`);
    setShowForm(false);
    setSupplier("");
    setItems("1");
    setValue("");
  }

  function updateStatus(number, status) {
    setOrders((current) =>
      current.map((order) =>
        order.number === number ? { ...order, status } : order
      )
    );
  }

  const openOrders = orders.filter(
    (order) => !["Delivered", "Cancelled"].includes(order.status)
  ).length;

  const inputStyle =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const cardStyle =
    "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";

  const buttonStyle =
    "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="w-full shrink-0 border-r border-slate-200 bg-white p-5 md:min-h-screen md:w-56">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 p-3 font-bold text-white">IS</div>
          <div>
            <h2 className="font-bold">IntelliStock</h2>
            <p className="text-[9px] tracking-widest text-slate-500">
              INVENTORY INTELLIGENCE
            </p>
          </div>
        </div>

        <p className="mb-3 text-xs font-bold tracking-wider text-slate-400">
          WORKSPACE
        </p>

        {[
          "Dashboard",
          "Demand Forecasting",
          "Import Center",
          "Inventory Optimization",
          "Incoming Requests",
          "Supplier Selection",
          "Goods Received",
        ].map((item) => (
          <button
            key={item}
            onClick={() => {
              if (item !== "Supplier Selection") {
                setMessage(`${item} is not implemented in this page.`);
              } else {
                setMessage("");
              }
            }}
            className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm ${
              item === "Supplier Selection"
                ? "bg-blue-50 font-semibold text-blue-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ))}

        <p className="mb-3 mt-7 text-xs font-bold tracking-wider text-slate-400">
          INSIGHTS & CONTROL
        </p>
        {["Analytics", "Supplier Reliability", "Reports Center", "What-If Simulator"].map((item) => (
          <div key={item} className="px-3 py-2.5 text-sm text-slate-500">
            {item}
          </div>
        ))}
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-sm">
            <span className="text-slate-400">Workspace / </span>
            <strong>Supplier Selection & Procurement</strong>
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-emerald-50 px-3 py-2 font-semibold text-emerald-700">
              DEMO ENVIRONMENT
            </span>
            <span className="rounded-full bg-blue-100 p-2 font-bold text-blue-600">M</span>
            <span className="text-slate-600">Warehouse Manager</span>
          </div>
        </header>

        <div className="mx-auto max-w-screen-2xl space-y-6 p-5 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold tracking-wider text-slate-400">
                MONDAY, 19 OCTOBER 2026
              </p>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Supplier Selection & Procurement
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Compare suppliers and manage purchase orders.
              </p>
            </div>
            <button className={buttonStyle} onClick={() => setShowForm(true)}>
              + Create purchase order
            </button>
          </div>

          {message && (
            <div role="status" className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              {message}
              <button onClick={() => setMessage("")} aria-label="Dismiss message">×</button>
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-3">
            <article className={cardStyle}>
              <p className="text-sm text-slate-500">Active suppliers</p>
              <p className="mt-2 text-3xl font-bold">12</p>
              <p className="mt-2 text-xs text-emerald-600">Demo directory</p>
            </article>
            <article className={cardStyle}>
              <p className="text-sm text-slate-500">Open purchase orders</p>
              <p className="mt-2 text-3xl font-bold">{openOrders}</p>
              <p className="mt-2 text-xs text-emerald-600">Across suppliers</p>
            </article>
            <article className={cardStyle}>
              <p className="text-sm text-slate-500">Average lead time</p>
              <p className="mt-2 text-3xl font-bold">4.8 days</p>
              <p className="mt-2 text-xs text-emerald-600">Illustrative estimate</p>
            </article>
          </section>

          <section className={cardStyle}>
            <div className="mb-5">
              <h2 className="font-bold">Supplier comparison</h2>
              <p className="mt-1 text-sm text-slate-500">
                Compare supplier performance and indicative terms
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] text-slate-500">
                  <tr>
                    {["SUPPLIER", "SCORE", "LEAD TIME", "ON-TIME DELIVERY", "PAYMENT TERMS", "ACTION"].map((heading) => (
                      <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((entry) => (
                    <tr key={entry.name} className="border-b border-slate-100">
                      <td className="px-3 py-4 font-semibold">{entry.name}</td>
                      <td className="px-3 py-4">{entry.score}</td>
                      <td className="px-3 py-4">{entry.lead}</td>
                      <td className="px-3 py-4">{entry.delivery}</td>
                      <td className="px-3 py-4">{entry.terms}</td>
                      <td className="px-3 py-4">
                        <button
                          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                          onClick={() => {
                            setSelectedSupplier(entry.name);
                            setSupplier(entry.name);
                            setShowForm(true);
                          }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={cardStyle}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">Purchase orders</h2>
                <p className="mt-1 text-sm text-slate-500">Track procurement lifecycle</p>
              </div>
              <button className={buttonStyle} onClick={() => setShowForm(true)}>
                + Create purchase order
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] text-slate-500">
                  <tr>
                    {["PO NUMBER", "SUPPLIER", "ITEMS", "VALUE", "STATUS", "UPDATE STATUS"].map((heading) => (
                      <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.number} className="border-b border-slate-100">
                      <td className="px-3 py-4 font-semibold">{order.number}</td>
                      <td className="px-3 py-4">{order.supplier}</td>
                      <td className="px-3 py-4">{order.items}</td>
                      <td className="px-3 py-4">{money(order.value)}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <select
                          className="rounded-md border border-slate-200 bg-white p-2 text-xs"
                          value={order.status}
                          aria-label={`Update ${order.number} status`}
                          onChange={(event) => updateStatus(order.number, event.target.value)}
                        >
                          {["Awaiting response", "Accepted", "In transit", "Delivered", "Cancelled"].map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="flex flex-wrap justify-between gap-2 text-xs text-slate-400">
            <span>© 2026 IntelliStock · University project prototype</span>
            <span>Demo data · Not connected to live systems</span>
          </footer>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Create purchase order</h2>
                <p className="mt-1 text-sm text-slate-500">Enter order details below.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-xl text-slate-400" aria-label="Close form">×</button>
            </div>

            <form onSubmit={createOrder} className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Supplier *</span>
                <select
                  required
                  className={inputStyle}
                  value={supplier}
                  onChange={(event) => setSupplier(event.target.value)}
                >
                  <option value="">Choose a supplier</option>
                  {suppliers.map((entry) => (
                    <option key={entry.name} value={entry.name}>{entry.name}</option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Number of items *</span>
                  <input className={inputStyle} type="number" min="1" required value={items} onChange={(event) => setItems(event.target.value)} />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Order value (LKR)</span>
                  <input className={inputStyle} type="number" min="0" placeholder="125000" value={value} onChange={(event) => setValue(event.target.value)} />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button type="button" className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className={buttonStyle}>Create order</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
