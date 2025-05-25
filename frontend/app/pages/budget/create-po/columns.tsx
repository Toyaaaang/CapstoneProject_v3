import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreatePODialog from "@/components/dialogs/CreatePODialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const columns: ColumnDef<any>[] = [
	{
		header: "RV No.",
		accessorKey: "rv_number",
	},
	{
		header: "Department",
		accessorKey: "department",
		cell: ({ row }) => (
			<Badge>
				{row.original.department
					? row.original.department.replace(/_/g, " ").toUpperCase()
					: ""}
			</Badge>
		),
	},
	{
		header: "Created At",
		accessorFn: (row) => {
			const date = row.created_at ? new Date(row.created_at) : null;
			return date
				? date.toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
				  })
				: "";
		},
	},
	{
		header: "Status",
		accessorKey: "status",
		cell: ({ row }) => (
			<Badge>
				{row.original.status
					? row.original.status.charAt(0).toUpperCase() +
					  row.original.status.slice(1)
					: ""}
			</Badge>
		),
	},
	{
		header: "Items",
		cell: ({ row }) => {
			const items = row.original.items || [];
			return (
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" size="sm">
							View Items
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 max-h-72 overflow-auto">
						{items.length > 0 ? (
							<div>
								<div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
									<span>Material</span>
									<span className="text-center">Qty</span>
									<span className="text-right">Unit</span>
								</div>
								<div className="space-y-2">
									{items.map((item: any, i: number) => (
										<div
											key={i}
											className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
										>
											<div className="font-medium truncate">
												{item.material?.name
													? item.material.name.charAt(0).toUpperCase() +
													  item.material.name.slice(1)
													: (
														<span className="italic text-muted-foreground">
															{item.custom_name || "Custom Item"}
														</span>
													)}
											</div>
											<div className="text-center text-muted-foreground">
												{item.quantity}
											</div>
											<div className="text-right text-muted-foreground uppercase">
												{item.unit}
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="text-muted-foreground text-xs italic py-4 text-center">No items</div>
						)}
					</PopoverContent>
				</Popover>
			);
		},
	},
	{
		header: "Action",
		cell: ({ row, table }) => {
			const rv = row.original;

			// Defensive check
			if (!rv || !rv.id)
				return (
					<span className="text-muted-foreground text-xs">Invalid RV</span>
				);

			return (
				<CreatePODialog
					rv={rv}
					refreshData={() => table.options.meta?.refreshData?.()}
				/>
			);
		},
	},
];
