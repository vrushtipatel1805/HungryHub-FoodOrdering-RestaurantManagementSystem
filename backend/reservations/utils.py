import logging
import threading
from django.utils import timezone
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from hungryhub.email_service import EmailService

logger = logging.getLogger(__name__)

def send_reservation_confirmation_email(reservation, raise_exception=False):
    """
    Sends a reservation confirmation email to the customer's email address.
    Updates the reservation's email_sent_status, email_sent_timestamp, and last_email_attempt_timestamp.
    """
    try:
        # Validate email address format
        import re
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        email = reservation.email
        if not email or not isinstance(email, str) or not re.match(email_regex, email.strip()):
            raise ValueError("Customer email address is missing or invalid.")

        # Update last email attempt timestamp immediately
        reservation.last_email_attempt_timestamp = timezone.now()
        reservation.save(update_fields=['last_email_attempt_timestamp'])

        # Format dates/times
        date_str = reservation.reservation_date.strftime('%Y-%m-%d') if hasattr(reservation.reservation_date, 'strftime') else str(reservation.reservation_date)
        time_str = reservation.reservation_time.strftime('%H:%M:%S') if hasattr(reservation.reservation_time, 'strftime') else str(reservation.reservation_time)
        
        # Check if it is a special event reservation or standard table seating (Fine Dining Seating)
        is_event = reservation.package is not None or (reservation.event_name and reservation.event_name != 'Table Reservation')

        # Get restaurant details
        restaurant = EmailService._get_restaurant_data()

        if not is_event:
            subject = f"Fine Dining Seating Confirmation - {reservation.booking_id} | HungryHub"
            content = f"""
            <h1 style="color: #b7410e; margin-top: 0;">Table Booking Confirmed!</h1>
            <p>Dear {reservation.customer_name},</p>
            <p>Thank you for choosing HungryHub! Your table reservation has been successfully booked and confirmed.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Reservation Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 140px;">Booking ID:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace;">{reservation.booking_id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Table Type:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">Fine Dining Seating</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Guests Count:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{reservation.guests_count} Guests</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Reservation Date:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{date_str}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Reservation Time:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{time_str}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Special Requests:</td>
                  <td style="padding: 6px 0; color: #0f172a;">{reservation.special_request or 'None'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Payment Status:</td>
                  <td style="padding: 6px 0;"><span style="background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px;">{reservation.payment_status}</span></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Booking Status:</td>
                  <td style="padding: 6px 0;"><span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px;">{reservation.reservation_status}</span></td>
                </tr>
              </table>
            </div>
            
            <p>We look forward to providing you with an exceptional fine dining experience.</p>
            """
        else:
            subject = f"Booking Confirmation - {reservation.booking_id} | HungryHub"
            package_name = reservation.package_name or (reservation.package.name if reservation.package else "N/A")
            event_name = reservation.event_name or (reservation.package.get_event_type_display() if reservation.package else "Special Event")
            content = f"""
            <h1 style="color: #b7410e; margin-top: 0;">Special Event Booking Confirmed!</h1>
            <p>Dear {reservation.customer_name},</p>
            <p>Thank you for choosing HungryHub! Your special event reservation has been successfully booked and confirmed.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Event Booking Details</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; width: 140px;">Booking ID:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace;">{reservation.booking_id}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Event Type:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{event_name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Package Name:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{package_name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Guests Count:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{reservation.guests_count} Guests</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Reservation Date:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{date_str}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Reservation Time:</td>
                  <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{time_str}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Special Requests:</td>
                  <td style="padding: 6px 0; color: #0f172a;">{reservation.special_request or 'None'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Payment Status:</td>
                  <td style="padding: 6px 0;"><span style="background-color: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px;">{reservation.payment_status}</span></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b;">Booking Status:</td>
                  <td style="padding: 6px 0;"><span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px;">{reservation.reservation_status}</span></td>
                </tr>
              </table>
            </div>
            """

        html_content = EmailService._wrap_layout(content, restaurant)
        text_content = strip_tags(html_content)
        from_email = f"HungryHub <{settings.EMAIL_HOST_USER}>"
        
        # Build EmailMultiAlternatives msg
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[reservation.email]
        )
        msg.attach_alternative(html_content, "text/html")

        # Dispatches email
        msg.send(fail_silently=False)
        
        # Update database fields
        reservation.email_sent_status = 'Sent'
        reservation.email_sent_timestamp = timezone.now()
        reservation.last_email_attempt_timestamp = timezone.now()
        reservation.save(update_fields=['email_sent_status', 'email_sent_timestamp', 'last_email_attempt_timestamp'])
        
        # Log success activity to email_service.log
        log_details = f"Booking confirmation email sent to {reservation.email} | Subject: {subject}"
        EmailService._log_activity("SUCCESS", reservation.email, "booking_confirmation", log_details)
        logger.info(f"Confirmation email successfully sent for Booking ID {reservation.booking_id} to {reservation.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send confirmation email for Booking ID {reservation.booking_id}: {str(e)}")
        reservation.email_sent_status = 'Failed'
        reservation.last_email_attempt_timestamp = timezone.now()
        reservation.save(update_fields=['email_sent_status', 'last_email_attempt_timestamp'])
        
        # Log failure activity to email_service.log
        try:
            EmailService._log_activity("FAILURE", reservation.email, "booking_confirmation", f"SMTP Error: {str(e)}")
        except Exception:
            pass
            
        if raise_exception:
            raise
        return False

def send_reservation_confirmation_email_async(reservation):
    """
    Spawns a separate thread to send the reservation confirmation email asynchronously.
    """
    res_id = reservation.booking_id
    
    def run():
        from django.db import connection
        from reservations.models import Reservation
        try:
            res_obj = Reservation.objects.get(booking_id=res_id)
            send_reservation_confirmation_email(res_obj)
        except Exception as e:
            logger.error(f"Async email sending error for booking {res_id}: {str(e)}")
        finally:
            connection.close()

    thread = threading.Thread(target=run)
    thread.start()
