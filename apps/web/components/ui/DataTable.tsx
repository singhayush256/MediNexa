'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronsUpDown, Download, ArrowLeft, ArrowRight, Filter } from 'lucide-react';
import { Button } from './Button';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKey?: (row: T) => string;
  pageSize?: number;
  exportFileName?: string;
  bulkActions?: (selectedRows: T[]) => React.ReactNode;
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  searchKey,
  pageSize = 10,
  exportFileName = 'medinexa_export',
  bulkActions,
  rowKey,
  emptyMessage = 'No records found matching criteria.',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Search Filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter((row) => {
      if (searchKey) {
        return searchKey(row).toLowerCase().includes(term);
      }
      return Object.values(row as any).some((val) =>
        String(val).toLowerCase().includes(term),
      );
    });
  }, [data, search, searchKey]);

  // Sort Filter
  const sortedData = useMemo(() => {
    if (!sortCol) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;
      const res = valA > valB ? 1 : -1;
      return sortAsc ? res : -res;
    });
  }, [filteredData, sortCol, sortAsc]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSort = (colKey: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortCol === colKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colKey);
      setSortAsc(true);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const all = new Set(paginatedData.map(rowKey));
      setSelectedIds(all);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((c) => `"${c.header}"`).join(',');
    const rows = sortedData.map((row: any) =>
      columns
        .map((c) => {
          const val = row[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(','),
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedRows = useMemo(() => {
    return data.filter((row) => selectedIds.has(rowKey(row)));
  }, [data, selectedIds, rowKey]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-subtle overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {bulkActions && selectedIds.size > 0 && (
            <div className="mr-2">{bulkActions(selectedRows)}</div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              {bulkActions && (
                <th className="p-3.5 pl-5 w-8">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`p-3.5 font-semibold ${
                    col.sortable ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortCol === col.key ? (
                          sortAsc ? (
                            <ChevronUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions ? 1 : 0)}
                  className="p-8 text-center text-slate-400 dark:text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const id = rowKey(row);
                const isSelected = selectedIds.has(id);
                return (
                  <tr
                    key={id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    {bulkActions && (
                      <td className="p-3.5 pl-5 w-8">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="p-3.5">
                        {col.render ? col.render(row) : (row as any)[col.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing <span className="font-semibold text-slate-900 dark:text-slate-100">{(page - 1) * pageSize + (paginatedData.length ? 1 : 0)}</span> to{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{(page - 1) * pageSize + paginatedData.length}</span> of{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">{sortedData.length}</span> entries
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            icon={<ArrowLeft className="w-3 h-3" />}
          >
            Prev
          </Button>
          <span className="px-2 font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="xs"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            icon={<ArrowRight className="w-3 h-3" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
