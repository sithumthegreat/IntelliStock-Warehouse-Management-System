
import { REQUIRED_COLUMNS } from '../data/importData'

function normalizeHeader(value) {
  return String(value ?? '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

// Handles commas and escaped quotation marks inside CSV cells.
function parseCsvMatrix(text) {
  const input = String(text ?? '').replace(/^\uFEFF/, '')
  const matrix = []
  let row = []
  let value = ''
  let quoted = false

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]
    const next = input[i + 1]

    if (char === '"') {
      if (quoted && next === '"') {
        value += '"'
        i += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      row.push(value.trim())
      value = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1

      row.push(value.trim())

      if (row.some((cell) => cell !== '')) matrix.push(row)

      row = []
      value = ''
    } else {
      value += char
    }
  }

  if (quoted) {
    throw new Error('The CSV file contains an unclosed quotation mark.')
  }

  row.push(value.trim())
  if (row.some((cell) => cell !== '')) matrix.push(row)

  return matrix
}

function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return String(value ?? '').trim()
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00`)
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === Number(value.slice(0, 4)) &&
    date.getMonth() + 1 === Number(value.slice(5, 7)) &&
    date.getDate() === Number(value.slice(8, 10))
  )
}

function validateRows(matrix, knownIds = []) {
  if (!matrix.length) {
    throw new Error('The file is empty.')
  }

  const headers = matrix[0].map(normalizeHeader)

  const duplicateHeaders = headers.filter(
    (header, index) => headers.indexOf(header) !== index
  )

  if (duplicateHeaders.length) {
    throw new Error(
      `Duplicate column headers: ${[...new Set(duplicateHeaders)].join(', ')}`
    )
  }

  const missingHeaders = REQUIRED_COLUMNS.filter(
    (column) => !headers.includes(column)
  )

  if (missingHeaders.length) {
    throw new Error(
      `Missing required columns: ${missingHeaders.join(', ')}`
    )
  }

  const indexes = Object.fromEntries(
    headers.map((header, index) => [header, index])
  )

  const rows = []
  const errors = []
  const warnings = []
  const seen = new Set()
  const dataRows = matrix.slice(1)

  dataRows.forEach((cells, index) => {
    const line = index + 2

    const date = normalizeDate(cells[indexes.date])
    const product = String(cells[indexes.product_id] ?? '').trim()
    const quantityText = String(cells[indexes.quantity] ?? '').trim()
    const priceText = String(cells[indexes.price] ?? '').trim()

    const quantity = Number(quantityText)
    const price = Number(priceText)
    const problems = []

    if (!isValidDate(date)) {
      problems.push(['date', 'Use a valid date in YYYY-MM-DD format'])
    }

    if (!product) {
      problems.push(['product_id', 'Product ID is required'])
    } else if (knownIds.length && !knownIds.includes(product)) {
      problems.push(['product_id', 'Unknown product ID'])
    }

    if (
      !quantityText ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      problems.push(['quantity', 'Must be a whole number above 0'])
    }

    if (
      !priceText ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      problems.push(['price', 'Must be a valid number, 0 or more'])
    }

    problems.forEach(([field, issue]) => {
      errors.push({ line, field, issue })
    })

    if (problems.length) return

    const record = { line, date, product, quantity, price }
    rows.push(record)

    const key = `${date}|${product}`

    if (seen.has(key)) {
      warnings.push({
        line,
        issue: 'Duplicate date and product combination',
      })
    }

    seen.add(key)

    if (quantity > 10000) {
      warnings.push({
        line,
        issue: 'Unusually high sales quantity',
      })
    }

    if (date > new Date().toISOString().slice(0, 10)) {
      warnings.push({
        line,
        issue: 'Sales date is in the future',
      })
    }
  })

  return {
    rows,
    errors,
    warnings,
    total: dataRows.length,
  }
}

export function parseSalesCsv(text, knownIds = []) {
  return validateRows(parseCsvMatrix(text), knownIds)
}

export async function parseSalesExcel(file, knownIds = []) {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()

  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
  })

  const firstSheet = workbook.SheetNames[0]

  if (!firstSheet) {
    throw new Error('The Excel workbook contains no worksheets.')
  }

  const worksheet = workbook.Sheets[firstSheet]

  const matrix = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    raw: false,
  })

  return validateRows(matrix, knownIds)
}

export function findWarnings(rows) {
  const seen = new Set()
  const warnings = []

  rows.forEach((row) => {
    const key = `${row.date}|${row.product}`

    if (seen.has(key)) {
      warnings.push({
        line: row.line,
        issue: 'Duplicate date and product combination',
      })
    }

    seen.add(key)
  })

  return warnings
}
