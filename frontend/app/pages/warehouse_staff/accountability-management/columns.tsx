import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

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
  user: string;
  created_at: string;
  department: string | null; 
  items: AccountabilityItem[];
};

export const columns: ColumnDef<AccountabilityRecord>[] = [
  {
    header: "User",
    accessorKey: "user",
    cell: ({ row }) => <span className="capitalize">{row.original.user}</span>,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => {
      const raw = row.original.department;
      const map: Record<string, string> = {
        engineering: "Engineering",
        operations_maintenance: "Operations & Maintenance",
        finance: "Finance",
      };

      return (
        <Badge variant="secondary">
          {map[raw] || "—"}
        </Badge>
      );
    },
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
        <PopoverContent className="w-80 max-h-72 overflow-auto">
          {row.original.items && row.original.items.length > 0 ? (
            <div>
              <div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
                <span>Material</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Unit</span>
              </div>
              <div className="space-y-2">
                {row.original.items.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
                  >
                    <div className="font-medium truncate">{item.material.name}</div>
                    <div className="text-center text-muted-foreground">{item.quantity}</div>
                    <div className="text-right text-muted-foreground">{item.unit}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-xs italic py-4 text-center">No items</div>
          )}
        </PopoverContent>
      </Popover>
    ),
  },
];
