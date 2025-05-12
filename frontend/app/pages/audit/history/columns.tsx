import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type AuditorApprovalRecord = {
    id: number;
    type: "certification" | "purchase_order" | "purchase_return";
    reference_no: string;
    department: string;
    reviewed_by: string;
    decision: "approved" | "rejected";
    reviewed_at: string;
    items: {
      material_name: string;
      quantity: number;
      unit: string;
    }[];
  };
  
export const columns: ColumnDef<AuditorApprovalRecord>[] = [
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => {
      const label =
        row.original.type === "certification"
          ? "Certification"
          : row.original.type === "purchase_order"
          ? "Purchase Order"
          : "Purchase Return";

      return <Badge variant="secondary">{label}</Badge>;
    },
  },
  {
    header: "Reference No.",
    accessorKey: "reference_no",
    cell: ({ row }) => <span className="font-mono">{row.original.reference_no}</span>,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Decision",
    accessorKey: "decision",
    cell: ({ row }) => (
      <Badge variant={row.original.decision === "approved" ? "success" : "destructive"}>
        {row.original.decision.charAt(0).toUpperCase() + row.original.decision.slice(1)}
      </Badge>
    ),
  },
  {
    header: "Date Reviewed",
    accessorKey: "reviewed_at",
    cell: ({ row }) => {
      const date = new Date(row.original.reviewed_at);
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
