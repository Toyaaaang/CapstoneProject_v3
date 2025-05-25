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
    cell: ({ row }) => {
      const supplier = row.original.supplier;
      return (
        <span className="font-semibold">
          {supplier
            ? supplier.charAt(0).toUpperCase() + supplier.slice(1)
            : <span className="italic text-muted-foreground">N/A</span>}
        </span>
      );
    },
  },
  {
    header: "Delivered At",
    accessorFn: (row) => {
      const firstDelivery = row.deliveries?.[0];
      return firstDelivery
        ? new Date(firstDelivery.delivery_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A";
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge>
        {row.original.status
          ? row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)
          : ""}
      </Badge>
    ),
  },
  {
    header: "Details",
    cell: ({ row }) => {
      const deliveries = row.original.deliveries || [];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">View Deliveries</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[28rem]">
            {deliveries.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                <div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-1 px-1">
                  <span>Material</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-right">Status</span>
                </div>
                {deliveries.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                  >
                    <div className="font-medium truncate">
                      {d.material_name || d.custom_name || "Custom Item"}
                    </div>
                    <div className="text-center text-muted-foreground">
                      {d.delivered_quantity}
                    </div>
                    <div className="text-right">
                      <span
                        className={
                          d.delivery_status === "delivered"
                            ? "text-green-600 font-semibold"
                            : d.delivery_status === "pending"
                            ? "text-yellow-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {d.delivery_status
                          ? d.delivery_status.charAt(0).toUpperCase() + d.delivery_status.slice(1)
                          : ""}
                      </span>
                    </div>
                    {d.remarks && (
                      <div className="col-span-3 italic text-muted-foreground mt-1">
                        Remarks: {d.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-xs text-center py-4">No deliveries</div>
            )}
          </PopoverContent>
        </Popover>
      );
    },
  },
];
