import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type AccountabilityRecord = {
    id: number;
    type: "employee" | "department";
    name: string; // user full name or department name
    reference_no: string; // MCT-000X or RV-000X
    date_assigned: string;
    items: {
      material_name: string;
      quantity: number;
      unit: string;
    }[];
  };
  

export const columns: ColumnDef<AccountabilityRecord>[] = [
  {
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "department" ? "secondary" : "outline"}>
        {row.original.type.charAt(0).toUpperCase() + row.original.type.slice(1)}
      </Badge>
    ),
  },
  {
    header: "Accountable To",
    accessorKey: "name",
  },
  {
    header: "Reference",
    accessorKey: "reference_no",
    cell: ({ row }) => (
      <span className="font-mono">{row.original.reference_no}</span>
    ),
  },
  {
    header: "Date Assigned",
    accessorKey: "date_assigned",
    cell: ({ row }) => {
      const date = new Date(row.original.date_assigned);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  {
    header: "Materials",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">View</Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <ul className="text-sm space-y-1 py-2">
            {row.original.items.map((item, i) => (
              <li key={i} className="list-disc list-inside">
                {item.material_name} – {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
];
