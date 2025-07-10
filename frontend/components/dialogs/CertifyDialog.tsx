// components/Dialogs/CertifyDialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

interface CertifyDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: number;
  materialName: string;
  poNumber: string;
  quantity: number;
  unit: string;
  refetch: () => void;
}

export default function CertifyDialog({
  open,
  onClose,
  itemId,
  materialName,
  poNumber,
  quantity,
  unit,
  refetch,
}: CertifyDialogProps) {
  const [remarks, setRemarks] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post(`/api/certifications/`, {
        quality_check_item: itemId,
        remarks,
      });

      toast.success("Certification created successfully.");
      refetch();
      onClose();
    } catch (err) {
      toast.error("Failed to create certification.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Certify Material</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <p>
            <strong>Material:</strong> {materialName}
          </p>
          <p>
            <strong>PO Number:</strong> {poNumber}
          </p>
          <p>
            <strong>Quantity:</strong> {quantity} {unit}
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="Enter remarks for certification..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Certify</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
