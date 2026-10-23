import { useRef, useState } from 'react'
import Badge from '../components/Badge'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Table from '../components/Table'
import {
  BASE_RECORDS,
  TEMPLATE_CSV,
  initialHistory,
  initialSales,
  knownProducts,
} from '../data/importData'
import usePersistentState from '../hooks/usePersistentState'
import { parseSalesCsv } from '../utils/salesCsv'

const knownIds = knownProducts.map((p) => p.id)
const templateHref = 'data:text/csv;charset=utf-8,' + encodeURIComponent(TEMPLATE_CSV)
const nameOf = (id) => knownProducts.find((p) => p.id === id)?.name ?? id
const money = (n) => `Rs. ${Number(n).toLocaleString()}`
const statusTone = { Completed: 'green', 'Completed with errors': 'amber' }

const formatSize = (bytes) =>
  bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`

// One badge that sums up the state of the chosen file
const fileStatus = (f) => {
  if (f.reading) return { tone: 'blue', text: 'Reading…' }
  if (f.rows.length === 0) return { tone: 'red', text: 'Cannot import' }
  if (f.errors.length > 0) return { tone: 'amber', text: 'Ready, with errors' }
  return { tone: 'green', text: 'Ready to import' }
}

const primaryBtn =
  'cursor-pointer rounded-lg bg-[#1677ff] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40'
const altBtn =
  'cursor-pointer rounded-lg border border-[#e5eaf2] bg-white px-4 py-2.5 text-xs font-bold hover:bg-[#f3f6fb]'
const linkBtn = 'cursor-pointer font-bold text-[#1677ff] hover:underline'

const rowColumns = [
  { header: 'Date', cell: (r) => r.date },
  { header: 'Product', cell: (r) => `${r.product} · ${nameOf(r.product)}` },
  { header: 'Quantity', cell: (r) => r.quantity },
  { header: 'Unit price', cell: (r) => money(r.price) },
  { header: 'Validation', cell: () => <Badge tone="green">Valid</Badge> },
]

export default function ImportCenter() {
  const [sales, setSales] = usePersistentState('is_sales', initialSales)
  const [history, setHistory] = usePersistentState('is_import_history', initialHistory)
  const [file, setFile] = useState(null) // { name, rows, errors, warnings }
  const [excluded, setExcluded] = useState([]) // line numbers the user chose to leave out
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const clearFile = () => {
    setFile(null)
    setExcluded([])
  }

  const readFile = async (f) => {
    if (!f) return
    setExcluded([])
    const info = { name: f.name, size: f.size, rows: [], errors: [], warnings: [], total: 0 }
    setFile({ ...info, reading: true }) // show the file card straight away

    if (!/\.csv$/i.test(f.name)) {
      setFile({
        ...info,
        errors: [
          { line: '–', field: 'file', issue: 'Only .csv files are supported here. In Excel, use Save As > CSV.' },
        ],
      })
      return
    }
    setFile({ ...info, ...parseSalesCsv(await f.text(), knownIds) })
  }

  const importable = file ? file.rows.filter((r) => !excluded.includes(r.line)) : []

  const setExclusion = (line, exclude) =>
    setExcluded(exclude ? [...new Set([...excluded, line])] : excluded.filter((l) => l !== line))

  const commit = () => {
    const stamp = Date.now()
    setSales([
      ...importable.map((r, i) => ({
        id: `${stamp}-${i}`,
        date: r.date,
        product: r.product,
        quantity: r.quantity,
        price: r.price,
      })),
      ...sales,
    ])
    setHistory([
      {
        id: String(stamp),
        file: file.name,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        records: importable.length,
        status: file.errors.length ? 'Completed with errors' : 'Completed',
      },
      ...history,
    ])
    setFile(null)
    setExcluded([])
  }

  const removeRecord = (id) => setSales(sales.filter((s) => s.id !== id))

  const errorColumns = [
    { header: 'Row', cell: (e) => e.line },
    { header: 'Field', cell: (e) => e.field },
    {
      header: 'Issue',
      cell: (e) => (
        <span className="flex items-center gap-2">
          <Badge tone="red">Error</Badge> {e.issue}
        </span>
      ),
    },
  ]

  const rowOf = (line) => file.rows.find((r) => r.line === line)
  const warningColumns = [
    { header: 'Row', cell: (w) => w.line },
    { header: 'Date', cell: (w) => rowOf(w.line)?.date },
    { header: 'Product', cell: (w) => rowOf(w.line)?.product },
    { header: 'Qty', cell: (w) => rowOf(w.line)?.quantity },
    {
      header: 'Issue',
      cell: (w) => (
        <span className="flex items-center gap-2">
          <Badge tone="amber">Review</Badge> {w.issue}
        </span>
      ),
    },
    {
      header: 'Action',
      cell: (w) => (
        <select
          value={excluded.includes(w.line) ? 'Exclude' : 'Keep'}
          onChange={(e) => setExclusion(w.line, e.target.value === 'Exclude')}
          className="rounded-lg border border-[#e5eaf2] bg-white px-2 py-1.5 text-xs"
        >
          <option>Keep</option>
          <option>Exclude</option>
        </select>
      ),
    },
  ]

  const salesColumns = [
    { header: 'Date', cell: (r) => r.date },
    { header: 'Product', cell: (r) => `${r.product} · ${nameOf(r.product)}` },
    { header: 'Quantity', cell: (r) => r.quantity },
    { header: 'Unit price', cell: (r) => money(r.price) },
    {
      header: 'Action',
      cell: (r) => (
        <button onClick={() => removeRecord(r.id)} className={linkBtn}>
          Delete
        </button>
      ),
    },
  ]

  const historyColumns = [
    { header: 'File name', cell: (h) => <b>{h.file}</b> },
    { header: 'Date', cell: (h) => h.date },
    { header: 'Records', cell: (h) => h.records.toLocaleString() },
    { header: 'Status', cell: (h) => <Badge tone={statusTone[h.status] ?? 'blue'}>{h.status}</Badge> },
  ]

  const previewRows = file ? importable : sales

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Records in system"
          value={(BASE_RECORDS + sales.length).toLocaleString()}
          note="Historical sales data"
        />
        <StatCard
          label="Validation errors"
          value={file?.errors.length ?? 0}
          note={file?.name ?? 'No file selected'}
        />
        <StatCard
          label="Last import"
          value={history[0]?.date ?? '—'}
          note={history[0]?.file ?? 'No imports yet'}
        />
      </div>

      <Card
        title="Import historical sales"
        subtitle="Upload a CSV file (columns: date, product_id, quantity, price)"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            readFile(e.dataTransfer.files[0])
          }}
          className={`cursor-pointer rounded-xl border border-dashed px-4 py-8 text-center ${
            dragging ? 'border-[#1677ff] bg-[#f1f7ff]' : 'border-[#bcd1ef] bg-[#fafdff]'
          }`}
        >
          <div className="text-3xl text-[#1677ff]">⇧</div>
          <b>Choose a sales file or drop it here</b>
          <p className="mt-1 text-[#718096]">
            CSV is read in your browser ·{' '}
            <a
              href={templateHref}
              download="sales_template.csv"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-[#1677ff]"
            >
              Download template
            </a>
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              readFile(e.target.files[0])
              e.target.value = '' // lets you pick the same file again
            }}
          />
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-[10px] border border-[#e5eaf2] bg-[#fafbfd] p-3.5">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#eaf2ff] text-lg">📄</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{file.name}</p>
              <p className="mt-0.5 text-[11px] text-[#718096]">
                {formatSize(file.size)} ·{' '}
                {file.reading
                  ? 'Reading file…'
                  : `${file.total} rows read · ${file.rows.length} valid · ${new Set(file.errors.map((e) => e.line)).size} with errors · ${file.warnings.length} warnings`}
              </p>
            </div>
            <Badge tone={fileStatus(file).tone}>{fileStatus(file).text}</Badge>
            <button
              onClick={clearFile}
              aria-label="Remove file"
              className="cursor-pointer rounded-md px-2 py-1 text-lg leading-none text-[#718096] hover:bg-[#eef2f7]"
            >
              ×
            </button>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button className={altBtn} disabled={!file} onClick={clearFile}>
            Clear
          </button>
          <button className={primaryBtn} disabled={!importable.length} onClick={commit}>
            Import {importable.length} valid rows
          </button>
        </div>
      </Card>

      {file?.errors.length > 0 && (
        <Card
          title="Validation errors"
          subtitle={`Fix these rows before importing them${file.errors.length > 15 ? ` (showing 15 of ${file.errors.length})` : ''}`}
        >
          <Table columns={errorColumns} rows={file.errors.slice(0, 15)} />
        </Card>
      )}

      {file?.warnings.length > 0 && (
        <Card
          title="Data quality warnings"
          subtitle="Unusual rows found. Choose what to do before importing"
        >
          <Table columns={warningColumns} rows={file.warnings} />
        </Card>
      )}

      <Card
        title="Data preview"
        subtitle={file ? `First rows of ${file.name}` : 'Example of the expected format'}
      >
        {previewRows.length === 0 ? (
          <p className="py-6 text-center text-[#718096]">No valid rows to show.</p>
        ) : (
          <Table columns={rowColumns} rows={previewRows.slice(0, 6)} />
        )}
      </Card>

      <Card
        title="Sales data management"
        subtitle={`Review and remove imported records (showing ${Math.min(8, sales.length)} of ${sales.length})`}
      >
        {sales.length === 0 ? (
          <p className="py-6 text-center text-[#718096]">No sales records yet. Import a file to add some.</p>
        ) : (
          <Table columns={salesColumns} rows={sales.slice(0, 8)} />
        )}
      </Card>

      <Card title="Import history" subtitle="Recent import activity">
        <Table columns={historyColumns} rows={history} />
      </Card>
    </div>
  )
}
