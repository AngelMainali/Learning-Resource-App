# create_admin.py
import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notes_platform.settings')
django.setup()

User = get_user_model()

username = os.getenv("DJANGO_ADMIN_USERNAME")
email = os.getenv("DJANGO_ADMIN_EMAIL")
password = os.getenv("DJANGO_ADMIN_PASSWORD")

if username and email and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print(f"✅ Superuser '{username}' created successfully.")
    else:
        print(f"ℹ️ Superuser '{username}' already exists. Skipping creation.")
else:
    print("❌ Missing one or more admin credentials. Skipping superuser creation.")
