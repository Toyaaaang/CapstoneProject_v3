import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
export type CertificationRecord = {
    id: number;
    po_no: string;
    material_name: string;
    unit: string;
    quantity_delivered: number;
    department: "engineering" | "operations_maintainance";
    certified_by: string;
    certification_date: string;
    remarks?: string;
  };
  

export const columns: ColumnDef<CertificationRecord>[] = [
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
    header: "Certified By",
    accessorKey: "certified_by",
  },
  {
    header: "Date",
    accessorKey: "certification_date",
    cell: ({ row }) => {
      const date = new Date(row.original.certification_date);
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
  {
    header: "Status",
    cell: () => <Badge variant="info">Certified</Badge>,
  },
];
