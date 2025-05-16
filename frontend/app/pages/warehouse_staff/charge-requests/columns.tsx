import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "@/lib/axios";

export type ChargeTicketForRelease = {
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
    quantity: number;
    unit: string;
  }[];
};

export const columns = ({
  refreshData,
}: {
  refreshData: () => void;
}): ColumnDef<ChargeTicketForRelease>[] => [
  {
    header: "Request No.",
    accessorKey: "id",
    cell: ({ row }) => {
      const { ic_no, mc_no, id } = row.original;
      return <span className="font-mono">{ic_no || mc_no || `CT-${id}`}</span>;
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
    cell: ({ row }) => <span className="text-sm line-clamp-2">{row.original.purpose}</span>,
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
      <ul className="text-sm space-y-1">
        {row.original.items.map((item, i) => (
          <li key={i}>
            {item.material_name} – {item.quantity} {item.unit}
          </li>
        ))}
      </ul>
    ),
  },
  {
    header: "Action",
    cell: ({ row, table }) => {
      const ticketId = row.original.id;

      const handleRelease = async () => {
        try {
          await axios.post(`/requests/charge-tickets/${ticketId}/release/`);
          toast.success("Marked as released.");
          table.options.meta?.refreshData?.();
        } catch (err) {
          toast.error("Failed to mark as released.");
        }
      };

      return (
        <Button size="sm" onClick={handleRelease}>
          Confirm Release
        </Button>
      );
    },
  },
];
