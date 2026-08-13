from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .models import Package, Reservation
from .serializers import PackageSerializer, ReservationSerializer
from authentication.permissions import IsAdminUserRole, IsAdminOrReadOnly

def ensure_default_packages():
    DEFAULT_PACKAGES = [
        {
            "id": "birthday-party",
            "event_type": "birthday",
            "name": "Birthday Party Package",
            "description": "Make your birthday milestone truly unforgettable with vibrant decorations, customized multi-course buffet menus, and festive celebration setups.",
            "price": 799.00,
            "price_type": "per_person",
            "min_capacity": 15,
            "max_capacity": 100,
            "duration": "4 Hours",
            "inclusions": ["Theme balloon & backdrop decor", "Dedicated party coordinator", "Complimentary celebration cake", "Welcome mocktail bar"]
        },
        {
            "id": "anniversary-celebration",
            "event_type": "anniversary",
            "name": "Anniversary Celebration Package",
            "description": "Celebrate your journey of love in an intimate, romantic setup featuring private candlelit corners, elegant floral arrangements, and curated chef specials.",
            "price": 2499.00,
            "price_type": "fixed",
            "min_capacity": 2,
            "max_capacity": 20,
            "duration": "3.5 Hours",
            "inclusions": ["Private candlelit table setup", "Personalized music background playlist", "Signature mocktails", "Flower bouquet"]
        },
        {
            "id": "corporate-event",
            "event_type": "corporate",
            "name": "Corporate Event Package",
            "description": "Host executive business dinners, conferences, or corporate celebrations with spacious seating, AV projector systems, and premium buffet dining.",
            "price": 1199.00,
            "price_type": "per_person",
            "min_capacity": 15,
            "max_capacity": 100,
            "duration": "5 Hours",
            "inclusions": ["Executive seating layout", "Projector screen & wireless presenter", "Complimentary Wi-Fi", "Multi-Cuisine Buffet"]
        },
        {
            "id": "family-gathering",
            "event_type": "family",
            "name": "Family Gathering Package",
            "description": "Reunite with family and friends in a cozy, festive hall setup. Enjoy generous family platter dining and dedicated kids activity corners.",
            "price": 999.00,
            "price_type": "per_person",
            "min_capacity": 10,
            "max_capacity": 60,
            "duration": "4.5 Hours",
            "inclusions": ["Festive traditional seating", "Kids fun activity corner", "Welcome Fresh Juices", "Traditional Sweet Platter"]
        }
    ]
    for pkg_data in DEFAULT_PACKAGES:
        Package.objects.get_or_create(id=pkg_data["id"], defaults=pkg_data)

class PackageListView(generics.ListCreateAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [IsAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        ensure_default_packages()
        return super().list(request, *args, **kwargs)

class PackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_update(self, serializer):
        import os
        instance = self.get_object()
        old_image = instance.image
        if 'image' in self.request.data:
            new_image = self.request.data.get('image')
            if old_image and old_image != new_image:
                try:
                    if os.path.exists(old_image.path):
                        os.remove(old_image.path)
                except Exception as e:
                    print("Error deleting old package image file:", e)
        serializer.save()

    def perform_destroy(self, instance):
        import os
        if instance.image:
            try:
                if os.path.exists(instance.image.path):
                    os.remove(instance.image.path)
            except Exception as e:
                print("Error deleting package image file:", e)
        instance.delete()

class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAdminOrReadOnly]


class ReservationListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def post(self, request):
        ensure_default_packages()
        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            res = serializer.save()
            return Response({
                "ok": True,
                "message": "Reservation created successfully.",
                "data": ReservationSerializer(res).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "ok": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        if request.user.role in ['admin', 'super_admin', 'manager', 'staff']:
            reservations = Reservation.objects.all().order_by('-created_at')
        else:
            reservations = Reservation.objects.filter(email=request.user.email).order_by('-created_at')

        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AdminBookingsListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        # Standard reservations (exclude package events)
        res = Reservation.objects.filter(package__isnull=True).order_by('-created_at')
        serializer = ReservationSerializer(res, many=True)
        
        # Format list suitable for table display:
        formatted = []
        for r in res:
            formatted.append({
                "id": r.booking_id,
                "customerName": r.customer_name,
                "phone": r.phone,
                "tableType": r.table_type,
                "tableNumber": r.table_number,
                "guestsCount": r.guests_count,
                "status": r.reservation_status,
                "dateTime": f"{r.reservation_date} {r.reservation_time}"
            })
        return Response(formatted, status=status.HTTP_200_OK)

class AdminEventsListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        # Event reservations (where package is defined)
        res = Reservation.objects.filter(package__isnull=False).order_by('-created_at')
        
        # Format matching Events.jsx
        # { guestName, phone, persons, date, timeSlot, perPlate, advance, total, gst, remaining, receivedFull }
        formatted = []
        for r in res:
            total_plate_cost = float(r.package.price) if r.package else 0
            persons = r.guests_count
            total = total_plate_cost * persons if (r.package and r.package.price_type == 'per_person') else total_plate_cost
            gst = total * 0.18
            grand = total + gst
            advance = float(r.amount_paid)
            remaining = grand - advance
            
            formatted.append({
                "guestName": r.customer_name,
                "phone": r.phone,
                "persons": persons,
                "date": r.reservation_date.isoformat(),
                "timeSlot": "Dinner" if r.reservation_time.hour >= 16 else "Lunch",
                "perPlate": total_plate_cost,
                "advance": advance,
                "total": total,
                "gst": gst,
                "remaining": remaining,
                "receivedFull": remaining <= 0
            })
        return Response(formatted, status=status.HTTP_200_OK)

    def post(self, request):
        # Allow admin to manually log event
        # Payload format: { guestName, phone, persons, date, timeSlot, perPlate, advance, receivedFull }
        data = request.data
        try:
            # We can create a manual reservation representing this logged event
            import datetime
            persons = int(data.get('persons', 10))
            per_plate = float(data.get('perPlate', 500))
            advance = float(data.get('advance', 0))
            total = per_plate * persons
            gst = total * 0.18
            grand = total + gst
            
            # Map timeSlot to time
            time_slot = data.get('timeSlot', 'Lunch')
            res_time = "13:00:00" if time_slot == "Lunch" else "20:00:00"
            
            # BK + timestamp
            booking_id = f"BK{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"

            # Try to match a package by price or create a dummy one
            pkg = Package.objects.filter(price=per_plate).first()

            res = Reservation.objects.create(
                booking_id=booking_id,
                customer_name=data.get('guestName'),
                phone=data.get('phone'),
                email=data.get('email', 'manual@hungryhub.com'),
                table_type='Event Hall',
                table_number='N/A (Special Event Area)',
                guests_count=persons,
                reservation_date=data.get('date'),
                reservation_time=res_time,
                amount_paid=advance,
                payment_method='CASH/COUNTER',
                payment_status='Paid' if data.get('receivedFull') else 'Partial',
                reservation_status='Confirmed',
                package=pkg,
                special_request='Manually logged by admin.'
            )
            return Response({
                "ok": True,
                "message": "Event logged successfully.",
                "data": ReservationSerializer(res).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class TableStatusView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        import datetime
        target_date_str = request.query_params.get('date')
        if target_date_str:
            try:
                target_date = datetime.datetime.strptime(target_date_str, '%Y-%m-%d').date()
            except ValueError:
                target_date = datetime.date.today()
        else:
            target_date = datetime.date.today()

        booked = Reservation.objects.filter(reservation_date=target_date).values_list('table_number', flat=True)
        return Response(list(booked), status=status.HTTP_200_OK)


class ResendConfirmationEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        if request.user.role not in ['admin', 'super_admin', 'manager', 'staff']:
            return Response({"error": "Unauthorized access"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            res = Reservation.objects.get(booking_id=booking_id)
        except Reservation.DoesNotExist:
            return Response({
                "ok": False,
                "error": "Reservation not found."
            }, status=status.HTTP_404_NOT_FOUND)

        # Validate customer email address
        import re
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        email = res.email
        if not email or not isinstance(email, str) or not re.match(email_regex, email.strip()):
            return Response({
                "ok": False,
                "error": "Customer email address is missing or invalid."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            from .utils import send_reservation_confirmation_email
            success = send_reservation_confirmation_email(res, raise_exception=True)
            if success:
                return Response({
                    "ok": True,
                    "message": "Confirmation email sent successfully.",
                    "email_sent_status": res.email_sent_status,
                    "email_sent_timestamp": res.email_sent_timestamp,
                    "last_email_attempt_timestamp": res.last_email_attempt_timestamp
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "ok": False,
                    "error": "Error resending confirmation email."
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error resending confirmation email for Booking ID {booking_id}: {str(e)}")
            return Response({
                "ok": False,
                "error": "Error resending confirmation email."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
