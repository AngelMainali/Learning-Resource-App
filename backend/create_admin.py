# create_admin.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notes_platform.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

if not User.objects.filter(username='AngelMainali').exists():
    User.objects.create_superuser(
        username='AngelMainali',
        password='YourStrongPasswordHere',
        email='your@email.com'
    )
