# HungryHub 
HungryHub is a full-stack online food ordering and restaurant management system developed for a pure vegetarian restaurant.
It allows customers to explore the menu, order food, apply coupons, make payments, reserve tables and event packages,
provide feedback, and receive booking/order notifications. The system also includesan admin panel for managing users,
menu items, orders, reservations, payments, coupons, feedback, and restaurant operations.
# Technology Used

**Frontend:**
React.js
Vite
HTML5
CSS3
JavaScript
Tailwind CSS

**Backend:**
Python
Django
Django REST Framework
REST APIs

**Database:**
PostgreSQL
Django ORM

**Other Technologies:**
JWT Authentication
Email/SMTP Integration
PDF Bill/Receipt Generation
Git & GitHub
npm

# Key Features
👤 User Registration & Login
🔐 JWT-based Authentication
🍕 Vegetarian Food Menu
📂 Menu Categories & Food Items
🛒 Shopping Cart
📦 Online Food Ordering
💰 GST & Delivery Charge Calculation
🎟️ Coupon & Discount System
💳 Payment Management
🍽️ Table Reservation
🎉 Event Package Booking
📄 Booking & Order Bill Generation
📧 Email Notifications
⭐ Customer Feedback & Ratings
🤖 AI Taste Match
❤️ Favourite Meals / Food Recommendations
📊 Admin Dashboard
👥 User Management
🍴 Menu Management
📋 Order Management
🪑 Reservation Management
💵 Revenue & Payment Management
🎟️ Coupon Management
📈 Reports & Analytics

# Project Structure
```text
HungryHub/
│
├── backend/
│   ├── authentication/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── permissions.py
│   │
│   ├── menu/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── management/
│   │
│   ├── orders/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── reservations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── offers/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── feedback/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── hungryhub/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── middleware.py
│   │   └── email_service.py
│   │
│   ├── media/
│   ├── manage.py
│   └── migrations/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   └── styles/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```
# Database Relationship
The main database relationships in HungryHub are:
```text
                    ┌───────────────┐
                    │  CustomUser   │
                    └───────┬───────┘
                            │
             ┌──────────────┼───────────────┐
             │              │               │
             ▼              ▼               ▼
           Cart           Order        Reservation
             │              │               │
             ▼              ▼               ▼
         CartItem       OrderItem         Package
             │              │
             └───────┬──────┘
                     ▼
                  MenuItem
                     │
                     ▼
                MenuCategory
```
# Simple ER Relationship
```text
CustomUser
   │
   ├── 1 ─── 1 Cart
   │             │
   │             └── N CartItem ─── 1 MenuItem ─── N ─── 1 MenuCategory
   │
   ├── 1 ─── N Order
   │             │
   │             └── N OrderItem ─── 1 MenuItem
   │
   ├── 1 ─── N Reservation ─── N ─── 1 Package
   │
   └── 1 ─── N Payment
                    │
                    ├── Order
                    └── Reservation

Feedback
   └── Customer feedback & rating
       
Coupon
   └── Discount / Promo Code Management
```
