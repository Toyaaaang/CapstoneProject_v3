import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
      const r = row.original.requester;
      return `${r.first_name} ${r.last_name}`;
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
        <PopoverContent className="w-72">
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
    header: "Materials",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            View Items
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <ul className="text-sm space-y-1 py-2">
            {row.original.items?.map((item) => (
              <li key={item.id}>
                {item.material.name} – {item.quantity} {item.unit}
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
