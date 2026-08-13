from django.contrib import admin
from .models import Package, Reservation

@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ('id', 'event_type', 'name', 'price', 'price_type', 'min_capacity', 'max_capacity', 'duration')
    list_filter = ('event_type', 'price_type')
    search_fields = ('name', 'id')

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'customer_name', 'phone', 'email', 'table_type', 'table_number', 'guests_count', 'reservation_date', 'reservation_time', 'amount_paid', 'reservation_status', 'email_sent_status', 'email_sent_timestamp')
    list_filter = ('reservation_status', 'table_type', 'reservation_date', 'email_sent_status')
    search_fields = ('booking_id', 'customer_name', 'phone', 'email')
