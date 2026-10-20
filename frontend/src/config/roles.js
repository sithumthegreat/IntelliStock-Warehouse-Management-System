export const ROLE_INFO = {
  Administrator: { icon: '♛', text: 'Users, roles and system settings' },
  'Warehouse Manager': { icon: '▦', text: 'Forecasts, approvals and procurement' },
  'Warehouse Staff': { icon: '▤', text: 'Stock levels and goods receiving' },
  'Requesting Entity': { icon: '☷', text: 'Submit and track stock requests' },
  Supplier: { icon: '⇄', text: 'Respond to purchase orders' },
}

export const ROLES = Object.keys(ROLE_INFO)

export const PRIVILEGED_ROLES = ['Administrator', 'Warehouse Manager']
export const needsApproval = (role) => PRIVILEGED_ROLES.includes(role)

export const ROLE_LANDING = { 'Requesting Entity': '/requests', Supplier: '/suppliers' }

export const DEMO_PASSWORD = 'intellistock'
export const DEMO_ACCOUNTS = {
  Administrator: { name: 'Minuka De Silva', email: 'minuka@intellistock.demo' },
  'Warehouse Manager': { name: 'Warehouse Manager', email: 'manager@intellistock.demo' },
  'Warehouse Staff': { name: 'Warehouse Staff', email: 'staff@intellistock.demo' },
  'Requesting Entity': { name: 'Retail Outlet User', email: 'retail@intellistock.demo' },
  Supplier: { name: 'Supplier Partner', email: 'supplier@intellistock.demo' },
}