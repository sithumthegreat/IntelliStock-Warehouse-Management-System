
import { useMemo, useState } from 'react'

import Badge from '../../components/Badge'
import Card from '../../components/Card'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'

import usePersistentState from '../../hooks/usePersistentState'
import { runAdaptiveForecast } from '../../utils/adaptiveForecast'

const createId = () =>
  `schedule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

const pad = (value) => String(value).padStart(2, '0')

const toLocalDateString = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const getNextRun = (schedule, fromDate = new Date()) => {
  const [hours, minutes] = schedule.time.split(':').map(Number)

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null
  }

  const candidate = new Date(
    `${schedule.startDate}T${schedule.time}:00`
  )

  if (Number.isNaN(candidate.getTime())) return null

  if (schedule.frequency === 'Daily') {
    while (candidate <= fromDate) {
      candidate.setDate(candidate.getDate() + 1)
    }

    return candidate
  }

  if (schedule.frequency === 'Weekly') {
    const targetDay = Number(schedule.weekday)

    if (!Number.isInteger(targetDay) || targetDay < 0 || targetDay > 6) {
      return null
    }

    while (
      candidate.getDay() !== targetDay ||
      candidate <= fromDate
    ) {
      candidate.setDate(candidate.getDate() + 1)
    }

    return candidate
  }

  if (schedule.frequency === 'Monthly') {
    const targetDay = Math.min(
      Math.max(Number(schedule.monthDay) || 1, 1),
      28
    )

    candidate.setDate(targetDay)

    while (candidate <= fromDate) {
      candidate.setMonth(candidate.getMonth() + 1)
      candidate.setDate(targetDay)
    }

    return candidate
  }

  return null
}

const formatDateTime = (date) => {
  if (!date) return 'Not scheduled'

  return date.toLocaleString()
}

export default function ForecastScheduleTab({ sales = [] }) {
  const [schedules, setSchedules] = usePersistentState(
    'is_forecast_schedules',
    []
  )

  const [runHistory, setRunHistory] = usePersistentState(
    'is_forecast_schedule_runs',
    []
  )

  const [name, setName] = useState('Daily Demand Forecast')
  const [frequency, setFrequency] = useState('Daily')
  const [startDate, setStartDate] = useState(
    toLocalDateString(new Date())
  )
  const [time, setTime] = useState('06:00')
  const [weekday, setWeekday] = useState('1')
  const [monthDay, setMonthDay] = useState('1')
  const [editingId, setEditingId] = useState(null)

  const forecastResult = useMemo(
    () => runAdaptiveForecast(sales),
    [sales]
  )

  const activeCount = schedules.filter(
    (item) => item.enabled
  ).length

  const totalRuns = runHistory.length

  const completedRuns = runHistory.filter(
    (item) => item.status === 'Completed'
  ).length

  const resetForm = () => {
    setName('Daily Demand Forecast')
    setFrequency('Daily')
    setStartDate(toLocalDateString(new Date()))
    setTime('06:00')
    setWeekday('1')
    setMonthDay('1')
    setEditingId(null)
  }

  const saveSchedule = (event) => {
    event.preventDefault()

    if (!name.trim() || !startDate || !time) {
      window.alert('Please complete all required fields.')
      return
    }

    const schedule = {
      id: editingId || createId(),
      name: name.trim(),
      frequency,
      startDate,
      time,
      weekday: Number(weekday),
      monthDay: Number(monthDay),
      enabled: true,
      createdAt: editingId
        ? schedules.find((item) => item.id === editingId)?.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingId) {
      setSchedules((current) =>
        current.map((item) =>
          item.id === editingId
            ? { ...schedule, enabled: item.enabled }
            : item
        )
      )
    } else {
      setSchedules((current) => [
        schedule,
        ...current,
      ])
    }

    resetForm()
  }

  const editSchedule = (schedule) => {
    setEditingId(schedule.id)
    setName(schedule.name)
    setFrequency(schedule.frequency)
    setStartDate(schedule.startDate)
    setTime(schedule.time)
    setWeekday(String(schedule.weekday ?? 1))
    setMonthDay(String(schedule.monthDay ?? 1))

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const toggleSchedule = (id) => {
    setSchedules((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, enabled: !item.enabled }
          : item
      )
    )
  }

  const deleteSchedule = (id) => {
    if (!window.confirm('Delete this schedule?')) return

    setSchedules((current) =>
      current.filter((item) => item.id !== id)
    )

    if (editingId === id) resetForm()
  }

  const runNow = (schedule) => {
    const timestamp = new Date().toISOString()

    const successful = forecastResult.predictions.length > 0

    const run = {
      id: createId(),
      scheduleId: schedule.id,
      scheduleName: schedule.name,
      frequency: schedule.frequency,
      executedAt: timestamp,
      productsEvaluated: forecastResult.productsEvaluated,
      forecastRecords: forecastResult.predictions.length,
      totalForecast: forecastResult.totalForecast,
      status: successful ? 'Completed' : 'Failed',
      message: successful
        ? 'Forecast calculation completed.'
        : 'No forecast predictions were available.',
    }

    setRunHistory((current) => [
      run,
      ...current,
    ].slice(0, 50))

    if (successful) {
      const snapshot = {
        id: `forecast-${Date.now()}`,
        savedAt: timestamp,
        productsEvaluated: forecastResult.productsEvaluated,
        totalForecast: forecastResult.totalForecast,
        predictions: forecastResult.predictions.map((item) => ({
          product: item.product,
          month: item.month,
          key: item.key,
          value: item.value,
          low: item.low,
          high: item.high,
          confidence: item.confidence,
        })),
      }

      try {
        const existing = JSON.parse(
          localStorage.getItem('is_forecast_history') || '[]'
        )

        localStorage.setItem(
          'is_forecast_history',
          JSON.stringify([snapshot, ...existing])
        )
      } catch (error) {
        console.error('Could not save forecast snapshot:', error)
      }
    }

    window.alert(
      successful
        ? 'Forecast run completed and saved to Forecast History.'
        : 'Forecast could not run because no predictions were available.'
    )
  }

  const scheduleColumns = [
    {
      header: 'Schedule',
      cell: (row) => (
        <div>
          <b>{row.name}</b>
          <p className="mt-1 text-[10px] text-muted">
            Created {new Date(row.createdAt).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: 'Frequency',
      cell: (row) => row.frequency,
    },
    {
      header: 'Execution time',
      cell: (row) => row.time,
    },
    {
      header: 'Next run',
      cell: (row) =>
        row.enabled
          ? formatDateTime(getNextRun(row))
          : 'Paused',
    },
    {
      header: 'Status',
      cell: (row) =>
        row.enabled ? (
          <Badge tone="green">Active</Badge>
        ) : (
          <Badge tone="amber">Paused</Badge>
        ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => editSchedule(row)}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Edit
          </button>

          <button
            onClick={() => toggleSchedule(row.id)}
            className="text-xs font-semibold text-brand hover:underline"
          >
            {row.enabled ? 'Pause' : 'Enable'}
          </button>

          <button
            onClick={() => runNow(row)}
            className="text-xs font-semibold text-green-700 hover:underline"
          >
            Run now
          </button>

          <button
            onClick={() => deleteSchedule(row.id)}
            className="text-xs font-semibold text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  const historyColumns = [
    {
      header: 'Schedule',
      cell: (row) => <b>{row.scheduleName}</b>,
    },
    {
      header: 'Execution date',
      cell: (row) => formatDateTime(new Date(row.executedAt)),
    },
    {
      header: 'Products',
      cell: (row) => row.productsEvaluated,
    },
    {
      header: 'Forecast records',
      cell: (row) => row.forecastRecords,
    },
    {
      header: 'Total forecast',
      cell: (row) =>
        Number(row.totalForecast || 0).toLocaleString(),
    },
    {
      header: 'Status',
      cell: (row) =>
        row.status === 'Completed' ? (
          <Badge tone="green">Completed</Badge>
        ) : (
          <Badge tone="red">Failed</Badge>
        ),
    },
  ]

  return (
    <div className="space-y-4">

      <div>
        <h2 className="text-lg font-bold">
          Forecast Scheduling
        </h2>

        <p className="mt-1 text-xs text-muted">
          Configure recurring forecast schedules and review
          previous execution records.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total schedules"
          value={schedules.length}
          note="Configured schedules"
        />

        <StatCard
          label="Active schedules"
          value={activeCount}
          note="Currently enabled"
        />

        <StatCard
          label="Total executions"
          value={totalRuns}
          note="Recorded manual runs"
        />

        <StatCard
          label="Successful executions"
          value={completedRuns}
          note="Completed forecast runs"
        />
      </div>

      <Card
        title={editingId ? 'Edit Forecast Schedule' : 'Create Forecast Schedule'}
        subtitle="Configure when the forecasting process should be run."
      >
        <form onSubmit={saveSchedule} className="space-y-4">

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold">
                Schedule name
              </label>

              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={60}
                placeholder="e.g. Weekly Demand Forecast"
                className="w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                Frequency
              </label>

              <select
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-brand"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                Start date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                min={toLocalDateString(new Date())}
                required
                className="w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold">
                Execution time
              </label>

              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
                className="w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-brand"
              />
            </div>

            {frequency === 'Weekly' && (
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Day of week
                </label>

                <select
                  value={weekday}
                  onChange={(event) => setWeekday(event.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-brand"
                >
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            )}

            {frequency === 'Monthly' && (
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Day of month
                </label>

                <select
                  value={monthDay}
                  onChange={(event) => setMonthDay(event.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-xs outline-none focus:border-brand"
                >
                  {Array.from({ length: 28 }, (_, index) => index + 1).map(
                    (day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white"
            >
              {editingId ? 'Update schedule' : 'Create schedule'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-line px-4 py-2.5 text-xs font-semibold"
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </Card>

      <Card
        title="Configured Schedules"
        subtitle="Manage recurring demand forecasting schedules."
      >
        {schedules.length ? (
          <Table
            columns={scheduleColumns}
            rows={schedules}
          />
        ) : (
          <div className="py-8 text-center text-xs text-muted">
            No schedules created yet. Use the form above to
            create your first forecast schedule.
          </div>
        )}
      </Card>

      <Card
        title="Execution History"
        subtitle="Records of forecast runs initiated from this interface."
      >
        {runHistory.length ? (
          <Table
            columns={historyColumns}
            rows={runHistory}
          />
        ) : (
          <div className="py-8 text-center text-xs text-muted">
            No execution records available.
          </div>
        )}
      </Card>

      <div className="rounded-xl border border-[#cfe0ff] bg-[#f2f7ff] p-4 text-xs leading-5 text-[#2a4a85]">
        <b>Scheduling implementation note</b>

        <p className="mt-1">
          Schedule configuration and execution history are stored
          in browser localStorage. The Run now action performs
          the forecasting calculation immediately. Recurring
          automatic execution requires a backend scheduler
          such as Spring Boot scheduling or a scheduled job.
          This browser-only version does not execute jobs in
          the background.
        </p>
      </div>

    </div>
  )
}
