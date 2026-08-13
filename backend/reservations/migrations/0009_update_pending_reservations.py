from django.db import migrations

def update_pending_status(apps, schema_editor):
    Reservation = apps.get_model('reservations', 'Reservation')
    Reservation.objects.filter(reservation_status='Pending').update(reservation_status='Confirmed')

class Migration(migrations.Migration):

    dependencies = [
        ('reservations', '0008_reservation_last_email_attempt_timestamp'),
    ]

    operations = [
        migrations.RunPython(update_pending_status),
    ]
