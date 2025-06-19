#!/bin/bash

# Backend Setup Script for Notes Platform
echo "🚀 Setting up Notes Platform Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.8"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python $required_version or higher is required. You have Python $python_version"
    exit 1
fi

echo "✅ Python $python_version detected"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📥 Installing Python packages..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p media/notes
mkdir -p media/thumbnails
mkdir -p media/subject_thumbnails
mkdir -p media/note_thumbnails
mkdir -p static

# Run migrations
echo "🗄️  Setting up database..."
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
echo "👤 Creating admin user..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@noteshub.edu', 'admin123') if not User.objects.filter(username='admin').exists() else None" | python manage.py shell

echo "✅ Backend setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run: python manage.py runserver"
echo "2. Access admin panel: http://localhost:8000/admin/"
echo "3. Admin credentials: admin / admin123"
echo "4. API endpoints: http://localhost:8000/api/"
