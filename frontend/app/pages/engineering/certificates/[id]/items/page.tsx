"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MaterialsTable from "@/components/Tables/MaterialsTable";
import { ColumnDef } from "@tanstack/react-table";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { startCertification } from "@/hooks/shared/useStartCertification";
import { toast } from "sonner";

const columns: ColumnDef<any>[] = [
	{
		header: "Material",
		accessorFn: (row) =>
			row.po_item?.material?.name ||
			row.po_item?.custom_name ||
			"Unnamed Item",
	},
	{
		header: "Quantity",
		accessorFn: (row) => row.po_item?.quantity ?? "-",
	},
	{
		header: "Unit",
		accessorFn: (row) => row.po_item?.unit ?? "-",
	},
	{
		header: "Remarks",
		accessorKey: "remarks",
		cell: ({ row }) => row.original.remarks || "-",
	},
	{
		header: "Delivery Date",
		accessorKey: "delivery_date",
		cell: ({ row }) =>
			row.original.delivery_date
				? new Date(row.original.delivery_date).toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
				  })
				: "-",
	},
];

export default function CertificateItemsPage() {
	const params = useParams();
	const id = Array.isArray(params.id) ? params.id[0] : params.id;
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		if (!id) return;

		const fetchData = async () => {
			setLoading(true);
			try {
				const res = await axios.get(
					`/requests/quality-checks/certifiable-batches/${id}/`
				);
				// Filter only items needing certification
				const certItems = (res.data.items ?? []).filter(
					(item: any) => item.requires_certification
				);
				setItems(certItems);
			} catch (err) {
				console.error(err);
				setItems([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	const handleStartCertification = async () => {
		try {
			await startCertification(id);
			toast.success("Certification started successfully");
			router.back();
		} catch (err: any) {
			toast.error("Failed to start certification");
		}
	};

	return (
		<div className="p-4">
			<MaterialsTable
				data={items}
				columns={columns}
				loading={loading}
				title="Materials Needing Certification"
			/>
			<div className="flex gap-2 mt-6">
				<Button variant="outline" onClick={() => router.back()}>
					Back
				</Button>
				<Button variant="default" onClick={handleStartCertification}>
					Start Certification
				</Button>
			</div>
		</div>
	);
}