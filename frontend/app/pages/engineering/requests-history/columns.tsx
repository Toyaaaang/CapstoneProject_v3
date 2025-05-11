import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type RVRequest = {
  id: number;
  purpose: string;
  status: string;
  created_at: string;
  items: {
    material: { name: string };
    quantity: number;
    unit: string;
    remarks?: string;
  }[];
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const columns: ColumnDef<RVRequest>[] = [
  {
    header: "RV ID",
    accessorKey: "id",
    cell: ({ row }) => <span className="font-mono">RV-{row.original.id}</span>,
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
      const map: Record<string, string> = {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
      };
      const variantMap: Record<string, string> = {
        pending: "warning",
        approved: "success",
        rejected: "destructive",
      };
      return (
        <Badge variant={variantMap[status] || "secondary"}>
          {map[status] || status}
        </Badge>
      );
    },
  },
  {
    header: "Date Created",
    accessorKey: "created_at",
    cell: ({ row }) => <span>{formatDate(row.original.created_at)}</span>,
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
                {item.remarks && <div className="text-xs text-muted-foreground">Remarks: {item.remarks}</div>}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
];
