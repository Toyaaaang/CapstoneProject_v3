import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import IssueMaterialsDialog from "@/components/dialogs/IssueMaterialsDialog";

export type ApprovedChargeRequest = {
    id: number;
    request_no: string;
    department: string;
    requester: string;
    created_at: string;
    items: {
      id: number;
      material_name: string;
      unit: string;
      requested_quantity: number;
    }[];
  };
  

export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<ApprovedChargeRequest>[] => [
  {
    header: "Request No.",
    accessorKey: "request_no",
    cell: ({ row }) => <span className="font-mono">{row.original.request_no}</span>,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Requested By",
    accessorKey: "requester",
  },
  {
    header: "Date",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Action",
    cell: ({ row }) => (
      <IssueMaterialsDialog request={row.original} refreshData={refreshData} />
    ),
  },
];
