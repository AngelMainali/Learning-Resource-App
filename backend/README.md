# Notes Platform Backend

Django REST API backend for the Academic Notes Platform.

## Quick Start

### Option 1: Automated Setup
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

### Option 2: Manual Setup

1. **Create virtual environment:**
   \`\`\`bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

3. **Setup database:**
   \`\`\`bash
   python manage.py makemigrations
   python manage.py migrate
   \`\`\`

4. **Create admin user:**
   \`\`\`bash
   python manage.py createsuperuser
   \`\`\`

5. **Load sample data:**
   \`\`\`bash
   python ../scripts/setup_academic_database.py
   \`\`\`

6. **Start server:**
   \`\`\`bash
   python manage.py runserver
   \`\`\`

## Project Structure

\`\`\`
backend/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── setup.sh                 # Automated setup script
├── notes_platform/          # Main project directory
│   ├── __init__.py
│   ├── settings.py          # Django settings
│   ├── urls.py              # Main URL configuration
│   ├── wsgi.py              # WSGI configuration
│   └── asgi.py              # ASGI configuration
├── notes/                   # Notes app
│   ├── __init__.py
│   ├── admin.py             # Admin interface
│   ├── apps.py              # App configuration
│   ├── models.py            # Database models
│   ├── serializers.py       # API serializers
│   ├── views.py             # API views
│   ├── urls.py              # App URLs
│   └── migrations/          # Database migrations
├── media/                   # User uploaded files
└── static/                  # Static files
\`\`\`

## API Endpoints

### Semesters
- `GET /api/semesters/` - List all semesters
- `GET /api/semesters/{id}/` - Get semester details

### Subjects
- `GET /api/subjects/` - List all subjects
- `GET /api/semesters/{id}/subjects/` - List subjects by semester
- `GET /api/subjects/{id}/` - Get subject details

### Notes
- `GET /api/notes/` - List all notes
- `GET /api/subjects/{id}/notes/` - List notes by subject
- `GET /api/notes/{id}/` - Get note details
- `GET /api/notes/{id}/download/` - Download note file

### Comments & Ratings
- `POST /api/notes/{id}/comments/` - Add comment
- `POST /api/notes/{id}/ratings/` - Add rating

### Other
- `POST /api/feedback/` - Submit feedback
- `GET /api/stats/` - Get platform statistics
- `GET /api/featured-notes/` - Get featured notes

## Admin Panel

Access the admin panel at `http://localhost:8000/admin/`

**Default credentials:**
- Username: `admin`
- Password: `admin123`

## Environment Variables

Copy `.env.example` to `.env` and configure:

\`\`\`bash
cp .env.example .env
\`\`\`

## Development

### Running Tests
\`\`\`bash
python manage.py test
\`\`\`

### Creating Migrations
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

### Collecting Static Files
\`\`\`bash
python manage.py collectstatic
\`\`\`

## Production Deployment

1. Set `DEBUG=False` in settings
2. Configure proper database (PostgreSQL recommended)
3. Set up proper static file serving
4. Configure email settings
5. Use environment variables for secrets
6. Enable HTTPS and security middleware

## Troubleshooting

### Common Issues

1. **Import Error**: Make sure virtual environment is activated
2. **Database Error**: Run migrations with `python manage.py migrate`
3. **Permission Error**: Check file permissions for media directory
4. **Port Already in Use**: Use different port with `python manage.py runserver 8001`

### Getting Help

- Check Django documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- Project issues: Create an issue in the repository
