const TONES = {
  green: 'bg-[#e9f8f1] text-[#13865d]',
  amber: 'bg-[#fff4de] text-[#b7791f]',
  blue: 'bg-[#e8f1ff] text-[#1f5fc4]',
  red: 'bg-[#fdecec] text-[#c53030]',
}

export default function Badge({ tone = 'green', children }) {
  return (
    <span className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold ${TONES[tone]}`}>
      {children}
    </span>
  )
}