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
		cell: ({ row }) => (
			<Badge>
				{row.original.department
					? row.original.department.replace(/_/g, " ").toUpperCase()
					: ""}
			</Badge>
		),
	},
	{
		header: "Created At",
		accessorKey: "created_at",
		cell: ({ row }) => {
			const date = row.original.created_at ? new Date(row.original.created_at) : null;
			return date
				? date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
				  })
				: "";
		},
	},
	{
		header: "Status",
		accessorKey: "status",
		cell: ({ row }) => (
			<Badge>
				{row.original.status
					? row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)
					: ""}
			</Badge>
		),
	},
	{
		header: "Rejection Reason",
		accessorFn: (row) => (row.status === "rejected" ? row.rejection_reason || "-" : "-"),
	},
];
