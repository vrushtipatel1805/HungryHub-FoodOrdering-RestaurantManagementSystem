from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from menu.models import MenuCategory, MenuItem
from reservations.models import Package
from taste_match.models import TasteQuestion, TasteOption

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds database with menu categories, items, event packages, and default users."

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # 1. Default accounts
        self.stdout.write("Creating default user accounts...")
        
        # Admin Account
        if not User.objects.filter(email='admin@hungryhub.com').exists():
            User.objects.create_superuser(
                email='admin@hungryhub.com',
                password='AdminPass123',
                full_name='System Admin',
                dob='1990-01-01'
            )
            self.stdout.write("Created Superuser Admin: admin@hungryhub.com / AdminPass123")


        # Customer Account
        if not User.objects.filter(email='customer@hungryhub.com').exists():
            User.objects.create_user(
                email='customer@hungryhub.com',
                password='CustomerPass123',
                full_name='Regular Customer Asha',
                dob='1988-12-25',
                role='customer'
            )
            self.stdout.write("Created Customer: customer@hungryhub.com / CustomerPass123")

        # 2. Categories
        self.stdout.write("Seeding menu categories...")
        categories_data = [
            {"name": "Cold Beverage", "slug": "cold-beverage", "image": "/Cold Beverage.jpg", "route": "/menu?category=cold-beverage"},
            {"name": "Hot Beverage", "slug": "hot-beverage", "image": "/Hot Beverage.jpg", "route": "/menu?category=hot-beverage"},
            {"name": "Mocktails", "slug": "mocktails", "image": "/Mocktails.jpg", "route": "/menu?category=mocktails"},
            {"name": "Steaming Soup", "slug": "steaming-soup", "image": "/Steaming Soup.jpg", "route": "/menu?category=steaming-soup"},
            {"name": "Yummy Pizza", "slug": "yummy-pizza", "image": "/Yummy Pizza.jpg", "route": "/menu?category=yummy-pizza"},
            {"name": "Bread & Burger", "slug": "bread-burger", "image": "/Bread & Burger.jpg", "route": "/menu?category=bread-burger"},
            {"name": "Snacks", "slug": "snacks", "image": "/Snacks.jpg", "route": "/menu?category=snacks"},
            {"name": "Sandwiches", "slug": "sandwiches", "image": "/Sandwiches.jpg", "route": "/menu?category=sandwiches"},
            {"name": "Baked Dish", "slug": "baked-dish", "image": "/Baked Dish.jpg", "route": "/menu?category=baked-dish"},
            {"name": "Italian Pastas", "slug": "italian-pastas", "image": "/Italian Pastas.jpg", "route": "/menu?category=italian-pastas"},
            {"name": "Chinese Cuisine Starters", "slug": "chinese-cuisine-starters", "image": "/Chinese Cuisine Starters.jpg", "route": "/menu?category=chinese-cuisine-starters"},
        ]

        category_objs = {}
        for c in categories_data:
            cat, created = MenuCategory.objects.update_or_create(
                slug=c['slug'],
                defaults={'name': c['name'], 'image': c['image'], 'route': c['route']}
            )
            category_objs[c['slug']] = cat

        # 3. Menu Items
        self.stdout.write("Seeding menu items...")
        menu_items_data = [
            # Cold Beverage
            {"id": "cb-1", "name": "Mineral Water", "category": "cold-beverage", "price": 30, "approx_qty_gms": 300, "description": "Pure chilled water", "is_veg": True},
            {"id": "cb-2", "name": "Soft drinks", "category": "cold-beverage", "price": 40, "approx_qty_gms": 300, "description": "Chilled soda drinks", "is_veg": True},
            {"id": "cb-3", "name": "Fresh lemon water", "category": "cold-beverage", "price": 50, "approx_qty_gms": 300, "description": "Sweet/salted lemon infusion", "is_veg": True},
            {"id": "cb-4", "name": "Fresh lime soda", "category": "cold-beverage", "price": 80, "approx_qty_gms": 300, "description": "Sweet/Salted sparkling refreshment", "is_veg": True},
            {"id": "cb-5", "name": "Cold coffee", "category": "cold-beverage", "price": 189, "approx_qty_gms": 300, "description": "Classic creamy cold coffee", "is_veg": True},
            {"id": "cb-6", "name": "Cold coffee with ice cream", "category": "cold-beverage", "price": 229, "approx_qty_gms": 300, "description": "Cold coffee topped with vanilla scoop", "is_veg": True},
            
            # Hot Beverage
            {"id": "hb-1", "name": "Masala Chai", "category": "hot-beverage", "price": 40, "approx_qty_gms": 200, "description": "Spiced Indian milk tea", "is_veg": True},
            {"id": "hb-2", "name": "Hot Coffee", "category": "hot-beverage", "price": 50, "approx_qty_gms": 200, "description": "Freshly brewed hot coffee", "is_veg": True},
            {"id": "hb-3", "name": "Green tea", "category": "hot-beverage", "price": 90, "approx_qty_gms": 200, "description": "Healthy warm organic green tea", "is_veg": True},
            {"id": "hb-4", "name": "Hazelnut Delight", "category": "hot-beverage", "price": 189, "approx_qty_gms": 200, "description": "Hazelnut-flavored specialty coffee", "is_veg": True},
            
            # Mocktails
            {"id": "mc-1", "name": "Watermelon Mojito", "category": "mocktails", "price": 180, "approx_qty_gms": 350, "description": "Lemon, watermelon syrup, mint, and soda", "is_veg": True},
            {"id": "mc-2", "name": "Ruby lime", "category": "mocktails", "price": 210, "approx_qty_gms": 350, "description": "Pomegranate extract and lime soda", "is_veg": True},
            {"id": "mc-3", "name": "Skin Shine", "category": "mocktails", "price": 199, "approx_qty_gms": 350, "description": "Carrot, beetroot, cucumber, and ginger juice blend", "is_veg": True},

            # Steaming Soup
            {"id": "ss-1", "name": "Tamatar Dhania Shorba", "category": "steaming-soup", "price": 140, "approx_qty_gms": 250, "description": "Light tomato soup flavored with fresh coriander and cumin.", "is_veg": True},
            {"id": "ss-2", "name": "Hot & Sour Veg Soup", "category": "steaming-soup", "price": 150, "approx_qty_gms": 250, "description": "Spicy and tangy Chinese soup loaded with minced vegetables.", "is_veg": True},
            {"id": "ss-3", "name": "Creamy tomato soup", "category": "steaming-soup", "price": 180, "approx_qty_gms": 250, "description": "Rich tomato soup prepared with fresh cream and herbs", "is_veg": True},

            # Yummy Pizza
            {"id": "pz-1", "name": "Paneer Tikka Pizza", "category": "yummy-pizza", "price": 340, "approx_qty_gms": 450, "description": "Tandoori paneer tikka, bell peppers, onions, and rich mozzarella cheese.", "is_veg": True},
            {"id": "pz-2", "name": "Garden Feast Pizza", "category": "yummy-pizza", "price": 320, "approx_qty_gms": 430, "description": "Loaded with mushrooms, black olives, sweet corn, onions, and capsicum.", "is_veg": True},
            {"id": "pz-3", "name": "Margherita Pizza", "category": "yummy-pizza", "price": 220, "approx_qty_gms": 450, "description": "Classic pizza topped with rich tomato sauce and fresh mozzarella.", "is_veg": True},

            # Bread & Burger
            {"id": "bb-1", "name": "Aloo Tikki Burger", "category": "bread-burger", "price": 130, "approx_qty_gms": 220, "description": "Crispy potato patty, spicy green chutney, and fresh vegetables in a bun.", "is_veg": True},
            {"id": "bb-2", "name": "Cheese Veg Burger", "category": "bread-burger", "price": 150, "approx_qty_gms": 240, "description": "Soft burger bun filled with a crispy veg patty, melted cheese, and mayo.", "is_veg": True},
            {"id": "bb-3", "name": "Paneer Tikka Burger", "category": "bread-burger", "price": 170, "approx_qty_gms": 250, "description": "Grilled paneer tikka, onion rings, mint chutney, and lettuce.", "is_veg": True},

            # Snacks
            {"id": "sk-1", "name": "Crispy Veg Samosa", "category": "snacks", "price": 80, "approx_qty_gms": 150, "description": "Flaky golden pastry filled with spiced potato and green peas.", "is_veg": True},
            {"id": "sk-2", "name": "Assorted Veg Pakora", "category": "snacks", "price": 150, "approx_qty_gms": 250, "description": "Crispy gram flour fritters of potato, onion, spinach, and paneer.", "is_veg": True},

            # Sandwiches
            {"id": "sd-1", "name": "Bombay Grilled Sandwich", "category": "sandwiches", "price": 140, "approx_qty_gms": 250, "description": "Spicy potato mash, cucumber, tomato, onion, and mint chutney.", "is_veg": True},
            {"id": "sd-2", "name": "Paneer Club Sandwich", "category": "sandwiches", "price": 180, "approx_qty_gms": 300, "description": "Double decker sandwich layered with paneer tikka, cheese, and lettuce.", "is_veg": True},

            # Baked Dish
            {"id": "bd-1", "name": "Lasagna Al Forno", "category": "baked-dish", "price": 280, "approx_qty_gms": 350, "description": "Layers of pasta sheets, mixed vegetables, and bechamel, oven-baked.", "is_veg": True},
            {"id": "bd-2", "name": "Mac & Cheese Bake", "category": "baked-dish", "price": 240, "approx_qty_gms": 300, "description": "Macaroni in a rich, three-cheese sauce with golden breadcrumbs.", "is_veg": True},

            # Italian Pastas
            {"id": "ip-1", "name": "Penne Arrabiata", "category": "italian-pastas", "price": 260, "approx_qty_gms": 320, "description": "Penne tossed in a spicy garlic and herb tomato sauce.", "is_veg": True},
            {"id": "ip-2", "name": "Creamy Alfredo Fettuccine", "category": "italian-pastas", "price": 290, "approx_qty_gms": 340, "description": "Fettuccine tossed in rich white parmesan cream with broccoli.", "is_veg": True},

            # Chinese cuisine starters
            {"id": "cs-1", "name": "Veg Spring Rolls", "category": "chinese-cuisine-starters", "price": 170, "approx_qty_gms": 200, "description": "Crispy rolls stuffed with seasoned stir-fried vegetables.", "is_veg": True},
            {"id": "cs-2", "name": "Gobi Manchurian Dry", "category": "chinese-cuisine-starters", "price": 190, "approx_qty_gms": 250, "description": "Crispy cauliflower florets tossed in soy sauce, ginger, and garlic.", "is_veg": True},
        ]

        def get_ai_fields(item_id, category_slug):
            if category_slug in ['cold-beverage', 'hot-beverage']:
                return {
                    'preferred_meal_type': 'Beverage',
                    'preferred_mood': 'Happy',
                    'taste_type': 'Sweet',
                    'spice_level': 'Mild',
                    'calories': 150,
                    'preparation_time': 5,
                    'diet_type': 'Veg',
                    'is_recommended': True if item_id in ['cb-5', 'hb-4'] else False,
                    'ai_priority': 2 if item_id in ['cb-5', 'hb-4'] else 0,
                    'popularity_score': 85
                }
            elif category_slug == 'mocktails':
                return {
                    'preferred_meal_type': 'Beverage',
                    'preferred_mood': 'Party',
                    'taste_type': 'Sweet',
                    'spice_level': 'Mild',
                    'calories': 180,
                    'preparation_time': 8,
                    'diet_type': 'Veg',
                    'is_recommended': True if item_id == 'mc-1' else False,
                    'ai_priority': 3 if item_id == 'mc-1' else 0,
                    'popularity_score': 90
                }
            elif category_slug == 'steaming-soup':
                return {
                    'preferred_meal_type': 'Snacks',
                    'preferred_mood': 'Office Lunch',
                    'taste_type': 'Tangy',
                    'spice_level': 'Medium',
                    'calories': 120,
                    'preparation_time': 10,
                    'diet_type': 'Veg',
                    'is_recommended': True if item_id == 'ss-2' else False,
                    'ai_priority': 1 if item_id == 'ss-2' else 0,
                    'popularity_score': 75
                }
            elif category_slug == 'yummy-pizza':
                return {
                    'preferred_meal_type': 'Dinner',
                    'preferred_mood': 'Party',
                    'taste_type': 'Cheesy',
                    'spice_level': 'Spicy',
                    'calories': 780,
                    'preparation_time': 20,
                    'diet_type': 'Veg',
                    'is_recommended': True if item_id == 'pz-1' else False,
                    'ai_priority': 5 if item_id == 'pz-1' else 0,
                    'popularity_score': 98
                }
            elif category_slug == 'bread-burger':
                return {
                    'preferred_meal_type': 'Snacks',
                    'preferred_mood': 'Celebration',
                    'taste_type': 'Salty',
                    'spice_level': 'Medium',
                    'calories': 480,
                    'preparation_time': 12,
                    'diet_type': 'Veg',
                    'is_recommended': True if item_id == 'bb-3' else False,
                    'ai_priority': 2 if item_id == 'bb-3' else 0,
                    'popularity_score': 88
                }
            elif category_slug == 'snacks':
                return {
                    'preferred_meal_type': 'Snacks',
                    'preferred_mood': 'Happy',
                    'taste_type': 'Salty',
                    'spice_level': 'Spicy',
                    'calories': 320,
                    'preparation_time': 15,
                    'diet_type': 'Jain Veg',
                    'is_recommended': False,
                    'ai_priority': 0,
                    'popularity_score': 80
                }
            elif category_slug == 'sandwiches':
                return {
                    'preferred_meal_type': 'Lunch',
                    'preferred_mood': 'Office Lunch',
                    'taste_type': 'Creamy',
                    'spice_level': 'Medium',
                    'calories': 350,
                    'preparation_time': 10,
                    'diet_type': 'Veg',
                    'is_recommended': True if item_id == 'sd-2' else False,
                    'ai_priority': 1 if item_id == 'sd-2' else 0,
                    'popularity_score': 82
                }
            elif category_slug == 'baked-dish':
                return {
                    'preferred_meal_type': 'Dinner',
                    'preferred_mood': 'Family Dinner',
                    'taste_type': 'Cheesy',
                    'spice_level': 'Medium',
                    'calories': 620,
                    'preparation_time': 25,
                    'diet_type': 'Veg',
                    'is_recommended': True if item_id == 'bd-1' else False,
                    'ai_priority': 4 if item_id == 'bd-1' else 0,
                    'popularity_score': 92
                }
            elif category_slug == 'italian-pastas':
                return {
                    'preferred_meal_type': 'Dinner',
                    'preferred_mood': 'Romantic',
                    'taste_type': 'Creamy',
                    'spice_level': 'Spicy',
                    'calories': 560,
                    'preparation_time': 18,
                    'diet_type': 'Veg',
                    'is_recommended': True if item_id == 'ip-1' else False,
                    'ai_priority': 3 if item_id == 'ip-1' else 0,
                    'popularity_score': 95
                }
            else: # chinese-cuisine-starters
                return {
                    'preferred_meal_type': 'Lunch',
                    'preferred_mood': 'Celebration',
                    'taste_type': 'Tangy',
                    'spice_level': 'Extra Spicy',
                    'calories': 420,
                    'preparation_time': 15,
                    'diet_type': 'Jain Veg',
                    'is_recommended': True if item_id == 'cs-2' else False,
                    'ai_priority': 2 if item_id == 'cs-2' else 0,
                    'popularity_score': 89
                }

        for item in menu_items_data:
            cat = category_objs.get(item['category'])
            if cat:
                ai = get_ai_fields(item['id'], item['category'])
                MenuItem.objects.update_or_create(
                    id=item['id'],
                    defaults={
                        'name': item['name'],
                        'category': cat,
                        'price': item['price'],
                        'approx_qty_gms': item['approx_qty_gms'],
                        'description': item['description'],
                        'is_veg': item['is_veg'],
                        'preferred_meal_type': ai['preferred_meal_type'],
                        'preferred_mood': ai['preferred_mood'],
                        'taste_type': ai['taste_type'],
                        'spice_level': ai['spice_level'],
                        'calories': ai['calories'],
                        'preparation_time': ai['preparation_time'],
                        'is_recommended': ai['is_recommended'],
                        'ai_priority': ai['ai_priority'],
                        'popularity_score': ai['popularity_score'],
                        'diet_type': ai['diet_type']
                    }
                )

        # Seeding Taste Questions and Options
        self.stdout.write("Seeding taste questions and options...")
        # Clean up deprecated questions
        TasteQuestion.objects.filter(key='food_preference').delete()
        
        questions_data = [
            {
                "key": "spice_level",
                "text": "Spice Level",
                "display_order": 2,
                "options": [
                    {"text": "Mild", "value": "Mild"},
                    {"text": "Medium", "value": "Medium"},
                    {"text": "Spicy", "value": "Spicy"},
                    {"text": "Extra Spicy", "value": "Extra Spicy"}
                ]
            },
            {
                "key": "taste_preference",
                "text": "Taste Preference",
                "display_order": 3,
                "options": [
                    {"text": "Sweet", "value": "Sweet"},
                    {"text": "Salty", "value": "Salty"},
                    {"text": "Tangy", "value": "Tangy"},
                    {"text": "Creamy", "value": "Creamy"},
                    {"text": "Cheesy", "value": "Cheesy"}
                ]
            },
            {
                "key": "meal_type",
                "text": "Meal Type",
                "display_order": 4,
                "options": [
                    {"text": "Lunch", "value": "Lunch"},
                    {"text": "Dinner", "value": "Dinner"},
                    {"text": "Snacks", "value": "Snacks"},
                    {"text": "Dessert", "value": "Dessert"},
                    {"text": "Beverage", "value": "Beverage"}
                ]
            },
            {
                "key": "budget",
                "text": "Budget",
                "display_order": 5,
                "options": [
                    {"text": "Under ₹200", "value": "Under ₹200"},
                    {"text": "₹200–₹500", "value": "₹200–₹500"},
                    {"text": "₹500–₹1000", "value": "₹500–₹1000"},
                    {"text": "Above ₹1000", "value": "Above ₹1000"}
                ]
            },
            {
                "key": "mood",
                "text": "Mood",
                "display_order": 6,
                "options": [
                    {"text": "Happy", "value": "Happy"},
                    {"text": "Family Dinner", "value": "Family Dinner"},
                    {"text": "Party", "value": "Party"},
                    {"text": "Romantic", "value": "Romantic"},
                    {"text": "Office Lunch", "value": "Office Lunch"},
                    {"text": "Celebration", "value": "Celebration"}
                ]
            },
            {
                "key": "hunger_level",
                "text": "Hunger Level",
                "display_order": 7,
                "options": [
                    {"text": "Light", "value": "Light"},
                    {"text": "Medium", "value": "Medium"},
                    {"text": "Very Hungry", "value": "Very Hungry"}
                ]
            }
        ]

        for q_data in questions_data:
            q_obj, created = TasteQuestion.objects.update_or_create(
                key=q_data['key'],
                defaults={
                    'text': q_data['text'],
                    'display_order': q_data['display_order']
                }
            )
            # Remove old options if questions were modified
            q_obj.options.all().delete()
            for opt_idx, opt_data in enumerate(q_data['options']):
                TasteOption.objects.create(
                    question=q_obj,
                    text=opt_data['text'],
                    value=opt_data['value'],
                    display_order=opt_idx + 1
                )

        # 4. Special Event Packages
        self.stdout.write("Seeding event packages...")
        packages_data = []

        for pkg in packages_data:
            Package.objects.update_or_create(
                id=pkg['id'],
                defaults={
                    'event_type': pkg['event_type'],
                    'name': pkg['name'],
                    'price': pkg['price'],
                    'price_type': pkg['price_type'],
                    'min_capacity': pkg['min_capacity'],
                    'max_capacity': pkg['max_capacity'],
                    'duration': pkg['duration'],
                    'inclusions': pkg['inclusions']
                }
            )

        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
