import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<any>[] = [
  {
    header: "PO No.",
    accessorKey: "po_number",
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
  },
  {
    header: "Delivered At",
    accessorFn: (row) => {
      const firstDelivery = row.deliveries?.[0];
      return firstDelivery ? new Date(firstDelivery.delivery_date).toLocaleDateString() : "N/A";
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
  {
    header: "Details",
    cell: ({ row }) => {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">View Delivery</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[30rem]">
            <div className="text-sm font-semibold mb-2">Delivered Items:</div>
            <div className="space-y-2 max-h-64 overflow-auto pr-1">
              {row.original.deliveries?.map((d: any, i: number) => (
                <div key={i} className="border rounded-md p-2 text-sm space-y-1">
                  <div className="font-medium">{d.material}</div>
                  <div className="text-muted-foreground">
                    {d.delivered_quantity} × {d.delivery_status}
                  </div>
                  {d.remarks && (
                    <div className="text-xs italic">Remarks: {d.remarks}</div>
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
];
