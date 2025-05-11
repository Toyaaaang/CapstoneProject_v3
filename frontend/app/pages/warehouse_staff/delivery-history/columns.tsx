import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type ValidatedDelivery = {
    id: number;
    po_no: string;
    delivery_date: string;
    supplier: string;
    department: string;
    items: {
      material_name: string;
      unit: string;
      ordered_quantity: number;
      delivered_quantity: number;
      status: "complete" | "partial" | "shortage";
      remarks?: string;
    }[];
  };
  
export const columns: ColumnDef<ValidatedDelivery>[] = [
  {
    header: "PO No.",
    accessorKey: "po_no",
    cell: ({ row }) => <span className="font-mono">{row.original.po_no}</span>,
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
    header: "Delivery Date",
    accessorKey: "delivery_date",
    cell: ({ row }) => {
      const date = new Date(row.original.delivery_date);
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
            View
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <ul className="text-sm space-y-2 py-2">
            {row.original.items.map((item, i) => (
              <li key={i} className="border-b pb-2">
                <div>
                  <strong>{item.material_name}</strong> – {item.delivered_quantity} / {item.ordered_quantity} {item.unit}
                </div>
                <div className="text-xs text-muted-foreground">Status: <Badge variant={
                  item.status === "complete" ? "success" :
                  item.status === "partial" ? "warning" : "destructive"
                }>{item.status}</Badge></div>
                {item.remarks && <div className="text-xs italic text-muted-foreground">Remarks: {item.remarks}</div>}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
];
