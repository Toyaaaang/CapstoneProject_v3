import { ColumnDef } from "@tanstack/react-table";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DeliveryRecord {
  id: number;
  delivered_quantity: string; 
  delivery_date: string;

  purchase_order: {
    id: number;
    po_number: string;
  };

  material: {
    id?: number; 
    name: string;
    unit: string;
  };

  po_item: number;
}

export const columns: ColumnDef<DeliveryRecord>[] = [
  {
    header: "PO Number",
    accessorKey: "purchase_order.po_number",
  },
  {
    header: "Material",
    accessorKey: "material.name",
    cell: ({ row }) =>
      row.original.material?.name
        ? row.original.material.name.charAt(0).toUpperCase() + row.original.material.name.slice(1)
        : "N/A",
  },
  {
    header: "Delivered Quantity",
    accessorKey: "delivered_quantity",
    cell: ({ row }) => {
      // Show as integer, no decimals
      const qty = Number(row.original.delivered_quantity);
      return isNaN(qty) ? "N/A" : qty.toLocaleString(undefined, { maximumFractionDigits: 0 });
    },
  },
  {
    header: "Delivery Date",
    accessorKey: "delivery_date",
    cell: ({ row }) => {
      const date = row.original.delivery_date ? new Date(row.original.delivery_date) : null;
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
      try {
        const payload = {
          purchase_order_id: delivery.purchase_order.id,
          delivery_record: delivery.id,
          items: [
            {
              po_item_id: delivery.po_item,
              material: delivery.material.id,
              quantity: parseFloat(delivery.delivered_quantity),
              unit: delivery.material.unit,
              remarks: "",
            },
          ],
        
        };
        console.log("Payload being sent:", payload);
        await axios.post("/requests/receiving-reports/", payload);
         // ✅ corrected endpoint

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
}

];
