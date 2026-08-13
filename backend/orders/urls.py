from django.urls import path
from .views import (
    CartView, CartAddItemView, CartUpdateItemView, CartRemoveItemView, CartClearView,
    OrderListView, OrderDetailView, AdminDineInBillView, AdminDashboardStatsView,
    AdminRevenueHistoryView, AdminReportsDataView, AdminAnalyticsView,
    PaymentListView, PaymentDetailView, PaymentRefundView,
    AdminCartManagementView, AdminCartDetailView, AdminCartItemRemoveView,
    AdminSendNotificationView
)

urlpatterns = [
    path('orders/', OrderListView.as_view(), name='orders_list_create'),
    path('orders/<str:pk>/', OrderDetailView.as_view(), name='order_detail_update'),
    
    path('cart/', CartView.as_view(), name='cart_view'),
    path('cart/add/', CartAddItemView.as_view(), name='cart_add_item'),
    path('cart/update/', CartUpdateItemView.as_view(), name='cart_update_item'),
    path('cart/remove/', CartRemoveItemView.as_view(), name='cart_remove_item'),
    path('cart/clear/', CartClearView.as_view(), name='cart_clear'),
    
    path('admin/dashboard/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('admin/dine-in/', AdminDineInBillView.as_view(), name='admin_dine_in_bill'),
    path('admin/revenue/', AdminRevenueHistoryView.as_view(), name='admin_revenue_history'),
    path('admin/reports-data/', AdminReportsDataView.as_view(), name='admin_reports_data'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin_analytics_stats'),
    
    path('admin/carts/', AdminCartManagementView.as_view(), name='admin_carts_list'),
    path('admin/carts/<str:email>/', AdminCartDetailView.as_view(), name='admin_cart_detail_clear'),
    path('admin/carts/<str:email>/items/<int:item_id>/', AdminCartItemRemoveView.as_view(), name='admin_cart_item_remove'),
    
    path('admin/payments/', PaymentListView.as_view(), name='admin_payments_list'),
    path('admin/payments/<str:pk>/', PaymentDetailView.as_view(), name='admin_payment_detail'),
    path('admin/payments/<str:pk>/refund/', PaymentRefundView.as_view(), name='admin_payment_refund'),
    
    path('admin/notifications/send/', AdminSendNotificationView.as_view(), name='admin_send_notification'),
]

