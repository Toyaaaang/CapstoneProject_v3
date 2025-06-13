import { ColumnDef } from "@tanstack/react-table";
import { CertificationRecord } from "@/hooks/shared/useCertificationMonitoring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";
import axios from "@/lib/axios";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Info } from "lucide-react";

export const columns: ColumnDef<CertificationRecord>[] = [
	{
		header: "PO No.",
		accessorFn: row => row.purchase_order.po_number,
		cell: ({ row }) => (
			<span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded">
				{row.original.purchase_order.po_number}
			</span>
		),
	},
	{
		header: "Delivery Date",
		accessorFn: row => row.delivery_record?.delivery_date ?? "—",
		cell: ({ row }) =>
			row.original.delivery_record?.delivery_date
				? new Date(row.original.delivery_record.delivery_date).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
				  })
				: <span className="italic text-muted-foreground">N/A</span>,
	},
	{
		header: "Created At",
		accessorFn: row => row.created_at,
		cell: ({ row }) =>
			row.original.created_at
				? new Date(row.original.created_at).toLocaleString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
						hour: "2-digit",
						minute: "2-digit",
						hour12: true,
				  })
				: <span className="italic text-muted-foreground">N/A</span>,
	},
	{
		header: "Status",
		accessorFn: row => (row.is_finalized ? "Completed" : "In Progress"),
		cell: ({ row }) => (
			<Badge variant={row.original.is_finalized ? "default" : "secondary"}>
				{row.original.is_finalized ? "COMPLETED" : "IN PROGRESS"}
			</Badge>
		),
	},
	{
		header: "Actions",
		cell: ({ row }) => {
			const cert = row.original;

			const handlePrintableRedirect = () => {
				window.location.href = `/pages/engineering/track-certificates/${cert.id}/printable`;
			};

			return cert.is_finalized ? (
				<Button variant="outline" size="sm" onClick={handlePrintableRedirect}>
					<Printer className="w-4 h-4 mr-1" /> Printable
				</Button>
			) : (
				<Button
					variant="outline"
					size="sm"
					disabled
					onClick={handlePrintableRedirect}
					style={{ pointerEvents: "auto" }} // allow click even when disabled
					tabIndex={0}
				>
					Ongoing
				</Button>
			);
		},
	},
	{
		header: "Items",
		cell: ({ row }) => {
			const items = row.original.items || [];
			const previewItems = items.slice(0, 5);
			const certId = row.original.id;

			return (
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" size="sm">
							<Info/>View Items 
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-80 max-h-64 overflow-y-auto">
						{items.length > 0 ? (
							<div>
								<div className="grid grid-cols-3 gap-2 font-semibold text-xs mb-2 px-1">
									<span>Material</span>
									<span className="text-center">Qty</span>
									<span className="text-right">Unit</span>
								</div>
								<div className="grid grid-cols-1 gap-2">
									{previewItems.map((item, idx) => (
										<div
											key={item.id ?? idx}
											className="grid grid-cols-3 gap-2 items-center border rounded p-2 bg-muted/30 text-xs"
										>
											<div className="font-medium truncate">
												{item.material_name ||
													<span className="italic text-muted-foreground">
														{item.custom_name || "Unnamed Item"}
													</span>}
											</div>
											<div className="text-center text-muted-foreground">
												{parseInt(item.quantity, 10)}
											</div>
											<div className="text-right text-muted-foreground">
												{item.unit}
											</div>
										</div>
									))}
								</div>
								{items.length > 5 && (
									<div className="italic text-muted-foreground text-xs mt-2">
										...and {items.length - 5} more
									</div>
								)}
								<div className="flex justify-center pt-2">
									<Button
										variant="ghost"
										className="w-full text-xs"
										onClick={() =>
											window.location.href = `/pages/engineering/track-certificates/${certId}/items`
										}
									>
										Full details
									</Button>
								</div>
							</div>
						) : (
							<div className="text-muted-foreground text-xs">No items</div>
						)}
					</PopoverContent>
				</Popover>
			);
		},
	},
];
