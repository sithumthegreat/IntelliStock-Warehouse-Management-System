export const NAV_GROUPS = [
  {
    label: 'Main workspace',
    items: [
      { path: '/dashboard', title: 'Dashboard', icon: '▦' },
      { path: '/forecasting', title: 'Demand Forecasting', icon: '↗' },
      { path: '/import', title: 'Import Center', icon: '⇪' },
      { path: '/inventory', title: 'Inventory Optimization', icon: '▤' },
      { path: '/requests', title: 'Requests', icon: '☷' },
      { path: '/suppliers', title: 'Supplier Selection', icon: '⇄' },
      { path: '/goods-received', title: 'Goods Received', icon: '✓' },
    ],
  },
  {
    label: 'Insights & control',
    items: [
      { path: '/analytics', title: 'Analytics', icon: '◔' },
      { path: '/what-if', title: 'What-If Simulator', icon: '⚙' },
      { path: '/administration', title: 'Administration', icon: '♛' },
    ],
  },
  {
    label: 'My account',
    items: [
      { path: '/notifications', title: 'Notifications', icon: '🔔' },
      { path: '/profile', title: 'My Profile', icon: '☺' },
      { path: '/help', title: 'Help & Support', icon: '?' },
    ],
  },
]