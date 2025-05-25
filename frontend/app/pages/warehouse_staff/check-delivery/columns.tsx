import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import ValidateDeliveryDialog from "@/components/dialogs/DeliveryDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
    header: "Total",
    accessorKey: "grand_total",
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-green-700 dark:text-green-400">
        ₱{parseFloat(row.original.grand_total).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              View Items
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-64 overflow-y-auto">
            {items.length > 0 ? (
              <div>
                <div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
                  <span>Material</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-right">Unit</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                    >
                      <div className="font-medium truncate">
                        {item.material?.name || (
                          <span className="italic text-muted-foreground">
                            {item.custom_name || "Custom Item"}
                          </span>
                        )}
                      </div>
                      <div className="text-center text-muted-foreground">
                        {item.quantity}
                      </div>
                      <div className="text-right text-muted-foreground">
                        {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-xs">No items</div>
            )}
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    header: "Action",
    cell: ({ row, table }) => (
      <ValidateDeliveryDialog
        po={row.original}
        refreshData={() => table.options.meta?.refreshData?.()}
      />
    ),
  },
];
