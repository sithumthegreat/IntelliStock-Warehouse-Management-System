
import { useMemo, useState } from 'react'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import { eventTypes } from '../../data/forecastData'
import { knownProducts } from '../../data/importData'

const emptyForm = {
  name: '',
  type: 'Promotion',
  startDate: '',
  endDate: '',
  impact: '',
  productId: 'ALL',
  description: '',
}

const labelClass = 'block text-xs font-semibold text-[#475569]'

const inputClass =
  'mt-2 w-full rounded-[10px] border border-[#e5eaf2] bg-white px-3.5 py-3 text-xs font-normal outline-none focus:border-[#1677ff]'

const buttonClass =
  'cursor-pointer rounded-lg bg-[#1677ff] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0865e5]'

const secondaryButton =
  'cursor-pointer rounded-lg border border-[#e5eaf2] bg-white px-4 py-2.5 text-xs font-bold hover:bg-[#f3f6fb]'

const formatDate = (iso) => {
  if (!iso) return '—'

  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const getEventStatus = (event) => {
  if (!event.startDate || !event.endDate) return 'Scheduled'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const start = new Date(`${event.startDate}T00:00:00`)
  const end = new Date(`${event.endDate}T23:59:59`)

  if (today < start) return 'Upcoming'
  if (today > end) return 'Completed'
  return 'Active'
}

const getProductName = (id) => {
  if (!id || id === 'ALL') return 'All products'

  return knownProducts.find((product) => product.id === id)?.name ?? id
}

export default function BusinessContextTab({ events, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const closeForm = () => {
    setShowForm(false)
    setForm(emptyForm)
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.startDate || !form.endDate || form.impact === '') {
      setError('Please complete all required fields.')
      return
    }

    if (form.endDate < form.startDate) {
      setError('The end date cannot be earlier than the start date.')
      return
    }

    const impact = Number(form.impact)

    if (!Number.isFinite(impact) || impact < -100 || impact > 1000) {
      setError('Expected impact must be between -100% and 1000%.')
      return
    }

    onAdd({
      name: form.name.trim(),
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      impact,
      productId: form.productId,
      description: form.description.trim(),
    })

    closeForm()
  }

  const counts = useMemo(() => {
    const statuses = events.map(getEventStatus)

    return {
      active: statuses.filter((status) => status === 'Active').length,
      upcoming: statuses.filter((status) => status === 'Upcoming').length,
      completed: statuses.filter((status) => status === 'Completed').length,
    }
  }, [events])

  const filteredEvents = useMemo(() => {
    if (filter === 'All') return events

    if (filter === 'Active') {
      return events.filter((event) => getEventStatus(event) === 'Active')
    }

    if (filter === 'Upcoming') {
      return events.filter((event) => getEventStatus(event) === 'Upcoming')
    }

    if (filter === 'Completed') {
      return events.filter((event) => getEventStatus(event) === 'Completed')
    }

    return events.filter((event) => event.type === filter)
  }, [events, filter])

  const columns = [
    {
      header: 'Business event',
      cell: (event) => (
        <div>
          <b>{event.name}</b>
          {event.description && (
            <p className="mt-1 max-w-[240px] text-[10px] text-[#8794a6]">
              {event.description}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (event) => event.type,
    },
    {
      header: 'Period',
      cell: (event) => (
        <div className="whitespace-nowrap">
          <p>{formatDate(event.startDate || '')}</p>
          {event.endDate && event.endDate !== event.startDate && (
            <p className="mt-1 text-[10px] text-[#8794a6]">
              to {formatDate(event.endDate)}
            </p>
          )}
          {!event.startDate && <p>{event.date || '—'}</p>}
        </div>
      ),
    },
    {
      header: 'Affected products',
      cell: (event) => getProductName(event.productId),
    },
    {
      header: 'Expected impact',
      cell: (event) => {
        if (event.impact === undefined || event.impact === null) {
          return 'Not specified'
        }

        const value = Number(event.impact)

        return (
          <span className={value >= 0 ? 'font-semibold text-[#16865b]' : 'font-semibold text-[#d14b4b]'}>
            {value > 0 ? '+' : ''}{value}%
          </span>
        )
      },
    },
    {
      header: 'Status',
      cell: (event) => {
        const status = getEventStatus(event)

        const styles = {
          Active: 'bg-[#e8f7ef] text-[#16865b]',
          Upcoming: 'bg-[#eaf2ff] text-[#1677ff]',
          Completed: 'bg-[#f1f3f6] text-[#718096]',
          Scheduled: 'bg-[#f1f3f6] text-[#718096]',
        }

        return (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${styles[status]}`}>
            {status}
          </span>
        )
      },
    },
    {
      header: 'Action',
      cell: (event) => (
        <button
          onClick={() => {
            if (window.confirm(`Remove "${event.name}"?`)) {
              onRemove(event.id)
            }
          }}
          className="cursor-pointer font-bold text-[#d14b4b] hover:underline"
        >
          Remove
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Active events"
          value={counts.active}
          note="Events currently in progress"
        />

        <StatCard
          label="Upcoming events"
          value={counts.upcoming}
          note="Future demand factors"
        />

        <StatCard
          label="Completed events"
          value={counts.completed}
          note="Historical business context"
        />
      </div>

      <Card
        title="Business context management"
        subtitle="Record external factors that may influence product demand."
        action={
          <button
            onClick={() => setShowForm(true)}
            className={buttonClass}
          >
            + Add event
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {['All', 'Active', 'Upcoming', 'Completed', ...eventTypes].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                filter === item
                  ? 'border-[#1677ff] bg-[#eaf2ff] text-[#1677ff]'
                  : 'border-[#e5eaf2] bg-white text-[#718096]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <p className="py-8 text-center text-[#718096]">
            No business events found for this filter.
          </p>
        ) : (
          <Table columns={columns} rows={filteredEvents} />
        )}
      </Card>

      <Card
        title="How business context supports forecasting"
        subtitle="Context events can later be used as explanatory variables in the forecasting engine."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              title: 'Promotions',
              description: 'Discounts and special offers that may increase demand.',
            },
            {
              title: 'Holidays',
              description: 'Public holidays and religious celebrations that change buying patterns.',
            },
            {
              title: 'Seasonal events',
              description: 'Recurring seasonal patterns such as year-end demand.',
            },
            {
              title: 'Marketing campaigns',
              description: 'Campaigns that may influence customer awareness and sales.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-[#e5eaf2] bg-[#fafbfd] p-4"
            >
              <p className="text-xs font-bold">{item.title}</p>
              <p className="mt-1 text-[11px] leading-5 text-[#718096]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {showForm && (
        <Modal
          title="Add business event"
          onClose={closeForm}
          footer={
            <>
              <button onClick={closeForm} className={secondaryButton}>
                Cancel
              </button>
              <button onClick={handleSubmit} className={buttonClass}>
                Save event
              </button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className={labelClass}>
              Event name *
              <input
                className={inputClass}
                value={form.name}
                onChange={update('name')}
                placeholder="e.g. Sinhala and Tamil New Year Promotion"
                autoFocus
              />
            </label>

            <label className={labelClass}>
              Event category *
              <select
                className={inputClass}
                value={form.type}
                onChange={update('type')}
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className={labelClass}>
                Start date *
                <input
                  type="date"
                  className={inputClass}
                  value={form.startDate}
                  onChange={update('startDate')}
                />
              </label>

              <label className={labelClass}>
                End date *
                <input
                  type="date"
                  min={form.startDate || undefined}
                  className={inputClass}
                  value={form.endDate}
                  onChange={update('endDate')}
                />
              </label>
            </div>

            <label className={labelClass}>
              Expected demand impact (%) *
              <input
                type="number"
                min="-100"
                max="1000"
                step="0.1"
                className={inputClass}
                value={form.impact}
                onChange={update('impact')}
                placeholder="e.g. 15 or -10"
              />
              <span className="mt-1 block text-[10px] font-normal text-[#8794a6]">
                Positive values indicate expected growth; negative values indicate a decline.
              </span>
            </label>

            <label className={labelClass}>
              Affected products
              <select
                className={inputClass}
                value={form.productId}
                onChange={update('productId')}
              >
                <option value="ALL">All products</option>
                {knownProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.id} — {product.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Description
              <textarea
                className={inputClass}
                rows={3}
                value={form.description}
                onChange={update('description')}
                placeholder="Describe the event and why it may affect demand..."
              />
            </label>

            {error && (
              <p className="rounded-lg bg-[#fff1f1] p-3 text-xs font-semibold text-[#c53030]">
                {error}
              </p>
            )}
          </form>
        </Modal>
      )}
    </div>
  )
}
