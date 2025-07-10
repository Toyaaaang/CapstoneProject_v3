import { ColumnDef } from "@tanstack/react-table";

export type FlattenedAccountabilityItem = {
  id: number; // accountability ID
  created_at: string;
  material_name: string;
  quantity: number;
  unit: string;
};

export const columns: ColumnDef<FlattenedAccountabilityItem>[] = [
  {
    header: "Material",
    accessorKey: "material_name",
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
    cell: ({ row }) => `${row.original.quantity} ${row.original.unit}`,
  },
  {
    header: "Date Assigned",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
];
