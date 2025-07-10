import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type ReceivingReport = {
    id: number;
    po_no: string;
    material_name: string;
    unit: string;
    quantity_certified: number;
    department: "engineering" | "operations_maintainance";
    certification_date: string;
  };
  

export const columns: ColumnDef<ReceivingReport>[] = [
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
    header: "Quantity",
    cell: ({ row }) => `${row.original.quantity_certified} ${row.original.unit}`,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Date Certified",
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
    header: "Status",
    cell: () => <Badge variant="info">Received</Badge>,
  },
];
