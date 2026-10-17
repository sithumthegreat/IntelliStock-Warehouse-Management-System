import { NavLink } from 'react-router-dom'
import { NAV_GROUPS } from '../config/navigation'

export default function Sidebar() {
  return (
    <aside className="side">
      <div className="brand">
        <div className="logo">IS</div>
        <div>
          <b>IntelliStock</b>
          <small>Inventory intelligence</small>
        </div>
      </div>

      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="navlabel">{group.label}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 'navitem' + (isActive ? ' active' : '')}
            >
              <span className="navicon">{item.icon}</span>
              {item.title}
            </NavLink>
          ))}
        </div>
      ))}

      
<div className="sidefoot">
  © 2026 IntelliStock | The Code Alchemy
  <br />
  All rights reserved.
</div>

    </aside>
  )
}