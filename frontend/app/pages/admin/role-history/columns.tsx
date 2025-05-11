import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

type ApprovalHistory = {
  id: number;
  user_username: string; // Username of the user whose role request was processed
  requested_role: string; // The role requested by the user
  status: string; // "approved" or "rejected"
  processed_by_username: string; // Username of the admin who processed the request
  processed_at: string; // Timestamp of when the request was processed
};

export const columns: ColumnDef<ApprovalHistory>[] = [
  {
    accessorKey: "user_username",
    header: "User",
    cell: ({ row }) => (
      <div className="py-2">{row.original.user_username}</div>
    ),
  },
  {
    accessorKey: "requested_role",
    header: "Requested Role",
    cell: ({ row }) => (
      <div className="py-2">{row.original.requested_role}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "approved" ? "success" : "destructive"}
        className="py-1 px-2"
      >
        {row.original.status === "approved" ? "Approved" : "Rejected"}
      </Badge>
    ),
  },
  {
    accessorKey: "processed_by_username",
    header: "Processed By",
    cell: ({ row }) => (
      <div className="py-2">{row.original.processed_by_username}</div>
    ),
  },
  {
    accessorKey: "processed_at",
    header: "Processed At",
    cell: ({ row }) => (
      <div className="py-2">
        {new Date(row.original.processed_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    ),
  },
];