import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'notes_platform.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv('DJANGO_ADMIN_USERNAME')
password = os.getenv('DJANGO_ADMIN_PASSWORD')
email = os.getenv('DJANGO_ADMIN_EMAIL')

print("🚀 Running create_admin.py")

if not all([username, password, email]):
    print("❌ Missing environment variables.")
    print(f"Username: {username}, Password: {password}, Email: {email}")
else:
    if User.objects.filter(username=username).exists():
        print(f"ℹ️ Superuser '{username}' already exists.")
    else:
        User.objects.create_superuser(username=username, password=password, email=email)
        print(f"✅ Superuser '{username}' created.")
