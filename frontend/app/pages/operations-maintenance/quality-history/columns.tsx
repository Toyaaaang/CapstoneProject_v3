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
		cell: ({ row }) =>
			row.original.supplier
				? row.original.supplier.charAt(0).toUpperCase() + row.original.supplier.slice(1)
				: "N/A",
	},
	{
		header: "Department",
		accessorKey: "department",
		cell: ({ row }) =>
			row.original.department
				? row.original.department.charAt(0).toUpperCase() + row.original.department.slice(1)
				: "N/A",
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
			// Capitalize first letter
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
					<PopoverContent className="w-80 max-h-72 overflow-auto">
						<div className="space-y-2 text-xs">
							{items.length === 0 ? (
								<div className="text-muted-foreground italic">No items</div>
							) : (
								items.map((item: any, i: number) => (
									<div key={i} className="border p-2 rounded">
										<div className="font-medium">{item.material_name}</div>
										<div className="text-muted-foreground">
											{item.quantity} {item.unit}
										</div>
										<div>
											<Badge variant={item.requires_certification ? "default" : "outline"}>
												{item.requires_certification ? "Needs Cert" : "No Cert"}
											</Badge>
										</div>
										{item.remarks && (
											<div className="text-muted-foreground italic">Remarks: {item.remarks}</div>
										)}
									</div>
								))
							)}
						</div>
					</PopoverContent>
				</Popover>
			);
		},
	},
];
