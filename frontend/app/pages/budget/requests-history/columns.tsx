import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<any>[] = [
  {
    header: "RV No.",
    accessorKey: "rv_number",
  },
  {
    header: "Requester",
    accessorFn: (row) => `${row.requester?.first_name || ""} ${row.requester?.last_name || ""}`,
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
    header: "Rejection Reason",
    accessorFn: (row) => row.status === "rejected" ? row.rejection_reason || "-" : "-",
  },
];
