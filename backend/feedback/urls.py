from django.urls import path
from .views import FeedbackListCreateView, FeedbackDetailView, ApprovedFeedbackListView

urlpatterns = [
    path('feedback/', FeedbackListCreateView.as_view(), name='feedback_list_create'),
    path('feedback/approved/', ApprovedFeedbackListView.as_view(), name='approved_feedback_list'),
    path('feedback/<int:pk>/', FeedbackDetailView.as_view(), name='feedback_detail'),
]

