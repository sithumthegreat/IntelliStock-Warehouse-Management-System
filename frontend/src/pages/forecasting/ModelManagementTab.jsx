
import { useMemo, useState } from 'react'
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import usePersistentState from '../../hooks/usePersistentState'
import { runAdaptiveForecast } from '../../utils/adaptiveForecast'

const number = (value) =>
  value == null
    ? '—'
    : Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })

const percent = (value) =>
  value == null ? '—' : `${number(value)}%`

const MODEL_DESCRIPTIONS = {
  'Moving Average':
    'Uses the average of the latest three observed months.',
  'Weighted Moving Average':
    'Gives more importance to the most recent months.',
  'Linear Regression':
    'Projects demand using the historical linear trend.',
}

export default function ModelManagementTab({ sales = [] }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const [versions, setVersions] = usePersistentState(
    'is_forecast_model_versions',
    []
  )

  const [lastRun, setLastRun] = usePersistentState(
    'is_forecast_model_last_run',
    null
  )

  const result = useMemo(
    () => runAdaptiveForecast(sales),
    [sales, refreshKey]
  )

  const rankedModels = [...result.modelSummary].sort(
    (a, b) => (a.mae ?? Infinity) - (b.mae ?? Infinity)
  )

  const bestOverall = rankedModels.find(
    (model) => model.mae !== null
  )

  const productRows = result.products.map((product) => ({
    ...product,
    selected: product.bestModel,
    bestResult: product.modelResults.find(
      (item) => item.model === product.bestModel
    ),
  }))

  // Retrain / rerun model evaluation
  const retrain = () => {
    const timestamp = new Date().toISOString()

    const snapshot = {
      id: `model-run-${Date.now()}`,
      version: `v${versions.length + 1}.0`,
      trainedAt: timestamp,
      productsEvaluated: result.productsEvaluated,
      bestModel: bestOverall?.model ?? 'Insufficient data',
      mae: bestOverall?.mae ?? null,
      rmse: bestOverall?.rmse ?? null,
      mape: bestOverall?.mape ?? null,
      status: result.productsEvaluated
        ? 'Completed'
        : 'Insufficient data',
    }

    setVersions((current) =>
      [snapshot, ...current].slice(0, 20)
    )

    setLastRun(timestamp)

    setRefreshKey((current) => current + 1)
  }

  // Model ranking table
  const rankingColumns = [
    {
      header: 'Rank',
      cell: (row) => <b>#{row.rank}</b>,
    },
    {
      header: 'Model',
      cell: (row) => (
        <div>
          <b>{row.model}</b>
          <p className="mt-1 text-[10px] text-muted">
            {MODEL_DESCRIPTIONS[row.model]}
          </p>
        </div>
      ),
    },
    {
      header: 'MAE',
      cell: (row) => number(row.mae),
    },
    {
      header: 'RMSE',
      cell: (row) => number(row.rmse),
    },
    {
      header: 'MAPE',
      cell: (row) => percent(row.mape),
    },
    {
      header: 'Products tested',
      cell: (row) => row.productsEvaluated,
    },
    {
      header: 'Ranking',
      cell: (row) =>
        row.mae === null ? (
          <Badge tone="amber">Not evaluated</Badge>
        ) : row.rank === 1 ? (
          <Badge tone="green">Best performer</Badge>
        ) : (
          <Badge tone="blue">Evaluated</Badge>
        ),
    },
  ]

  // Product-level best model table
  const productColumns = [
    {
      header: 'Product ID',
      cell: (row) => <b>{row.product}</b>,
    },
    {
      header: 'Selected model',
      cell: (row) =>
        row.selected ? (
          <Badge tone="green">{row.selected}</Badge>
        ) : (
          <Badge tone="amber">Insufficient data</Badge>
        ),
    },
    {
      header: 'MAE',
      cell: (row) => number(row.bestResult?.mae),
    },
    {
      header: 'RMSE',
      cell: (row) => number(row.bestResult?.rmse),
    },
    {
      header: 'MAPE',
      cell: (row) => percent(row.bestResult?.mape),
    },
    {
      header: 'Forecast status',
      cell: (row) =>
        row.insufficientData ? (
          <Badge tone="amber">Need more history</Badge>
        ) : (
          <Badge tone="green">Ready</Badge>
        ),
    },
  ]

  // Model version history table
  const versionColumns = [
    {
      header: 'Version',
      cell: (row) => <b>{row.version}</b>,
    },
    {
      header: 'Run date',
      cell: (row) =>
        new Date(row.trainedAt).toLocaleString(),
    },
    {
      header: 'Best model',
      cell: (row) => row.bestModel,
    },
    {
      header: 'MAE',
      cell: (row) => number(row.mae),
    },
    {
      header: 'Products',
      cell: (row) => row.productsEvaluated,
    },
    {
      header: 'Status',
      cell: (row) =>
        row.status === 'Completed' ? (
          <Badge tone="green">{row.status}</Badge>
        ) : (
          <Badge tone="amber">{row.status}</Badge>
        ),
    },
  ]

  // Dashboard statistics
  const stats = [
    {
      label: 'Models evaluated',
      value: result.modelSummary.filter(
        (item) => item.mae !== null
      ).length,
      note: 'Available forecasting algorithms',
    },
    {
      label: 'Products evaluated',
      value: result.productsEvaluated,
      note: `${result.productsWithoutEnoughData} need more history`,
    },
    {
      label: 'Best overall model',
      value: bestOverall?.model ?? '—',
      note: bestOverall
        ? `Average MAE: ${number(bestOverall.mae)}`
        : 'Not enough historical data',
    },
    {
      label: 'Saved versions',
      value: versions.length,
      note: lastRun
        ? `Last run ${new Date(lastRun).toLocaleDateString()}`
        : 'No retraining run saved yet',
    },
  ]

  return (
    <div className="space-y-4">

      {/* Page heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">
            Forecast Model Management
          </h2>

          <p className="mt-1 text-xs text-muted">
            Compare forecasting algorithms, review product-level
            performance and manage model runs.
          </p>
        </div>

        <button
          onClick={retrain}
          className="rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white hover:opacity-90"
        >
          ↻ Retrain models
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      {/* Model rankings */}
      <Card
        title="Model Performance Rankings"
        subtitle="Models are ranked by lowest mean absolute error (MAE)."
      >
        {rankedModels.some(
          (item) => item.mae !== null
        ) ? (
          <Table
            columns={rankingColumns}
            rows={rankedModels.map((row, index) => ({
              ...row,
              rank: index + 1,
            }))}
          />
        ) : (
          <EmptyState />
        )}
      </Card>

      {/* Best model by product */}
      <Card
        title="Best Model by Product"
        subtitle="The selected model is the best-performing eligible model for each product."
      >
        {productRows.length ? (
          <Table
            columns={productColumns}
            rows={productRows}
          />
        ) : (
          <EmptyState />
        )}
      </Card>

      {/* Version history */}
      <Card
        title="Model Version History"
        subtitle="Each manual retraining action saves a snapshot of the current evaluation results."
      >
        {versions.length ? (
          <Table
            columns={versionColumns}
            rows={versions}
          />
        ) : (
          <div className="py-8 text-center text-xs text-muted">
            No model versions yet. Select Retrain models
            to create the first version.
          </div>
        )}
      </Card>

      {/* Implementation note */}
      <div className="rounded-xl border border-[#cfe0ff] bg-[#f2f7ff] p-4 text-xs leading-5 text-[#2a4a85]">
        <b>Implementation Note</b>

        <p className="mt-1">
          This frontend evaluates the three forecasting
          algorithms in the browser using imported sales
          history. Retraining reruns the evaluation and saves
          a version snapshot in this browser. Server-side
          model training and deployment require backend
          integration. The error-based forecast range is not
          a statistically calibrated confidence interval.
        </p>
      </div>

    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-8 text-center">
      <p className="font-semibold">
        Not enough historical sales data
      </p>

      <p className="mt-1 text-xs text-muted">
        Import at least four months of sales history for a
        product to evaluate its forecasting models.
      </p>
    </div>
  )
}
