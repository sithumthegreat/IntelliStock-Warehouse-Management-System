
const MODEL_NAMES = [
  'Moving Average',
  'Weighted Moving Average',
  'Linear Regression',
]

const FORECAST_HORIZON = 3
const MIN_TRAINING_MONTHS = 3

function monthKey(date) {
  return String(date).slice(0, 7)
}

function addMonths(key, amount) {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(year, month - 1 + amount, 1)

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`
}

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number)

  return new Date(year, month - 1, 1).toLocaleDateString(
    'en-US',
    { month: 'short', year: 'numeric' }
  )
}

function average(values) {
  if (!values.length) return 0

  return values.reduce((sum, value) => sum + value, 0) /
    values.length
}

function movingAverage(values) {
  return average(values.slice(-3))
}

function weightedMovingAverage(values) {
  const recent = values.slice(-3)

  if (!recent.length) return 0

  const weights = recent.map((_, index) => index + 1)
  const weightedTotal = recent.reduce(
    (sum, value, index) => sum + value * weights[index],
    0
  )

  return weightedTotal / weights.reduce((sum, weight) => sum + weight, 0)
}

function linearRegression(values, stepsAhead = 1) {
  if (!values.length) return 0
  if (values.length === 1) return values[0]

  const n = values.length
  const xMean = (n - 1) / 2
  const yMean = average(values)

  let numerator = 0
  let denominator = 0

  values.forEach((value, index) => {
    numerator += (index - xMean) * (value - yMean)
    denominator += (index - xMean) ** 2
  })

  const slope = denominator === 0 ? 0 : numerator / denominator
  const intercept = yMean - slope * xMean

  return Math.max(0, intercept + slope * (n - 1 + stepsAhead))
}

function predict(model, values, stepsAhead = 1) {
  if (model === 'Moving Average') {
    return movingAverage(values)
  }

  if (model === 'Weighted Moving Average') {
    return weightedMovingAverage(values)
  }

  if (model === 'Linear Regression') {
    return linearRegression(values, stepsAhead)
  }

  return 0
}

function calculateMetrics(actual, predicted) {
  if (!actual.length) {
    return { mae: null, rmse: null, mape: null }
  }

  const errors = actual.map(
    (value, index) => value - predicted[index]
  )

  const mae = average(errors.map(Math.abs))

  const rmse = Math.sqrt(
    average(errors.map((error) => error ** 2))
  )

  const percentageErrors = actual
    .map((value, index) =>
      value > 0
        ? (Math.abs(value - predicted[index]) / value) * 100
        : null
    )
    .filter((value) => value !== null)

  const mape = percentageErrors.length
    ? average(percentageErrors)
    : null

  return {
    mae: Number(mae.toFixed(2)),
    rmse: Number(rmse.toFixed(2)),
    mape: mape === null ? null : Number(mape.toFixed(2)),
  }
}

function buildMonthlySeries(sales, productId) {
  const monthly = {}

  sales.forEach((record) => {
    if (record.product !== productId) return

    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) return

    const quantity = Number(record.quantity)

    if (!Number.isFinite(quantity) || quantity < 0) return

    const key = monthKey(record.date)
    monthly[key] = (monthly[key] || 0) + quantity
  })

  const keys = Object.keys(monthly).sort()

  if (!keys.length) return []

  const first = keys[0]
  const last = keys[keys.length - 1]

  const series = []

  let current = first

  while (current <= last) {
    series.push({
      key: current,
      month: monthLabel(current),
      actual: monthly[current] || 0,
    })

    current = addMonths(current, 1)
  }

  return series
}

function backtestModel(values, model) {
  const actual = []
  const predicted = []

  // Test each month using only the months before it.
  for (
    let index = MIN_TRAINING_MONTHS;
    index < values.length;
    index += 1
  ) {
    const training = values.slice(0, index)
    const prediction = predict(model, training, 1)

    actual.push(values[index])
    predicted.push(Math.max(0, prediction))
  }

  return {
    ...calculateMetrics(actual, predicted),
    observations: actual.length,
  }
}

function selectBestModel(results) {
  const eligible = results.filter(
    (result) => result.observations > 0 && result.mae !== null
  )

  if (!eligible.length) return null

  return [...eligible].sort((a, b) => a.mae - b.mae)[0]
}

function getPredictionRange(forecast, mae, confidence) {
  // A practical error-based range, not a calibrated statistical interval.
  const errorMargin = mae ?? forecast * 0.2
  const margin = Math.max(errorMargin, forecast * 0.05)

  return {
    low: Math.max(0, Math.round(forecast - margin)),
    high: Math.round(forecast + margin),
    confidence,
  }
}

function generateProductForecast(series) {
  const values = series.map((item) => item.actual)

  const modelResults = MODEL_NAMES.map((model) => ({
    model,
    ...backtestModel(values, model),
  }))

  const bestModel = selectBestModel(modelResults)

  if (!bestModel) {
    return {
      bestModel: null,
      modelResults,
      predictions: [],
      insufficientData: true,
    }
  }

  const predictions = Array.from(
    { length: FORECAST_HORIZON },
    (_, index) => {
      const step = index + 1

      const value = Math.max(
        0,
        Math.round(predict(bestModel.model, values, step))
      )

      const confidence = Math.max(
        50,
        Math.min(95, Math.round(
          95 - (bestModel.mae / Math.max(average(values), 1)) * 100
        ))
      )

      return {
        key: addMonths(series.at(-1).key, step),
        month: monthLabel(addMonths(series.at(-1).key, step)),
        value,
        ...getPredictionRange(value, bestModel.mae, confidence),
      }
    }
  )

  return {
    bestModel: bestModel.model,
    modelResults,
    predictions,
    insufficientData: false,
  }
}

export function runAdaptiveForecast(sales) {
  const validSales = Array.isArray(sales) ? sales : []

  const productIds = [
    ...new Set(
      validSales
        .map((record) => record.product)
        .filter(Boolean)
    ),
  ]

  const products = productIds.map((productId) => {
    const series = buildMonthlySeries(validSales, productId)
    const result = generateProductForecast(series)

    return {
      product: productId,
      history: series,
      bestModel: result.bestModel,
      modelResults: result.modelResults,
      predictions: result.predictions,
      insufficientData: result.insufficientData,
    }
  })

  const modelSummary = MODEL_NAMES.map((model) => {
    const results = products
      .flatMap((product) => product.modelResults)
      .filter(
        (result) =>
          result.model === model &&
          result.mae !== null
      )

    return {
      model,
      productsEvaluated: results.length,
      mae: results.length
        ? Number(average(results.map((item) => item.mae)).toFixed(2))
        : null,
      rmse: results.length
        ? Number(average(results.map((item) => item.rmse)).toFixed(2))
        : null,
      mape: results.some((item) => item.mape !== null)
        ? Number(
            average(
              results
                .map((item) => item.mape)
                .filter((value) => value !== null)
            ).toFixed(2)
          )
        : null,
    }
  })

  const allPredictions = products.flatMap((product) =>
    product.predictions.map((prediction) => ({
      ...prediction,
      product: product.product,
    }))
  )

  return {
    products,
    modelSummary,
    predictions: allPredictions,
    totalForecast: allPredictions.reduce(
      (sum, item) => sum + item.value,
      0
    ),
    productsEvaluated: products.filter(
      (product) => !product.insufficientData
    ).length,
    productsWithoutEnoughData: products.filter(
      (product) => product.insufficientData
    ).length,
  }
}
