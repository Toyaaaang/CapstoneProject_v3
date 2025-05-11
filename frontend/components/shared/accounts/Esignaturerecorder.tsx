"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { toast } from "sonner";

interface ESignatureRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureFetched: () => void; // Callback to notify when the signature is fetched
}

export default function ESignatureRecorder({ isOpen, onClose, onSignatureFetched }: ESignatureRecorderProps) {
  const signaturePadRef = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    toast.info("Signature cleared.");
  };

  const handleSave = () => {
    if (signaturePadRef.current?.isEmpty()) {
      toast.error("Please draw your signature first!");
      return;
    }

    // Simulate saving the signature
    const signatureDataUrl = signaturePadRef.current?.toDataURL("image/png");
    console.log("Simulated saved signature:", signatureDataUrl); // Debugging

    toast.success("Signature saved successfully!");
    onSignatureFetched(); // Notify that the signature has been saved
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full h-auto">
        <DialogHeader>
          <DialogTitle>E-Signature Recorder</DialogTitle>
          <p className="text-sm text-gray-500">
            Please draw your signature below. You can save or clear it as needed.
          </p>
        </DialogHeader>
        <div className="p-4">
          <SignatureCanvas
            ref={signaturePadRef}
            penColor="black"
            canvasProps={{
              width: 420,
              height: 300,
              className: "border border-gray-300 rounded",
            }}
          />
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            <X className="mr-1" />
            Clear
          </Button>
          <Button onClick={handleSave} className="mr-4">
            <Save className="mr-1" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}