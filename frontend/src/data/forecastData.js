export const summaryStats = [
  {
    label: 'Forecast horizon',
    value: 'Next 3 months',
    note: 'Monthly granularity',
  },
  {
    label: 'Model confidence',
    value: '87.4%',
    note: 'Blend of top 2 models',
  },
  {
    label: 'Best model MAE',
    value: '118.9',
    note: 'XGBoost',
  },
]

export const chartData = [
  { month: 'May', value: 1180, forecast: false },
  { month: 'Jun', value: 1320, forecast: false },
  { month: 'Jul', value: 1250, forecast: false },
  { month: 'Aug', value: 1480, forecast: false },
  { month: 'Sep', value: 1620, forecast: false },
  { month: 'Oct', value: 1760, forecast: true },
  { month: 'Nov', value: 1810, forecast: true },
  { month: 'Dec', value: 1960, forecast: true },
]

export const forecastProducts = [
  {
    name: 'Samba Rice 5kg',
    forecast: 1361,
    low: 1252,
    high: 1470,
    confidence: 91,
  },
  {
    name: 'Ceylon Black Tea 200g',
    forecast: 583,
    low: 536,
    high: 630,
    confidence: 84,
  },
  {
    name: 'Red Dhal 1kg',
    forecast: 810,
    low: 745,
    high: 875,
    confidence: 88,
  },
  {
    name: 'Coconut Oil 1L',
    forecast: 454,
    low: 418,
    high: 490,
    confidence: 79,
  },
  {
    name: 'Roasted Curry Powder 100g',
    forecast: 389,
    low: 358,
    high: 420,
    confidence: 86,
  },
  {
    name: 'Dried Sprats 250g',
    forecast: 518,
    low: 477,
    high: 559,
    confidence: 90,
  },
]

export const shapFactors = [
  { name: 'Recent sales trend', impact: 0.42 },
  { name: 'Seasonality (Oct–Dec)', impact: 0.31 },
  { name: 'Deepavali promotion', impact: 0.18 },
  { name: 'Holiday calendar', impact: 0.09 },
  { name: 'Unit price change', impact: -0.07 },
]

export const accuracyRows = [
  { month: 'Jun', forecast: 1480, actual: 1412 },
  { month: 'Jul', forecast: 1520, actual: 1561 },
  { month: 'Aug', forecast: 1610, actual: 1522 },
  { month: 'Sep', forecast: 1700, actual: 1688 },
]

export const contextEvents = [
  {
    name: 'Deepavali Promotion',
    type: 'Promotion',
    date: '20 Oct 2026',
    impact: '+18% expected demand',
  },
  {
    name: 'Year-end Seasonal Demand',
    type: 'Seasonal',
    date: '01 Dec 2026',
    impact: '+12% expected demand',
  },
]

export const explainSummary =
  'Projected demand increase is linked to the Deepavali promotion, year-end seasonality and recent sales trends. Prediction range: ±8% of the forecast.'

  export const seasonalIndex = [
  { month: 'Jan', value: 88, forecast: false },
  { month: 'Feb', value: 90, forecast: false },
  { month: 'Mar', value: 93, forecast: false },
  { month: 'Apr', value: 96, forecast: false },
  { month: 'May', value: 100, forecast: false },
  { month: 'Jun', value: 104, forecast: false },
  { month: 'Jul', value: 108, forecast: false },
  { month: 'Aug', value: 114, forecast: false },
  { month: 'Sep', value: 126, forecast: false },
  { month: 'Oct', value: 132, forecast: true },
  { month: 'Nov', value: 128, forecast: true },
  { month: 'Dec', value: 140, forecast: true },
]