import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type AccountabilityItem = {
  material: {
    name: string;
    unit: string;
  };
  quantity: number;
  unit: string;
};

export type AccountabilityRecord = {
  id: number;
  user: string; // full name of the accountable person
  created_at: string;
  items: AccountabilityItem[];
};

export const columns: ColumnDef<AccountabilityRecord>[] = [
  {
    header: "User",
    accessorKey: "user",
    cell: ({ row }) => <span className="capitalize">{row.original.user}</span>,
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
  {
    header: "Materials",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            View
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <ul className="text-sm space-y-1 py-2">
            {row.original.items.map((item, i) => (
              <li key={i} className="list-disc list-inside">
                {item.material.name} – {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
];
