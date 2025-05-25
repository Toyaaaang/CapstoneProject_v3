from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import RoleRequestRecord


User = get_user_model()

# User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role", "is_role_confirmed", "last_login","first_name", "last_name"]
        extra_kwargs = {
            "password": {"write_only": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
            }

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data) 
        return user

# Login Serializer
class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()  # Can be username or email
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data.get("identifier")  
        password = data.get("password")

        user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()

        if user and user.check_password(password):
            if not user.is_active:
                raise serializers.ValidationError("This account is inactive.")
            return {"user": user}

        raise serializers.ValidationError("Invalid credentials.")
    
    
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['is_role_confirmed'] = user.is_role_confirmed
        return token



class RoleRequestRecordSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source="user.username", read_only=True)
    processed_by_username = serializers.CharField(source="processed_by.username", read_only=True)

    class Meta:
        model = RoleRequestRecord
        fields = [
            "id",
            "user_username",
            "requested_role",
            "status",
            "processed_by_username",
            "processed_at",
        ]