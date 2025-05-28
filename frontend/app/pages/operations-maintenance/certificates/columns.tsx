"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CertifiableItem } from "@/hooks/shared/useCertificationsToCreate";
import { startCertification } from "@/hooks/shared/useStartCertification";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/alert-dialog/AlertDialog";

export const columns: ColumnDef<CertifiableItem>[] = [
	{
		header: "PO No.",
		accessorFn: (row) => row.quality_check.purchase_order.po_number,
		cell: ({ row }) => (
			<span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded">
				{row.original.quality_check.purchase_order.po_number}
			</span>
		),
	},
	{
		header: "RV No.",
		accessorFn: (row) => row.quality_check.requisition_voucher.rv_number,
		cell: ({ row }) => (
			<span className="font-mono text-xs bg-muted/60 px-2 py-1 rounded">
				{row.original.quality_check.requisition_voucher.rv_number}
			</span>
		),
	},
	{
		header: "Department",
		accessorFn: (row) => row.quality_check.requisition_voucher.department,
		cell: ({ row }) => (
			<Badge>
				{row.original.quality_check.requisition_voucher.department
					? row.original.quality_check.requisition_voucher.department.replace(/_/g, " ").toUpperCase()
					: <span className="italic text-muted-foreground">N/A</span>}
			</Badge>
		),
	},
	{
		header: "Material",
		accessorFn: (row) =>
			row.po_item?.material?.name ??
			row.po_item?.custom_name ??
			"Custom Item",
		cell: ({ row }) => (
			<span className="font-semibold">
				{row.original.po_item?.material?.name ||
					<span className="italic text-muted-foreground">
						{row.original.po_item?.custom_name || "Custom Item"}
					</span>
				}
			</span>
		),
	},
	{
		header: "Quantity",
		accessorFn: (row) => `${row.po_item.quantity} ${row.po_item.unit}`,
		cell: ({ row }) => (
			<span className="font-mono">
				{row.original.po_item.quantity} {row.original.po_item.unit}
			</span>
		),
	},
	{
		header: "Delivery Date",
		accessorFn: (row) => row.quality_check.purchase_order.delivery_date,
		cell: ({ row }) =>
			row.original.quality_check.purchase_order.delivery_date
				? new Date(row.original.quality_check.purchase_order.delivery_date).toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				})
				: <span className="italic text-muted-foreground">N/A</span>,
	},
	{
		header: "Actions",
		cell: ({ table, row }) => {
			const item = row.original;
			const rows = table.getRowModel().rows;
			const currentDeliveryId = item.delivery_record_id;
			const isFirstForDelivery =
				rows.findIndex((r) => r.original.delivery_record_id === currentDeliveryId) === row.index;

			const handleStartCertification = async () => {
				try {
					await startCertification(item.delivery_record_id);
					toast.success("Certification started successfully");
					table.options.meta?.refreshData?.();
				} catch (err: any) {
					console.error(err);
					toast.error("Failed to start certification");
				}
			};

			return (
				<div className="space-x-2">
					{isFirstForDelivery && (
						<ConfirmActionDialog
							trigger={
								<Button size="sm" variant="default">
									Start Certification
								</Button>
							}
							title="Start Certification?"
							description="Do you want to continue with this action? This cannot be undone."
							confirmLabel="Start"
							cancelLabel="Cancel"
							onConfirm={handleStartCertification}
						/>
					)}
				</div>
			);
		},
	},
];
