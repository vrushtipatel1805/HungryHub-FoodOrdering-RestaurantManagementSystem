import re
import os
from django.core.management.base import BaseCommand
from menu.models import MenuCategory, MenuItem

class Command(BaseCommand):
    help = "Seeds database with all categories and menu items parsed from menuData.js"

    def handle(self, *args, **options):
        self.stdout.write("Parsing menuData.js...")
        
        js_path = os.path.abspath(os.path.join(
            os.path.dirname(__file__), 
            '../../../../frontend/src/utils/menuData.js'
        ))
        
        if not os.path.exists(js_path):
            self.stdout.write(self.style.ERROR(f"menuData.js not found at: {js_path}"))
            return
            
        with open(js_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        categories_data = self.parse_js_array(content, "categories")
        menu_items_data = self.parse_js_array(content, "mockMenuItems")
        
        self.stdout.write(f"Parsed {len(categories_data)} categories and {len(menu_items_data)} menu items.")

        # 1. Categories
        self.stdout.write("Inserting/Updating Menu Categories...")
        category_objs = {}
        for c in categories_data:
            cat, created = MenuCategory.objects.update_or_create(
                slug=c['slug'],
                defaults={
                    'name': c['name'], 
                    'image': c.get('image', ''), 
                    'route': c.get('route', '')
                }
            )
            category_objs[c['slug']] = cat

        # 2. Menu Items
        self.stdout.write("Inserting/Updating Menu Items...")
        items_created = 0
        items_updated = 0
        
        for item in menu_items_data:
            category_slug = item.get('category')
            parent_cat = category_objs.get(category_slug)
            
            if not parent_cat:
                self.stdout.write(self.style.WARNING(f"Category '{category_slug}' not found for item '{item.get('name')}'"))
                continue
                
            item_obj, created = MenuItem.objects.update_or_create(
                id=item['id'],
                defaults={
                    'name': item['name'],
                    'category': parent_cat,
                    'price': item['price'],
                    'approx_qty_gms': item.get('approx_qty_gms'),
                    'description': item.get('description', ''),
                    'is_veg': item.get('is_veg', True)
                }
            )
            if created:
                items_created += 1
            else:
                items_updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded database! Categories: {len(category_objs)}, Created Items: {items_created}, Updated Items: {items_updated}"
        ))

    def parse_js_array(self, js_code, array_name):
        # Find the block starting with export const array_name = [
        pattern = rf'const\s+{array_name}\s*=\s*\[(.*?)\]\s*;'
        match = re.search(pattern, js_code, re.DOTALL)
        if not match:
            pattern = rf'const\s+{array_name}\s*=\s*\[(.*?)\]'
            match = re.search(pattern, js_code, re.DOTALL)
            if not match:
                return []
                
        block = match.group(1)
        
        # Extract each object block {...}
        objs = re.findall(r'\{(.*?)\}', block, re.DOTALL)
        
        parsed_list = []
        for obj_str in objs:
            kv_pattern = r'(\w+)\s*:\s*("(\\.|[^"\\])*"|\'(\\.|[^\'\\])*\'|\d+|true|false|null)'
            pairs = re.findall(kv_pattern, obj_str)
            
            obj_dict = {}
            for pair in pairs:
                key = pair[0]
                val = pair[1].strip()
                
                if val.startswith('"') and val.endswith('"'):
                    val = val[1:-1].replace('\\"', '"').replace('\\\\', '\\')
                elif val.startswith("'") and val.endswith("'"):
                    val = val[1:-1].replace("\\'", "'").replace('\\\\', '\\')
                elif val == 'true':
                    val = True
                elif val == 'false':
                    val = False
                elif val == 'null':
                    val = None
                else:
                    try:
                        val = int(val)
                    except ValueError:
                        try:
                            val = float(val)
                        except ValueError:
                            pass
                
                obj_dict[key] = val
            if obj_dict:
                parsed_list.append(obj_dict)
                
        return parsed_list
