from django.db import models

class Coupon(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    discount_percent = models.IntegerField(default=10)
    flat_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    promo_code = models.CharField(max_length=50, unique=True)
    start_date = models.DateField()
    expiry_date = models.DateField()
    applicable_category = models.CharField(max_length=100, default='All')
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    terms = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    usage_limit = models.PositiveIntegerField(default=100)
    usage_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.promo_code})"

