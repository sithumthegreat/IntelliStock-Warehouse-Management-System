import { REQUIRED_COLUMNS } from '../data/importData'

const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))

// Turns the text of a CSV file into { rows, errors, warnings }
export function parseSalesCsv(text, knownIds) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim())
  const header = (lines.shift() ?? '').split(',').map((h) => h.trim().toLowerCase())

  if (REQUIRED_COLUMNS.some((c) => !header.includes(c))) {
    return {
      rows: [],
      errors: [{ line: 1, field: 'header', issue: `Required columns: ${REQUIRED_COLUMNS.join(', ')}` }],
      warnings: [],
      total: 0,
    }
  }

  const get = (cells, name) => (cells[header.indexOf(name)] ?? '').trim()
  const rows = []
  const errors = []

  lines.forEach((raw, i) => {
    const line = i + 2 // +1 for the header row, +1 because people count from 1
    const cells = raw.split(',')
    const date = get(cells, 'date')
    const product = get(cells, 'product_id')
    const quantity = Number(get(cells, 'quantity'))
    const priceText = get(cells, 'price')
    const price = Number(priceText)

    const problems = []
    if (!isValidDate(date)) problems.push(['date', 'Use YYYY-MM-DD'])
    if (!knownIds.includes(product)) problems.push(['product_id', 'Unknown product ID'])
    if (!Number.isInteger(quantity) || quantity <= 0) problems.push(['quantity', 'Must be a whole number above 0'])
    if (priceText === '' || Number.isNaN(price) || price < 0) problems.push(['price', 'Must be a number, 0 or more'])

    if (problems.length) problems.forEach(([field, issue]) => errors.push({ line, field, issue }))
    else rows.push({ line, date, product, quantity, price })
  })

  return { rows, errors, total: lines.length, warnings: findWarnings(rows) }
}

// Valid rows that still look suspicious: the user decides to keep or exclude them
export function findWarnings(rows) {
  const warnings = []
  const today = new Date().toISOString().slice(0, 10)
  const sorted = rows.map((r) => r.quantity).sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)] ?? 0
  const seen = new Set()

  rows.forEach((r) => {
    const key = `${r.date}|${r.product}`
    if (seen.has(key)) warnings.push({ line: r.line, issue: 'Duplicate date and product' })
    seen.add(key)
    if (rows.length >= 5 && r.quantity > median * 5) warnings.push({ line: r.line, issue: 'Unusually high quantity' })
    if (r.date > today) warnings.push({ line: r.line, issue: 'Date is in the future' })
  })

  return warnings.slice(0, 20)
}
