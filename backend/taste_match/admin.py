from django.contrib import admin
from .models import TasteQuestion, TasteOption, TasteResponse, RecommendationHistory

@admin.register(TasteQuestion)
class TasteQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'text', 'key', 'display_order')
    search_fields = ('text', 'key')
    ordering = ('display_order',)

@admin.register(TasteOption)
class TasteOptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'text', 'value', 'display_order')
    list_filter = ('question',)
    search_fields = ('text', 'value')
    ordering = ('question', 'display_order')

@admin.register(TasteResponse)
class TasteResponseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'question', 'selected_option', 'created_at')
    list_filter = ('question', 'created_at')
    search_fields = ('user__email', 'question__text', 'selected_option__text')
    ordering = ('-created_at',)

@admin.register(RecommendationHistory)
class RecommendationHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'recommended_item', 'match_score', 'selected_budget', 'selected_taste', 'selected_spice', 'selected_meal', 'selected_mood', 'is_ordered', 'created_at')
    list_filter = ('selected_taste', 'selected_spice', 'selected_meal', 'selected_mood', 'is_ordered', 'created_at')
    search_fields = ('user__email', 'recommended_item__name')
    ordering = ('-created_at',)
