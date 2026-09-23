from django.test import TestCase
from rest_framework.test import APIRequestFactory, force_authenticate

from api.models import CustomUser
from api.views import SearchView


class SearchViewTests(TestCase):
    def test_empty_accommodations_returns_empty_list(self):
        user = CustomUser.objects.create_user(
            username="searchtester",
            email="searchtester@example.com",
            password="secret123",
        )

        factory = APIRequestFactory()
        request = factory.post(
            "/api/search/",
            {
                "lat": 13.0827,
                "lon": 80.2707,
                "accommodations": [],
                "amenities": [],
            },
            format="json",
        )
        force_authenticate(request, user=user)

        response = SearchView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, [])
