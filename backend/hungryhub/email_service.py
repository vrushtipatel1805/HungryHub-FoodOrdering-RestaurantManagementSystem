import os
import sys
import threading
from datetime import datetime
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


_thread_locals = threading.local()
_log_lock = threading.Lock()

def get_current_user_email():
    """Retrieve the current user email from thread-local storage."""
    return getattr(_thread_locals, 'user_email', None)

def set_current_user_email(email):
    """Store the current user email in thread-local storage."""
    _thread_locals.user_email = email

class EmailService:
    @staticmethod
    def _get_restaurant_data():
        """Retrieve restaurant settings dynamically, with static defaults if missing."""
        try:
            from authentication.models import RestaurantSettings
            settings_obj = RestaurantSettings.objects.get_or_create(id=1)[0]
            return {
                "name": settings_obj.name,
                "tagline": settings_obj.tagline,
                "address": settings_obj.address,
                "phone": settings_obj.phone,
                "email": settings_obj.email,
                "logo": settings_obj.logo
            }
        except Exception:
            return {
                "name": 'HungryHub Gourmet',
                "tagline": '100% Pure Vegetarian Restaurant & Dining',
                "address": 'Near Commerce Six Roads, Navrangpura, Ahmedabad, Gujarat 380009',
                "phone": '+91 98765 43210',
                "email": 'info@hungryhub.com',
                "logo": 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
            }

    @staticmethod
    def _log_activity(status, recipient, email_type, details=""):
        """Logs email activity to a dedicated file in the backend root directory."""
        log_file_path = os.path.join(settings.BASE_DIR, 'email_service.log')
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_message = f"[{timestamp}] [{status.upper()}] {details}\n"
        
        with _log_lock:
            try:
                with open(log_file_path, 'a', encoding='utf-8') as log_file:
                    log_file.write(log_message)
            except Exception as e:
                print(f"Error writing to email log file: {str(e)}")

    @staticmethod
    def _send_raw(email_type, recipient, subject, html_content):
        """Dispatches an HTML email asynchronously using Django's EmailMultiAlternatives."""
        import re
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        
        is_valid = True
        if not recipient or not isinstance(recipient, str):
            is_valid = False
        else:
            recipient = recipient.strip()
            if not re.match(email_regex, recipient):
                is_valid = False

        if not is_valid:
            err_msg = f"Invalid email address: {recipient}"
            EmailService._log_activity("FAILURE", str(recipient), email_type, err_msg)
            print(f"EMAIL SEND FAILURE: {err_msg}", flush=True)
            return

        # Verify content is not empty
        if not html_content or not isinstance(html_content, str) or not html_content.strip():
            err_msg = "Email content is empty"
            EmailService._log_activity("FAILURE", recipient, email_type, err_msg)
            print(f"EMAIL SEND FAILURE: {err_msg}", flush=True)
            return

        def async_task():
            import sys
            import re
            from django.core.mail import get_connection

            traffic_logs = []

            try:
                from_email = f"HungryHub <{settings.EMAIL_HOST_USER}>"
                text_content = strip_tags(html_content)
                
                # Create native Django email
                msg = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content,
                    from_email=from_email,
                    to=[recipient]
                )
                msg.attach_alternative(html_content, "text/html")
                
                # Get generated Message-ID
                msg_id = msg.message().get('Message-ID', 'Unknown')

                # Get connection
                connection = get_connection(fail_silently=False)
                connection.open()
                
                if connection.connection:
                    connection.connection.set_debuglevel(1)
                    # Dynamic thread-safe intercept
                    def custom_print_debug(*args):
                        line = " ".join(map(str, args))
                        traffic_logs.append(line)
                    connection.connection._print_debug = custom_print_debug
                
                try:
                    connection.send_messages([msg])
                finally:
                    connection.close()

                traffic = "\n".join(traffic_logs)
                
                # Extract retcode and message from SMTP transaction log
                retcode = 250
                retmsg = "2.0.0 OK"
                
                for log_line in reversed(traffic_logs):
                    if log_line.startswith("data:"):
                        match = re.search(r"data:\s*\((\d+),\s*b['\"](.*?)['\"]\)", log_line)
                        if match:
                            retcode = int(match.group(1))
                            retmsg = match.group(2)
                            break
                    elif "retcode (" in log_line:
                        match = re.search(r"retcode\s*\((\d+)\);\s*Msg:\s*b['\"](.*?)['\"]", log_line)
                        if match:
                            if int(match.group(1)) == 250:
                                retcode = int(match.group(1))
                                retmsg = match.group(2)
                                break

                # Print complete SMTP transaction to stdout
                print(f"\n=== SMTP TRANSACTION FOR {recipient} ===\n{traffic}\n========================================", flush=True)

                # Map internal types to user-friendly names for proper logs
                email_name_map = {
                    "new_menu_launch": "New menu launch email"
                }
                friendly_name = email_name_map.get(email_type, f"{email_type.replace('_', ' ').capitalize()} email")
                log_details = (
                    f"{friendly_name} sent to {recipient} | Subject: {subject} | "
                    f"Message-ID: {msg_id} | SMTP Code: {retcode} | SMTP Msg: {retmsg}"
                )
                EmailService._log_activity("SUCCESS", recipient, email_type, log_details)
                print(f"EMAIL SEND SUCCESS: {log_details}", flush=True)
            except Exception as e:
                err_details = f"SMTP Error: {str(e)}"
                EmailService._log_activity("FAILURE", recipient, email_type, err_details)
                print(f"EMAIL SEND FAILURE: {err_details}", flush=True)

        # Run in a daemon thread so it doesn't block the request cycle
        threading.Thread(target=async_task, daemon=True).start()

    @staticmethod
    def _wrap_layout(content, restaurant):
        """HTML structure with HungryHub theme styling."""
        return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HungryHub</title>
  <style>
    body {{
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f1f5f9;
      color: #334155;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      background-color: #f1f5f9;
      padding: 20px 10px;
    }}
    .container {{
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      border-top: 6px solid #b7410e;
    }}
    .header {{
      padding: 30px 20px;
      text-align: center;
      background-color: #ffffff;
      border-bottom: 1px solid #f1f5f9;
    }}
    .logo-text {{
      font-size: 28px;
      font-weight: 800;
      color: #b7410e;
      letter-spacing: -0.5px;
      margin: 0;
    }}
    .logo-tagline {{
      font-size: 12px;
      color: #64748b;
      margin: 4px 0 0 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }}
    .content {{
      padding: 30px 25px;
      line-height: 1.6;
    }}
    h1 {{
      font-size: 22px;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 700;
    }}
    p {{
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 15px;
      color: #334155;
    }}
    .button-container {{
      margin: 25px 0;
      text-align: center;
    }}
    .btn-primary {{
      background-color: #b7410e;
      color: #ffffff !important;
      padding: 12px 30px;
      text-decoration: none;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      display: inline-block;
      box-shadow: 0 4px 6px -1px rgba(183, 65, 14, 0.2);
    }}
    .btn-primary:hover {{
      background-color: #9a350a;
    }}
    .footer {{
      background-color: #1e293b;
      color: #94a3b8;
      padding: 30px 20px;
      text-align: center;
      font-size: 13px;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
    }}
    .footer a {{
      color: #ffffff;
      text-decoration: none;
      margin: 0 10px;
    }}
    .footer p {{
      margin: 8px 0;
      color: #94a3b8;
      font-size: 13px;
    }}
    .social-links {{
      margin-bottom: 15px;
    }}
    .social-icon {{
      display: inline-block;
      width: 24px;
      height: 24px;
      line-height: 24px;
      background-color: #334155;
      color: #ffffff !important;
      border-radius: 50%;
      margin: 0 5px;
      font-size: 12px;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-text">{restaurant['name']}</div>
        <div class="logo-tagline">{restaurant['tagline']}</div>
      </div>
      <div class="content">
        {content}
      </div>
      <div class="footer">
        <div class="social-links">
          <a href="#" class="social-icon">F</a>
          <a href="#" class="social-icon">I</a>
          <a href="#" class="social-icon">T</a>
        </div>
        <p><strong>{restaurant['name']}</strong></p>
        <p>{restaurant['address']}</p>
        <p>Phone: {restaurant['phone']} | Email: {restaurant['email']}</p>
        <p>&copy; {datetime.now().year} {restaurant['name']}. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
        """

    @staticmethod
    def send_new_menu_launch(recipient, subject, message):
        """Sends the New Menu Launch notification email."""
        restaurant = EmailService._get_restaurant_data()
        content = f"""
        <h1>New Menu Launch!</h1>
        <p>Dear Valued Guest,</p>
        <div style="white-space: pre-line; line-height: 1.6; font-size: 15px; color: #334155; margin-bottom: 25px;">
          {message}
        </div>
        <div class="button-container">
          <a href="http://localhost:5173/menu" class="btn-primary">Explore Our New Menu</a>
        </div>
        <p>We look forward to serving you soon!</p>
        <p>Best regards,<br>The {restaurant['name']} Team</p>
        """
        html = EmailService._wrap_layout(content, restaurant)
        EmailService._send_raw("new_menu_launch", recipient, subject, html)
