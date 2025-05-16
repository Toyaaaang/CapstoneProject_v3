from .models import MaterialRequest, ChargeTicket, RequisitionVoucher

def update_request_status(material_request: MaterialRequest):
    has_charge = ChargeTicket.objects.filter(request=material_request).exists()
    has_requisition = RequisitionVoucher.objects.filter(request=material_request).exists()

    if has_charge and has_requisition:
        material_request.status = 'partially_fulfilled'
    elif has_charge:
        material_request.status = 'charged'
    elif has_requisition:
        material_request.status = 'requisitioned'
    else:
        material_request.status = 'pending'

    material_request.save()
