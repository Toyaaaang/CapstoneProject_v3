// app/(dashboard)/receiving-reports/create/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import type { DeliveryRecord } from "@/hooks/staff/usePendingDeliveries";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: ColumnDef<DeliveryRecord>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "PO No.",
    accessorFn: (row) => row.purchase_order?.po_number ?? "—",
  },
  {
    header: "Material",
    accessorFn: (row) => row.material?.name ?? "—",
  },
  {
    header: "Delivered Qty",
    accessorFn: (row) =>
      row.delivered_quantity && row.material?.unit
        ? `${row.delivered_quantity} ${row.material.unit}`
        : "—",
  },
  {
    header: "Delivery Date",
    accessorFn: (row) => row.delivery_date ?? "—",
  },
  {
    header: "Status",
    accessorFn: (row) => row.delivery_status ?? "—",
  },
];
