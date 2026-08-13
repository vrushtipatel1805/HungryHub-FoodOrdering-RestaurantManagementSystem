from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from .serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer, RestaurantSettingsSerializer
from .models import RestaurantSettings
from .permissions import IsAdminUserRole, IsAdminOrReadOnly


User = get_user_model()

class CheckEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        exists = User.objects.filter(email=email).exists()
        return Response({"exists": exists}, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "ok": True,
                "message": "Account created successfully.",
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response({
            "ok": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({
                "ok": False,
                "error": "Email and password are required."
            }, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(email=email, password=password)
        if user is None:
            return Response({
                "ok": False,
                "error": "Invalid email or password."
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Explicitly set current user email context for this request thread
        from hungryhub.email_service import set_current_user_email
        set_current_user_email(user.email)

        refresh = RefreshToken.for_user(user)

        return Response({
            "ok": True,
            "message": "Login successful.",
            "user": UserSerializer(user).data,
            "tokens": {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"ok": True, "message": "Logout successful."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"ok": False, "error": "Invalid refresh token."}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            "ok": True,
            "user": serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "ok": True,
                "message": "Profile updated successfully.",
                "user": UserSerializer(request.user).data
            }, status=status.HTTP_200_OK)
        return Response({
            "ok": False,
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class CustomerListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        from orders.models import Order
        from reservations.models import Reservation
        from django.db.models import Sum

        customers = User.objects.filter(role='customer')
        data = []
        for idx, c in enumerate(customers, 1):
            user_orders = Order.objects.filter(email=c.email)
            order_count = user_orders.count()
            total_spend = user_orders.aggregate(total=Sum('grand_total'))['total'] or 0.0
            last_order = user_orders.order_by('-created_at').first()
            last_order_date = last_order.created_at.strftime('%Y-%m-%d') if last_order else 'N/A'
            reservation_count = Reservation.objects.filter(email=c.email).count()

            data.append({
                "pk": c.pk,
                "id": f"CUST-{1000 + idx}",
                "name": c.full_name,
                "email": c.email,
                "phone": "+91 98765 43210",  # default / placeholder if not stored
                "totalOrders": order_count,
                "totalSpend": float(total_spend),
                "lastOrderDate": last_order_date,
                "reservationCount": reservation_count,
                "joinedDate": c.date_joined.strftime('%Y-%m-%d'),
                "is_active": c.is_active
            })
        return Response(data, status=status.HTTP_200_OK)


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.filter(role='customer')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]

    def delete(self, request, *args, **kwargs):
        # Support customer deletion
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"ok": True, "message": "Customer deleted successfully"}, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        # Support updating user profile details like full_name or is_active
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({"ok": True, "user": serializer.data}, status=status.HTTP_200_OK)
        return Response({"ok": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class RestaurantSettingsView(APIView):
    permission_classes = [IsAdminOrReadOnly]

    def get(self, request):
        settings, created = RestaurantSettings.objects.get_or_create(id=1)
        serializer = RestaurantSettingsSerializer(settings)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        settings, created = RestaurantSettings.objects.get_or_create(id=1)
        serializer = RestaurantSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"ok": True, "data": serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminUserManagementView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        admins = User.objects.exclude(role='customer').order_by('-date_joined')
        serializer = UserSerializer(admins, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        email = data.get('email', '').strip().lower()
        password = data.get('password', 'AdminPass123')
        full_name = data.get('full_name')
        role = data.get('role', 'staff')
        permissions_list = data.get('permissions', [])
        mobile = data.get('mobile', '')

        if not email or not full_name:
            return Response({"error": "Email and Full Name are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            role=role,
            mobile=mobile,
            is_staff=True,
            permissions=permissions_list
        )
        return Response({"ok": True, "user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "Admin user not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'role' in data:
            user.role = data['role']
        if 'permissions' in data:
            user.permissions = data['permissions']
        if 'mobile' in data:
            user.mobile = data['mobile']
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'password' in data and data['password']:
            user.set_password(data['password'])
        
        user.save()
        return Response({"ok": True, "user": UserSerializer(user).data}, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response({"ok": True, "message": "Admin user deleted successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "Admin user not found"}, status=status.HTTP_404_NOT_FOUND)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if not current_password or not new_password:
            return Response({"error": "Current and new password are required"}, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if not user.check_password(current_password):
            return Response({"error": "Incorrect current password"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"ok": True, "message": "Password changed successfully"}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            confirm_password = request.data.get('confirm_password', '')
            token = request.data.get('token', '').strip()

            if not email:
                return Response({
                    "ok": False,
                    "error": "Email is required."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve user
            user = User.objects.filter(email=email).first()
            if not user:
                return Response({
                    "ok": False,
                    "error": "User with this email does not exist."
                }, status=status.HTTP_400_BAD_REQUEST)

            if not password and not confirm_password:
                # Phase 1: Request Reset Link
                from django.contrib.auth.tokens import default_token_generator

                # Generate secure cryptographic token
                reset_token = default_token_generator.make_token(user)
                reset_link = f"http://localhost:5173/forgot-password?token={reset_token}&email={email}"

                # Print reset link to stdout/logs for testing purposes since email sending is disabled
                print(f"[PASSWORD RESET LINK] Reset Link: {reset_link}", flush=True)

                return Response({
                    "ok": True,
                    "message": "A secure password reset link has been sent to your email."
                }, status=status.HTTP_200_OK)

            # Phase 2: Confirm Reset
            if not token:
                return Response({
                    "ok": False,
                    "error": "Password reset token is required."
                }, status=status.HTTP_400_BAD_REQUEST)

            from django.contrib.auth.tokens import default_token_generator
            if not default_token_generator.check_token(user, token):
                return Response({
                    "ok": False,
                    "error": "The password reset link is invalid or has expired."
                }, status=status.HTTP_400_BAD_REQUEST)

            if not password or not confirm_password:
                return Response({
                    "ok": False,
                    "error": "New password and confirm password are required."
                }, status=status.HTTP_400_BAD_REQUEST)

            if password != confirm_password:
                return Response({
                    "ok": False,
                    "error": "Passwords do not match."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Password policy validation
            if len(password) < 8:
                return Response({
                    "ok": False,
                    "error": "Password must be at least 8 characters long."
                }, status=status.HTTP_400_BAD_REQUEST)

            import re
            if not re.search(r'[A-Z]', password):
                return Response({
                    "ok": False,
                    "error": "Password must contain at least one uppercase letter."
                }, status=status.HTTP_400_BAD_REQUEST)

            if not re.search(r'[a-z]', password):
                return Response({
                    "ok": False,
                    "error": "Password must contain at least one lowercase letter."
                }, status=status.HTTP_400_BAD_REQUEST)

            if not re.search(r'[0-9]', password):
                return Response({
                    "ok": False,
                    "error": "Password must contain at least one number."
                }, status=status.HTTP_400_BAD_REQUEST)

            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                return Response({
                    "ok": False,
                    "error": "Password must contain at least one special character."
                }, status=status.HTTP_400_BAD_REQUEST)

            # Securely set the password
            user.set_password(password)
            user.save()

            return Response({
                "ok": True,
                "message": "Password updated successfully."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "ok": False,
                "error": f"An error occurred while updating your password: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




