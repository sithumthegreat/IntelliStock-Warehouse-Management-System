import Badge from '../../components/Badge'
import Card from '../../components/Card'
import DemandChart from '../../components/DemandChart'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import {
  chartData,
  contextEvents,
  explainSummary,
  forecastProducts,
  seasonalIndex,
  shapFactors,
  summaryStats,
} from '../../data/forecastData'

const eventColumns = [
  { header: 'Event', cell: (e) => <b>{e.name}</b> },
  { header: 'Type', cell: (e) => e.type },
  { header: 'Date', cell: (e) => e.date },
  { header: 'Expected impact', cell: (e) => e.impact },
]

const productColumns = [
  { header: 'Product', cell: (p) => <b>{p.name}</b> },
  { header: 'Forecast (units)', cell: (p) => p.forecast.toLocaleString() },
  { header: 'Interval', cell: (p) => `${p.low.toLocaleString()} – ${p.high.toLocaleString()}` },
  {
    header: 'Confidence',
    cell: (p) => (
      <Badge tone={p.confidence >= 85 ? 'green' : 'amber'}>
        {p.confidence >= 85 ? 'High' : 'Low'} confidence · {p.confidence}%
      </Badge>
    ),
  },
]

export default function DashboardTab({ onGoToApproval }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {summaryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card
        title="Demand forecast"
        subtitle="Historical sales and forecast with prediction range"
        action={
          <button
            onClick={onGoToApproval}
            className="cursor-pointer rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-semibold hover:bg-[#f3f6fb]"
          >
            Go to approval
          </button>
        }
      >
        <DemandChart data={chartData} />
        <div className="mt-4 rounded-[10px] border border-[#cfe0ff] bg-[#f2f7ff] p-3.5 text-xs leading-relaxed text-[#2a4a85]">
          <b>Explainability summary</b>
          <br />
          {explainSummary}
        </div>
      </Card>

      <Card
        title="Seasonal trends & context impact"
        subtitle="Seasonal demand index (100 = yearly average); highlighted months are forecast months"
      >
        <DemandChart
          data={seasonalIndex}
          pastLabel="Past seasonal index"
          futureLabel="Forecast months"
          unit=""
          height={240}
        />
        <div className="mt-4">
          <Table columns={eventColumns} rows={contextEvents} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Forecast by product" subtitle="Next-month demand with confidence interval and score">
          <Table columns={productColumns} rows={forecastProducts} />
        </Card>
        <Card title="Explainability (SHAP)" subtitle="Top Factors driving the forecast">
          <ul>
            {shapFactors.map((f) => (
              <li
  key={f.name}
  className="flex items-center gap-3 border-b border-line py-3 last:border-0"
>
  <span className="w-40 text-xs">{f.name}</span>

  <div className="h-2.5 flex-1 rounded-full bg-[#eef2f7]">
    <div
  className={`h-full rounded-full ${f.impact >= 0 ? 'bg-accent' : 'bg-[#e5484d]'}`}
  style={{ width: `${Math.abs(f.impact) * 200}%` }}
/>
  </div>
  <span className="w-12 text-right text-xs font-bold">
  {f.impact > 0 ? '+' : ''}
  {f.impact.toFixed(2)}
</span>
</li>
            ))}
          </ul>
          <div className="mt-4 rounded-[10px] border border-[#cfe0ff] bg-[#f2f7ff] p-3.5 text-xs leading-relaxed text-[#2a4a85]">
  Green factors raise demand, red factors lower it.
</div>
        </Card>
      </div>
    </div>
  )
}