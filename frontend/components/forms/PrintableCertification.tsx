import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import "./PrintableCertification.css";

export default function PrintableCertification({ data, landscape = false }) {
  const router = useRouter();
  const signatories = data.signatories || [];

  // Format date as "Month DD, YYYY"
  const formattedDate = data.created_at
    ? new Date(data.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const today = new Date();
  const formattedToday = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={`printable-certification ${landscape ? "landscape" : ""} bg-white p-8 max-w-5xl mx-auto print:w-full print:p-0`}
      style={{
        width: landscape ? "100vw" : "auto",
        minHeight: landscape ? "100vh" : "auto",
      }}
    >
      {/* Print/Download Buttons */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold">Certification</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            ← Back
          </Button>
          <Button onClick={() => window.print()} variant="outline">
            <Printer />
            Print
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {/* Header with logo and company info */}
        <div className="flex items-center gap-4 mb-2 justify-center">
          <img
            src="/app-logo.png"
            alt="Company Logo"
            className="h-16 w-16 object-contain"
          />
          <div>
            <div className="text-xl font-bold leading-tight">
              Quezon Electric Cooperative I
            </div>
            <div className="ml-8 text-muted-foreground text-sm">
              Brgy. Poctol, Pitogo, Quezon, 4308
            </div>
          </div>
        </div>
        <div className="text-l font-bold text-center">
          QUALITY CONTROL COMMITTEE
        </div>
        <div className="text-2xl font-bold text-center">
          C E R T I F I C A T I O N
        </div>
        <div className="text-xs italic text-left mb-2">
          This is to certify that the following materials/hardware/poles/equipment delivered on {data.delivery_record?.delivery_date
            ? new Date(data.delivery_record.delivery_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "—"} has PASSED the specification and testing indicated hereof and conforms to the specifications set forth in the approved purchase order.
        </div>


        <Separator />

        {/* Table and Signatures */}
        <div className="mb-2 p-2">
          <table className="w-full border text-xs">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left w-8">No.</th>
                <th className="border px-2 py-1 text-left">Material</th>
                <th className="border px-2 py-1 text-left">Quantity</th>
                <th className="border px-2 py-1 text-left">Unit</th>
                <th className="border px-2 py-1 text-left">Inspection Type</th>
                <th className="border px-2 py-1 text-left">PO No.</th>
                <th className="border px-2 py-1 text-left">RV No.</th>
                <th className="border px-2 py-1 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1">{item.material_name}</td>
                  <td className="border px-2 py-1">
                    {item.quantity ? parseInt(item.quantity, 10) : 0}
                  </td>
                  <td className="border px-2 py-1">{item.unit}</td>
                  <td className="border px-2 py-1">{item.inspection_type}</td>
                  <td className="border px-2 py-1">{data.purchase_order?.po_number || "—"}</td>
                  <td className="border px-2 py-1">{data.requisition_voucher?.rv_number || "—"}</td>
                  <td className="border px-2 py-1">{item.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
            {/* Info Grid */}
            <div className="flex flex-col gap-1 text-xs mt-4">
                <div>
                    <span className="font-semibold">
                    Issued this {formattedToday} at Quezon I Electric Cooperative, Inc. Poctol, Pitogo, Quezon.
                    </span>
                </div>
                <div>
                    <span className="font-semibold">Note:</span>
                </div>
                <div>
                    <span className="font-semibold">Supplier:</span>{" "}
                    <span>{data.supplier || "—"}</span>
                </div>
                <div>
                    <span className="font-semibold">Purpose:</span>{" "}
                    <span>{data.purpose || "—"}</span>
                </div>
            </div>

          {/* Signature Row */}
          <div className="flex flex-row justify-center items-end gap-8 mt-8">
            {signatories.length === 0 && (
              <div className="text-center text-xs text-muted-foreground">
                No signatories available
              </div>
            )}
            {signatories.map((signatory: any, idx: number) => (
              <div
                key={idx}
                className="flex flex-col items-center min-w-[120px]"
                style={{ fontSize: "0.8rem" }}
              >
                {signatory.signature ? (
                  <img
                    src={signatory.signature}
                    alt="Signature"
                    className="h-10 object-contain mb-1"
                    style={{ pointerEvents: "none" }}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground mb-1 w-20 text-center">
                    No signature
                  </span>
                )}
                <div className="font-semibold">{signatory.full_name || signatory.name}</div>
                <div className="text-xs text-muted-foreground">
                  {signatory.role || signatory.position}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Print Style Overrides */}
      <style>{`
        @media print {
          header, nav, .sidebar, .footer, .print\\:hidden {
            display: none !important;
          }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
