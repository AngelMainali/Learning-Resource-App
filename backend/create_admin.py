import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notes_platform.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv('DJANGO_ADMIN_USERNAME')
password = os.getenv('DJANGO_ADMIN_PASSWORD')
email = os.getenv('DJANGO_ADMIN_EMAIL')

if not all([username, password, email]):
    print("❌ Environment variables for admin not set.")
else:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, password=password, email=email)
        print(f"✅ Superuser '{username}' created.")
    else:
        print(f"ℹ️ Superuser '{username}' already exists.")
