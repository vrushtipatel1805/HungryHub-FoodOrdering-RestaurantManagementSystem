export default function DataTable({ headers, rows }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
      <table className="min-w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800/80 text-slate-200">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-white/10">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
