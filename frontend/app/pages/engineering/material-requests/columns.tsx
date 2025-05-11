import { ColumnDef } from "@tanstack/react-table";
import EvaluateDialog from "@/components/dialogs/EvaluateDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type MaterialRequest = {
  id: number;
  department: string;
  purpose: string;
  status: string;
  requester:string;
  items: {
    id: number;
    material: { id: number; name: string };
    quantity: number;
    unit: string;
  }[];
};

export const columns: ColumnDef<MaterialRequest>[] = [
  {
    header: "Request ID",
    accessorKey: "id",
    cell: ({ row }) => <span className="font-mono">MR-{row.original.id}</span>,
  },
  {
    header: "Requested By",
    accessorKey: "requester",
    cell: ({ row }) => <span>{row.original.requester}</span>,
  },
  
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.department.replace(/_/g, " ")}</Badge>
    ),
  },
  {
    header: "Purpose",
    accessorKey: "purpose",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="truncate max-w-[200px] text-left">
            {row.original.purpose}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <p className="text-sm">{row.original.purpose}</p>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Materials",
    cell: ({ row }) => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            View Items
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <ul className="text-sm space-y-1 py-2">
            {row.original.items.map((item) => (
              <li key={item.id} className="list-disc list-inside">
                {item.material.name} – {item.quantity} {item.unit}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    header: "Actions",
    cell: ({ row, table }) => {
      const request = row.original;
      return (
        <EvaluateDialog
          requestId={request.id}
          items={request.items}
          refreshData={() => table.options.meta?.refreshData?.()}
        />
      );
    },
  },
];
