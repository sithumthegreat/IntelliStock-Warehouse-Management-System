import { useState } from 'react'
import Card from '../../components/Card'
import Modal from '../../components/Modal'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'
import { eventTypes } from '../../data/forecastData'

const emptyForm = { name: '', type: 'Promotion', date: '', impact: '' }

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

const labelClass = 'block text-xs font-semibold text-[#475569]'
const inputClass =
  'mt-2 w-full rounded-[10px] border border-[#e5eaf2] px-3.5 py-3 text-xs font-normal outline-none focus:border-[#1677ff]'

export default function BusinessContextTab({ events, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const closeForm = () => {
    setShowForm(false)
    setForm(emptyForm)
    setError('')
  }

  const handleSubmit = () => {
    if (!form.name.trim() || !form.date || form.impact === '') {
      setError('Please fill in the event name, date and expected impact.')
      return
    }
    const pct = Number(form.impact)
    onAdd({
      name: form.name.trim(),
      type: form.type,
      date: formatDate(form.date),
      impact: `${pct > 0 ? '+' : ''}${pct}% expected demand`,
    })
    closeForm()
  }

  const columns = [
    { header: 'Event', cell: (e) => <b>{e.name}</b> },
    { header: 'Type', cell: (e) => e.type },
    { header: 'Date', cell: (e) => e.date },
    { header: 'Expected impact', cell: (e) => e.impact },
    {
      header: 'Action',
      cell: (e) => (
        <button
          onClick={() => onRemove(e.id)}
          className="cursor-pointer font-bold text-[#1677ff] hover:underline"
        >
          Remove
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active events" value={events.length} note="Feeding the forecast" />
        <StatCard
          label="Event types"
          value="Promotions, holidays, seasons, campaigns"
          note="Supported categories"
        />
        <StatCard
          label="Impact method"
          value="Learned from history"
          note="Model feature, not a fixed uplift"
        />
      </div>

      <Card
        title="Business context management"
        subtitle="Promotions, holidays, seasonal events, marketing campaigns and other external factors"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="cursor-pointer rounded-lg bg-[#1677ff] px-4 py-2.5 text-xs font-bold text-white"
          >
            Add event
          </button>
        }
      >
        {events.length === 0 ? (
          <p className="py-8 text-center text-[#718096]">
            No events yet. Add one to see how it affects the forecast.
          </p>
        ) : (
          <Table columns={columns} rows={events} />
        )}
      </Card>

      {showForm && (
        <Modal
          title="Add business event"
          onClose={closeForm}
          footer={
            <>
              <button
                onClick={closeForm}
                className="cursor-pointer rounded-lg border border-[#e5eaf2] bg-white px-4 py-2.5 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="cursor-pointer rounded-lg bg-[#1677ff] px-4 py-2.5 text-xs font-bold text-white"
              >
                Save
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <label className={labelClass}>
              Event name
              <input
                className={inputClass}
                value={form.name}
                onChange={update('name')}
                placeholder="e.g. New Year promotion"
                autoFocus
              />
            </label>
            <label className={labelClass}>
              Event type
              <select className={inputClass} value={form.type} onChange={update('type')}>
                {eventTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Date
              <input type="date" className={inputClass} value={form.date} onChange={update('date')} />
            </label>
            <label className={labelClass}>
              Expected impact (%)
              <input
                type="number"
                className={inputClass}
                value={form.impact}
                onChange={update('impact')}
                placeholder="e.g. 15 or -10"
              />
            </label>
          </div>
          {error && <p className="mt-3 text-xs font-semibold text-[#c53030]">{error}</p>}
        </Modal>
      )}
    </div>
  )
}