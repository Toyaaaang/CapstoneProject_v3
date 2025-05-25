import { ColumnDef } from "@tanstack/react-table";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DeliveryRecord {
  id: number;
  material: number | null;
  custom_name: string | null;
  custom_unit: string | null;
  delivered_quantity: string;
  delivery_status: string;
  delivery_date: string;
  remarks: string;
  po_item: number;

  purchase_order: number;
  purchase_order_details: {
    id: number;
    po_number: string;
  };

  material_details: {
    id?: number;
    name: string;
    unit: string;
  };

  material_name: string;
}

export const columns: ColumnDef<DeliveryRecord>[] = [
  {
    header: "PO Number",
    accessorKey: "purchase_order_details.po_number",
  },
  {
    header: "Material",
    accessorKey: "material_name",
    cell: ({ row }) => row.original.material_name || "Custom Item",
  },
  {
    header: "Delivered Qty",
    accessorKey: "delivered_quantity",
    cell: ({ row }) => {
      const qty = Number(row.original.delivered_quantity);
      return isNaN(qty)
        ? "N/A"
        : qty.toLocaleString(undefined, { maximumFractionDigits: 2 });
    },
  },
  {
    header: "Unit",
    cell: ({ row }) => {
      const unit = row.original.custom_unit || row.original.material_details.unit;
      return unit || "—";
    },
  },
  {
    header: "Status",
    accessorKey: "delivery_status",
    cell: ({ row }) =>
      row.original.delivery_status.charAt(0).toUpperCase() +
      row.original.delivery_status.slice(1),
  },
  {
    header: "Remarks",
    accessorKey: "remarks",
    cell: ({ row }) =>
      row.original.remarks ? row.original.remarks : <span className="italic text-muted-foreground">None</span>,
  },
  {
    header: "Delivery Date",
    accessorKey: "delivery_date",
    cell: ({ row }) => {
      const date = row.original.delivery_date
        ? new Date(row.original.delivery_date)
        : null;
      return date
        ? date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A";
    },
  },
  {
    header: "Action",
    cell: ({ row, table }) => {
      const delivery = row.original;

      const handleCreateReport = async () => {
        const payload = {
          purchase_order_id: delivery.purchase_order_details.id,
          delivery_record: delivery.id,
          items: [
            {
              po_item_id: delivery.po_item,
              material: delivery.material || null,
              quantity: parseFloat(delivery.delivered_quantity),
              unit: delivery.custom_unit || delivery.material_details.unit || "-",
              remarks: delivery.remarks || "",
              custom_name: delivery.custom_name || "",
              custom_unit: delivery.custom_unit || "",
            },
          ],
        };

        try {
          await axios.post("/requests/receiving-reports/", payload);
          toast.success("Receiving Report created!");
          table.options.meta?.refreshData?.();
        } catch (err) {
          toast.error("Failed to create report.");
          console.error(err);
        }
      };

      return (
        <Button size="sm" onClick={handleCreateReport}>
          Create Report
        </Button>
      );
    },
  },
];
