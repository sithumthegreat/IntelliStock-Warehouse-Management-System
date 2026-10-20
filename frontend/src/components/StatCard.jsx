import Card from './Card'

export default function StatCard({ label, value, note }) {
  return (
    <Card>
      <p className="text-xs text-muted">{label}</p>
      <p className="my-3 text-[26px] font-extrabold">{value}</p>
      <p className="text-[11px] font-semibold text-accent">{note}</p>
    </Card>
  )
}