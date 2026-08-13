import os
import sys
import django
import time

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hungryhub.settings')
django.setup()

from hungryhub.email_service import EmailService

def main():
    recipient = os.environ.get('TEST_RECIPIENT', 'customer@hungryhub.com')
    print(f"=== Testing Email Delivery to: {recipient} ===")
    
    # 1. Test sending HTML email (New Menu Launch)
    print("\nSending New Menu Launch HTML template email...")
    subject = "✨ Introducing 8 New Gourmet 100% Veg Specialties at HungryHub!"
    message = (
        "Exciting News!\n\nOur Master Chefs have curated 8 brand-new 100% vegetarian culinary masterpieces "
        "including Cheese Ka Khazana sizzlers, Tandoor Ke Sholay, and artisanal smoothies.\n\n"
        "Explore the updated menu on our website or visit us today!\n\nHungryHub Ahmedabad"
    )
    EmailService.send_new_menu_launch(recipient, subject, message)
    
    # 2. Test validation of invalid email format
    print("\nTesting email validation with invalid address 'abc'...")
    EmailService.send_new_menu_launch("abc", subject, message)
    
    print("\nWaiting for async threads to complete transmission...")
    for i in range(15):
        print(f"Waiting... {i+1}s")
        time.sleep(1)  # Wait for SMTP operations
    
    print("\nChecking email_service.log for latest log entries:")
    log_path = 'email_service.log'
    if os.path.exists(log_path):
        with open(log_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for line in lines[-10:]: # Print the last 10 lines
                print(line.strip())
    else:
        print("Log file not found.")

if __name__ == '__main__':
    main()
