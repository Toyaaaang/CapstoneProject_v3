import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ReturnRecord = {
    id: number;
    type: "salvage" | "credit";
    mrt_no: string;
    returned_by: string;
    received_date: string;
    status: "approved" | "rejected";
    items: {
      material_name: string;
      unit: string;
      quantity: number;
    }[];
  };
  

export const columns: ColumnDef<ReturnRecord>[] = [
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "credit" ? "secondary" : "outline"}>
        {row.original.type.charAt(0).toUpperCase() + row.original.type.slice(1)}
      </Badge>
    ),
  },
  {
    header: "MRT No.",
    accessorKey: "mrt_no",
    cell: ({ row }) => <span className="font-mono">{row.original.mrt_no}</span>,
  },
  {
    header: "Returned By",
    accessorKey: "returned_by",
  },
  {
    header: "Date Received",
    accessorKey: "received_date",
    cell: ({ row }) => {
      const date = new Date(row.original.received_date);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant = status === "approved" ? "success" : "destructive";
      return <Badge variant={variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
          <ul className="text-sm space-y-2 py-2">
            {row.original.items.map((item, i) => (
              <li key={i} className="border-b pb-1">
                {item.material_name} – {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
];
