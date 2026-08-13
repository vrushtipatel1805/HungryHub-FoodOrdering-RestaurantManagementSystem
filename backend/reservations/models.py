from django.db import models
from django.conf import settings

class Package(models.Model):
    EVENT_CHOICES = (
        ('birthday', 'Birthday Celebration'),
        ('anniversary', 'Anniversary Celebration'),
        ('corporate', 'Corporate Party'),
        ('family', 'Family Celebration'),
        ('other', 'Other Functions & Events'),
    )
    PRICE_TYPE_CHOICES = (
        ('per_person', 'Per Person'),
        ('fixed', 'Fixed'),
    )
    id = models.CharField(max_length=50, primary_key=True)  # custom ID like 'bd-silver'
    event_type = models.CharField(max_length=50, choices=EVENT_CHOICES)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    price_type = models.CharField(max_length=20, choices=PRICE_TYPE_CHOICES)
    min_capacity = models.PositiveIntegerField(default=10)
    max_capacity = models.PositiveIntegerField(default=100)
    duration = models.CharField(max_length=50, default='4 Hours')
    inclusions = models.JSONField(default=list)  # array of strings
    is_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to='reservation_packages/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (₹{self.price} {self.price_type})"


class Reservation(models.Model):
    booking_id = models.CharField(max_length=50, primary_key=True)  # BK + DateStr + Random
    transaction_id = models.CharField(max_length=50, blank=True, null=True)
    customer_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    table_type = models.CharField(max_length=50)  # '2 Seater', '4 Seater', '6 Seater', 'Event Hall'
    table_number = models.CharField(max_length=50)  # e.g., 'Table 01', 'N/A (Special Event Area)'
    guests_count = models.PositiveIntegerField()
    reservation_date = models.DateField()
    reservation_time = models.TimeField()
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=100)
    payment_status = models.CharField(max_length=50, default='Paid')
    reservation_status = models.CharField(max_length=50, default='Confirmed')
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservations')
    event_name = models.CharField(max_length=100, blank=True, null=True)
    package_name = models.CharField(max_length=100, blank=True, null=True)
    email_sent_status = models.CharField(max_length=10, default='Failed', choices=[('Sent', 'Sent'), ('Failed', 'Failed')])
    email_sent_timestamp = models.DateTimeField(null=True, blank=True)
    last_email_attempt_timestamp = models.DateTimeField(null=True, blank=True)
    special_request = models.TextField(blank=True, null=True)
    invoice_data = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reservation {self.booking_id} - {self.customer_name}"
