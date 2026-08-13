import logging
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Reservation, Package

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=Reservation)
def populate_reservation_fields(sender, instance, **kwargs):
    """
    Pre-save receiver to populate event_name, package_name, and link the user
    account automatically by matching the email address.
    """
    try:
        # Cache names
        if not instance.event_name or not instance.package_name:
            if instance.package:
                instance.package_name = instance.package.name
                instance.event_name = dict(Package.EVENT_CHOICES).get(instance.package.event_type, instance.package.event_type)
            else:
                instance.event_name = 'Table Reservation'
                instance.package_name = instance.table_type or 'Standard Table'

        # Auto-link correct User account if email matches
        if not instance.user and instance.email:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            customer_obj = User.objects.filter(email__iexact=instance.email).first()
            if customer_obj:
                instance.user = customer_obj
                logger.info(f"Auto-linked reservation {instance.booking_id} to user account {customer_obj.email}")
    except Exception as e:
        logger.error(f"Error in populate_reservation_fields pre_save signal: {str(e)}")

@receiver(post_save, sender=Reservation)
def trigger_reservation_email(sender, instance, created, **kwargs):
    """
    Post-save receiver to trigger reservation confirmation email asynchronously upon creation.
    """
    if created:
        try:
            from .utils import send_reservation_confirmation_email_async
            send_reservation_confirmation_email_async(instance)
            logger.info(f"Triggered async confirmation email for Booking ID {instance.booking_id}")
        except Exception as e:
            logger.error(f"Error in trigger_reservation_email post_save signal: {str(e)}")
