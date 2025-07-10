"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CertifiableBatch } from "@/hooks/shared/useCertificationsToCreate";
import { startCertification } from "@/hooks/shared/useStartCertification";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useState } from "react";
import DrawerTable from "@/components/dialogs/DrawerTable"; // adjust import as needed

const remarksOptions = [
  "Compliant",
  "With Defect",
  "For Replacement",
  "Others"
];

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
      const batchId = row.original.purchase_order_id;

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
      const [drawerOpen, setDrawerOpen] = useState(false);
      const [itemRemarks, setItemRemarks] = useState(
        (batch.items || []).map(item => ({
          id: item.id,
          remarks: item.remarks || ""
        }))
      );
      const [confirmOpen, setConfirmOpen] = useState(false);

      const handleRemarkChange = (id, value) => {
        setItemRemarks(prev =>
          prev.map(r => (r.id === id ? { ...r, remarks: value } : r))
        );
      };

      // Called when user clicks "Start Signatory Process" in the drawer
      const handleStartSignatory = () => {
        setConfirmOpen(true);
      };

      // Called when user confirms in the dialog
      const handleConfirm = async () => {
        try {
          const deliveryRecordId = batch.items?.[0]?.delivery_record_id;
          if (!deliveryRecordId) {
            toast.error("No delivery record ID found.");
            return;
          }
          // Send itemRemarks to backend here!
          await startCertification(deliveryRecordId, itemRemarks.map(r => ({
            id: r.id,
            remarks: r.remarks
          })));
          toast.success("Certification started successfully");
          table.options.meta?.refreshData?.();
        } catch (err: any) {
          console.error(err);
          toast.error("Failed to start certification");
        }
        setConfirmOpen(false);
        setDrawerOpen(false);
      };

      // Drawer columns
      const drawerColumns = [
        { header: "Material", accessorKey: "material_name" },
        { header: "Quantity", accessorKey: "quantity" },
        { header: "Unit", accessorKey: "unit" },
        {
          header: "Remarks",
          cell: ({ row }) => (
            <select
              className="border rounded px-2 py-1 text-xs"
              value={itemRemarks.find(r => r.id === row.original.id)?.remarks || ""}
              onChange={e => handleRemarkChange(row.original.id, e.target.value)}
            >
              <option value="">Select</option>
              {remarksOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ),
        },
      ];

      return (
        <>
          <DrawerTable
            title="Set Remarks for Certificate Items"
            columns={drawerColumns}
            data={batch.items}
            triggerLabel="Start Certification"
          >
            <ConfirmActionDialog
              trigger={
                <Button
                  disabled={itemRemarks.some(r => !r.remarks)}
                  className="w-full mt-4"
                >
                  Start Signatory Process
                </Button>
              }
              title="Start Certification?"
              description="Do you want to continue with this action? This cannot be undone."
              confirmLabel="Start"
              cancelLabel="Cancel"
              onConfirm={handleConfirm}
            />
          </DrawerTable>

        </>
      );
    },
  },
];

