"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

// 👇 Define meta type for optional refreshData
type TableMeta = {
  refreshData?: () => void;
};

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  title: string;
  refreshData?: () => void;
  page: number;
  setPage: (page: number) => void;
  totalCount: number;
  pageSize?: number;
  /** Optional: Pass a custom filter component to render above the table */
  filters?: React.ReactNode;
}

export default function DataTable<TData>({
  columns = [],
  data = [],
  title,
  refreshData,
  page,
  setPage,
  totalCount,
  pageSize = 10,
  filters, // <-- accept custom filters as a prop
}: DataTableProps<TData>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const table = useReactTable<TData>({
    data,
    columns,
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newPageIndex =
        typeof updater === "function"
          ? updater({ pageIndex: page - 1, pageSize }).pageIndex
          : updater.pageIndex;

      if (typeof setPage === "function") {
        setPage(newPageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    meta: {
      refreshData,
    },
  });

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4 p-4">{title}</h2>

      {/* Custom Filters */}
      {filters && <div className="mb-4">{filters}</div>}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns?.length || 1} className="text-center">
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={page <= 1}
          >
            <ArrowLeft className="mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={page >= totalPages}
          >
            Next
            <ArrowRight className="ml-2" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
      </div>
    </div>
  );
}
