
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
import { parseSalesCsv, parseSalesExcel } from '../utils/salesCsv'

const knownIds = knownProducts.map((product) => product.id)
const templateHref =
  'data:text/csv;charset=utf-8,' + encodeURIComponent(TEMPLATE_CSV)

const nameOf = (id) =>
  knownProducts.find((product) => product.id === id)?.name ?? id

const money = (value) => `Rs. ${Number(value).toLocaleString()}`

const statusTone = {
  Completed: 'green',
  'Completed with errors': 'amber',
}

const formatSize = (bytes) =>
  bytes < 1024
    ? `${bytes} B`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`

const fileStatus = (file) => {
  if (file.reading) return { tone: 'blue', text: 'Reading…' }
  if (!file.rows.length) return { tone: 'red', text: 'Cannot import' }
  if (file.errors.length) return { tone: 'amber', text: 'Ready, with errors' }
  return { tone: 'green', text: 'Ready to import' }
}

const primaryBtn =
  'cursor-pointer rounded-lg bg-[#1677ff] px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40'

const altBtn =
  'cursor-pointer rounded-lg border border-[#e5eaf2] bg-white px-4 py-2.5 text-xs font-bold hover:bg-[#f3f6fb]'

const linkBtn =
  'cursor-pointer font-bold text-[#1677ff] hover:underline'

const rowColumns = [
  { header: 'Date', cell: (row) => row.date },
  {
    header: 'Product',
    cell: (row) => `${row.product} · ${nameOf(row.product)}`,
  },
  { header: 'Quantity', cell: (row) => row.quantity },
  { header: 'Unit price', cell: (row) => money(row.price) },
  {
    header: 'Validation',
    cell: () => <Badge tone="green">Valid</Badge>,
  },
]

export default function ImportCenter() {
  const [sales, setSales] = usePersistentState('is_sales', initialSales)
  const [history, setHistory] = usePersistentState(
    'is_import_history',
    initialHistory
  )

  const [file, setFile] = useState(null)
  const [excluded, setExcluded] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const clearFile = () => {
    setFile(null)
    setExcluded([])
  }

  const readFile = async (selectedFile) => {
    if (!selectedFile) return

    setExcluded([])

    const info = {
      name: selectedFile.name,
      size: selectedFile.size,
      rows: [],
      errors: [],
      warnings: [],
      total: 0,
      reading: true,
    }

    setFile(info)

    const extension = selectedFile.name.split('.').pop().toLowerCase()

    try {
      let result

      if (extension === 'csv') {
        result = parseSalesCsv(await selectedFile.text(), knownIds)
      } else if (['xlsx', 'xls'].includes(extension)) {
        result = await parseSalesExcel(selectedFile, knownIds)
      } else {
        throw new Error('Unsupported file type. Please upload CSV or Excel.')
      }

      setFile({
        ...info,
        ...result,
        reading: false,
      })
    } catch (error) {
      setFile({
        ...info,
        reading: false,
        errors: [
          {
            line: '–',
            field: 'file',
            issue: error.message || 'Unable to read this file.',
          },
        ],
      })
    }
  }

  const importable = file
    ? file.rows.filter((row) => !excluded.includes(row.line))
    : []

  const setExclusion = (line, exclude) => {
    setExcluded((current) =>
      exclude
        ? [...new Set([...current, line])]
        : current.filter((item) => item !== line)
    )
  }

  const commit = () => {
    if (!file || !importable.length) return

    const stamp = Date.now()

    setSales((current) => [
      ...importable.map((row, index) => ({
        id: `${stamp}-${index}`,
        date: row.date,
        product: row.product,
        quantity: row.quantity,
        price: row.price,
      })),
      ...current,
    ])

    setHistory((current) => [
      {
        id: String(stamp),
        file: file.name,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        records: importable.length,
        status:
          file.errors.length || excluded.length
            ? 'Completed with errors'
            : 'Completed',
      },
      ...current,
    ])

    clearFile()
  }

  const removeRecord = (id) => {
    setSales((current) => current.filter((record) => record.id !== id))
  }

  const errorColumns = [
    { header: 'Row', cell: (error) => error.line },
    { header: 'Field', cell: (error) => error.field },
    {
      header: 'Issue',
      cell: (error) => (
        <span className="flex items-center gap-2">
          <Badge tone="red">Error</Badge> {error.issue}
        </span>
      ),
    },
  ]

  const rowOf = (line) => file?.rows.find((row) => row.line === line)

  const warningColumns = [
    { header: 'Row', cell: (warning) => warning.line },
    { header: 'Date', cell: (warning) => rowOf(warning.line)?.date },
    { header: 'Product', cell: (warning) => rowOf(warning.line)?.product },
    { header: 'Qty', cell: (warning) => rowOf(warning.line)?.quantity },
    {
      header: 'Issue',
      cell: (warning) => (
        <span className="flex items-center gap-2">
          <Badge tone="amber">Review</Badge> {warning.issue}
        </span>
      ),
    },
    {
      header: 'Action',
      cell: (warning) => (
        <select
          value={excluded.includes(warning.line) ? 'Exclude' : 'Keep'}
          onChange={(event) =>
            setExclusion(warning.line, event.target.value === 'Exclude')
          }
          className="rounded-lg border border-[#e5eaf2] bg-white px-2 py-1.5 text-xs"
        >
          <option>Keep</option>
          <option>Exclude</option>
        </select>
      ),
    },
  ]

  const salesColumns = [
    { header: 'Date', cell: (row) => row.date },
    {
      header: 'Product',
      cell: (row) => `${row.product} · ${nameOf(row.product)}`,
    },
    { header: 'Quantity', cell: (row) => row.quantity },
    { header: 'Unit price', cell: (row) => money(row.price) },
    {
      header: 'Action',
      cell: (row) => (
        <button
          onClick={() => removeRecord(row.id)}
          className={linkBtn}
        >
          Delete
        </button>
      ),
    },
  ]

  const historyColumns = [
    { header: 'File name', cell: (item) => <b>{item.file}</b> },
    { header: 'Date', cell: (item) => item.date },
    {
      header: 'Records',
      cell: (item) => item.records.toLocaleString(),
    },
    {
      header: 'Status',
      cell: (item) => (
        <Badge tone={statusTone[item.status] ?? 'blue'}>
          {item.status}
        </Badge>
      ),
    },
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
        subtitle="Upload CSV or Excel files (date, product_id, quantity, price)"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            readFile(event.dataTransfer.files[0])
          }}
          className={`cursor-pointer rounded-xl border border-dashed px-4 py-8 text-center ${
            dragging
              ? 'border-[#1677ff] bg-[#f1f7ff]'
              : 'border-[#bcd1ef] bg-[#fafdff]'
          }`}
        >
          <div className="text-3xl text-[#1677ff]">⇧</div>
          <b>Choose a sales file or drop it here</b>
          <p className="mt-1 text-[#718096]">
            Supports CSV, XLSX and XLS ·{' '}
            <a
              href={templateHref}
              download="sales_template.csv"
              onClick={(event) => event.stopPropagation()}
              className="font-semibold text-[#1677ff]"
            >
              Download CSV template
            </a>
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(event) => {
              readFile(event.target.files[0])
              event.target.value = ''
            }}
          />
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-[10px] border border-[#e5eaf2] bg-[#fafbfd] p-3.5">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#eaf2ff] text-lg">
              📄
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{file.name}</p>
              <p className="mt-0.5 text-[11px] text-[#718096]">
                {formatSize(file.size)} ·{' '}
                {file.reading
                  ? 'Reading file…'
                  : `${file.total} rows read · ${file.rows.length} valid · ${
                      new Set(file.errors.map((error) => error.line)).size
                    } with errors · ${file.warnings.length} warnings`}
              </p>
            </div>

            <Badge tone={fileStatus(file).tone}>
              {fileStatus(file).text}
            </Badge>

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
          <button
            className={altBtn}
            disabled={!file}
            onClick={clearFile}
          >
            Clear
          </button>

          <button
            className={primaryBtn}
            disabled={!importable.length || file?.reading}
            onClick={commit}
          >
            Import {importable.length} valid rows
          </button>
        </div>
      </Card>

      {file?.errors.length > 0 && (
        <Card
          title="Validation errors"
          subtitle={`Rows with errors cannot be imported${
            file.errors.length > 15
              ? ` (showing 15 of ${file.errors.length})`
              : ''
          }`}
        >
          <Table columns={errorColumns} rows={file.errors.slice(0, 15)} />
        </Card>
      )}

      {file?.warnings.length > 0 && (
        <Card
          title="Data quality warnings"
          subtitle="Review unusual rows and choose whether to keep or exclude them"
        >
          <Table columns={warningColumns} rows={file.warnings} />
        </Card>
      )}

      <Card
        title="Data preview"
        subtitle={
          file
            ? `Valid rows from ${file.name}`
            : 'Example of the expected format'
        }
      >
        {previewRows.length === 0 ? (
          <p className="py-6 text-center text-[#718096]">
            No valid rows to show.
          </p>
        ) : (
          <Table columns={rowColumns} rows={previewRows.slice(0, 6)} />
        )}
      </Card>

      <Card
        title="Sales data management"
        subtitle={`Review and remove imported records (showing ${Math.min(
          8,
          sales.length
        )} of ${sales.length})`}
      >
        {sales.length === 0 ? (
          <p className="py-6 text-center text-[#718096]">
            No sales records yet. Import a file to add some.
          </p>
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
