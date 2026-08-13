from django.db import models

class Feedback(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    rating = models.PositiveIntegerField()  # 1 to 5
    message = models.TextField()
    order_id = models.CharField(max_length=100, blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    reply = models.TextField(blank=True, null=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback by {self.name} - {self.rating} Stars"

