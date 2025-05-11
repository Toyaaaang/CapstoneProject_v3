"use client";

import { columns } from "./columns";
import { usePurchaseOrderForm } from "@/hooks/usePurchaseOrderForm";
import { POCreateDialog } from "@/components/dialogs/POCreateDialog";
import DataTable from "@/components/Tables/DataTable";
import { useFinalApprovedRestocks } from "@/hooks/useFinalApprovedRestocks";

export default function FinalApprovedRestockPage() {
  const { data, loading, error, refetch, removeRequestById } = useFinalApprovedRestocks(); // Include removeRequestById
  const poForm = usePurchaseOrderForm();

  return (
    <div className="p-4">
      <DataTable
        title="Final Approved Restocks"
        columns={columns(poForm, removeRequestById)} // Pass removeRequestById here
        data={data}
        searchKey="reference_no"
        refreshData={refetch}
      />
      <POCreateDialog hook={poForm} />
    </div>
  );
}
