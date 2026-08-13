from django.test import TestCase
from django.urls import reverse
from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from reservations.models import Reservation, Package

User = get_user_model()

class EventBookingConfirmationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Seed the database to get packages and users
        call_command('seed_db')
        from reservations.views import ensure_default_packages
        ensure_default_packages()
        # Get reference package & user
        self.birthday_package = Package.objects.get(id='birthday-party')
        self.customer = User.objects.get(email='customer@hungryhub.com')
        self.admin = User.objects.get(email='admin@hungryhub.com')

    def test_reservation_creation_signals(self):
        # Create a reservation with customer email
        res = Reservation.objects.create(
            booking_id='BKTEST12345',
            customer_name='Asha Customer',
            phone='9876543210',
            email='customer@hungryhub.com',
            table_type='Event Hall',
            table_number='N/A (Special Event Area)',
            guests_count=15,
            reservation_date='2026-08-15',
            reservation_time='13:00:00',
            amount_paid=11985.00,
            payment_method='CARD',
            payment_status='Paid',
            reservation_status='Confirmed',
            package=self.birthday_package
        )
        
        # Verify pre-save fields populated correctly
        self.assertEqual(res.package_name, self.birthday_package.name)
        self.assertEqual(res.event_name, 'Birthday Celebration')
        self.assertEqual(res.user, self.customer)
        
        # Verify default email status by triggering send sync
        from reservations.utils import send_reservation_confirmation_email
        success = send_reservation_confirmation_email(res)
        self.assertTrue(success)
        self.assertEqual(res.email_sent_status, 'Sent')
        self.assertIsNotNone(res.email_sent_timestamp)

    def test_resend_confirmation_email_api(self):
        res = Reservation.objects.create(
            booking_id='BKTEST54321',
            customer_name='Asha Customer',
            phone='9876543210',
            email='customer@hungryhub.com',
            table_type='Event Hall',
            table_number='N/A (Special Event Area)',
            guests_count=15,
            reservation_date='2026-08-15',
            reservation_time='13:00:00',
            amount_paid=11985.00,
            payment_method='CARD',
            payment_status='Paid',
            reservation_status='Confirmed',
            package=self.birthday_package
        )

        url = reverse('resend_confirmation_email', kwargs={'booking_id': res.booking_id})
        
        # Test anonymous access -> forbidden
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Test customer access -> forbidden (admins only)
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Test admin access -> success
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['ok'])
        self.assertEqual(response.data['email_sent_status'], 'Sent')

    def test_fine_dining_reservation_email(self):
        # Create a Fine Dining table reservation (package=None)
        res = Reservation.objects.create(
            booking_id='BKTEST_FD_01',
            customer_name='Asha Customer',
            phone='9876543210',
            email='customer@hungryhub.com',
            table_type='4 Seater',
            table_number='Table 02',
            guests_count=4,
            reservation_date='2026-08-16',
            reservation_time='19:30:00',
            amount_paid=1000.00,
            payment_method='CARD',
            payment_status='Paid',
            reservation_status='Confirmed',
            package=None
        )
        
        # Verify cached/default pre-save values
        self.assertEqual(res.event_name, 'Table Reservation')
        self.assertEqual(res.package_name, '4 Seater')
        
        # Trigger sending email sync to inspect output
        from reservations.utils import send_reservation_confirmation_email
        success = send_reservation_confirmation_email(res)
        self.assertTrue(success)
        self.assertEqual(res.email_sent_status, 'Sent')
        self.assertIsNotNone(res.email_sent_timestamp)

    def test_resend_email_invalid_address(self):
        # Create a reservation with invalid email address format
        res = Reservation.objects.create(
            booking_id='BKTEST_INVALID_EMAIL',
            customer_name='Asha Customer',
            phone='9876543210',
            email='invalid_email_format',
            table_type='4 Seater',
            table_number='Table 02',
            guests_count=4,
            reservation_date='2026-08-16',
            reservation_time='19:30:00',
            amount_paid=1000.00,
            payment_method='CARD',
            payment_status='Paid',
            reservation_status='Confirmed',
            package=None
        )
        url = reverse('resend_confirmation_email', kwargs={'booking_id': res.booking_id})
        
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['ok'])
        self.assertEqual(response.data['error'], "Customer email address is missing or invalid.")

    def test_package_creation_with_image(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        self.client.force_authenticate(user=self.admin)
        
        # Transparent 1x1 GIF
        image_content = b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b'
        sample_image = SimpleUploadedFile(
            name='test_package_image.gif',
            content=image_content,
            content_type='image/gif'
        )

        url = reverse('package_list')
        data = {
            'id': 'test-pkg-image-id',
            'event_type': 'birthday',
            'name': 'Test Image Package',
            'description': 'A package that tests image upload.',
            'price': '999.00',
            'price_type': 'per_person',
            'min_capacity': 10,
            'max_capacity': 50,
            'duration': '3 Hours',
            'inclusions': '["Mocktail","Dessert"]',
            'is_active': True,
            'image': sample_image
        }

        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['image'])
        
        pkg = Package.objects.get(id='test-pkg-image-id')
        self.assertTrue(pkg.image)
        
        import os
        image_path = pkg.image.path
        self.assertTrue(os.path.exists(image_path))
        
        del_url = reverse('package_detail', kwargs={'pk': pkg.id})
        del_response = self.client.delete(del_url)
        self.assertEqual(del_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(os.path.exists(image_path))
