"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { CertifiableItem } from "@/hooks/shared/useCertificationsToCreate";
import { startCertification } from "@/hooks/shared/useStartCertification";
import { useRouter } from "next/navigation";

export const columns: ColumnDef<CertifiableItem>[] = [
  {
    header: "PO No.",
    accessorFn: (row) => row.quality_check.purchase_order.po_number,
  },
  {
    header: "RV No.",
    accessorFn: (row) => row.quality_check.requisition_voucher.rv_number,
  },
  {
    header: "Department",
    accessorFn: (row) => row.quality_check.requisition_voucher.department,
  },
  {
    header: "Material",
    accessorFn: (row) => row.po_item?.material?.name ?? "—",
  },
  {
    header: "Quantity",
    accessorFn: (row) => `${row.po_item.quantity} ${row.po_item.unit}`,
  },
  {
    header: "Delivery Date",
    accessorFn: (row) => row.quality_check.purchase_order.delivery_date,
  },
  {
    header: "Actions",
    cell: ({ table, row }) => {
      const item = row.original;
      const router = useRouter();

      // Group by delivery_record_id on the current page only
      const rows = table.getRowModel().rows;
      const currentDeliveryId = item.delivery_record_id;

      // Show "Start Certification" only for the first row with this delivery_record_id
      const isFirstForDelivery = rows.findIndex(
        (r) => r.original.delivery_record_id === currentDeliveryId
      ) === row.index;

      return (
        <div className="space-x-2">
          {isFirstForDelivery && (
            <Button
              size="sm"
              onClick={async () => {
                await startCertification(item.delivery_record_id);
                table.options.meta?.refreshData?.(); // Refresh table to hide it
              }}
            >
              Start Certification
            </Button>
          )}
        </div>
      );
    },
  },
];
