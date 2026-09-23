import logging
import math
from heapq import heappop, heappush

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import CustomUser
from .serializers import ProfileSerializer, UserSerializer

logger = logging.getLogger(__name__)



# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]




def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class SearchView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            try:
                lat = float(request.data.get('lat'))
                lon = float(request.data.get('lon'))
            except (TypeError, ValueError):
                return Response({"error": "lat and lon are required."}, status=400)

            try:
                min_budget = float(request.data.get('minbudget', 0))
                max_budget = float(request.data.get('maxbudget', float('inf')))
            except (TypeError, ValueError):
                min_budget = 0
                max_budget = float('inf')

            proximity = float(request.data.get('proximity', 15))  # in km
            accommodations = request.data.get('accommodations', [])
            user_amenities = request.data.get('amenities', [])

            if not accommodations:
                return Response([], status=200)

            heap = []

            for acc in accommodations:
                try:
                    acc_lat = float(acc['lat'])
                    acc_lon = float(acc['lon'])
                    acc_budget = float(acc.get('budget', 0))
                    acc_amenities = acc.get('amenities', [])

                    dist = haversine(lat, lon, acc_lat, acc_lon)
                    if dist <= proximity and min_budget <= acc_budget <= max_budget:
                        acc['distance'] = round(dist, 2)

                        # Score amenities
                        score = 0
                        for idx, amenity in enumerate(user_amenities):
                            if amenity in acc_amenities:
                                score += (len(user_amenities) - idx)

                        acc['match_score'] = score

                        
                        # Max heap (negative score), then sort by distance and budget if scores are equal
                        heappush(heap, (-score, acc['distance'], acc['budget'], acc))
                except Exception:
                    continue

            sorted_results = []

            while heap:
                _, _, _, acc = heappop(heap)
                if acc['match_score'] and user_amenities != []:
                    sorted_results.append(acc)
                if user_amenities == []:
                    sorted_results.append(acc)

            return Response(sorted_results)

        except Exception as e:
            logger.exception("SearchView failed")
            return Response({"error": "An internal error occurred."}, status=500)
        


    
class BookView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        serializer = ProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    



