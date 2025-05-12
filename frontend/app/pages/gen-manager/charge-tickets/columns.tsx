import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import axios from "@/lib/axios";
import { toast } from "sonner";

export type PendingChargeRequestForGM = {
    id: number;
    request_no: string;
    department: string;
    requested_by: string;
    purpose: string;
    created_at: string;
    items: {
      material_name: string;
      quantity: number;
      unit: string;
    }[];
  };
  
export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<PendingChargeRequestForGM>[] => [
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
    accessorKey: "requested_by",
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => (
      <span className="text-sm line-clamp-2">{row.original.purpose}</span>
    ),
  },
  {
    header: "Date Created",
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
    header: "Items",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">View</Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <ul className="text-sm space-y-1 py-2">
            {row.original.items.map((item, i) => (
              <li key={i}>
                {item.material_name} – {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Action",
    cell: ({ row }) => {
      const handleAction = async (status: "approved" | "rejected") => {
        try {
          await axios.post(`/gm/charge-request/${row.original.id}/${status}/`);
          toast.success(`Request ${status}`);
          refreshData();
        } catch (err) {
          console.error(err);
          toast.error(`Failed to ${status} request`);
        }
      };

      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleAction("approved")}>Approve</Button>
          <Button size="sm" variant="destructive" onClick={() => handleAction("rejected")}>Reject</Button>
        </div>
      );
    },
  },
];
