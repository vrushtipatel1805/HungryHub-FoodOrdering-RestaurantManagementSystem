from django.db import models

class MenuCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True, primary_key=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    route = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    id = models.CharField(max_length=50, primary_key=True)  # custom ID like 'cb-1'
    name = models.CharField(max_length=255)
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    approx_qty_gms = models.IntegerField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    ingredients = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='menu/', blank=True, null=True)
    prep_time = models.IntegerField(default=15)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_veg = models.BooleanField(default=True)
    discount = models.IntegerField(default=0)  # discount %
    gst = models.IntegerField(default=5)  # gst %
    is_popular = models.BooleanField(default=False)

    # AI Taste Match fields
    preferred_meal_type = models.CharField(max_length=50, default='Dinner')
    preferred_mood = models.CharField(max_length=50, default='Happy')
    taste_type = models.CharField(max_length=50, default='Salty')
    spice_level = models.CharField(max_length=50, default='Medium')
    calories = models.IntegerField(default=350)
    preparation_time = models.IntegerField(default=15)
    is_recommended = models.BooleanField(default=False)
    ai_priority = models.IntegerField(default=0)
    popularity_score = models.IntegerField(default=0)
    diet_type = models.CharField(max_length=50, default='Veg')
    recommendation_boost = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} (₹{self.price})"


