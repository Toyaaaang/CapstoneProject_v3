import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import ValidateDeliveryDialog from "@/components/dialogs/DeliveryDialog";

export const columns: ColumnDef<any>[] = [
  {
    header: "PO No.",
    accessorKey: "po_number",
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
  },
  {
    header: "Total",
    accessorKey: "grand_total",
    cell: ({ row }) => `₱${parseFloat(row.original.grand_total).toFixed(2)}`
  },
  {
    header: "Action",
    cell: ({ row, table }) => (
      <ValidateDeliveryDialog
        po={row.original}
        refreshData={() => table.options.meta?.refreshData?.()}
      />
    ),
  },
];
