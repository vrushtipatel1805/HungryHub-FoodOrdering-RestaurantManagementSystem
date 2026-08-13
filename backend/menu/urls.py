from django.urls import path
from .views import MenuCategoryListView, MenuCategoryDetailView, MenuItemListView, MenuItemDetailView

urlpatterns = [
    path('menu-categories/', MenuCategoryListView.as_view(), name='menu_categories'),
    path('menu-categories/<str:pk>/', MenuCategoryDetailView.as_view(), name='menu_category_detail'),
    path('menu-items/', MenuItemListView.as_view(), name='menu_items'),
    path('menu-items/<str:pk>/', MenuItemDetailView.as_view(), name='menu_item_detail'),
]

