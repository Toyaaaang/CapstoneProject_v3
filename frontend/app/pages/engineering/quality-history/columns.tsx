import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<any>[] = [
  {
    header: "PO Number",
    accessorKey: "po_number",
  },
  {
    header: "Supplier",
    accessorKey: "supplier",
    cell: ({ row }) => (
      <span className="font-semibold">
        {row.original.supplier
          ? row.original.supplier.charAt(0).toUpperCase() + row.original.supplier.slice(1)
          : <span className="italic text-muted-foreground">N/A</span>}
      </span>
    ),
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => (
      <Badge>
        {row.original.department
          ? row.original.department.replace(/_/g, " ").toUpperCase()
          : <span className="italic text-muted-foreground">N/A</span>}
      </Badge>
    ),
  },
  {
    header: "Checked At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      const formatted = date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    },
  },
  {
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.items || [];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="outline">
              View Items
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[32rem] max-h-80 overflow-auto">
            <div className="space-y-2 text-xs">
              {items.length === 0 ? (
                <div className="text-muted-foreground italic">No items</div>
              ) : (
                <div>
                  <div className="grid grid-cols-4 gap-2 font-semibold mb-2">
                    <span>Material</span>
                    <span className="text-center">Qty</span>
                    <span className="text-center">Cert</span>
                    <span className="text-right">Remarks</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="grid grid-cols-4 gap-2 items-center border rounded p-2 bg-muted/30"
                      >
                        <div className="font-medium truncate flex items-center gap-1">
                          {item.po_item?.material?.name || item.po_item?.custom_name || "Custom Item"}
                          {!item.po_item?.material?.name && (
                            <Badge variant="outline" className="text-xs">Custom</Badge>
                          )}
                        </div>
                        <div className="text-center text-muted-foreground">
                          {item.po_item?.quantity} {item.po_item?.unit}
                        </div>
                        <div className="text-center">
                          <Badge variant={item.requires_certification ? "default" : "outline"}>
                            {item.requires_certification ? "Needs Cert" : "No Cert"}
                          </Badge>
                        </div>
                        <div className="text-right text-muted-foreground italic truncate" title={item.remarks || "-"}>
                          {item.remarks || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
];
