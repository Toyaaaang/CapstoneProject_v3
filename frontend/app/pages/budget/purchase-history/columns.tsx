import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";

export const purchaseHistoryColumns: ColumnDef<any>[] = [
	{
		header: "Type",
		accessorKey: "type",
		cell: ({ row }) => (
			<Badge
				variant={row.original.type === "return" ? "destructive" : "secondary"}
				className="uppercase tracking-wide"
			>
				{row.original.type === "return" ? "Return" : "Purchase"}
			</Badge>
		),
	},
	{
		header: "Reference No.",
		accessorKey: "reference_number",
		cell: ({ row }) => (
			<span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded">
				{row.original.reference_number}
			</span>
		),
	},
	{
		header: "Supplier",
		accessorKey: "supplier",
		cell: ({ row }) => {
			const supplier = row.original.supplier;
			return (
				<span className="font-semibold">
					{supplier
						? supplier.charAt(0).toUpperCase() + supplier.slice(1)
						: <span className="italic text-muted-foreground">N/A</span>}
				</span>
			);
		},
	},
	{
		header: "Date",
		accessorKey: "date",
		cell: ({ row }) =>
			row.original.date ? (
				new Date(row.original.date).toLocaleDateString("en-PH", {
					year: "numeric",
					month: "short",
					day: "numeric",
				})
			) : (
				<span className="italic text-muted-foreground">N/A</span>
			),
	},
	{
		header: "Total",
		accessorKey: "total",
		cell: ({ row }) => (
			<span className="font-mono font-semibold text-green-700 dark:text-green-400">
				₱
				{parseFloat(row.original.total).toLocaleString("en-PH", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})}
			</span>
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
					<PopoverContent className="w-80 max-h-64 overflow-y-auto">
						{items.length > 0 ? (
							<div>
								<div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
									<span>Material</span>
									<span className="text-center">Quantity</span>
									<span className="text-right">Unit</span>
								</div>
								<div className="grid grid-cols-1 gap-2">
									{items.map((item: any, idx: number) => (
										<div
											key={idx}
											className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30"
										>
											<div className="flex items-center gap-2 font-medium">
												{item.material_name ? (
													item.material_name
												) : (
													<span className="italic text-muted-foreground">
														{item.custom_name || "Custom Item"}
													</span>
												)}
												{!item.material_name && (
													<Badge
														variant="outline"
														className="ml-1 text-xs"
													>
														Custom
													</Badge>
												)}
											</div>
											<div className="text-center text-muted-foreground text-xs">
												{item.quantity}
											</div>
											<div className="text-right text-muted-foreground text-xs">
												{item.unit}
											</div>
										</div>
									))}
								</div>
							</div>
						) : (
							<div className="text-muted-foreground text-xs">
								No items
							</div>
						)}
					</PopoverContent>
				</Popover>
			);
		},
	},
	{
		header: "Status",
		accessorKey: "status",
		cell: ({ row }) => {
			let variant: "default" | "secondary" | "destructive" = "secondary";
			if (row.original.status === "approved") variant = "default";
			else if (row.original.status === "pending") variant = "secondary";
			else variant = "destructive";
			return (
				<Badge variant={variant} className="uppercase tracking-wide">
					{row.original.status
						? row.original.status.charAt(0).toUpperCase() +
						  row.original.status.slice(1)
						: ""}
				</Badge>
			);
		},
	},
];
