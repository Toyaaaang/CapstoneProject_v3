import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type EvaluatedRequest = {
    id: number;
    requester: string;
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
  
export const columns: ColumnDef<EvaluatedRequest>[] = [
  {
    header: "Request ID",
    accessorKey: "id",
    cell: ({ row }) => <span className="font-mono">MR-{row.original.id}</span>,
  },
  {
    header: "Requested By",
    accessorKey: "requester",
    cell: ({ row }) => <span>{row.original.requester}</span>,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.department.replace(/_/g, " ")}</Badge>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      const map: Record<string, string> = {
        charged: "Charge Ticket Created",
        requisitioned: "Requisition Voucher Created",
        partially_fulfilled: "Partially Fulfilled",
        rejected: "Rejected",
        invalid: "Invalid",
      };
      const variantMap: Record<string, string> = {
        charged: "info",
        requisitioned: "info",
        partially_fulfilled: "warning",
        rejected: "destructive",
        invalid: "destructive",
      };
      return (
        <Badge variant={variantMap[status] || "secondary"}>
          {map[status] || status}
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
            {row.original.items.map((item, i) => (
              <li key={i} className="list-disc list-inside">
                {item.material.name} – {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
];
