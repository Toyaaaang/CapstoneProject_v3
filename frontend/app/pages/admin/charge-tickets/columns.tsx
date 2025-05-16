import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { RejectDialog } from "@/components/Dialogs/RejectDialog"; // ✅ Use your shared dialog

export type ChargeRequestPendingApproval = {
  id: number;
  ic_no?: string;
  mc_no?: string;
  department: string;
  requester: {
    first_name: string;
    last_name: string;
  };
  purpose: string;
  created_at: string;
  items: {
    material_name: string;
    unit: string;
    quantity: number;
  }[];
};

export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<ChargeRequestPendingApproval>[] => [
  {
    header: "Request No.",
    accessorKey: "id",
    cell: ({ row }) => {
      const ticket = row.original;
      const ref = ticket.ic_no || ticket.mc_no || `CT-${ticket.id}`;
      return <span className="font-mono">{ref}</span>;
    },
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
    cell: ({ row }) => {
      const r = row.original.requester;
      return `${r.first_name} ${r.last_name}`;
    },
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => <span className="line-clamp-2 text-sm">{row.original.purpose}</span>,
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
        <PopoverContent className="w-80">
          <ul className="text-sm space-y-2 py-2">
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
          <Button size="sm" onClick={handleApprove}>Approve</Button>
          <RejectDialog
            ticketId={ticketId}
            refreshData={() => table.options.meta?.refreshData?.()}
          />
        </div>
      );
    },
  },
];
