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
    # 🔥 Delete existing user with same username (use carefully!)
    if User.objects.filter(username=username).exists():
        print(f"⚠️ Superuser '{username}' exists. Deleting...")
        User.objects.get(username=username).delete()

    # ✅ Create new superuser
    User.objects.create_superuser(username=username, password=password, email=email)
    print(f"✅ Superuser '{username}' created.")
