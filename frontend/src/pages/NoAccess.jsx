import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { landingFor } from '../config/roles'
import { useAuth } from '../context/AuthContext'

export default function NoAccess() {
  const { currentUser } = useAuth()
  return (
    <Card title="You don't have access to this page">
      <p className="text-[#718096]">
        Your role ({currentUser.role}) can't open this page. If you think this is a mistake,
        please contact an administrator.
      </p>
      <Link
        to={landingFor(currentUser.role)}
        className="mt-4 inline-block rounded-lg bg-[#1677ff] px-4 py-2.5 text-xs font-bold text-white no-underline"
      >
        Go to my home page
      </Link>
    </Card>
  )
}