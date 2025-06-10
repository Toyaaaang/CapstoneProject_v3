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
import { useRouter } from "next/navigation";

// Extend TableMeta to include refreshData
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    refreshData?: () => void;
  }
}

// Helper to fetch estimates for a PO's items
async function fetchEstimates(items: any[]) {
  if (!items?.length) return {};
  const res = await axios.post("/requests/purchase-orders/estimate/", {
    items: items
      .filter((item: any) => item.material?.id)
      .map((item: any) => ({
        material_id: item.material.id,
        unit: item.unit,
      })),
  });
  return res.data;
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
      // Prefer supplier_name if available
      const name = row.original.supplier_name;
      if (name) {
        return (
          <span className="font-semibold">
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </span>
        );
      }
      // Fallback: show N/A if supplier is just an ID
      return (
        <span className="italic text-gray-800 dark:text-gray-400">N/A</span>
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
    id: "estimatedAmount",
    header: (
      <>
        Estimated Amount
        <br />
        <span className="text-xs text-gray-800 dark:text-gray-400">(Historical Avg + VAT)</span>
      </>
    ) as any,
    cell: ({ row }) => {
      const [estimate, setEstimate] = React.useState<number | null>(null);

      React.useEffect(() => {
        let mounted = true;
        fetchEstimates(row.original.items).then((estimates) => {
          if (!mounted) return;
          let total = 0;
          row.original.items.forEach((item: any) => {
            const est = estimates[item.material?.id];
            if (est && est.average) {
              total += est.average * item.quantity;
            }
          });
          setEstimate(total || null);
        });
        return () => { mounted = false; };
      }, [row.original.items]);

      // Include VAT in estimate
      const vatRate = parseFloat(row.original.vat_rate) || 0;
      const estimateWithVat = estimate !== null ? estimate * (1 + vatRate / 100) : null;

      return estimateWithVat !== null
        ? <span className="font-mono text-blue-700 dark:text-blue-400">₱{estimateWithVat.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
        : <span className="italic text-gray-800 dark:text-gray-400">No estimate</span>;
    },
    meta: { align: "right" },
  },
  {
    header: "Actual Amount",
    accessorKey: "grand_total",
    cell: ({ row }) => (
      <span className="font-mono font-semibold">
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
    id: "variance",
    header: (
      <>
        Variance
        <br />
        <span className="text-xs text-gray-800 dark:text-gray-400">(Actual - Estimate)</span>
      </>
    ) as any,
    cell: ({ row }) => {
      const [estimate, setEstimate] = React.useState<number | null>(null);

      React.useEffect(() => {
        let mounted = true;
        fetchEstimates(row.original.items).then((estimates) => {
          if (!mounted) return;
          let total = 0;
          row.original.items.forEach((item: any) => {
            const est = estimates[item.material?.id];
            if (est && est.average) {
              total += est.average * item.quantity;
            }
          });
          setEstimate(total || null);
        });
        return () => { mounted = false; };
      }, [row.original.items]);

      const actual = parseFloat(row.original.grand_total);
      const vatRate = parseFloat(row.original.vat_rate) || 0;
      const estimateWithVat = estimate !== null ? estimate * (1 + vatRate / 100) : null;

      return estimateWithVat !== null
        ? (
          <span className={`font-mono ${actual - estimateWithVat > 0 ? "text-red-600" : "text-green-800"}`}>
            ₱{(actual - estimateWithVat).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>
        )
        : <span className="italic text-gray-800 dark:text-gray-400">N/A</span>
    },
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
      const router = useRouter();

      // Show only first 5 items
      const previewItems = items.slice(0, 5);
      const hasMore = items.length > 5;

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
              {previewItems.map((item: any, i: number) => (
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
            <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs text-blue-700 dark:text-blue-400 flex justify-center w-full"
                onClick={() => {
                  setOpen(false);
                  router.push(`/pages/audit/purchase-orders/${row.original.id}/items`);
                }}
              >
                Show Full Details
            </Button>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    header: () => (
      <div className=" w-full pr-2">Actions</div>
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
        <div className="flex gap-2">
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
