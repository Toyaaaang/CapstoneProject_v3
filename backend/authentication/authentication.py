from rest_framework_simplejwt.authentication import JWTAuthentication

class CustomCookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try to get token from cookie instead of header
        raw_token = request.COOKIES.get("access_token")

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
