import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

// ✅ Type definition
export type EvaluatedRequest = {
  id: number;
  requester: {
    id: number;
    first_name: string;
    last_name: string;
  };
  department: string;
  purpose: string;
  status: string;
  created_at: string;
  items: {
    material: { name: string };
    quantity: number;
    unit: string;
  }[];
};

// ✅ Column definitions
export const columns: ColumnDef<EvaluatedRequest>[] = [
  {
    header: "Request ID",
    accessorKey: "id",
    cell: ({ row }) => <span className="font-mono">MR-{row.original.id}</span>,
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
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.department.replace(/_/g, " ").toUpperCase()}
      </Badge>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      const labelMap: Record<string, string> = {
        charged: "Charge Ticket Created",
        requisitioned: "Requisition Voucher Created",
        partially_fulfilled: "Partially Fulfilled",
        rejected: "Rejected",
        invalid: "Invalid",
      };
      const variantMap: Record<string, "info" | "warning" | "destructive" | "secondary"> = {
        charged: "info",
        requisitioned: "info",
        partially_fulfilled: "warning",
        rejected: "destructive",
        invalid: "destructive",
      };
      return (
        <Badge variant={variantMap[status] || "secondary"}>
          {labelMap[status] || status}
        </Badge>
      );
    },
  },
  {
    header: "Materials",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">View</Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <ul className="text-sm space-y-1 py-2">
            {row.original.items.map((item, index) => (
              <li key={index} className="list-disc list-inside">
                {item.material.name} – {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
];
