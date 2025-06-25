from django.urls import path
from . import views

urlpatterns = [
    # Semesters
    path('semesters/', views.SemesterListView.as_view(), name='semester-list'),
    path('semesters/<int:pk>/', views.SemesterDetailView.as_view(), name='semester-detail'),
    path('semesters/<int:semester_id>/subjects/', views.SubjectListView.as_view(), name='semester-subjects'),
    
    # Subjects
    path('subjects/', views.SubjectListView.as_view(), name='subject-list'),
    path('subjects/<int:pk>/', views.SubjectDetailView.as_view(), name='subject-detail'),
    path('subjects/<int:subject_id>/notes/', views.NoteListView.as_view(), name='subject-notes'),
    
    # Notes
    path('notes/', views.NoteListView.as_view(), name='note-list'),
    path('notes/<int:pk>/', views.NoteDetailView.as_view(), name='note-detail'),
    
    # File serving and download endpoints - FIXED
    path('notes/<int:pk>/file/', views.serve_note_file, name='serve-note-file'),
    path('notes/<int:pk>/serve/', views.serve_note_file, name='serve-note-file-alt'),
    path('notes/<int:pk>/download/', views.download_note, name='download-note'),
    path('notes/<int:pk>/increment-download/', views.increment_download, name='increment-download'),
    
    # Comments and Ratings
    path('notes/<int:note_id>/comments/', views.CommentCreateView.as_view(), name='create-comment'),
    path('notes/<int:note_id>/ratings/', views.RatingCreateView.as_view(), name='create-rating'),
    
    # Other endpoints
    path('feedback/', views.FeedbackCreateView.as_view(), name='create-feedback'),
    path('stats/', views.stats, name='stats'),
    path('featured-notes/', views.featured_notes, name='featured-notes'),
]
