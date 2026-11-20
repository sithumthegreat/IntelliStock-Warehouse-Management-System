
import { useMemo } from 'react'

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

const formatMonth = (key) => {
  const [year, month] = key.split('-').map(Number)

  return new Date(year, month - 1, 1).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      year: 'numeric',
    }
  )
}

const severityTone = {
  Critical: 'red',
  High: 'red',
  Medium: 'amber',
  Low: 'blue',
}

function getMonthlySales(sales) {
  const monthly = {}

  sales.forEach((record) => {
    if (
      !record.product ||
      !record.date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(record.date)
    ) {
      return
    }

    const quantity = Number(record.quantity)

    if (!Number.isFinite(quantity) || quantity < 0) return

    const key = `${record.product}_${record.date.slice(0, 7)}`

    monthly[key] = (monthly[key] || 0) + quantity
  })

  return monthly
}

function generateDemandAlerts(sales, forecastResult, forecastHistory) {
  const alerts = []
  const monthlySales = getMonthlySales(sales)

  const products = forecastResult.products || []

  // Demand spikes and drops
  products.forEach((product) => {
    const history = [...(product.history || [])].sort(
      (a, b) => a.key.localeCompare(b.key)
    )

    if (history.length < 4) return

    const latest = history[history.length - 1]
    const previous = history.slice(-4, -1)

    const baseline =
      previous.reduce((sum, item) => sum + item.actual, 0) /
      previous.length

    if (baseline <= 0) return

    const change = ((latest.actual - baseline) / baseline) * 100

    if (change >= 30) {
      alerts.push({
        id: `spike-${product.product}-${latest.key}`,
        type: 'Demand Spike',
        severity: change >= 75 ? 'Critical' : change >= 50 ? 'High' : 'Medium',
        product: product.product,
        period: formatMonth(latest.key),
        description: `Sales increased ${change.toFixed(1)}% compared with the previous three-month average.`,
        actual: latest.actual,
        baseline,
        change,
        recommendation:
          'Review stock availability and investigate whether promotions or seasonal demand caused the increase.',
      })
    }

    if (change <= -30) {
      alerts.push({
        id: `drop-${product.product}-${latest.key}`,
        type: 'Demand Drop',
        severity: change <= -75 ? 'Critical' : change <= -50 ? 'High' : 'Medium',
        product: product.product,
        period: formatMonth(latest.key),
        description: `Sales decreased ${Math.abs(change).toFixed(1)}% compared with the previous three-month average.`,
        actual: latest.actual,
        baseline,
        change,
        recommendation:
          'Review product performance, pricing, availability and possible changes in customer demand.',
      })
    }
  })

  // Low confidence forecasts
  forecastResult.predictions.forEach((prediction) => {
    if (prediction.confidence >= 70) return

    alerts.push({
      id: `confidence-${prediction.product}-${prediction.key}`,
      type: 'Low Forecast Confidence',
      severity: prediction.confidence < 55 ? 'High' : 'Medium',
      product: prediction.product,
      period: prediction.month,
      description: `The forecast confidence score is ${prediction.confidence}%.`,
      actual: null,
      baseline: null,
      change: null,
      recommendation:
        'Review the historical sales data and business context before relying on this forecast.',
    })
  })

  // Forecast deviations against subsequently imported actual sales
  forecastHistory.forEach((snapshot) => {
    ;(snapshot.predictions || []).forEach((prediction) => {
      const actualKey = `${prediction.product}_${prediction.key}`
      const actual = monthlySales[actualKey]

      if (actual === undefined || actual === 0) return

      const forecast = Number(prediction.value)

      if (!Number.isFinite(forecast)) return

      const deviation = ((actual - forecast) / actual) * 100
      const absoluteDeviation = Math.abs(deviation)

      if (absoluteDeviation < 25) return

      alerts.push({
        id: `deviation-${snapshot.id}-${prediction.product}-${prediction.key}`,
        type: 'Forecast Deviation',
        severity:
          absoluteDeviation >= 60
            ? 'Critical'
            : absoluteDeviation >= 40
              ? 'High'
              : 'Medium',
        product: prediction.product,
        period: prediction.month,
        description: `Actual sales were ${absoluteDeviation.toFixed(1)}% different from the saved forecast.`,
        actual,
        baseline: forecast,
        change: deviation,
        recommendation:
          'Review the forecasting model and check for unexpected events, promotions or changes in market demand.',
      })
    })
  })

  return alerts
}

export default function DemandAlertsTab({ sales = [] }) {
  const [forecastHistory] = usePersistentState(
    'is_forecast_history',
    []
  )

  const [alertStates, setAlertStates] = usePersistentState(
    'is_demand_alert_states',
    {}
  )

  const forecastResult = useMemo(
    () => runAdaptiveForecast(sales),
    [sales]
  )

  const alerts = useMemo(
    () =>
      generateDemandAlerts(
        sales,
        forecastResult,
        forecastHistory
      ),
    [sales, forecastResult, forecastHistory]
  )

  const activeAlerts = alerts.filter(
    (alert) => alertStates[alert.id]?.status !== 'Resolved'
  )

  const unreadCount = activeAlerts.filter(
    (alert) => !alertStates[alert.id]?.read
  ).length

  const criticalCount = activeAlerts.filter(
    (alert) => alert.severity === 'Critical'
  ).length

  const highCount = activeAlerts.filter(
    (alert) => alert.severity === 'High'
  ).length

  const resolvedCount = Object.values(alertStates).filter(
    (item) => item.status === 'Resolved'
  ).length

  const updateAlert = (id, changes) => {
    setAlertStates((current) => ({
      ...current,
      [id]: {
        ...current[id],
        ...changes,
      },
    }))
  }

  const markAllRead = () => {
    const updates = {}

    activeAlerts.forEach((alert) => {
      updates[alert.id] = {
        ...alertStates[alert.id],
        read: true,
      }
    })

    setAlertStates((current) => ({
      ...current,
      ...updates,
    }))
  }

  const resolveAll = () => {
    if (!activeAlerts.length) return

    if (!window.confirm('Resolve all active alerts?')) return

    const updates = {}

    activeAlerts.forEach((alert) => {
      updates[alert.id] = {
        ...alertStates[alert.id],
        read: true,
        status: 'Resolved',
        resolvedAt: new Date().toISOString(),
      }
    })

    setAlertStates((current) => ({
      ...current,
      ...updates,
    }))
  }

  const columns = [
    {
      header: 'Alert',
      cell: (row) => (
        <div className="min-w-[180px]">
          <b>{row.type}</b>

          <p className="mt-1 text-[10px] text-muted">
            {row.product} · {row.period}
          </p>
        </div>
      ),
    },
    {
      header: 'Severity',
      cell: (row) => (
        <Badge tone={severityTone[row.severity]}>
          {row.severity}
        </Badge>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <div className="min-w-[220px] max-w-sm">
          {row.description}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) =>
        alertStates[row.id]?.read ? (
          <Badge tone="blue">Read</Badge>
        ) : (
          <Badge tone="amber">Unread</Badge>
        ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          {!alertStates[row.id]?.read && (
            <button
              onClick={() =>
                updateAlert(row.id, { read: true })
              }
              className="text-xs font-semibold text-brand hover:underline"
            >
              Mark read
            </button>
          )}

          <button
            onClick={() =>
              updateAlert(row.id, {
                read: true,
                status: 'Resolved',
                resolvedAt: new Date().toISOString(),
              })
            }
            className="text-xs font-semibold text-green-700 hover:underline"
          >
            Resolve
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">
            Demand Alerts
          </h2>

          <p className="mt-1 text-xs text-muted">
            Monitor unusual demand patterns and forecasting
            performance across your products.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={markAllRead}
            disabled={!unreadCount}
            className="rounded-lg border border-line px-3 py-2 text-xs font-semibold disabled:opacity-40"
          >
            Mark all read
          </button>

          <button
            onClick={resolveAll}
            disabled={!activeAlerts.length}
            className="rounded-lg bg-brand px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
          >
            Resolve all
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active alerts"
          value={activeAlerts.length}
          note="Currently unresolved"
        />

        <StatCard
          label="Unread alerts"
          value={unreadCount}
          note="Require attention"
        />

        <StatCard
          label="Critical alerts"
          value={criticalCount}
          note={`${highCount} additional high-severity alerts`}
        />

        <StatCard
          label="Resolved alerts"
          value={resolvedCount}
          note="Previously handled"
        />
      </div>

      <Card
        title="Active Demand Alerts"
        subtitle="Alerts are automatically derived from current sales, forecast results and saved forecast history."
      >
        {activeAlerts.length ? (
          <Table
            columns={columns}
            rows={activeAlerts}
          />
        ) : (
          <div className="py-10 text-center">
            <div className="text-3xl">✓</div>

            <p className="mt-2 font-semibold">
              No active demand alerts
            </p>

            <p className="mt-1 text-xs text-muted">
              No unusual demand patterns or forecast deviations
              have been detected using the available data.
            </p>
          </div>
        )}
      </Card>

      <Card
        title="Alert Details"
        subtitle="Recommended actions for detected demand issues."
      >
        {activeAlerts.length ? (
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-line p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <b className="text-sm">
                      {alert.type}
                    </b>

                    <p className="mt-1 text-xs text-muted">
                      {alert.product} · {alert.period}
                    </p>
                  </div>

                  <Badge tone={severityTone[alert.severity]}>
                    {alert.severity}
                  </Badge>
                </div>

                <p className="mt-3 text-xs leading-5">
                  {alert.description}
                </p>

                {alert.actual !== null && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-[#f6f8fb] p-3">
                      <p className="text-[10px] text-muted">
                        Actual quantity
                      </p>

                      <b className="mt-1 block text-sm">
                        {formatNumber(alert.actual)}
                      </b>
                    </div>

                    <div className="rounded-lg bg-[#f6f8fb] p-3">
                      <p className="text-[10px] text-muted">
                        Comparison quantity
                      </p>

                      <b className="mt-1 block text-sm">
                        {formatNumber(alert.baseline)}
                      </b>
                    </div>

                    <div className="rounded-lg bg-[#f6f8fb] p-3">
                      <p className="text-[10px] text-muted">
                        Percentage change
                      </p>

                      <b className="mt-1 block text-sm">
                        {alert.change > 0 ? '+' : ''}
                        {formatNumber(alert.change)}%
                      </b>
                    </div>
                  </div>
                )}

                <div className="mt-3 rounded-lg bg-[#f2f7ff] p-3 text-xs leading-5 text-[#2a4a85]">
                  <b>Recommended action</b>

                  <p className="mt-1">
                    {alert.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-muted">
            No recommendations available.
          </p>
        )}
      </Card>

      <Card
        title="Resolved Alert History"
        subtitle="Previously resolved alerts remain stored in the browser."
      >
        {alerts.filter(
          (alert) => alertStates[alert.id]?.status === 'Resolved'
        ).length ? (
          <Table
            columns={[
              ...columns.slice(0, 3),
              {
                header: 'Resolved on',
                cell: (row) => {
                  const date = alertStates[row.id]?.resolvedAt

                  return date
                    ? new Date(date).toLocaleString()
                    : '—'
                },
              },
              {
                header: 'Action',
                cell: (row) => (
                  <button
                    onClick={() =>
                      updateAlert(row.id, {
                        status: 'Active',
                        read: false,
                        resolvedAt: null,
                      })
                    }
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Reopen
                  </button>
                ),
              },
            ]}
            rows={alerts.filter(
              (alert) =>
                alertStates[alert.id]?.status === 'Resolved'
            )}
          />
        ) : (
          <p className="py-6 text-center text-xs text-muted">
            No resolved alerts yet.
          </p>
        )}
      </Card>

      <div className="rounded-xl border border-[#cfe0ff] bg-[#f2f7ff] p-4 text-xs leading-5 text-[#2a4a85]">
        <b>Alert detection methodology</b>

        <p className="mt-1">
          Demand spikes and drops are detected when the latest
          monthly sales quantity differs by at least 30% from
          the previous three-month average. Low-confidence
          alerts are generated below 70%. Forecast deviation
          alerts are generated when actual sales differ by at
          least 25% from a saved prediction for the same
          product and month. Alert status is stored in browser
          localStorage.
        </p>
      </div>

    </div>
  )
}
