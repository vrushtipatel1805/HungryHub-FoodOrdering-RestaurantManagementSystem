from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView, CheckEmailView, 
    CustomerListView, CustomerDetailView, RestaurantSettingsView,
    AdminUserManagementView, AdminUserDetailView, ChangePasswordView,
    ForgotPasswordView
)

urlpatterns = [
    path('signup/', RegisterView.as_view(), name='auth_signup'),
    path('signin/', LoginView.as_view(), name='auth_signin'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),
    path('check-email/', CheckEmailView.as_view(), name='auth_check_email'),
    path('customers/', CustomerListView.as_view(), name='auth_customers'),
    path('customers/<str:pk>/', CustomerDetailView.as_view(), name='auth_customer_detail'),
    
    path('settings/', RestaurantSettingsView.as_view(), name='restaurant_settings'),
    path('admins/', AdminUserManagementView.as_view(), name='admin_users_list_create'),
    path('admins/<str:pk>/', AdminUserDetailView.as_view(), name='admin_user_detail_update'),
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
]


