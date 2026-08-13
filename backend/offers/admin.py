from django.contrib import admin
from .models import Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('title', 'promo_code', 'discount_percent', 'flat_discount', 'is_active', 'start_date', 'expiry_date')
    list_filter = ('is_active', 'start_date', 'expiry_date')
    search_fields = ('title', 'promo_code')
