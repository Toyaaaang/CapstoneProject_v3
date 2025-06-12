// app/(your_path)/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PerformQCDialog from "@/components/dialogs/QCDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const columns: ColumnDef<any>[] = [
  {
    header: "PO Number",
    accessorKey: "po_number",
  },
  {
    header: "RV Number",
    accessorFn: (row) => row.requisition_voucher?.rv_number || "N/A",
    cell: ({ row }) => {
      const rvNumber = row.original.requisition_voucher?.rv_number;
      return (
        <span className="font-semibold">
          {rvNumber || <span className="italic text-muted-foreground">N/A</span>}
        </span>
      );
    },
  },
  {
    header: "Delivery Date",
    accessorFn: (row) => row.purchase_order?.delivery_date || "N/A",
    cell: ({ row }) => {
      const deliveryDate = row.original.purchase_order?.delivery_date;
      return deliveryDate ? (
        new Date(deliveryDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      ) : (
        <span className="italic text-muted-foreground">N/A</span>
      );
    },
  },
  {
    header: "Supplier",
    accessorFn: (row) =>
      row.supplier_name
        ? row.supplier_name.charAt(0).toUpperCase() + row.supplier_name.slice(1)
        : "N/A",
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
    header: "Department",
    accessorFn: (row) =>
      row.requisition_voucher?.department
        ? row.requisition_voucher.department.replace(/_/g, " ").toUpperCase()
        : "N/A",
    cell: ({ row }) => (
      <Badge>
        {row.original.requisition_voucher?.department
          ? row.original.requisition_voucher.department.replace(/_/g, " ").toUpperCase()
          : <span className="italic text-muted-foreground">N/A</span>}
      </Badge>
    ),
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) =>
      row.original.created_at
        ? new Date(row.original.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
  },
  {
    header: "Total",
    accessorKey: "grand_total",
    cell: ({ row }) =>
      <span className="font-mono font-semibold text-green-700 dark:text-green-400">
        ₱{parseFloat(row.original.grand_total).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>,
  },
  {
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const previewItems = items.slice(0, 5);
      const poId = row.original.id;

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
                  {previewItems.map((item: any, idx: number) => (
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
                {/* Always show Full details button */}
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => window.location.href = `/pages/engineering/quality-check/${poId}/items`}
                  >
                    Full details
                  </Button>
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
    header: "QC Action",
    cell: ({ row, table }) => (
      <PerformQCDialog
        po={row.original}
        refreshData={() => table.options.meta?.refreshData?.()}
      />
    ),
  },
];
