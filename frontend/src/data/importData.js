export const knownProducts = [
  { id: 'SKU-1001', name: 'Premium Arabica Coffee' },
  { id: 'SKU-1002', name: 'Organic Green Tea' },
  { id: 'SKU-1003', name: 'Wholegrain Crackers' },
  { id: 'SKU-1004', name: 'Almond Milk 1L' },
  { id: 'SKU-1005', name: 'Dark Chocolate 70%' },
  { id: 'SKU-1006', name: 'Oat Cookies' },
]

export const REQUIRED_COLUMNS = ['date', 'product_id', 'quantity', 'price']

// Records already in the system before this demo session
export const BASE_RECORDS = 8417

export const initialSales = [
  { id: 's1', date: '2026-10-01', product: 'SKU-1001', quantity: 120, price: 1250 },
  { id: 's2', date: '2026-10-02', product: 'SKU-1002', quantity: 84, price: 950 },
  { id: 's3', date: '2026-10-03', product: 'SKU-1004', quantity: 96, price: 300 },
]

export const initialHistory = [
  { id: 'h1', file: 'sales_history_q3.csv', date: '15 Oct 2026', records: 8420, status: 'Completed' },
  { id: 'h2', file: 'sales_history_q2.csv', date: '30 Sep 2026', records: 7980, status: 'Completed' },
]

export const TEMPLATE_CSV =
  'date,product_id,quantity,price\n2026-10-01,SKU-1001,120,1250\n2026-10-02,SKU-1002,84,950\n'
