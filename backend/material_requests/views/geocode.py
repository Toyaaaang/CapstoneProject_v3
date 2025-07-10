import requests
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.conf import settings

@require_GET
def locationiq_geocode(request):
    q = request.GET.get("q")
    if not q:
        return JsonResponse({"error": "Missing query"}, status=400)
    api_key = getattr(settings, "LOCATIONIQ_API_KEY", None)
    if not api_key:
        return JsonResponse({"error": "API key not configured"}, status=500)
    viewbox = "121.3500,13.4000,122.4000,14.5000"
    url = (
        f"https://api.locationiq.com/v1/search"
        f"?key={api_key}"
        f"&q={q}, Quezon, Philippines"
        f"&countrycodes=ph"
        f"&viewbox={viewbox}&bounded=1"
        f"&limit=3&format=json"
    )
    resp = requests.get(url)
    results = resp.json()
    # Optionally filter for state=Quezon
    filtered = [
        r for r in results
        if r.get("address", {}).get("state", "").lower() == "quezon"
    ]
    return JsonResponse(filtered or results, safe=False)