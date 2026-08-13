from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Aggregate api routes
api_urlpatterns = [
    path('auth/', include('authentication.urls')),
    path('', include('menu.urls')),
    path('', include('orders.urls')),
    path('', include('reservations.urls')),
    path('', include('feedback.urls')),
    path('', include('offers.urls')),
    path('', include('taste_match.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_urlpatterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
