export default function Table({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-xs">
        <thead>
          <tr className="bg-[#f6f8fb]">
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8794a6]"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {columns.map((col) => (
                <td key={col.header} className="px-3 py-3.5">
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}