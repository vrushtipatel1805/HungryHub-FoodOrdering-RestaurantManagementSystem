from django.urls import path
from .views import (
    TasteQuestionListView,
    TasteRecommendationView,
    AdminTasteStatsView,
    AdminTasteHistoryView,
    AdminTasteAnalyticsView,
    AdminTasteMenuItemsView
)

urlpatterns = [
    # Public APIs
    path('taste-match/questions/', TasteQuestionListView.as_view(), name='taste_questions'),
    path('taste-match/recommend/', TasteRecommendationView.as_view(), name='taste_recommendation'),

    # Admin APIs
    path('admin/taste-match/stats/', AdminTasteStatsView.as_view(), name='admin_taste_stats'),
    path('admin/taste-match/history/', AdminTasteHistoryView.as_view(), name='admin_taste_history'),
    path('admin/taste-match/analytics/', AdminTasteAnalyticsView.as_view(), name='admin_taste_analytics'),
    path('admin/taste-match/menu-items/', AdminTasteMenuItemsView.as_view(), name='admin_taste_menu_items'),
]
