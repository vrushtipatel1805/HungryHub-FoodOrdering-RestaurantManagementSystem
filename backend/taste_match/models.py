from django.db import models
from django.conf import settings
from menu.models import MenuItem

class TasteQuestion(models.Model):
    text = models.CharField(max_length=255)
    key = models.CharField(max_length=100, unique=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.text

class TasteOption(models.Model):
    question = models.ForeignKey(TasteQuestion, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    value = models.CharField(max_length=100)
    display_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.question.text} - {self.text}"

class TasteResponse(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='taste_responses')
    question = models.ForeignKey(TasteQuestion, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(TasteOption, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        username = self.user.email if self.user else "Guest"
        return f"Response by {username}: {self.question.text} = {self.selected_option.text}"

class RecommendationHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name='recommendation_histories')
    recommended_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    match_score = models.IntegerField()
    selected_budget = models.CharField(max_length=100)
    selected_taste = models.CharField(max_length=100)
    selected_spice = models.CharField(max_length=100)
    selected_meal = models.CharField(max_length=100)
    selected_mood = models.CharField(max_length=100)
    is_ordered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        username = self.user.email if self.user else "Guest"
        return f"Recommendation for {username}: {self.recommended_item.name} ({self.match_score}%)"
