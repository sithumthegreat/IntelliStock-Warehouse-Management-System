
import Badge from '../../components/Badge'
import Card from '../../components/Card'
import DemandChart from '../../components/DemandChart'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import { generateForecast } from '../../utils/forecastEngine'

const money = (value) => Number(value).toLocaleString()

export default function DashboardTab({
  sales = [],
  events = [],
  onGoToApproval,
}) {
  const result = generateForecast(sales, events)

  const productColumns = [
    {
      header: 'Product',
      cell: (product) => <b>{product.name}</b>,
    },
    {
      header: 'Forecast',
      cell: (product) => money(product.forecast),
    },
    {
      header: 'Prediction range',
      cell: (product) =>
        `${money(product.low)} – ${money(product.high)}`,
    },
    {
      header: 'Confidence',
      cell: (product) => (
        <Badge tone={product.confidence >= 80 ? 'green' : 'amber'}>
          {product.confidence}%
        </Badge>
      ),
    },
  ]

  const eventColumns = [
    { header: 'Event', cell: (event) => <b>{event.name}</b> },
    { header: 'Type', cell: (event) => event.type },
    { header: 'Start', cell: (event) => event.startDate || '—' },
    { header: 'End', cell: (event) => event.endDate || '—' },
    {
      header: 'Expected impact',
      cell: (event) => `${event.impact > 0 ? '+' : ''}${event.impact}%`,
    },
  ]

  const stats = [
    {
      label: 'Historical sales',
      value: money(result.totalHistorical),
      note: `${result.availableMonths} months with recorded sales`,
    },
    {
      label: 'Average monthly demand',
      value: money(result.averageMonthly),
      note: 'Based on available historical months',
    },
    {
      label: 'Next 3 months forecast',
      value: money(result.totalForecast),
      note: 'Three-month moving average baseline',
    },
  ]

  if (!result.hasData) {
    return (
      <Card title="Demand forecasting" subtitle="Historical sales data is required to generate forecasts.">
        <div className="py-12 text-center">
          <p className="text-3xl">📊</p>
          <h3 className="mt-3 font-bold">No historical sales data</h3>
          <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#718096]">
            Import sales records through the Import Center. Once sales data is available,
            IntelliStock can calculate a baseline forecast.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card
        title="Demand forecast"
        subtitle="Historical sales compared with the next three months' baseline prediction"
        action={
          <button
            onClick={onGoToApproval}
            className="cursor-pointer rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-semibold hover:bg-[#f3f6fb]"
          >
            Go to approval
          </button>
        }
      >
        <DemandChart
          data={result.chart}
          pastLabel="Historical sales"
          futureLabel="Baseline forecast"
        />

        <div className="mt-4 rounded-[10px] border border-[#cfe0ff] bg-[#f2f7ff] p-3.5 text-xs leading-relaxed text-[#2a4a85]">
          <b>Forecast methodology</b>
          <p className="mt-1">
            Predictions use the average of the latest three available monthly
            sales totals, adjusted by a bounded recent trend. The prediction
            range is an illustrative uncertainty interval, not a statistically
            calibrated confidence interval.
          </p>
        </div>
      </Card>

      <Card
        title="Forecast by product"
        subtitle="Estimated demand for each product using its recent monthly sales"
      >
        <Table columns={productColumns} rows={result.products} />
      </Card>

      <Card
        title="Business context events"
        subtitle="Recorded events overlapping the forecast period"
      >
        {result.context.length ? (
          <Table columns={eventColumns} rows={result.context} />
        ) : (
          <p className="py-5 text-center text-xs text-[#718096]">
            No recorded events overlap the forecast period.
          </p>
        )}
      </Card>
    </div>
  )
}
