import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type DeliveryItem = {
    id: number;
    po_no: string;
    delivery_date: string;
    material_name: string;
    unit: string;
    quantity_delivered: number;
    department: "engineering" | "operations_maintainance";
    status: "pending" | "approved" | "rejected" | "certified";
  };
  

export const columns: ColumnDef<DeliveryItem>[] = [
  {
    header: "PO No.",
    accessorKey: "po_no",
    cell: ({ row }) => <span className="font-mono">{row.original.po_no}</span>,
  },
  {
    header: "Material",
    accessorKey: "material_name",
  },
  {
    header: "Qty",
    accessorKey: "quantity_delivered",
    cell: ({ row }) => `${row.original.quantity_delivered} ${row.original.unit}`,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      const map: Record<string, string> = {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        certified: "Certified",
      };
      const variantMap: Record<string, string> = {
        pending: "warning",
        approved: "success",
        rejected: "destructive",
        certified: "info",
      };
      return <Badge variant={variantMap[status]}>{map[status]}</Badge>;
    },
  },
  {
    header: "Actions",
    cell: ({ row, table }) => {
      const id = row.original.id;
      const handleAction = async (action: "approve" | "reject" | "certify") => {
        try {
          await fetch(`/quality-compliance/${id}/${action}/`, { method: "POST" });
          table.options.meta?.refreshData?.();
        } catch (err) {
          console.error(`Failed to ${action} item ${id}`, err);
        }
      };

      return (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleAction("approve")}>Approve</Button>
          <Button size="sm" variant="destructive" onClick={() => handleAction("reject")}>
            Reject
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleAction("certify")}>
            Certify
          </Button>
        </div>
      );
    },
  },
];
