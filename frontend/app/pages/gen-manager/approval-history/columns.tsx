import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export type GMApprovalRecord = {
    id: number;
    type: "po" | "rv" | "charge";
    reference_no: string;
    department: string;
    requested_by: string;
    decision: "approved" | "rejected";
    decided_at: string;
    items: {
      material_name: string;
      unit: string;
      quantity: number;
      unit_price?: number;
      total_price?: number;
    }[];
  };
  
export const columns: ColumnDef<GMApprovalRecord>[] = [
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => {
      const label =
        row.original.type === "po"
          ? "Purchase Order"
          : row.original.type === "rv"
          ? "Requisition Voucher"
          : "Charge Request";

      return <Badge variant="secondary">{label}</Badge>;
    },
  },
  {
    header: "Reference No.",
    accessorKey: "reference_no",
    cell: ({ row }) => (
      <span className="font-mono">{row.original.reference_no}</span>
    ),
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
    cell: ({ row }) => (
      <Badge variant={row.original.decision === "approved" ? "success" : "destructive"}>
        {row.original.decision.charAt(0).toUpperCase() + row.original.decision.slice(1)}
      </Badge>
    ),
  },
  {
    header: "Date",
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
        <PopoverContent className="w-[400px]">
          <ul className="text-sm space-y-2 py-2">
            {row.original.items.map((item, i) => (
              <li key={i}>
                <div className="font-medium">{item.material_name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.quantity} {item.unit}
                  {item.unit_price !== undefined && (
                    <>
                      <br />
                      Unit Price: ₱{item.unit_price.toFixed(2)}
                      <br />
                      Total: ₱{item.total_price?.toFixed(2)}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
];
