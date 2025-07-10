import { ColumnDef } from "@tanstack/react-table";

export type DepartmentAccountabilityRecord = {
    id: number;
    material_name: string;
    unit: string;
    quantity: number;
    rv_no: string;
    department: string;
    date_added: string;
    remarks?: string;
  };
  
export const columns: ColumnDef<DepartmentAccountabilityRecord>[] = [
  {
    header: "Material",
    accessorKey: "material_name",
  },
  {
    header: "Unit",
    accessorKey: "unit",
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
  },
  {
    header: "RV No.",
    accessorKey: "rv_no",
    cell: ({ row }) => <span className="font-mono">{row.original.rv_no}</span>,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) =>
      row.original.department.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    header: "Date Added",
    accessorKey: "date_added",
    cell: ({ row }) => {
      const date = new Date(row.original.date_added);
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
