import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { RejectPODialog } from "@/components/dialogs/RejectPODialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";

// Extend TableMeta to include refreshData
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    refreshData?: () => void;
  }
}

export const columns: ColumnDef<any>[] = [
  {
    header: "PO No.",
    accessorKey: "po_number",
    cell: ({ getValue }) => (
      <span className="font-mono">{getValue()}</span>
    ),
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
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = row.original.created_at ? new Date(row.original.created_at) : null;
      return (
        <span className="whitespace-nowrap">
          {date
            ? date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : ""}
        </span>
      );
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
    header: "Total",
    accessorKey: "grand_total",
    cell: ({ row }) => (
      <span className="font-mono font-semibold text-green-700 dark:text-green-400">
        ₱
        {parseFloat(row.original.grand_total).toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
    meta: { align: "right" },
  },
  {
    header: "Review",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const vatRate = parseFloat(row.original.vat_rate) || 0;
      const vatAmount = parseFloat(row.original.vat_amount) || 0;
      const grandTotal = parseFloat(row.original.grand_total) || 0;
      const subtotal = grandTotal - vatAmount;

      const [open, setOpen] = React.useState(false);

      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">View Details</Button>
          </PopoverTrigger>
          <PopoverContent className="w-[32rem]">
            <div className="grid grid-cols-4 gap-2 font-semibold text-xs mb-2 px-1">
              <span>Material</span>
              <span className="text-center">Qty</span>
              <span className="text-center">Unit Price</span>
              <span className="text-right">Total</span>
            </div>
            <div className="max-h-56 overflow-auto flex flex-col gap-2 pr-1">
              {items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                >
                  <div className="font-medium truncate">
                    {item.material?.name || item.custom_name || "Unknown Item"}
                  </div>
                  <div className="text-center text-muted-foreground">
                    {item.quantity}
                  </div>
                  <div className="text-center text-muted-foreground">
                    ₱{parseFloat(item.unit_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-right font-semibold">
                    ₱{parseFloat(item.total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right mt-4 space-y-1 text-sm">
              <div>Subtotal: ₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
              <div>VAT ({vatRate}%): ₱{vatAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
              <div className="font-bold">Grand Total: ₱{grandTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    header: () => (
      <div className="text-right w-full pr-2">Action</div>
    ),
    id: "actions",
    cell: ({ row, table }) => {
      const [loading, setLoading] = React.useState(false);
      const [popoverOpen, setPopoverOpen] = React.useState(false);

      const handleRecommend = async () => {
        setLoading(true);
        try {
          await axios.patch(`/requests/purchase-orders/${row.original.id}/recommend/`);
          toast.success("PO recommended.");
          setPopoverOpen(false);
          setTimeout(() => {
            table.options.meta?.refreshData?.();
          }, 200);
        } catch {
          toast.error("Failed to recommend PO.");
        } finally {
          setLoading(false);
        }
      };

      return (
        <div className="flex gap-2 justify-end">
          <ConfirmActionDialog
            trigger={
              <Button size="sm" disabled={loading}>
                Recommend
              </Button>
            }
            title="Recommend Purchase Order?"
            description="Do you want to continue with this action? This cannot be undone."
            confirmLabel="Recommend"
            cancelLabel="Cancel"
            onConfirm={handleRecommend}
            loading={loading}
          />
          <RejectPODialog
            poId={row.original.id}
            refreshData={() => {
              setPopoverOpen(false);
              table.options.meta?.refreshData?.();
            }}
          />
        </div>
      );
    },
    meta: { align: "right" },
  },
];
