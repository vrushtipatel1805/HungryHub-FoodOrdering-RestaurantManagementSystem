from rest_framework import serializers
from .models import MenuCategory, MenuItem

class HybridImageField(serializers.ImageField):
    """
    Custom ImageField serializer to handle both file uploads and string URLs.
    """
    def to_internal_value(self, data):
        if isinstance(data, str):
            return data
        return super().to_internal_value(data)


class MenuItemSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_image = serializers.CharField(source='category.image', read_only=True)
    image = HybridImageField(required=False, allow_null=True)

    class Meta:
        model = MenuItem
        fields = (
            'id', 'name', 'category', 'category_slug', 'category_image', 'price',
            'approx_qty_gms', 'description', 'ingredients', 'image', 'prep_time',
            'is_available', 'is_featured', 'is_veg', 'discount', 'gst', 'is_popular',
            'preferred_meal_type', 'preferred_mood', 'taste_type', 'spice_level',
            'calories', 'preparation_time', 'is_recommended', 'ai_priority',
            'popularity_score', 'diet_type', 'recommendation_boost'
        )


class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = MenuCategory
        fields = ('name', 'slug', 'image', 'route', 'description', 'is_active', 'display_order', 'items')

