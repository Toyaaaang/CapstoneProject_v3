import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type FinanceRequestRecord = {
    id: number;
    requester: string;
    purpose: string;
    department: string;
    status: string;
    created_at: string;
    items: {
      material: { name: string };
      quantity: number;
      unit: string;
    }[];
  };
  

export const columns: ColumnDef<FinanceRequestRecord>[] = [
  {
    header: "Request ID",
    accessorKey: "id",
    cell: ({ row }) => <span className="font-mono">REQ-{row.original.id}</span>,
  },
  {
    header: "Requested By",
    accessorKey: "requester",
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      const labelMap: Record<string, string> = {
        charged: "Issued",
        rejected: "Rejected",
        fulfilled: "Fulfilled",
        partially_fulfilled: "Partially Fulfilled",
      };
      const variantMap: Record<string, string> = {
        charged: "success",
        fulfilled: "success",
        partially_fulfilled: "warning",
        rejected: "destructive",
      };
      return (
        <Badge variant={variantMap[status] || "secondary"}>
          {labelMap[status] || status}
        </Badge>
      );
    },
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
    header: "Items",
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
