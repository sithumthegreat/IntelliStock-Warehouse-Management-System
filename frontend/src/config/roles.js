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

export const ROLE_PAGES = {
  Administrator: ['/dashboard', '/analytics', '/what-if', '/administration', '/notifications', '/profile', '/help'],
  'Warehouse Manager': ['/dashboard', '/forecasting', '/import', '/inventory', '/requests', '/suppliers', '/goods-received', '/analytics', '/what-if', '/notifications', '/profile', '/help'],
  'Warehouse Staff': ['/dashboard', '/inventory', '/goods-received', '/notifications', '/profile', '/help'],
  'Requesting Entity': ['/requests', '/notifications', '/profile', '/help'],
  Supplier: ['/supplier-portal', '/notifications', '/profile', '/help'],
}

export const canAccess = (role, pathname) =>
  (ROLE_PAGES[role] ?? []).some((p) => pathname === p || pathname.startsWith(p + '/'))

export const landingFor = (role) => ROLE_PAGES[role]?.[0] ?? '/login'

export const DEMO_PASSWORD = 'intellistock'
export const DEMO_ACCOUNTS = {
  Administrator: { name: 'Minuka De Silva', email: 'minuka@intellistock.demo' },
  'Warehouse Manager': { name: 'Warehouse Manager', email: 'manager@intellistock.demo' },
  'Warehouse Staff': { name: 'Warehouse Staff', email: 'staff@intellistock.demo' },
  'Requesting Entity': { name: 'Retail Outlet User', email: 'retail@intellistock.demo' },
  Supplier: { name: 'Supplier Partner', email: 'supplier@intellistock.demo' },
}