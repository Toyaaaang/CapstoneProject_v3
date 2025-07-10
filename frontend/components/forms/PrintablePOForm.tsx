import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

export default function PrintablePOForm({ data }: { data: any }) {
  const router = useRouter();

  // Get RV No and Department from requisition_voucher if available
  const rvNo = data.requisition_voucher?.rv_number || data.rv_no || "—";
  const department = data.requisition_voucher?.department || data.department || data.dept || "—";
  const signatories = data.signatories || data.approvers || [];

  // Format date as "Month DD, YYYY"
  const formattedDate = data.created_at
    ? new Date(data.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto print:w-full print:p-0">
      {/* Print/Download Buttons */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold">Purchase Order</h2>
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
          PURCHASE ORDER
        </div>
        {/* Description */}
        <div className="text-xs italic">
          Please furnish the following articles to all the terms and conditions stated herein and in accordance with your quotation.
        </div>
        {/* Info Grid */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-2">
          <div>
            <span className="font-semibold">PO No:</span>{" "}
            <span className="italic">{data.po_number || data.id}</span>
          </div>
          <div>
            <span className="font-semibold">RV No:</span>{" "}
            <span className="italic">{rvNo}</span>
          </div>
          <div>
            <span className="font-semibold">Date:</span>{" "}
            {formattedDate}
          </div>
          <div>
            <span className="font-semibold">Department:</span>{" "}
            <span className="capitalize">{department}</span>
          </div>
          <div>
            <span className="font-semibold">Supplier:</span>{" "}
            <span className="capitalize">{data.supplier_name || data.supplier?.name}</span>
          </div>
          <div>
            <span className="font-semibold">Supplier Address:</span>{" "}
            <span>{data.supplier_address}</span>
          </div>
          <div>
            <span className="font-semibold">Purpose:</span>{" "}
            <span>{data.purpose || "—"}</span>
          </div>
          
        </div>



        <Separator />

        {/* Table and Signatures */}
        <div className="mb-2 p-2">
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left w-8">No.</th>
                <th className="border px-2 py-1 text-left">Material Name</th>
                <th className="border px-2 py-1 text-left">Unit</th>
                <th className="border px-2 py-1 text-left">Quantity</th>
                <th className="border px-2 py-1 text-left">Unit Price</th>
                <th className="border px-2 py-1 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1">{item.material?.name || item.custom_name || item.name}</td>
                  <td className="border px-2 py-1">{item.unit || item.custom_unit}</td>
                  <td className="border px-2 py-1">{item.quantity}</td>
                  <td className="border px-2 py-1">
                    ₱{parseFloat(item.unit_price).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border px-2 py-1">
                    ₱{parseFloat(item.total).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex flex-col items-end mt-4 text-sm gap-1">
            <div>
              <span className="font-semibold">Subtotal: </span>
              ₱{parseFloat(data.subtotal || data.grand_total - data.vat_amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </div>
            <div>
              <span className="font-semibold">VAT ({data.vat_rate || 0}%): </span>
              ₱{parseFloat(data.vat_amount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </div>
            <div className="font-bold">
              Grand Total: ₱{parseFloat(data.grand_total || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div>
              <span className="font-semibold text-sm gap-1">Delivery Date:</span>{" "}
              <span className="italic">_________________________</span>
            </div>
            <div>
              <span className="font-semibold text-sm gap-1">Shipping Instruction:</span>{" "}
              <span className="italic">_________________________</span>
            </div>
          </div>
          {/* Signature Grid */}
          <div className="grid grid-cols-2 gap-8 mt-8 ">
            {signatories.length === 0 && (
              <div className="col-span-2 text-center text-xs text-muted-foreground">
                No signatories available
              </div>
            )}
            {signatories.map((signatory: any, idx: number) => (
              <div
                key={idx}
                className="flex flex-col items-center relative pt-14"
              >
                {signatory.signature ? (
                  <img
                    src={signatory.signature}
                    alt="Signature"
                    className="h-20 object-contain absolute top-0 left-1/2 -translate-x-1/2"
                    style={{ pointerEvents: "none" }}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground absolute top-0 left-1/2 -translate-x-1/2 w-32 text-center">
                    No signature
                  </span>
                )}
                <div className="font-semibold z-10">{signatory.full_name || signatory.name}</div>
                <div className="text-xs text-muted-foreground z-10">
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
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}