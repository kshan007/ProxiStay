import math

def haversine(lat1, lon1, lat2, lon2):
    # Calculate distance using the Haversine formula
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def bellman_ford(accommodations, college, max_distance):
    distances = {}
    for acc in accommodations:
        dist = haversine(
            college.latitude, college.longitude,
            acc.latitude, acc.longitude
        )
        if dist <= max_distance:
            distances[acc] = dist
    return distances

'''
# from geopy.geocoders import Nominatim
# from geopy.distance import geodesic
@api_view(['GET'])
def search_accommodations(request):
    location = request.GET.get('location', '')
    budget = request.GET.get('budget', '')
    amenity = request.GET.get('amenity', '')

    if not location:
        return Response({"error": "Location is required"}, status=400)

    geolocator = Nominatim(user_agent="geoapiExercises")
    loc = geolocator.geocode(location)

    if not loc:
        return Response({"error": "Invalid location"}, status=400)

    user_coordinates = (loc.latitude, loc.longitude)
    accommodations = Accommodation.objects.all()

    # Filter by radius (15km)
    accommodations = [
        acc for acc in accommodations
        if geodesic(user_coordinates, (acc.latitude, acc.longitude)).km <= 15
    ]'
    ''
    '''