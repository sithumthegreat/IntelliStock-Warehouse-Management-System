
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function getMonthKey(date) {
  return date.slice(0, 7)
}

function getNextMonth(key, offset) {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1 + offset, 1)

  return {
    key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    label: `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`,
  }
}

function getLastMonths(sales, count = 6) {
  const validDates = sales
    .map((row) => row.date)
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort()

  const latest = validDates.at(-1)

  if (!latest) return []

  return Array.from({ length: count }, (_, index) => {
    const month = getNextMonth(getMonthKey(latest), index - count + 1)

    return month
  })
}

function calculateAverage(values) {
  if (!values.length) return 0

  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function getInterval(forecast, confidence) {
  const uncertainty = Math.max(0.08, (100 - confidence) / 100)

  return {
    low: Math.max(0, Math.round(forecast * (1 - uncertainty))),
    high: Math.round(forecast * (1 + uncertainty)),
  }
}

export function generateForecast(sales, events = []) {
  const validSales = sales.filter(
    (row) =>
      row.date &&
      Number.isFinite(Number(row.quantity)) &&
      Number(row.quantity) > 0
  )

  const months = getLastMonths(validSales, 6)

  const monthlyTotals = {}

  validSales.forEach((row) => {
    const key = getMonthKey(row.date)
    monthlyTotals[key] = (monthlyTotals[key] || 0) + Number(row.quantity)
  })

  const historical = months.map((month) => ({
    month: month.label,
    key: month.key,
    value: monthlyTotals[month.key] || 0,
    forecast: false,
  }))

  const availableMonths = historical.filter((month) => month.value > 0)

  const recentValues = availableMonths.slice(-3).map((month) => month.value)
  const movingAverage = calculateAverage(recentValues)

  const lastValue = recentValues.at(-1) || 0
  const firstValue = recentValues[0] || 0

  const trend =
    recentValues.length > 1 && firstValue > 0
      ? (lastValue - firstValue) / firstValue / (recentValues.length - 1)
      : 0

  const boundedTrend = Math.max(-0.2, Math.min(0.2, trend))

  const predictions = Array.from({ length: 3 }, (_, index) => {
    const month = getNextMonth(
      historical.at(-1)?.key || new Date().toISOString().slice(0, 7),
      index + 1
    )

    const forecast = Math.max(
      0,
      Math.round(movingAverage * (1 + boundedTrend * (index + 1)))
    )

    const confidence = Math.max(60, Math.min(95, 90 - index * 5))

    return {
      month: month.label,
      key: month.key,
      value: forecast,
      forecast: true,
      confidence,
      ...getInterval(forecast, confidence),
    }
  })

  const totalHistorical = availableMonths.reduce(
    (sum, month) => sum + month.value,
    0
  )

  const averageMonthly = availableMonths.length
    ? Math.round(totalHistorical / availableMonths.length)
    : 0

  const totalForecast = predictions.reduce(
    (sum, month) => sum + month.value,
    0
  )

  const context = events.filter((event) => {
    return predictions.some(
      (prediction) =>
        prediction.key >= event.startDate &&
        prediction.key <= event.endDate
    )
  })

  const products = [...new Set(validSales.map((row) => row.product))]

  const productForecasts = products.map((product) => {
    const productSales = validSales.filter((row) => row.product === product)

    const productMonths = {}

    productSales.forEach((row) => {
      const key = getMonthKey(row.date)
      productMonths[key] = (productMonths[key] || 0) + Number(row.quantity)
    })

    const values = months
      .map((month) => productMonths[month.key] || 0)
      .filter((value) => value > 0)
      .slice(-3)

    const forecast = Math.round(calculateAverage(values))
    const confidence = values.length >= 3 ? 85 : values.length === 2 ? 75 : 65

    return {
      name: product,
      forecast,
      confidence,
      ...getInterval(forecast, confidence),
    }
  }).sort((a, b) => b.forecast - a.forecast)

  return {
    historical,
    predictions,
    chart: [...historical, ...predictions],
    products: productForecasts,
    averageMonthly,
    totalHistorical,
    totalForecast,
    availableMonths: availableMonths.length,
    context,
    hasData: validSales.length > 0,
  }
}
