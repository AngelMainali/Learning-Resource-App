from django.urls import path
from . import views

urlpatterns = [
    # Semesters
    path('semesters/', views.SemesterListView.as_view(), name='semester-list'),
    path('semesters/<int:pk>/', views.SemesterDetailView.as_view(), name='semester-detail'),
    
    # Subjects
    path('subjects/', views.SubjectListView.as_view(), name='subject-list'),
    path('subjects/<int:pk>/', views.SubjectDetailView.as_view(), name='subject-detail'),
    path('semesters/<int:semester_id>/subjects/', views.SubjectListView.as_view(), name='semester-subjects'),
    
    # Notes
    path('notes/', views.NoteListView.as_view(), name='note-list'),
    path('notes/<int:pk>/', views.NoteDetailView.as_view(), name='note-detail'),
    path('subjects/<int:subject_id>/notes/', views.NoteListView.as_view(), name='subject-notes'),
    path('notes/<int:pk>/download/', views.download_note, name='note-download'),
    
    # Comments and Ratings
    path('notes/<int:note_id>/comments/', views.CommentCreateView.as_view(), name='note-comments'),
    path('notes/<int:note_id>/ratings/', views.RatingCreateView.as_view(), name='note-ratings'),
    
    # Feedback
    path('feedback/', views.FeedbackCreateView.as_view(), name='feedback'),
    
    # Stats and Featured
    path('stats/', views.stats, name='stats'),
    path('featured-notes/', views.featured_notes, name='featured-notes'),
]
