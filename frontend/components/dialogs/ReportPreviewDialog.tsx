"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReceivingReport } from "@/hooks/admin/useUnapprovedReceivingReports";

export default function ReportPreviewDialog({ report }: { report: ReceivingReport }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Preview</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Receiving Report Preview</DialogTitle>
          <DialogDescription>
            <strong>{report.po_number}</strong> | Created by: {report.created_by}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p><strong>Remarks:</strong> {report.remarks || "None"}</p>
          <p><strong>Created At:</strong> {new Date(report.created_at).toLocaleString()}</p>

          <div className="border rounded-md p-4 mt-2">
            <h4 className="font-semibold mb-2">Items</h4>
            <ul className="space-y-1 text-sm">
              {report.items.map((item) => (
                <li key={item.id} className="flex justify-between border-b py-1">
                  <span>{item.material_name}</span>
                  <span>{item.quantity} {item.unit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
