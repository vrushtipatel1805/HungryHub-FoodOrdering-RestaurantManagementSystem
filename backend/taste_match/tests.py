from django.test import TestCase
from django.urls import reverse
from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APIClient
from taste_match.models import TasteQuestion, TasteOption, RecommendationHistory, TasteResponse

class TasteMatchAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Seed the database using the custom seed_db command
        call_command('seed_db')

    def test_get_questions(self):
        url = reverse('taste_questions')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['ok'])
        self.assertGreater(len(response.data['questions']), 0)

    def test_recommendation_single_select(self):
        url = reverse('taste_recommendation')
        payload = {
            "food_preference": "Veg",
            "spice_level": "Medium",
            "taste_preference": "Salty",
            "meal_type": "Dinner",
            "budget": "₹200–₹500",
            "mood": "Happy",
            "hunger_level": "Medium"
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['ok'])
        self.assertIn('main_recommendation', response.data)
        
        # Verify recommendation history was created
        history_id = response.data['recommendation_id']
        history_exists = RecommendationHistory.objects.filter(id=history_id).exists()
        self.assertTrue(history_exists)
        
        # Verify responses were logged
        responses_count = TasteResponse.objects.count()
        self.assertGreater(responses_count, 0)

    def test_recommendation_multi_select(self):
        url = reverse('taste_recommendation')
        payload = {
            "food_preference": "Veg",
            "spice_level": ["Mild", "Spicy"],
            "taste_preference": ["Sweet", "Tangy"],
            "meal_type": ["Lunch", "Snacks"],
            "budget": ["Under ₹200", "₹200–₹500"],
            "mood": ["Happy", "Office Lunch"],
            "hunger_level": ["Medium", "Light"]
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['ok'])
        self.assertIn('main_recommendation', response.data)
        
        # Verify history saved comma-separated values
        history_id = response.data['recommendation_id']
        history = RecommendationHistory.objects.get(id=history_id)
        self.assertEqual(history.selected_spice, "Mild, Spicy")
        self.assertEqual(history.selected_taste, "Sweet, Tangy")
        self.assertEqual(history.selected_meal, "Lunch, Snacks")
        self.assertEqual(history.selected_budget, "Under ₹200, ₹200–₹500")
        self.assertEqual(history.selected_mood, "Happy, Office Lunch")

        # Verify multiple TasteResponse rows were created for the same question
        spice_question = TasteQuestion.objects.get(key="spice_level")
        responses = TasteResponse.objects.filter(question=spice_question)
        self.assertEqual(responses.count(), 2)

    def test_recommendation_missing_inputs(self):
        url = reverse('taste_recommendation')
        # Empty list is missing/empty choice
        payload = {
            "food_preference": "Veg",
            "spice_level": [],
            "taste_preference": ["Sweet"],
            "meal_type": ["Dinner"],
            "budget": ["₹200–₹500"],
            "mood": ["Happy"],
            "hunger_level": ["Medium"]
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['ok'])
        self.assertIn("required", response.data['error'])
