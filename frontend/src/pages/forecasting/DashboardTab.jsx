
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import DemandChart from '../../components/DemandChart'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import { runAdaptiveForecast } from '../../utils/adaptiveForecast'

const formatNumber = (value) =>
  Number(value || 0).toLocaleString()

const formatMetric = (value) =>
  value === null || value === undefined
    ? 'Not available'
    : Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })

export default function DashboardTab({
  sales = [],
  events = [],
  onGoToApproval,
}) {
  const result = runAdaptiveForecast(sales)

  const historical = {}
  const forecast = {}

  result.products.forEach((product) => {
    product.history.forEach((item) => {
      historical[item.key] = (historical[item.key] || 0) + item.actual
    })

    product.predictions.forEach((item) => {
      forecast[item.key] = (forecast[item.key] || 0) + item.value
    })
  })

  const chartData = [
    ...Object.entries(historical)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        month: key,
        value,
        forecast: false,
      })),
    ...Object.entries(forecast)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        month: key,
        value,
        forecast: true,
      })),
  ]

  const modelColumns = [
    {
      header: 'Forecasting model',
      cell: (row) => <b>{row.model}</b>,
    },
    {
      header: 'Products evaluated',
      cell: (row) => row.productsEvaluated,
    },
    {
      header: 'MAE',
      cell: (row) => formatMetric(row.mae),
    },
    {
      header: 'RMSE',
      cell: (row) => formatMetric(row.rmse),
    },
    {
      header: 'MAPE',
      cell: (row) =>
        row.mape === null ? 'Not available' : `${row.mape}%`,
    },
  ]

  const productColumns = [
    {
      header: 'Product',
      cell: (row) => <b>{row.product}</b>,
    },
    {
      header: 'Selected model',
      cell: (row) =>
        row.bestModel || (
          <Badge tone="amber">Insufficient data</Badge>
        ),
    },
    {
      header: 'Next month forecast',
      cell: (row) =>
        row.predictions.length
          ? formatNumber(row.predictions[0].value)
          : '—',
    },
    {
      header: 'Prediction range',
      cell: (row) =>
        row.predictions.length
          ? `${formatNumber(row.predictions[0].low)} – ${formatNumber(row.predictions[0].high)}`
          : '—',
    },
  ]

  const eventColumns = [
    {
      header: 'Event',
      cell: (event) => <b>{event.name}</b>,
    },
    {
      header: 'Category',
      cell: (event) => event.type,
    },
    {
      header: 'Start',
      cell: (event) => event.startDate || event.date || '—',
    },
    {
      header: 'End',
      cell: (event) => event.endDate || '—',
    },
    {
      header: 'Expected impact',
      cell: (event) =>
        event.impact === undefined
          ? 'Not specified'
          : `${Number(event.impact) > 0 ? '+' : ''}${event.impact}%`,
    },
  ]

  const upcomingEvents = events.filter((event) => {
    if (!event.startDate || !event.endDate) return false

    return chartData.some(
      (item) =>
        item.forecast &&
        item.month >= event.startDate.slice(0, 7) &&
        item.month <= event.endDate.slice(0, 7)
    )
  })

  const hasForecast = result.productsEvaluated > 0

  if (!sales.length) {
    return (
      <Card
        title="Demand forecasting"
        subtitle="Historical sales data is required to generate forecasts."
      >
        <div className="py-12 text-center">
          <p className="text-3xl">📊</p>
          <h3 className="mt-3 font-bold">
            No historical sales data
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#718096]">
            Import sales records through the Import Center to generate
            demand forecasts.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Products evaluated"
          value={result.productsEvaluated}
          note="Products with sufficient backtesting data"
        />

        <StatCard
          label="Products needing more data"
          value={result.productsWithoutEnoughData}
          note="Insufficient historical observations"
        />

        <StatCard
          label="Next 3 months forecast"
          value={formatNumber(result.totalForecast)}
          note="Combined demand across evaluated products"
        />
      </div>

      <Card
        title="Adaptive demand forecast"
        subtitle="Historical demand and automatically selected model predictions"
        action={
          <button
            onClick={onGoToApproval}
            className="cursor-pointer rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-semibold hover:bg-[#f3f6fb]"
          >
            Go to approval
          </button>
        }
      >
        {hasForecast ? (
          <>
            <DemandChart
              data={chartData}
              pastLabel="Historical sales"
              futureLabel="Adaptive forecast"
            />

            <div className="mt-4 rounded-[10px] border border-[#cfe0ff] bg-[#f2f7ff] p-3.5 text-xs leading-relaxed text-[#2a4a85]">
              <b>How the engine works</b>
              <p className="mt-1">
                IntelliStock tests Moving Average, Weighted Moving Average
                and Linear Regression against historical monthly sales.
                It selects the model with the lowest Mean Absolute Error
                for each product.
              </p>
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-xs text-[#718096]">
            More historical months are required before a model can be evaluated.
          </p>
        )}
      </Card>

      <Card
        title="Model performance comparison"
        subtitle="Lower MAE, RMSE and MAPE indicate better historical prediction performance"
      >
        <Table
          columns={modelColumns}
          rows={result.modelSummary}
        />
      </Card>

      <Card
        title="Product-level forecasts"
        subtitle="Best-performing model selected independently for each product"
      >
        <Table
          columns={productColumns}
          rows={result.products}
        />
      </Card>

      <Card
        title="Business context events"
        subtitle="Events recorded in the business context module"
      >
        {upcomingEvents.length ? (
          <Table
            columns={eventColumns}
            rows={upcomingEvents}
          />
        ) : (
          <p className="py-5 text-center text-xs text-[#718096]">
            No recorded events overlap the forecast months.
          </p>
        )}
      </Card>
    </div>
  )
}
