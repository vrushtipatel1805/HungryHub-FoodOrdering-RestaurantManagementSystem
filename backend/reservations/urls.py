from django.urls import path
from .views import (
    PackageListView, PackageDetailView, ReservationListCreateView, ReservationDetailView,
    AdminBookingsListView, AdminEventsListView, TableStatusView, ResendConfirmationEmailView
)

urlpatterns = [
    path('packages/', PackageListView.as_view(), name='package_list'),
    path('packages/<str:pk>/', PackageDetailView.as_view(), name='package_detail'),
    path('reservations/', ReservationListCreateView.as_view(), name='reservations_list_create'),
    path('reservations/<str:pk>/', ReservationDetailView.as_view(), name='reservation_detail'),
    path('reservations/<str:booking_id>/resend-email/', ResendConfirmationEmailView.as_view(), name='resend_confirmation_email'),
    
    path('admin/bookings/', AdminBookingsListView.as_view(), name='admin_bookings'),
    path('admin/events/', AdminEventsListView.as_view(), name='admin_events'),
    
    path('tables/status/', TableStatusView.as_view(), name='table_status'),
]

