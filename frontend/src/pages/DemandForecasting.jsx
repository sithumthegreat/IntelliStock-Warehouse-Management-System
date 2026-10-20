import { useState } from 'react'
import Card from '../components/Card'
import Tabs from '../components/Tabs'
import BusinessContextTab from './forecasting/BusinessContextTab'
import DashboardTab from './forecasting/DashboardTab'
import { contextEvents } from '../data/forecastData'

const TABS = ['Dashboard', 'Business Context', 'Models', 'History', 'Schedule', 'Approval', 'Alerts']

export default function DemandForecasting() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [events, setEvents] = useState(contextEvents)

  const addEvent = (event) => setEvents([...events, { ...event, id: Date.now() }])
  const removeEvent = (id) => setEvents(events.filter((e) => e.id !== id))

  return (
    <>
      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Dashboard' && (
        <DashboardTab events={events} onGoToApproval={() => setActiveTab('Approval')} />
      )}

      {activeTab === 'Business Context' && (
        <BusinessContextTab events={events} onAdd={addEvent} onRemove={removeEvent} />
      )}

      {activeTab !== 'Dashboard' && activeTab !== 'Business Context' && (
        <Card title={activeTab}>
          <p className="text-[#718096]">This tab will be built later.</p>
        </Card>
      )}
    </>
  )
}