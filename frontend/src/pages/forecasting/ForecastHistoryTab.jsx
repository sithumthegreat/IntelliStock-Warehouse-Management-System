
import { useMemo, useState } from 'react'

import Badge from '../../components/Badge'
import Card from '../../components/Card'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'

import usePersistentState from '../../hooks/usePersistentState'
import { runAdaptiveForecast } from '../../utils/adaptiveForecast'

const formatNumber = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

const formatDate = (date) =>
  new Date(date).toLocaleString()

const getMonthKey = (date) => String(date).slice(0, 7)

function getActualSales(sales) {
  const totals = {}

  sales.forEach((record) => {
    if (
      !record.product ||
      !record.date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(record.date)
    ) {
      return
    }

    const key = `${record.product}_${getMonthKey(record.date)}`
    const quantity = Number(record.quantity)

    if (!Number.isFinite(quantity) || quantity < 0) return

    totals[key] = (totals[key] || 0) + quantity
  })

  return totals
}

export default function ForecastHistoryTab({ sales = [] }) {
  const result = useMemo(
    () => runAdaptiveForecast(sales),
    [sales]
  )

  const actualSales = useMemo(
    () => getActualSales(sales),
    [sales]
  )

  const [history, setHistory] = usePersistentState(
    'is_forecast_history',
    []
  )

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const saveSnapshot = () => {
    if (!result.predictions.length) {
      window.alert('There are no forecasts available to save.')
      return
    }

    const snapshot = {
      id: `forecast-${Date.now()}`,
      savedAt: new Date().toISOString(),
      productsEvaluated: result.productsEvaluated,
      totalForecast: result.totalForecast,
      predictions: result.predictions.map((item) => ({
        product: item.product,
        month: item.month,
        key: item.key,
        value: item.value,
        low: item.low,
        high: item.high,
        confidence: item.confidence,
      })),
    }

    setHistory((current) => [
      snapshot,
      ...current,
    ])

    window.alert('Forecast snapshot saved successfully.')
  }

  const rows = history.flatMap((snapshot) =>
    snapshot.predictions.map((prediction) => {
      const actualKey = `${prediction.product}_${prediction.key}`
      const actual = actualSales[actualKey]

      const hasActual = actual !== undefined

      const error = hasActual
        ? Math.abs(actual - prediction.value)
        : null

      const errorPercentage =
        hasActual && actual > 0
          ? (error / actual) * 100
          : null

      return {
        ...prediction,
        snapshotId: snapshot.id,
        savedAt: snapshot.savedAt,
        actual,
        hasActual,
        error,
        errorPercentage,
      }
    })
  )

  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      row.product.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'All' ||
      (filter === 'Evaluated' && row.hasActual) ||
      (filter === 'Pending' && !row.hasActual)

    return matchesSearch && matchesFilter
  })

  const evaluatedRows = rows.filter(
    (row) => row.hasActual
  )

  const averageError = evaluatedRows.length
    ? evaluatedRows.reduce(
        (sum, row) => sum + row.error,
        0
      ) / evaluatedRows.length
    : null

  const averagePercentageError = evaluatedRows.filter(
    (row) => row.errorPercentage !== null
  )

  const averagePercentage = averagePercentageError.length
    ? averagePercentageError.reduce(
        (sum, row) => sum + row.errorPercentage,
        0
      ) / averagePercentageError.length
    : null

  const stats = [
    {
      label: 'Saved forecast runs',
      value: history.length,
      note: 'Stored forecast snapshots',
    },
    {
      label: 'Forecast records',
      value: rows.length,
      note: 'Product-month predictions saved',
    },
    {
      label: 'Actual comparisons',
      value: evaluatedRows.length,
      note: 'Forecasts matched with actual sales',
    },
    {
      label: 'Average absolute error',
      value: averageError === null
        ? '—'
        : formatNumber(averageError),
      note: 'Units per product-month',
    },
  ]

  const columns = [
    {
      header: 'Product',
      cell: (row) => <b>{row.product}</b>,
    },
    {
      header: 'Forecast month',
      cell: (row) => row.month,
    },
    {
      header: 'Saved forecast',
      cell: (row) => formatNumber(row.value),
    },
    {
      header: 'Actual sales',
      cell: (row) =>
        row.hasActual
          ? formatNumber(row.actual)
          : 'Awaiting sales',
    },
    {
      header: 'Absolute error',
      cell: (row) =>
        row.hasActual
          ? formatNumber(row.error)
          : '—',
    },
    {
      header: 'Error %',
      cell: (row) =>
        row.errorPercentage === null
          ? '—'
          : `${formatNumber(row.errorPercentage)}%`,
    },
    {
      header: 'Status',
      cell: (row) =>
        row.hasActual ? (
          <Badge tone="green">Evaluated</Badge>
        ) : (
          <Badge tone="amber">Pending</Badge>
        ),
    },
    {
      header: 'Saved on',
      cell: (row) => (
        <span className="whitespace-nowrap">
          {new Date(row.savedAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  const snapshotColumns = [
    {
      header: 'Forecast run',
      cell: (row) => (
        <b>
          {new Date(row.savedAt).toLocaleString()}
        </b>
      ),
    },
    {
      header: 'Products evaluated',
      cell: (row) => row.productsEvaluated,
    },
    {
      header: 'Forecast records',
      cell: (row) => row.predictions.length,
    },
    {
      header: 'Total forecast',
      cell: (row) => formatNumber(row.totalForecast),
    },
    {
      header: 'Action',
      cell: (row) => (
        <button
          onClick={() => {
            if (
              window.confirm(
                'Delete this forecast snapshot?'
              )
            ) {
              setHistory((current) =>
                current.filter((item) => item.id !== row.id)
              )
            }
          }}
          className="font-semibold text-red-600 hover:underline"
        >
          Delete
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4">

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">
            Forecast History
          </h2>

          <p className="mt-1 text-xs text-muted">
            Preserve forecast runs and evaluate predictions
            against subsequently imported actual sales.
          </p>
        </div>

        <button
          onClick={saveSnapshot}
          disabled={!result.predictions.length}
          className="rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Save current forecast
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card
        title="Forecast Accuracy Overview"
        subtitle="Accuracy is calculated only for saved predictions with matching actual sales."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-[#f6f8fb] p-4">
            <p className="text-xs text-muted">
              Average absolute percentage error
            </p>

            <p className="mt-2 text-2xl font-extrabold">
              {averagePercentage === null
                ? '—'
                : `${formatNumber(averagePercentage)}%`}
            </p>
          </div>

          <div className="rounded-xl bg-[#f6f8fb] p-4">
            <p className="text-xs text-muted">
              Evaluated forecast records
            </p>

            <p className="mt-2 text-2xl font-extrabold">
              {evaluatedRows.length}
            </p>
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-5 text-muted">
          Percentage error is not calculated when actual sales
          are zero, because division by zero is undefined.
          The displayed average is a simple mean of the
          available absolute percentage errors.
        </p>
      </Card>

      <Card
        title="Forecast vs Actual Sales"
        subtitle="Compare each saved prediction with imported sales for the same product and month."
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product ID..."
            className="w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-brand sm:max-w-xs"
          />

          <div className="flex flex-wrap gap-2">
            {['All', 'Evaluated', 'Pending'].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                  filter === item
                    ? 'border-[#bcd6ff] bg-[#eaf2ff] text-brand'
                    : 'border-line bg-white text-muted'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {filteredRows.length ? (
          <Table
            columns={columns}
            rows={filteredRows}
          />
        ) : (
          <div className="py-10 text-center">
            <p className="font-semibold">
              No forecast records found
            </p>

            <p className="mt-1 text-xs text-muted">
              Save a forecast snapshot to begin tracking
              forecast history and performance.
            </p>
          </div>
        )}
      </Card>

      <Card
        title="Saved Forecast Runs"
        subtitle="Previously saved forecast snapshots."
      >
        {history.length ? (
          <Table
            columns={snapshotColumns}
            rows={history}
          />
        ) : (
          <div className="py-8 text-center text-xs text-muted">
            No forecast snapshots have been saved yet.
          </div>
        )}
      </Card>

      <div className="rounded-xl border border-[#cfe0ff] bg-[#f2f7ff] p-4 text-xs leading-5 text-[#2a4a85]">
        <b>How forecast history works</b>

        <p className="mt-1">
          Save a forecast to preserve its predictions.
          When you later import actual sales for the same
          product and month, the system matches the records
          and calculates the forecast error. Existing
          snapshots remain unchanged when new sales are
          imported.
        </p>
      </div>

    </div>
  )
}
