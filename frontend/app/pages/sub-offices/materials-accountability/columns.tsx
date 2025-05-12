import { ColumnDef } from "@tanstack/react-table";

export type AccountabilityRecord = {
  id: number;
  material_name: string;
  unit: string;
  quantity: number;
  mct_no: string;
  charged_date: string;
  remarks?: string;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const columns: ColumnDef<AccountabilityRecord>[] = [
  {
    header: "Material",
    accessorKey: "material_name",
    cell: ({ row }) => <span>{row.original.material_name}</span>,
  },
  {
    header: "Unit",
    accessorKey: "unit",
    cell: ({ row }) => <span>{row.original.unit}</span>,
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
    cell: ({ row }) => <span>{row.original.quantity}</span>,
  },
  {
    header: "MCT No.",
    accessorKey: "mct_no",
    cell: ({ row }) => <span className="font-mono">{row.original.mct_no}</span>,
  },
  {
    header: "Charged Date",
    accessorKey: "charged_date",
    cell: ({ row }) => <span>{formatDate(row.original.charged_date)}</span>,
  },
  {
    header: "Remarks",
    accessorKey: "remarks",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.remarks || "—"}</span>
    ),
  },
];
