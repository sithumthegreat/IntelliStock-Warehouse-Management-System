import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const BLUE = '#1677ff'
const GREEN = '#19b38a'

export default function DemandChart({
  data,
  pastLabel = 'Actual sales',
  futureLabel = 'Forecast',
  unit = 'units',
  height = 280,
}) {
  const chart = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        data: data.map((d) => d.value),
        backgroundColor: data.map((d) => (d.forecast ? GREEN : BLUE)),
        borderRadius: 6,
        maxBarThickness: 64,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${data[ctx.dataIndex].forecast ? futureLabel : pastLabel}: ${ctx.parsed.y.toLocaleString()} ${unit}`.trim(),
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#e5eaf2' } },
    },
  }

  return (
    <div>
      <div style={{ height }}>
        <Bar data={chart} options={options} />
      </div>
      <div className="mt-3 flex gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-full bg-brand" />
          {pastLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <i className="size-2 rounded-full bg-accent" />
          {futureLabel}
        </span>
      </div>
    </div>
  )
}