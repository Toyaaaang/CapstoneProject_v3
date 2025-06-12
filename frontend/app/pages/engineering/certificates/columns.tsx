"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CertifiableBatch } from "@/hooks/shared/useCertificationsToCreate";
import { startCertification } from "@/hooks/shared/useStartCertification";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";


export const columns: ColumnDef<CertifiableBatch>[] = [
  {
    header: "PO No.",
    accessorKey: "po_number",
    cell: ({ row }) => {
      const poNumber =
		row.original.items?.[0]?.quality_check?.purchase_order?.po_number ??
		row.original.po_number;

      return (
        <span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded">
			{poNumber || <span className="italic text-muted-foreground">N/A</span>}
        </span>
      );
    },
  },
  {
    header: "RV No.",
    accessorKey: "rv_number",
    cell: ({ row }) => {
      const rvNumber =
        row.original.items?.[0]?.quality_check?.requisition_voucher?.rv_number;

      return (
        <span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded">
			{rvNumber || <span className="italic text-muted-foreground">N/A</span>}
        </span>
      );
    },
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => {
      const department =
        row.original.items?.[0]?.quality_check?.requisition_voucher?.department ??
        row.original.department;

      return (
        <Badge>
			{department
				? department.replace(/_/g, " ").toUpperCase()
				: <span className="italic text-muted-foreground">N/A</span>}
        </Badge>
      );
    },
  },
  {
    header: "Items Needing Cert",
    cell: ({ row }) => {
      // Only items that require certification
      const items = Array.isArray(row.original.items)
        ? row.original.items.filter((i) => i.requires_certification)
        : [];
      const previewItems = items.slice(0, 5);
      const batchId = row.original.id;

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
                      key={item.id ?? idx}
                      className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                    >
                      <div className="font-medium truncate">
                        {item.po_item?.material?.name ||
                          item.po_item?.custom_name ||
                          <span className="italic text-muted-foreground">
                            Unnamed Item
                          </span>}
                      </div>
                      <div className="text-center text-muted-foreground">
                        {item.po_item?.quantity}
                      </div>
                      <div className="text-right text-muted-foreground">
                        {item.po_item?.unit}
                      </div>
                    </div>
                  ))}
                </div>
                {items.length > 5 && (
                  <div className="italic text-muted-foreground text-xs mt-2">
                    ...and {items.length - 5} more
                  </div>
                )}
                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() =>
                      window.location.href = `/pages/engineering/certificates/${batchId}/items`
                    }
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
    header: "Delivery Date",
    accessorKey: "delivery_date",
    cell: ({ row }) => {
      const date =
        row.original.items?.[0]?.quality_check?.purchase_order?.delivery_date ??
        row.original.items?.[0]?.delivery_date;

      return date ? (
        new Date(date).toLocaleDateString("en-US", {
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
    header: "Actions",
    cell: ({ row, table }) => {
      const batch = row.original;

      const handleStartCertification = async () => {
        try {
          await startCertification(batch.id);
          toast.success("Certification started successfully");
          table.options.meta?.refreshData?.();
        } catch (err: any) {
          console.error(err);
          toast.error("Failed to start certification");
        }
      };

      return (
        <ConfirmActionDialog
          trigger={
            <Button size="sm" variant="default">
              Start Certification
            </Button>
          }
          title="Start Certification?"
          description="Do you want to continue with this action? This cannot be undone."
          confirmLabel="Start"
          cancelLabel="Cancel"
          onConfirm={handleStartCertification}
        />
      );
    },
  },
];

