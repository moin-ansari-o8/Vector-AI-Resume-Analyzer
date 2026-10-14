import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';

// ─── Types ──────────────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

type SortDir = 'asc' | 'desc' | null;

// ─── Component ──────────────────────────────────────────────────────
export function DataTable<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No data available.',
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  function handleSort(col: Column<T>) {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortFn) return data;
    const sorted = [...data].sort(col.sortFn);
    return sortDir === 'desc' ? sorted.reverse() : sorted;
  }, [data, sortKey, sortDir, columns]);

  if (data.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12 text-text-muted text-sm', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-default">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider whitespace-nowrap',
                  col.sortable && 'cursor-pointer select-none hover:text-text-secondary'
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => handleSort(col)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span className="text-text-muted">
                      {sortKey === col.key && sortDir === 'asc' ? (
                        <ArrowUp size={12} />
                      ) : sortKey === col.key && sortDir === 'desc' ? (
                        <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="opacity-40" />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr
              key={idx}
              className={cn(
                'border-b border-border-default transition-colors duration-fast',
                onRowClick && 'cursor-pointer hover:bg-bg-hover'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-4 text-text-primary">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
