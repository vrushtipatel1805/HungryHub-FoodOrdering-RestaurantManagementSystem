from rest_framework import serializers
from .models import Package, Reservation

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ('id', 'event_type', 'name', 'description', 'price', 'price_type', 'min_capacity', 'max_capacity', 'duration', 'inclusions', 'is_active', 'image', 'created_at', 'updated_at')


class ReservationSerializer(serializers.ModelSerializer):
    package_details = PackageSerializer(source='package', read_only=True)
    package_id = serializers.PrimaryKeyRelatedField(
        queryset=Package.objects.all(), source='package', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Reservation
        fields = (
            'booking_id', 'transaction_id', 'customer_name', 'phone', 'email',
            'table_type', 'table_number', 'guests_count', 'reservation_date',
            'reservation_time', 'amount_paid', 'payment_method', 'payment_status',
            'reservation_status', 'package_details', 'package_id', 'special_request', 'created_at',
            'invoice_data', 'user', 'event_name', 'package_name', 'email_sent_status', 'email_sent_timestamp',
            'last_email_attempt_timestamp'
        )

    def create(self, validated_data):
        import random
        booking_id = validated_data.get('booking_id')
        if not booking_id:
            import datetime
            date_str = datetime.date.today().strftime('%Y%m%d')
            booking_id = f"BK{date_str}{random.randint(1000, 9999)}"
            validated_data['booking_id'] = booking_id
            
        txn_id = validated_data.get('transaction_id')
        if not txn_id:
            import datetime
            date_str = datetime.date.today().strftime('%Y%m%d')
            validated_data['transaction_id'] = f"TXN{date_str}{random.randint(100000, 999999)}"

        res = Reservation.objects.create(**validated_data)
        
        # Create Payment log
        try:
            from orders.models import Payment
            from django.contrib.auth import get_user_model
            User = get_user_model()
            customer_obj = User.objects.filter(email=res.email).first()
            payment_id = f"PY-{random.randint(100000, 999999)}"
            Payment.objects.create(
                id=payment_id,
                customer=customer_obj,
                booking=res,
                amount=res.amount_paid,
                gst=res.amount_paid * 0.18,
                discount=0.0,
                payment_method=res.payment_method or 'UPI',
                status='Success' if res.payment_status.lower() in ['paid', 'confirmed', 'success'] else 'Pending'
            )
        except Exception as e:
            print("Error creating reservation payment log:", e)

        return res

