from rest_framework import serializers
from .models import TasteQuestion, TasteOption, RecommendationHistory
from menu.models import MenuItem

class TasteOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TasteOption
        fields = ('id', 'text', 'value', 'display_order')

class TasteQuestionSerializer(serializers.ModelSerializer):
    options = TasteOptionSerializer(many=True, read_only=True)

    class Meta:
        model = TasteQuestion
        fields = ('id', 'text', 'key', 'display_order', 'options')

class RecommendationHistorySerializer(serializers.ModelSerializer):
    dish_name = serializers.CharField(source='recommended_item.name', read_only=True)
    dish_id = serializers.CharField(source='recommended_item.id', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = RecommendationHistory
        fields = (
            'id', 'user', 'user_name', 'recommended_item', 'dish_id', 'dish_name',
            'match_score', 'selected_budget', 'selected_taste', 'selected_spice',
            'selected_meal', 'selected_mood', 'is_ordered', 'created_at'
        )

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.full_name or obj.user.email
        return "Guest"

class MenuItemAISerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = (
            'id', 'name', 'category_name', 'taste_type', 'spice_level',
            'preferred_meal_type', 'preferred_mood', 'calories',
            'preparation_time', 'is_recommended', 'ai_priority',
            'popularity_score', 'diet_type', 'recommendation_boost'
        )
