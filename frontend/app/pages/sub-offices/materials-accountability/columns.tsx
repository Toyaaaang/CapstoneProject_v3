import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type FlattenedAccountabilityItem = {
  id: number;
  created_at: string;
  material_name: string;
  category: string;
  quantity: number;
  unit: string;
  charge_ticket_number: string; // <-- update type
  department: string;
};

export const columns: ColumnDef<FlattenedAccountabilityItem>[] = [
  {
    header: "Material",
    accessorKey: "material_name",
  },
  {
    header: "Category",
    accessorKey: "category",
    cell: ({ row }) => (
      <Badge variant="warning" className="capitalize">
        {row.original.category}
      </Badge>
    ),
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
  },
  {
    header: "Unit",
    accessorKey: "unit",
  },
  {
    header: "Charge Ticket",
    accessorKey: "charge_ticket_number", // <-- fix here
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.department.replace(/_/g, " ")}
      </Badge>
    ),
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
