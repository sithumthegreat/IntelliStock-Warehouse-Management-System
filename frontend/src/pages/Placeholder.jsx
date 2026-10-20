import Card from '../components/Card'

export default function Placeholder({ title }) {
  return (
    <Card title={title}>
      <p className="text-muted">test</p>
    </Card>
  )
}