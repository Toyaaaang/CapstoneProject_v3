import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { BudgetHistoryRequest } from "@/hooks/useBudgetHistory";

export const columns: ColumnDef<BudgetHistoryRequest>[] = [
  {
    accessorKey: "reference_no",
    header: "Reference No.",
    cell: ({ row }) => <div className="font-medium">{row.original.reference_no}</div>,
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.department?.replace(/_/g, " ") || "—"}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant = 
        status === "approved" ? "success" :
        status === "rejected" ? "destructive" :
        "default";

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "requested_by",
    header: "Requested By",
  },
  {
    accessorKey: "created_at",
    header: "Requested At",
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    accessorKey: "approved_by",
    header: "Reviewed By",
    cell: ({ row }) =>
      row.original.status === "approved"
        ? row.original.approved_by
        : row.original.rejected_by,
  },
];
