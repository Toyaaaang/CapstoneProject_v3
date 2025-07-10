import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import ValidateDeliveryDialog from "@/components/dialogs/DeliveryDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export const columns: ColumnDef<any>[] = [
  {
    header: "PO No.",
    accessorKey: "po_number",
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.po_number || (
          <span className="italic text-muted-foreground">N/A</span>
        )}
      </span>
    ),
  },
  {
    header: "Supplier",
    accessorKey: "supplier_name",
    cell: ({ row }) => {
      const supplierName = row.original.supplier_name;
      return supplierName
        ? <span className="font-semibold">{supplierName.charAt(0).toUpperCase() + supplierName.slice(1)}</span>
        : <span className="italic text-muted-foreground">N/A</span>;
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      let color: "default" | "secondary" | "destructive" | "outline";
      if (status === "pending") color = "secondary";
      else if (status === "rejected" || status === "cancelled") color = "destructive";
      else if (status === "delivered" || status === "completed") color = "default";
      else color = "outline";
      return (
        <Badge variant={color} className="capitalize">
          {status
            ? status.replace(/_/g, " ")
            : <span className="italic text-muted-foreground">N/A</span>}
        </Badge>
      );
    },
  },
  {
    header: "Date Created",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = row.original.created_at ? new Date(row.original.created_at) : null;
      return (
        <span className="text-xs">
          {date ? date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : "—"}
        </span>
      );
    },
  },
  {
    header: "Total",
    accessorKey: "grand_total",
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-grey-800 dark:text-grey-400">
        {row.original.grand_total
          ? `₱${parseFloat(row.original.grand_total).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`
          : <span className="italic text-muted-foreground">N/A</span>
        }
      </span>
    ),
    meta: { align: "right" },
  },
  {
    header: "Items",
    cell: ({ row }) => {
      const router = useRouter();
      const items = row.original.items || [];
      const showItems = items.slice(0, 5);
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
                  {showItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                    >
                      <div className="font-medium truncate">
                        {item.material?.name ||
                          <span className="italic text-muted-foreground">
                            {item.custom_name || "Custom Item"}
                          </span>
                        }
                      </div>
                      <div className="text-center text-muted-foreground">
                        {parseFloat(item.quantity).toLocaleString("en-PH", { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-right text-muted-foreground">
                        {item.unit || item.custom_unit || "—"}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600"
                    onClick={() => {
                      router.push(`/pages/warehouse_staff/check-delivery/${row.original.id}/items`);
                    }}
                  >
                    See full details
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-muted-foreground text-xs mb-2">No items</div>
                <div className="flex justify-center mt-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600 w-full"
                    onClick={() => {
                      router.push(`/warehouse_staff/check-delivery/${row.original.id}/items`);
                    }}
                  >
                    See full details
                  </Button>
                </div>
              </div>
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
