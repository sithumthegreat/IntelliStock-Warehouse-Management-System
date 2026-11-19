
import { useState } from 'react'

import Card from '../components/Card'
import Tabs from '../components/Tabs'

import usePersistentState from '../hooks/usePersistentState'

import BusinessContextTab from './forecasting/BusinessContextTab'
import DashboardTab from './forecasting/DashboardTab'
import ModelManagementTab from './forecasting/ModelManagementTab'
import ForecastHistoryTab from './forecasting/ForecastHistoryTab'
import ForecastScheduleTab from './forecasting/ForecastScheduleTab'
import ForecastApprovalTab from './forecasting/ForecastApprovalTab'
import DemandAlertsTab from './forecasting/DemandAlertsTab'

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

  const [events, setEvents] = usePersistentState(
    'is_business_context_events',
    contextEvents
  )

  const [sales] = usePersistentState(
    'is_sales',
    initialSales
  )

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

  const removeEvent = (id) => {
    setEvents((current) =>
      current.filter((event) => event.id !== id)
    )
  }

  return (
    <div className="space-y-4">

      <Tabs
        tabs={TABS}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'Dashboard' && (
        <DashboardTab
          sales={sales}
          events={events}
          onGoToApproval={() => setActiveTab('Approval')}
        />
      )}

      {activeTab === 'Business Context' && (
        <BusinessContextTab
          events={events}
          onAdd={addEvent}
          onRemove={removeEvent}
        />
      )}

      {activeTab === 'Models' && (
        <ModelManagementTab sales={sales} />
      )}

      {activeTab === 'History' && (
        <ForecastHistoryTab sales={sales} />
      )}

      {activeTab === 'Schedule' && (
        <ForecastScheduleTab sales={sales} />
      )}

      {activeTab === 'Approval' && (
        <ForecastApprovalTab sales={sales} />
      )}

      {activeTab === 'Alerts' && (
        <DemandAlertsTab sales={sales} />
      )}

    </div>
  )
}
