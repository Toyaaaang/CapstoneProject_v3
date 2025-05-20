import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RejectDialog } from "@/components/Dialogs/RejectDialog";
import axios from "@/lib/axios";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export type PendingChargeRequestForGM = {
  id: number;
  request_no: string;
  department: string;
  requester: {
      id: number;
      first_name: string;
      last_name: string;
    };
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
    accessorKey: "id", // needed for fallback
    cell: ({ row }) => {
      const { ic_no, mc_no, id } = row.original;
      const no = ic_no || mc_no || `CT-${id}`;
      return <span className="font-mono">{no}</span>;
    },
  },
  {
      header: "Department",
      accessorKey: "department",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.department.replace(/_/g, " ").toUpperCase()}
        </Badge>
      ),
    },
  {
    header: "Requested By",
    accessorKey: "requester",
    cell: ({ row }) => {
      const { first_name, last_name } = row.original.requester || {};
      return <span>{first_name} {last_name}</span>;

    },
  },

  {
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button>{row.original.purpose || "No purpose provided"}</Button>

        </PopoverTrigger>
        <PopoverContent className="w-60">
          <p className="text-sm">{row.original.purpose}</p>
        </PopoverContent>
      </Popover>
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
  cell: ({ row, table }) => {
    const ticketId = row.original.id;

    const handleApprove = async () => {
      try {
        await axios.post(`/requests/charge-tickets/${ticketId}/approve/`);
        toast.success("Charge ticket approved.");
        table.options.meta?.refreshData?.();
      } catch (err) {
        console.error(err);
        toast.error("Approval failed.");
      }
    };

    return (
      <div className="flex gap-2">
        <Button size="sm" onClick={handleApprove}>
          Approve
        </Button>
        <RejectDialog
          ticketId={ticketId}
          refreshData={() => table.options.meta?.refreshData?.()}
        />
      </div>
    );
  },
}
  
];
