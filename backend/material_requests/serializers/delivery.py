from rest_framework import serializers
from material_requests.models import DeliveryRecord, PurchaseOrderItem
from inventory.models import Material

class DeliveryRecordSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    material = serializers.SerializerMethodField()
    purchase_order = serializers.SerializerMethodField()
    po_item = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryRecord
        fields = [
            "id",
            "material",
            "delivered_quantity",
            "delivery_status",
            "delivery_date",
            "remarks",
            "purchase_order",
            "po_item",
        ]

    def get_material(self, obj):
        return {
            "id": obj.material.id,                  # ✅ needed for report creation
            "name": obj.material.name,
            "unit": obj.material.unit
        }

    def get_purchase_order(self, obj):
        return {
            "id": obj.purchase_order.id,            # ✅ ensures frontend can access PO ID
            "po_number": obj.purchase_order.po_number
        }

    def get_po_item(self, obj):
        try:
            return obj.purchase_order.items.get(material=obj.material).id
        except PurchaseOrderItem.DoesNotExist:
            return None
        except Exception as e:
            print(f"[DeliveryRecordSerializer] po_item error: {e}")
            return None
