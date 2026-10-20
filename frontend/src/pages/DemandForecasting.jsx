import { useState } from 'react'
import Card from '../components/Card'
import Tabs from '../components/Tabs'
import DashboardTab from './forecasting/DashboardTab'

const TABS = ['Dashboard', 'Business Context', 'Models', 'History', 'Schedule', 'Approval', 'Alerts']

export default function DemandForecasting() {
  const [activeTab, setActiveTab] = useState('Dashboard')

  return (
    <>
      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Dashboard' ? (
        <DashboardTab onGoToApproval={() => setActiveTab('Approval')} />
      ) : (
        <Card title={activeTab}>
          <p className="text-muted">test</p>
        </Card>
      )}
    </>
  )
}