import { ROLE_INFO, ROLES } from '../../config/roles'

export default function RolePicker({ label, value, onChange }) {
  return (
    <div>
      <p className="mb-2.5 mt-4 text-xs font-semibold text-[#475569]">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {ROLES.map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => onChange(r)}
            className={`flex min-h-[58px] cursor-pointer items-center gap-2.5 rounded-[10px] border p-2.5 text-left last:col-span-2 ${
              value === r
                ? 'border-[#1677ff] bg-[#f1f7ff]'
                : 'border-[#e5eaf2] bg-white hover:bg-[#f8fafd]'
            }`}
          >
            <i className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eaf2ff] not-italic text-[#1677ff]">
              {ROLE_INFO[r].icon}
            </i>
            <span>
              <b className="block text-xs">{r}</b>
              <small className="text-[10px] leading-snug text-[#718096]">{ROLE_INFO[r].text}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}