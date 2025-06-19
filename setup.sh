#!/bin/bash

echo "🚀 Setting up Academic Notes Platform..."

# Backend setup
echo "📦 Setting up Backend..."
cd backend
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "👤 Creating admin user..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@noteshub.edu', 'admin123') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell

cd ..

# Frontend setup
echo "⚛️  Setting up Frontend..."
cd frontend
npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the application:"
echo "1. Backend: cd backend && python manage.py runserver"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. Access: http://localhost:5173"
echo "4. Admin: http://localhost:8000/admin (admin/admin123)"
