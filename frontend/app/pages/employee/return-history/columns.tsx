import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export const columns: ColumnDef<ReturnRecord>[] = [
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }) => getTypeBadge(row.original.type),
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => <span>{formatDate(row.original.date)}</span>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      header: "Materials",
      cell: ({ row }) => (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">View</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <ul className="text-sm space-y-1 py-2">
              {row.original.materials.map((mat, i) => (
                <li key={i} className="list-disc list-inside">
                  {mat.name} – {mat.quantity} {mat.unit}
                  {mat.remarks && <div className="text-xs text-muted-foreground">Remarks: {mat.remarks}</div>}
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      ),
    },
  ];
  