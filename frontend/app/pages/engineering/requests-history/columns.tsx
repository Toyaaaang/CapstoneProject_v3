// columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DepartmentalRV } from "@/hooks/shared/useDepartmentalRVHistory";

export const columns: ColumnDef<DepartmentalRV>[] = [
  {
    header: "RV Number",
    accessorKey: "rv_number",
    cell: ({ row }) => (
      <span className="font-mono font-semibold">{row.original.rv_number}</span>
    ),
  },
  {
    header: "Requested By",
    accessorKey: "requester",
    cell: ({ row }) => {
      const { first_name, last_name } = row.original.requester;
      return <span>{first_name} {last_name}</span>;
    },
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => (
      <span className="line-clamp-2 text-sm text-muted-foreground">
        {row.original.purpose}
      </span>
    ),
  },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return date.toLocaleDateString();
    },
  },
  {
    header: "Materials",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">View Items</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-72 overflow-auto">
          {row.original.items.length > 0 ? (
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
                    <div className="font-medium truncate flex items-center gap-1">
                      {item.material?.name || item.custom_name || "Custom Item"}
                      {!item.material?.id && (
                        <Badge variant="outline" className="ml-1 text-[10px]">Custom</Badge>
                      )}
                    </div>
                    <div className="text-center text-muted-foreground">{item.quantity}</div>
                    <div className="text-right text-muted-foreground uppercase">{item.unit}</div>
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
