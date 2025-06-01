from .jwt_auth_middleware import JWTAuthMiddleware

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
