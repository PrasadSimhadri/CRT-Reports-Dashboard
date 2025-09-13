"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn: string;
  filterPlaceholder: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Left side - Search */}
        <Input
          placeholder={filterPlaceholder}
          value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="w-64 dark:bg-black dark:text-white dark:placeholder-gray-400"
        />

        {/* Right side - Rows per page + page info */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="dark:text-gray-200 text-sm">Rows per page:</span>
            <select
              className="px-3 py-1.5 rounded-lg border bg-white text-gray-700 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-black dark:text-gray-200 dark:border-gray-700 dark:focus:ring-blue-400 dark:focus:border-blue-400 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {[10, 50, 100].map((size) => (
                <option
                  key={size}
                  value={size}
                  className="bg-white text-gray-700 dark:bg-black dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  {size}
                </option>
              ))}
            </select>

          </div>
          <span className="dark:text-gray-200 text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto dark:border-gray-700">
        <Table className="dark:bg-black dark:text-white">
          <TableHeader className="dark:bg-black">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="dark:text-gray-200"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="dark:text-gray-100"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center dark:text-gray-400"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        {(() => {
          const pageCount = table.getPageCount();
          const current = table.getState().pagination.pageIndex;
          const pages: (number | string)[] = [];
          if (pageCount <= 7) {
            for (let i = 0; i < pageCount; i++) pages.push(i);
          } else {
            pages.push(0);
            if (current > 2) pages.push('...');
            for (let i = Math.max(1, current - 4); i <= Math.min(pageCount - 2, current + 4); i++) {
              if (i !== 0 && i !== pageCount - 1) pages.push(i);
            }
            if (current < pageCount - 3) pages.push('...');
            pages.push(pageCount - 1);
          }
          return pages.map((p, idx) =>
            p === '...'
              ? <span key={"ellipsis-" + idx} className="px-2">...</span>
              : (
                <Button
                  key={p}
                  variant={current === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => table.setPageIndex(p as number)}
                  className="dark:border-gray-600 dark:text-gray-200"
                >
                  {(p as number) + 1}
                </Button>
              )
          );
        })()}
      </div>
    </div>
  );
}