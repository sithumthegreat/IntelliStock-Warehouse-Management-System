export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`cursor-pointer rounded-lg border px-3.5 py-2.5 font-semibold ${
            active === tab
              ? 'border-[#bcd6ff] bg-[#eaf2ff] text-brand'
              : 'border-line bg-white text-[#475569] hover:bg-[#f3f6fb]'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}