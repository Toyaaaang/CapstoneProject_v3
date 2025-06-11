import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import DrawerTable from "@/components/dialogs/DrawerTable";

export const columns: ColumnDef<any>[] = [
  {
    header: "PO No.",
    accessorKey: "po_number",
  },
  {
    header: "Supplier",
    accessorKey: "supplier_name",
    cell: ({ row }) => {
      const supplier = row.original.supplier_name;
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
      const items = row.original.items || [];

      // Define columns for the drawer table (reuse or customize as needed)
      const drawerColumns = [
        { header: "Material", accessorKey: "material_name" },
        { header: "Ordered", accessorKey: "ordered_quantity" },
        { header: "Delivered", accessorKey: "delivered_quantity" },
        { header: "Status", accessorKey: "delivery_status" },
        { header: "Remarks", accessorKey: "remarks" },
      ];

      // Prepare data for the drawer table
      const drawerData = deliveries.map((d: any) => {
        const item = items.find(
          (it: any) =>
            (d.po_item && it.id === d.po_item) ||
            (d.material && it.material?.id === d.material) ||
            (d.custom_name && it.custom_name === d.custom_name)
        );
        return {
          ...d,
          ordered_quantity: item ? item.quantity : "—",
        };
      });

      // Preview deliveries - show only the first 5 deliveries
      const previewDeliveries = deliveries.slice(0, 5);

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">View Deliveries</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[32rem]">
            {deliveries.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                <div className="grid grid-cols-4 gap-2 font-semibold text-xs mb-1 px-1">
                  <span>Material</span>
                  <span className="text-center">Ordered</span>
                  <span className="text-center">Delivered</span>
                  <span className="text-right">Status</span>
                </div>
                {previewDeliveries.map((d: any, i: number) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                  >
                    <div className="font-medium truncate">
                      {d.material_name || d.custom_name || "Custom Item"}
                    </div>
                    <div className="text-center text-muted-foreground">
                      {d.ordered_quantity}
                    </div>
                    <div className="text-center text-muted-foreground">
                      {d.delivered_quantity}
                    </div>
                    <div className="text-right">
                      <span
                        className={
                          d.delivery_status === "complete"
                            ? "text-green-600 font-semibold"
                            : d.delivery_status === "partial"
                            ? "text-yellow-600 font-semibold"
                            : d.delivery_status === "shortage"
                            ? "text-red-600 font-semibold"
                            : d.delivery_status === "over"
                            ? "text-blue-600 font-semibold"
                            : "font-semibold"
                        }
                      >
                        {d.delivery_status
                          ? d.delivery_status.charAt(0).toUpperCase() + d.delivery_status.slice(1)
                          : ""}
                      </span>
                    </div>
                    {d.remarks && (
                      <div className="col-span-4 italic text-muted-foreground mt-1">
                        Remarks: {d.remarks}
                      </div>
                    )}
                  </div>
                ))}
                {/* Centered Full Details button */}
                <div className="flex justify-center pt-2">
                  <DrawerTable
                    triggerLabel="Full Details"
                    title={`Full Details for ${row.original.po_number}`}
                    columns={drawerColumns}
                    data={drawerData}
                  />
                </div>
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
