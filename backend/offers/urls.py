from django.urls import path
from .views import (
    CouponListView, CouponDetailView, ActiveCouponListView
)

urlpatterns = [
    path('coupons/', CouponListView.as_view(), name='coupon_list'),
    path('coupons/active/', ActiveCouponListView.as_view(), name='active_coupon_list'),
    path('coupons/<int:pk>/', CouponDetailView.as_view(), name='coupon_detail'),
]

