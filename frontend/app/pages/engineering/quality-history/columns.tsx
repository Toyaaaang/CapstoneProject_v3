import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type QualityCheckRecord = {
    id: number;
    po_no: string;
    material_name: string;
    unit: string;
    quantity_delivered: number;
    department: "engineering" | "operations_maintainance";
    status: "approved" | "rejected" | "certified";
    date_checked: string;
    remarks?: string;
  };
  

export const columns: ColumnDef<QualityCheckRecord>[] = [


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
        approved: "Approved",
        rejected: "Rejected",
        certified: "Certified",
      };
      const variantMap: Record<string, string> = {
        approved: "success",
        rejected: "destructive",
        certified: "info",
      };
      return <Badge variant={variantMap[status]}>{map[status]}</Badge>;
    },
  },
  {
    header: "Date Checked",
    accessorKey: "date_checked",
    cell: ({ row }) => {
      const date = new Date(row.original.date_checked);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Remarks",
    accessorKey: "remarks",
    cell: ({ row }) =>
      row.original.remarks ? (
        <span className="text-muted-foreground">{row.original.remarks}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];
