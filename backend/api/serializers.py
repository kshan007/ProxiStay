from .models import CustomUser , UserProfile
from rest_framework import serializers 



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id","username","email","phone_number","password"]
        extra_kwargs = {"password": {"write_only":True},"phone_number":{"read_only":True}}

    def create(self,validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user
    

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["name", "email" , "contact_number", "alternate_contact_number", "college_or_workplace","course","accommodation"]
        
