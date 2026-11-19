
import { useMemo, useState } from 'react'

import Badge from '../../components/Badge'
import Card from '../../components/Card'
import StatCard from '../../components/StatCard'
import Table from '../../components/Table'

import usePersistentState from '../../hooks/usePersistentState'
import { runAdaptiveForecast } from '../../utils/adaptiveForecast'

const formatNumber = (value) =>
  Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })

const formatDate = (value) =>
  new Date(value).toLocaleString()

export default function ForecastApprovalTab({ sales = [] }) {
  const result = useMemo(
    () => runAdaptiveForecast(sales),
    [sales]
  )

  const [submissions, setSubmissions] = usePersistentState(
    'is_forecast_approval_submissions',
    []
  )

  const [decisionHistory, setDecisionHistory] = usePersistentState(
    'is_forecast_approval_history',
    []
  )

  const [selectedId, setSelectedId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const selected = submissions.find(
    (item) => item.id === selectedId
  )

  const pendingCount = submissions.filter(
    (item) => item.status === 'Pending'
  ).length

  const approvedCount = submissions.filter(
    (item) => item.status === 'Approved'
  ).length

  const publishedCount = submissions.filter(
    (item) => item.status === 'Published'
  ).length

  const rejectedCount = submissions.filter(
    (item) => item.status === 'Rejected'
  ).length

  const submitForecast = () => {
    if (!result.predictions.length) {
      window.alert('No forecast predictions are available to submit.')
      return
    }

    const snapshot = {
      id: `approval-${Date.now()}`,
      reference: `FC-${Date.now().toString().slice(-8)}`,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      productsEvaluated: result.productsEvaluated,
      totalForecast: result.totalForecast,
      predictions: result.predictions.map((item) => ({
        product: item.product,
        month: item.month,
        key: item.key,
        value: item.value,
        low: item.low,
        high: item.high,
        confidence: item.confidence,
      })),
      reviewerComment: '',
      rejectionReason: '',
      reviewedAt: null,
      publishedAt: null,
    }

    setSubmissions((current) => [
      snapshot,
      ...current,
    ])

    setSelectedId(snapshot.id)

    window.alert('Forecast submitted for approval.')
  }

  const recordDecision = (submission, status, comment = '') => {
    const timestamp = new Date().toISOString()

    setSubmissions((current) =>
      current.map((item) =>
        item.id === submission.id
          ? {
              ...item,
              status,
              reviewerComment: comment,
              rejectionReason:
                status === 'Rejected' ? comment : '',
              reviewedAt: timestamp,
            }
          : item
      )
    )

    setDecisionHistory((current) => [
      {
        id: `decision-${Date.now()}`,
        reference: submission.reference,
        status,
        comment,
        decisionAt: timestamp,
      },
      ...current,
    ])

    setRejectionReason('')
  }

  const approveForecast = (submission) => {
    if (
      !window.confirm(
        `Approve forecast ${submission.reference}?`
      )
    ) {
      return
    }

    recordDecision(submission, 'Approved', 'Forecast approved.')
  }

  const rejectForecast = (submission) => {
    if (!rejectionReason.trim()) {
      window.alert('Please provide a rejection reason.')
      return
    }

    recordDecision(
      submission,
      'Rejected',
      rejectionReason.trim()
    )
  }

  const publishForecast = (submission) => {
    if (
      submission.status !== 'Approved'
    ) {
      window.alert('Only approved forecasts can be published.')
      return
    }

    if (
      !window.confirm(
        `Publish forecast ${submission.reference}?`
      )
    ) {
      return
    }

    const timestamp = new Date().toISOString()

    setSubmissions((current) =>
      current.map((item) =>
        item.id === submission.id
          ? {
              ...item,
              status: 'Published',
              publishedAt: timestamp,
            }
          : item
      )
    )

    setDecisionHistory((current) => [
      {
        id: `decision-${Date.now()}`,
        reference: submission.reference,
        status: 'Published',
        comment: 'Forecast published successfully.',
        decisionAt: timestamp,
      },
      ...current,
    ])

    // Save published forecasts for downstream frontend use.
    try {
      const existing = JSON.parse(
        localStorage.getItem('is_published_forecasts') || '[]'
      )

      const published = {
        ...submission,
        status: 'Published',
        publishedAt: timestamp,
      }

      localStorage.setItem(
        'is_published_forecasts',
        JSON.stringify([
          published,
          ...existing.filter(
            (item) => item.id !== submission.id
          ),
        ])
      )
    } catch (error) {
      console.error('Could not save published forecast:', error)
    }

    window.alert('Forecast published successfully.')
  }

  const submissionColumns = [
    {
      header: 'Reference',
      cell: (row) => (
        <button
          onClick={() => setSelectedId(row.id)}
          className="font-bold text-brand hover:underline"
        >
          {row.reference}
        </button>
      ),
    },
    {
      header: 'Submitted',
      cell: (row) => (
        <span className="whitespace-nowrap">
          {new Date(row.submittedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Products',
      cell: (row) => row.productsEvaluated,
    },
    {
      header: 'Forecast quantity',
      cell: (row) => formatNumber(row.totalForecast),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Action',
      cell: (row) => (
        <button
          onClick={() => setSelectedId(row.id)}
          className="font-semibold text-brand hover:underline"
        >
          Review
        </button>
      ),
    },
  ]

  const predictionColumns = [
    {
      header: 'Product',
      cell: (row) => <b>{row.product}</b>,
    },
    {
      header: 'Month',
      cell: (row) => row.month,
    },
    {
      header: 'Forecast',
      cell: (row) => formatNumber(row.value),
    },
    {
      header: 'Lower range',
      cell: (row) => formatNumber(row.low),
    },
    {
      header: 'Upper range',
      cell: (row) => formatNumber(row.high),
    },
    {
      header: 'Confidence score',
      cell: (row) => `${row.confidence}%`,
    },
  ]

  const historyColumns = [
    {
      header: 'Reference',
      cell: (row) => <b>{row.reference}</b>,
    },
    {
      header: 'Decision',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Comment',
      cell: (row) => row.comment || '—',
    },
    {
      header: 'Date',
      cell: (row) => formatDate(row.decisionAt),
    },
  ]

  return (
    <div className="space-y-4">

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold">
            Forecast Approval & Publishing
          </h2>

          <p className="mt-1 text-xs text-muted">
            Review forecast submissions, record decisions and
            publish approved forecasts.
          </p>
        </div>

        <button
          onClick={submitForecast}
          disabled={!result.predictions.length}
          className="rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
        >
          + Submit current forecast
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending review"
          value={pendingCount}
          note="Awaiting reviewer decision"
        />

        <StatCard
          label="Approved"
          value={approvedCount}
          note="Ready for publishing"
        />

        <StatCard
          label="Published"
          value={publishedCount}
          note="Approved and published"
        />

        <StatCard
          label="Rejected"
          value={rejectedCount}
          note="Returned for revision"
        />
      </div>

      <Card
        title="Forecast Submissions"
        subtitle="All forecasts submitted for review."
      >
        {submissions.length ? (
          <Table
            columns={submissionColumns}
            rows={submissions}
          />
        ) : (
          <div className="py-8 text-center">
            <p className="font-semibold">
              No forecast submissions
            </p>

            <p className="mt-1 text-xs text-muted">
              Submit your current forecast to begin the approval process.
            </p>
          </div>
        )}
      </Card>

      {selected && (
        <Card
          title={`Review Forecast – ${selected.reference}`}
          subtitle={`Submitted ${formatDate(selected.submittedAt)}`}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={selected.status} />

            <span className="text-xs text-muted">
              {selected.productsEvaluated} products evaluated
            </span>

            <span className="text-xs text-muted">
              Total forecast: {formatNumber(selected.totalForecast)}
            </span>
          </div>

          <Table
            columns={predictionColumns}
            rows={selected.predictions}
          />

          {selected.status === 'Pending' && (
            <div className="mt-5 space-y-3 border-t border-line pt-4">
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Rejection reason (required only when rejecting)
                </label>

                <textarea
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value)
                  }
                  rows={3}
                  placeholder="Enter the reason for rejection..."
                  className="w-full rounded-lg border border-line p-3 text-xs outline-none focus:border-brand"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => approveForecast(selected)}
                  className="rounded-lg bg-green-600 px-4 py-2.5 text-xs font-bold text-white"
                >
                  Approve forecast
                </button>

                <button
                  onClick={() => rejectForecast(selected)}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white"
                >
                  Reject forecast
                </button>
              </div>
            </div>
          )}

          {selected.status === 'Approved' && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div className="text-xs text-muted">
                Approved on {formatDate(selected.reviewedAt)}
              </div>

              <button
                onClick={() => publishForecast(selected)}
                className="rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white"
              >
                Publish forecast
              </button>
            </div>
          )}

          {selected.status === 'Rejected' && (
            <div className="mt-4 rounded-lg bg-[#fff4de] p-3 text-xs text-[#9a6415]">
              <b>Rejection reason:</b>
              <p className="mt-1">
                {selected.rejectionReason}
              </p>
            </div>
          )}

          {selected.status === 'Published' && (
            <div className="mt-4 rounded-lg bg-[#e9f8f1] p-3 text-xs text-[#13865d]">
              <b>Published successfully.</b>
              <p className="mt-1">
                Published on {formatDate(selected.publishedAt)}
              </p>
            </div>
          )}

          <button
            onClick={() => setSelectedId(null)}
            className="mt-4 text-xs font-semibold text-brand hover:underline"
          >
            Close review
          </button>
        </Card>
      )}

      <Card
        title="Approval Decision History"
        subtitle="An audit-style record of approval, rejection and publishing actions."
      >
        {decisionHistory.length ? (
          <Table
            columns={historyColumns}
            rows={decisionHistory}
          />
        ) : (
          <p className="py-8 text-center text-xs text-muted">
            No approval decisions have been recorded.
          </p>
        )}
      </Card>

      <div className="rounded-xl border border-[#cfe0ff] bg-[#f2f7ff] p-4 text-xs leading-5 text-[#2a4a85]">
        <b>Workflow implementation note</b>

        <p className="mt-1">
          This frontend provides a local approval workflow.
          Decisions and published forecasts are stored in the
          browser. User authentication, reviewer permissions,
          server-side audit logs and publishing to other
          application modules require backend integration.
        </p>
      </div>

    </div>
  )
}

function StatusBadge({ status }) {
  const tones = {
    Pending: 'amber',
    Approved: 'blue',
    Rejected: 'red',
    Published: 'green',
  }

  return (
    <Badge tone={tones[status] || 'blue'}>
      {status}
    </Badge>
  )
}
