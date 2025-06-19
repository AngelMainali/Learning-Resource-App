# Academic Notes Platform

A clean, modern academic notes platform with React + Tailwind CSS frontend and Django REST API backend.

## ✨ Features

- **Beautiful Modern UI** - Clean design with Tailwind CSS
- **Admin-Only Content Management** - Notes added via Django admin dashboard
- **Semester-based Organization** - 8 semesters with subjects and notes
- **Note Management** - Download, rate, and comment on notes
- **Responsive Design** - Works perfectly on all devices
- **Clean Architecture** - Simple, organized codebase

## 🚀 Quick Start

### Automated Setup
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

### Manual Setup

#### Backend (Django)
\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
\`\`\`

#### Frontend (React + Vite)
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client

### Backend
- **Django 5.0.1** - Python web framework
- **Django REST Framework** - API development
- **SQLite** - Database (easily changeable)
- **Pillow** - Image processing

## 📁 Project Structure

\`\`\`
notes-platform/
├── frontend/                 # React + Tailwind frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── tailwind.config.js
├── backend/                 # Django REST API
│   ├── notes_platform/     # Main project
│   ├── notes/              # Notes app
│   ├── manage.py
│   └── requirements.txt
└── setup.sh               # Automated setup script
\`\`\`

## 📊 Admin Panel

Access at \`http://localhost:8000/admin/\`

**Default credentials (created by setup script):**
- Username: \`admin\`
- Password: \`admin123\`

### Adding Content via Admin

1. **Add Semesters** - Create 8 semesters (1-8)
2. **Add Subjects** - Create subjects for each semester  
3. **Add Notes** - Upload notes with files, set as featured, etc.

### Admin Features
- Upload files and images
- Mark notes as featured
- Manage comments and ratings
- View platform statistics

## 🎨 UI Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Mobile-first design
- **Smooth Animations** - Subtle transitions and hover effects
- **Intuitive Navigation** - Easy-to-use interface
- **Beautiful Cards** - Elegant content presentation

## 📱 Pages

1. **Home** - Hero section, featured notes, semester grid
2. **Semester Detail** - Subject cards for selected semester
3. **Subject Detail** - Notes list with filtering
4. **Note Detail** - Full note content, download, comments, ratings
5. **Feedback** - Contact form for user feedback

## 🌐 API Endpoints

\`\`\`
GET  /api/semesters/           # List semesters
GET  /api/semesters/{id}/      # Semester details
GET  /api/subjects/{id}/       # Subject details
GET  /api/notes/{id}/          # Note details
GET  /api/notes/{id}/download/ # Download note file
POST /api/notes/{id}/comments/ # Add comment
POST /api/notes/{id}/ratings/  # Add rating
POST /api/feedback/            # Submit feedback
\`\`\`

## 🔧 Development

### Frontend Development
\`\`\`bash
cd frontend
npm run dev     # Start dev server
npm run build   # Build for production
\`\`\`

### Backend Development
\`\`\`bash
cd backend
python manage.py runserver    # Start Django server
python manage.py shell       # Django shell
\`\`\`

## 🚀 Deployment

### Frontend (Vercel/Netlify)
\`\`\`bash
cd frontend
npm run build
# Deploy dist/ folder
\`\`\`

### Backend (Railway/Heroku)
\`\`\`bash
cd backend
# Add production settings
# Deploy with your preferred platform
\`\`\`

## 📝 Content Management

**Admin adds all content via Django admin dashboard:**

1. Login to admin panel at \`http://localhost:8000/admin/\`
2. Create semesters (1-8)
3. Add subjects to each semester
4. Upload notes with files
5. Mark important notes as "Featured"

**Simple and clean - no scripts needed!**

## 📝 License

MIT License - feel free to use this project for learning and development!
"# Learning-Resource-App" 
