from rest_framework_simplejwt.authentication import JWTAuthentication
from hungryhub.email_service import set_current_user_email

class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = None
        # Try JWT authentication first (for DRF clients)
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                authenticator = JWTAuthentication()
                validated_token = authenticator.get_validated_token(auth_header.split(' ')[1])
                user = authenticator.get_user(validated_token)
        except Exception:
            pass

        # Fallback to session user
        if not user and request.user and request.user.is_authenticated:
            user = request.user

        if user:
            set_current_user_email(user.email)
        else:
            set_current_user_email(None)

        response = self.get_response(request)

        # Always clear context after request finishes
        set_current_user_email(None)
        return response
