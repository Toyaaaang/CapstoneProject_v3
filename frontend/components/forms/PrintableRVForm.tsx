import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const getRoleLabel = (role: string) => {
  if (role === "manager") return "General Manager";
  if (role === "budget_analyst") return "Budget Analyst";
  if (role === "warehouse_admin") return "Warehouse Head";
  return role ? role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "";
};

interface PrintableRVFormProps {
  data: any;
}

const PrintableRVForm: React.FC<PrintableRVFormProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto print:w-full print:p-0">
      {/* Print/Download Buttons */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold">Requisition Voucher</h2>
        <Button onClick={() => window.print()} variant="outline">
          <Printer />
          Print
        </Button>
      </div>

      <Card className="p-6">
        {/* Header with logo and company info */}
        <div className="flex ml-28 items-center gap-4 mb-2">
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
        <div className="text-l font-bold text-center mb-2">
          REQUISITION VOUCHER
        </div>
        {/* Description */}
        <div className="text-left text-sm text-muted-foreground">
            Request Approval to procure the following materials/ supplies for:
        </div>
        {/* Info Grid */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-2">
          <div>
            <span className="font-semibold">RV No:</span>{" "}
            <span className="italic">{data.rv_number || data.id}</span>
          </div>
          <div>
            <span className="font-semibold">Date:</span>{" "}
            {data.created_at?.slice(0, 10)}
          </div>
          <div>
            <span className="font-semibold">Department:</span>{" "}
            <span className="capitalize">{data.department}</span>
          </div>
          <div>
            <span className="font-semibold">Purpose:</span> {data.purpose}
          </div>
          <div>
            <span className="font-semibold">Location:</span> {data.location}
          </div>
          <div>
            <span className="font-semibold">Requested by:</span>{" "}
            {data.requester?.first_name} {data.requester?.last_name}
          </div>
        </div>

        <Separator />

        {/* Table and Signatures */}
        <div className="mb-2 p-4">
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left w-8">No.</th>
                <th className="border px-2 py-1 text-left">Material Name</th>
                <th className="border px-2 py-1 text-left">Unit</th>
                <th className="border px-2 py-1 text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1">
                    {item.material_name || item.custom_name || "Custom Item"}
                  </td>
                  <td className="border px-2 py-1">{item.unit}</td>
                  <td className="border px-2 py-1">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature Grid */}
          <div className="grid grid-cols-3 gap-8 mt-8">
            {/* Recommended By */}
            <div className="flex flex-col items-center relative pt-14">
              {data.recommended_by_signature ? (
                <img
                  src={data.recommended_by_signature}
                  alt="Signature"
                  className="h-20 object-contain absolute top-0 left-1/2 -translate-x-1/2"
                  style={{ pointerEvents: "none" }}
                />
              ) : (
                <span className="text-xs text-muted-foreground absolute top-0 left-1/2 -translate-x-1/2 w-32 text-center">
                  No signature
                </span>
              )}
              <div className="font-semibold z-10">
                {data.recommended_by
                  ? `${data.recommended_by.first_name} ${data.recommended_by.last_name}`
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground z-10">
                Budget Analyst
              </div>
            </div>
            {/* Work Order Assigned By */}
            <div className="flex flex-col items-center relative pt-14">
              {data.work_order_assigned_by_signature ? (
                <img
                  src={data.work_order_assigned_by_signature}
                  alt="Signature"
                  className="h-20 object-contain absolute top-0 left-1/2 -translate-x-1/2"
                  style={{ pointerEvents: "none" }}
                />
              ) : (
                <span className="text-xs text-muted-foreground absolute top-0 left-1/2 -translate-x-1/2 w-32 text-center">
                  No signature
                </span>
              )}
              <div className="font-semibold z-10">
                {data.work_order_assigned_by
                  ? `${data.work_order_assigned_by.first_name} ${data.work_order_assigned_by.last_name}`
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground z-10">
                Department Head
              </div>
            </div>
            {/* Final Approved By */}
            <div className="flex flex-col items-center relative pt-14">
              {data.final_approved_by_signature ? (
                <img
                  src={data.final_approved_by_signature}
                  alt="Signature"
                  className="h-20 object-contain absolute top-0 left-1/2 -translate-x-1/2"
                  style={{ pointerEvents: "none" }}
                />
              ) : (
                <span className="text-xs text-muted-foreground absolute top-0 left-1/2 -translate-x-1/2 w-32 text-center">
                  No signature
                </span>
              )}
              <div className="font-semibold z-10">
                {data.final_approved_by
                  ? `${data.final_approved_by.first_name} ${data.final_approved_by.last_name}`
                  : "—"}
              </div>
              <div className="text-xs text-muted-foreground z-10">
                General Manager
              </div>
            </div>
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
};

export default PrintableRVForm;