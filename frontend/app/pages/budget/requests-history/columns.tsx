import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type RVApprovalRecord = {
  id: number;
  rv_no: string;
  department: string;
  requested_by: string;
  decision: "approved" | "rejected";
  decided_at: string;
  items: {
    material_name: string;
    unit: string;
    quantity: number;
  }[];
};

export const columns: ColumnDef<RVApprovalRecord>[] = [
  {
    header: "RV No.",
    accessorKey: "rv_no",
    cell: ({ row }) => <span className="font-mono">{row.original.rv_no}</span>,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Requested By",
    accessorKey: "requested_by",
  },
  {
    header: "Decision",
    accessorKey: "decision",
    cell: ({ row }) => {
      const decision = row.original.decision;
      const variant = decision === "approved" ? "success" : "destructive";
      return <Badge variant={variant}>{decision.charAt(0).toUpperCase() + decision.slice(1)}</Badge>;
    },
  },
  {
    header: "Date Decided",
    accessorKey: "decided_at",
    cell: ({ row }) => {
      const date = new Date(row.original.decided_at);
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
];
