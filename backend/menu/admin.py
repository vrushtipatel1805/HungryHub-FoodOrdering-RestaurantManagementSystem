from django.contrib import admin
from .models import MenuCategory, MenuItem

@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'image', 'route')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'price', 'taste_type', 'spice_level', 'diet_type', 'is_recommended')
    list_filter = ('category', 'is_veg', 'taste_type', 'spice_level', 'diet_type', 'is_recommended')
    search_fields = ('name', 'description')
