"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileSearch2 } from "lucide-react";

interface PreviewDialogProps {
  title: string;
  iframeSrc: string;
  triggerText: string;
}

export default function PreviewDialog({ title, iframeSrc, triggerText }: PreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <FileSearch2 className="mr-2" size={16} />
          {triggerText}
          </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] p-8 flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden mt-4">
          <iframe
            src={iframeSrc}
            title={title}
            className="w-full h-full border rounded"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}