from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('customer', 'Customer'),
        ('super_admin', 'Super Admin'),
        ('manager', 'Manager'),
        ('staff', 'Staff'),
    )
    email = models.EmailField(unique=True, primary_key=True)
    full_name = models.CharField(max_length=255)
    dob = models.DateField(null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    mobile = models.CharField(max_length=20, blank=True, null=True)
    permissions = models.JSONField(default=list, blank=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.email} ({self.role})"


class RestaurantSettings(models.Model):
    name = models.CharField(max_length=255, default='HungryHub Gourmet')
    tagline = models.CharField(max_length=255, default='100% Pure Vegetarian Restaurant & Dining')
    address = models.TextField(default='Near Commerce Six Roads, Navrangpura, Ahmedabad, Gujarat 380009')
    phone = models.CharField(max_length=20, default='+91 98765 43210')
    email = models.EmailField(default='info@hungryhub.com')
    opening_time = models.CharField(max_length=50, default='11:00 AM')
    closing_time = models.CharField(max_length=50, default='11:00 PM')
    gst_number = models.CharField(max_length=50, default='24AAACH1111A1Z1')
    logo = models.CharField(max_length=500, blank=True, null=True, default='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400')

    def __str__(self):
        return self.name

