from rest_framework import generics, permissions
from .models import Coupon
from .serializers import CouponSerializer
from authentication.permissions import IsAdminOrReadOnly


class CouponListView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        serializer.save()

class CouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [IsAdminOrReadOnly]

class ActiveCouponListView(generics.ListAPIView):
    serializer_class = CouponSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Coupon.objects.filter(is_active=True).order_by('-created_at')

