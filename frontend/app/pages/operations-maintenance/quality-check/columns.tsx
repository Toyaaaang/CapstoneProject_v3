// app/(your_path)/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PerformQCDialog from "@/components/dialogs/QCDialog";

export const columns: ColumnDef<any>[] = [
  {
    header: "PO Number",
    accessorKey: "po_number",
  },
  {
    header: "Supplier",
    accessorFn: (row) =>
      row.supplier
        ? row.supplier.charAt(0).toUpperCase() + row.supplier.slice(1)
        : "N/A",
  },
  {
    header: "Department",
    accessorFn: (row) =>
      row.requisition_voucher?.department
        ? row.requisition_voucher.department.charAt(0).toUpperCase() + row.requisition_voucher.department.slice(1)
        : "N/A",
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
  },
  {
    header: "Total",
    accessorKey: "grand_total",
    cell: ({ row }) => `₱${parseFloat(row.original.grand_total).toFixed(2)}`,
  },
  {
    header: "QC Action",
    cell: ({ row, table }) => (
      <PerformQCDialog
        po={row.original}
        refreshData={() => table.options.meta?.refreshData?.()}
      />
    ),
  },
];
