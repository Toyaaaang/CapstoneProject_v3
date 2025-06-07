"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import axios from "@/lib/axios";

interface ESignatureRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureFetched: (url: string) => void; // Send Cloudinary URL
}

export default function ESignatureRecorder({
  isOpen,
  onClose,
  onSignatureFetched,
}: ESignatureRecorderProps) {
  const signaturePadRef = useRef<SignatureCanvas>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    toast.info("Signature cleared.");
  };

  const handleSave = async () => {
    if (signaturePadRef.current?.isEmpty()) {
      toast.error("Please draw your signature first!");
      return;
    }

    const dataUrl = signaturePadRef.current.toDataURL("image/png");

    // Convert dataURL to Blob
    function dataURLtoBlob(dataurl: string) {
      const arr = dataurl.split(",");
      const mime = arr[0].match(/:(.*?);/)![1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }

    const blob = dataURLtoBlob(dataUrl);
    const formData = new FormData();
    formData.append("image", blob, "signature.png");

    try {
      setIsSaving(true);
      const response = await axios.post(
        "/authentication/save-signature/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      const signatureUrl = response.data.url;

      toast.success("Signature uploaded successfully!");
      onSignatureFetched(signatureUrl);
      onClose();
    } catch (error) {
      console.error("Error uploading signature:", error);
      toast.error("Failed to upload signature. Try again.");
    } finally {
      setIsSaving(false);
    }
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
          <Button variant="outline" onClick={handleClear} disabled={isSaving}>
            <X className="mr-1" />
            Clear
          </Button>
          <Button onClick={handleSave} className="mr-4" disabled={isSaving}>
            <Save className="mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
