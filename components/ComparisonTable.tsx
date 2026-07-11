export type ComparisonColumn = {
  key: string;
  label: string;
};

export type ComparisonRow = {
  label: string;
  values: Record<string, string>;
};

function CellValue({ value }: { value: string }) {
  if (value === "Yes") {
    return (
      <span className="cell-check" aria-label="Yes">
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="M4 10.5 8 14.5 16 6" fill="none" stroke="var(--success)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (value === "No") {
    return (
      <span className="cell-dash" aria-label="Not included">
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="M5 10h10" stroke="var(--muted)" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return <>{value}</>;
}

export function ComparisonTable({
  columns,
  rows,
  caption,
}: {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  caption?: string;
}) {
  return (
    <table className="comparison-table">
      {caption ? <caption className="visually-hidden">{caption}</caption> : null}
      <thead>
        <tr>
          <th scope="col">Feature</th>
          {columns.map((column) => (
            <th scope="col" key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            {columns.map((column) => (
              <td key={column.key}>
                <CellValue value={row.values[column.key] ?? "—"} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
