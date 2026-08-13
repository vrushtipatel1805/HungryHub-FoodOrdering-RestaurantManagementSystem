from django.contrib import admin
from .models import Cart, CartItem, Order, OrderItem, DineInBill

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    inlines = [CartItemInline]

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'phone', 'grand_total', 'payment_method', 'status', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('id', 'customer_name', 'phone', 'email')
    inlines = [OrderItemInline]

@admin.register(DineInBill)
class DineInBillAdmin(admin.ModelAdmin):
    list_display = ('guest_name', 'amount', 'gst', 'total', 'date', 'time')
    list_filter = ('date',)
    search_fields = ('guest_name',)
