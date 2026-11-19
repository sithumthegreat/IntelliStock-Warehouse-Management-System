
import { useState } from 'react'

import Card from '../components/Card'
import Tabs from '../components/Tabs'

import usePersistentState from '../hooks/usePersistentState'

import BusinessContextTab from './forecasting/BusinessContextTab'
import DashboardTab from './forecasting/DashboardTab'

import { contextEvents } from '../data/forecastData'
import { initialSales } from '../data/importData'

const TABS = [
  'Dashboard',
  'Business Context',
  'Models',
  'History',
  'Schedule',
  'Approval',
  'Alerts',
]

export default function DemandForecasting() {
  const [activeTab, setActiveTab] = useState('Dashboard')

  // Persist business context events
  const [events, setEvents] = usePersistentState(
    'is_business_context_events',
    contextEvents
  )

  // Persisted historical sales data
  const [sales] = usePersistentState(
    'is_sales',
    initialSales
  )

  // Add a new business context event
  const addEvent = (event) => {
    setEvents((current) => [
      {
        ...event,
        id: `event-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])
  }

  // Remove a business context event
  const removeEvent = (id) => {
    setEvents((current) =>
      current.filter((event) => event.id !== id)
    )
  }

  return (
    <div className="space-y-4">

      {/* Demand Forecasting Navigation */}
      <Tabs
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Forecasting Dashboard */}
      {activeTab === 'Dashboard' && (
        <DashboardTab
          sales={sales}
          events={events}
          onGoToApproval={() => setActiveTab('Approval')}
        />
      )}

      {/* Business Context Management */}
      {activeTab === 'Business Context' && (
        <BusinessContextTab
          events={events}
          onAdd={addEvent}
          onRemove={removeEvent}
        />
      )}

      {/* Remaining modules - future development */}
      {![
        'Dashboard',
        'Business Context',
      ].includes(activeTab) && (
        <Card title={activeTab}>
          <p className="text-[#718096]">
            This module will be implemented in a later development batch.
          </p>
        </Card>
      )}

    </div>
  )
}
