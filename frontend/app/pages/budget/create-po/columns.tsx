import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreatePODialog from "@/components/dialogs/CreatePODialog";

export const columns: ColumnDef<any>[] = [
  {
    header: "RV No.",
    accessorKey: "rv_number",
  },
  {
    header: "Department",
    accessorKey: "department",
  },
  {
    header: "Created At",
    accessorFn: (row) => new Date(row.created_at).toLocaleDateString(),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
  {
    header: "Action",
    cell: ({ row, table }) => (
      <CreatePODialog
        rv={row.original}
        refreshData={() => table.options.meta?.refreshData?.()}
      />
    ),
  },
];
