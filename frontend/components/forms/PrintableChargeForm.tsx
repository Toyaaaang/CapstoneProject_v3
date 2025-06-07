import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer } from 'lucide-react'
import { Separator } from "@/components/ui/separator"

export default function PrintableChargeForm({ data }: { data: any }) {
  return (
    <div className="bg-white p-8 max-w-3xl mx-auto print:w-full print:p-0">

      {/* Print/Download Buttons */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold">Material Release Charge Form</h2>
        <Button onClick={() => window.print()} variant="outline">
          <Printer />
          Print
        </Button>
      </div>
      <Card className="mb-2 p-6">
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
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs mb-2">
          <div>
            <span className="font-semibold">Charge No:</span> {data.ic_no || data.mc_no || data.id}
          </div>
          <div>
            <span className="font-semibold">Date:</span> {data.created_at?.slice(0, 10)}
          </div>
          <div>
            <span className="font-semibold">Department:</span>{" "}
            <span className="capitalize">{data.department}</span>
          </div>
          <div>
            <span className="font-semibold">Work Order No:</span> {data.work_order_no}
          </div>
          <div>
            <span className="font-semibold">Purpose:</span> {data.purpose}
          </div>
          <div>
            <span className="font-semibold">Location:</span> {data.location}
          </div>
          <div>
            <span className="font-semibold">Requested by:</span> {data.requester_name}
          </div>
        </div>
        <Separator/>
      <div className="mb-2 p-4">
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Material Name</th>
              <th className="border px-2 py-1 text-left">Unit</th>
              <th className="border px-2 py-1 text-left">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="border px-2 py-1">{item.name}</td>
                <td className="border px-2 py-1">{item.unit}</td>
                <td className="border px-2 py-1">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      
      <div className="grid grid-cols-2 gap-8 mt-8">
        {data.approvers?.map((approver: any, idx: number) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="h-16 w-32 border-b mb-2 flex items-end justify-center">
              {approver.signature ? (
                <img src={approver.signature} alt="Signature" className="h-16 object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground">No signature</span>
              )}
            </div>
            <div className="font-semibold">{approver.full_name}</div>
            <div className="text-xs text-muted-foreground">{approver.role}</div>
          </div>
        ))}
        {data.work_order_assigner && (
          <div className="flex flex-col items-center">
            <div className="h-16 w-32 border-b mb-2 flex items-end justify-center">
              {data.work_order_assigner_signature ? (
                <img src={data.work_order_assigner_signature} alt="Signature" className="h-16 object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground">No signature</span>
              )}
            </div>
            <div className="font-semibold">{data.work_order_assigner}</div>
            <div className="text-xs text-muted-foreground">Work Order Assigned By</div>
          </div>
        )}
      </div>
        </div>
              </Card>
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
    
  )
}