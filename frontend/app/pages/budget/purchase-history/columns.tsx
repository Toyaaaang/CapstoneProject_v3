import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type POAndPRHistoryRecord = {
  id: number;
  type: "po" | "purchase_return";
  reference_no: string;
  supplier: string;
  department: string;
  created_by: string;
  created_at: string;
  status?: "approved" | "rejected"; // only for returns
  items: {
    material_name: string;
    unit: string;
    quantity: number;
  }[];
};

export const columns: ColumnDef<POAndPRHistoryRecord>[] = [
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "po" ? "secondary" : "outline"}>
        {row.original.type === "po" ? "Purchase Order" : "Purchase Return"}
      </Badge>
    ),
  },
  {
    header: "Reference No.",
    accessorKey: "reference_no",
    cell: ({ row }) => (
      <span className="font-mono">{row.original.reference_no}</span>
    ),
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Created By",
    accessorKey: "created_by",
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
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) =>
      row.original.type === "purchase_return" ? (
        <Badge
          variant={
            row.original.status === "approved"
              ? "success"
              : "destructive"
          }
        >
          {row.original.status?.charAt(0).toUpperCase() +
            row.original.status?.slice(1)}
        </Badge>
      ) : null,
  },
  {
    header: "Items",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            View
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
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
];
