from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()

    class Meta:
        model = Feedback
        fields = ('id', 'name', 'email', 'rating', 'message', 'order_id', 'is_approved', 'reply', 'is_resolved', 'date', 'created_at')

    def get_date(self, obj):
        return obj.created_at.strftime('%B %d, %Y')

