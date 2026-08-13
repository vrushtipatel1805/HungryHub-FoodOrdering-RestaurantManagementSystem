from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem, DineInBill, Payment

from menu.models import MenuItem
from django.contrib.auth import get_user_model

User = get_user_model()

class MenuItemSummarySerializer(serializers.ModelSerializer):
    category_image = serializers.CharField(source='category.image', read_only=True)

    class Meta:
        model = MenuItem
        fields = ('id', 'name', 'price', 'is_veg', 'image', 'category_image', 'gst')

class CartItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSummarySerializer(read_only=True)
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source='menu_item', write_only=True
    )

    class Meta:
        model = CartItem
        fields = ('id', 'menu_item', 'menu_item_id', 'quantity')

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField()

    class Meta:
        model = Cart
        fields = ('id', 'user', 'items', 'created_at', 'updated_at')

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSummarySerializer(read_only=True)
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(), source='menu_item', write_only=True
    )

    class Meta:
        model = OrderItem
        fields = ('id', 'menu_item', 'menu_item_id', 'quantity', 'price')

class OrderSerializer(serializers.ModelSerializer):
    id = serializers.CharField(required=False)
    items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = (
            'id', 'user', 'customer_name', 'phone', 'email', 'address', 'pincode',
            'item_total', 'gst_amount', 'discount_amount', 'grand_total',
            'payment_method', 'payment_status', 'status',
            'created_at', 'items'
        )

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Auto-generate a unique order ID if not provided
        import random
        order_id = validated_data.get('id')
        if not order_id:
            order_id = f"HH-{random.randint(100000, 999999)}"
            validated_data['id'] = order_id
            
        # Associate user context if authenticated
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
            
        order = Order.objects.create(**validated_data)
        
        # Save items passed in payload
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        # If no items were explicitly passed, attempt to populate from the user's cart
        if not items_data and request and request.user.is_authenticated:
            try:
                cart = Cart.objects.get(user=request.user)
                cart_items = cart.items.all()
                for cart_item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        menu_item=cart_item.menu_item,
                        quantity=cart_item.quantity,
                        price=cart_item.menu_item.price
                    )
            except Cart.DoesNotExist:
                pass
                
        # Always clear the user's cart from database on order completion
        if request and request.user.is_authenticated:
            try:
                cart = Cart.objects.get(user=request.user)
                cart.items.all().delete()
            except Cart.DoesNotExist:
                pass
                
        # Create Payment log
        try:
            import random
            payment_id = f"PY-{random.randint(100000, 999999)}"
            Payment.objects.create(
                id=payment_id,
                customer=order.user,
                order=order,
                amount=order.grand_total,
                gst=order.gst_amount,
                discount=order.discount_amount,
                payment_method=order.payment_method or 'UPI',
                status='Success' if order.payment_status.lower() == 'paid' else 'Pending'
            )
        except Exception as e:
            print("Error creating payment log:", e)

        return order


class DineInBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = DineInBill
        fields = ('id', 'guest_name', 'amount', 'gst', 'total', 'date', 'time', 'created_at')


class PaymentSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'

