from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    return JsonResponse({
        'message': 'Engineer Sathi API is running!',
        'endpoints': {
            'semesters': '/api/semesters/',
            'subjects': '/api/subjects/',
            'notes': '/api/notes/',
            'feedback': '/api/feedback/',
            'stats': '/api/stats/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('notes.urls')),
     path('', api_root, name='api_root'),
]


if settings.DEBUG or True:  
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

