from django.urls import include, path
from api.views import CreateUserView , SearchView , BookView
from rest_framework_simplejwt.views import TokenObtainPairView , TokenRefreshView

urlpatterns = [
    path("user/register/",CreateUserView.as_view(),name="register"),
    path("token/",TokenObtainPairView.as_view(),name="get_token"),
    path("token/refresh/",TokenRefreshView.as_view(),name="refresh"),
    path("api-auth/" , include("rest_framework.urls")),
    path("search/", SearchView.as_view(), name="search"),
    path("book/",BookView.as_view(), name="booking")
]