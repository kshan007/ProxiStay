# Create your models here.

from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser): 
    phone_number = models.CharField(max_length=10, blank=True, null=True) 

class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    contact_number = models.CharField(max_length=10)
    alternate_contact_number = models.CharField(max_length=10, blank=True, null=True)
    college_or_workplace = models.CharField(max_length=150)
    course = models.CharField(max_length=100, blank=True, null=True)
    accommodation = models.CharField(max_length=150)

    def __str__(self):
        return f"{self.name} - {self.accommodation}"


# class Accommodation(models.Model):
#     name = models.CharField(max_length=255)
#     latitude = models.FloatField()
#     longitude = models.FloatField()
#     budget = models.IntegerField()
#     amenities = models.JSONField()  # Stores amenities as a list
#     description = models.TextField(blank=True, null=True)

#     def __str__(self):
#         return self.name
