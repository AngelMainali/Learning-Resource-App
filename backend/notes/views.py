from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse, Http404, FileResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
import os
import mimetypes
from .models import Semester, Subject, Note, Comment, Rating, Feedback
from .serializers import (
    SemesterListSerializer, SemesterDetailSerializer,
    SubjectListSerializer, SubjectDetailSerializer,
    NoteListSerializer, NoteDetailSerializer,
    CommentSerializer, RatingSerializer, FeedbackSerializer
)

class SemesterListView(generics.ListAPIView):
    queryset = Semester.objects.filter(is_active=True)
    serializer_class = SemesterListSerializer

class SemesterDetailView(generics.RetrieveAPIView):
    serializer_class = SemesterDetailSerializer
    
    def get_object(self):
        semester_number = self.kwargs['pk']
        try:
            return Semester.objects.get(number=semester_number, is_active=True)
        except Semester.DoesNotExist:
            raise Http404(f"Semester {semester_number} not found")

class SubjectListView(generics.ListAPIView):
    serializer_class = SubjectListSerializer
    
    def get_queryset(self):
        semester_number = self.kwargs.get('semester_id')
        if semester_number:
            try:
                semester = Semester.objects.get(number=semester_number, is_active=True)
                return Subject.objects.filter(semester=semester, is_active=True)
            except Semester.DoesNotExist:
                return Subject.objects.none()
        return Subject.objects.filter(is_active=True)

class SubjectDetailView(generics.RetrieveAPIView):
    queryset = Subject.objects.filter(is_active=True)
    serializer_class = SubjectDetailSerializer

class NoteListView(generics.ListAPIView):
    serializer_class = NoteListSerializer
    
    def get_queryset(self):
        subject_id = self.kwargs.get('subject_id')
        queryset = Note.objects.all()
        
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        
        # Filter parameters
        search = self.request.query_params.get('search')
        note_type = self.request.query_params.get('type')
        chapter = self.request.query_params.get('chapter')
        featured = self.request.query_params.get('featured')
        
        if search:
            queryset = queryset.filter(title__icontains=search)
        if note_type:
            queryset = queryset.filter(note_type=note_type)
        if chapter:
            queryset = queryset.filter(chapter__icontains=chapter)
        if featured:
            queryset = queryset.filter(is_featured=True)
        
        return queryset

class NoteDetailView(generics.RetrieveAPIView):
    queryset = Note.objects.all()
    serializer_class = NoteDetailSerializer

@api_view(['GET'])
@require_http_methods(["GET"])
def download_note(request, pk):
    """Download note file"""
    try:
        note = get_object_or_404(Note, pk=pk)
        print(f"Found note: {note.id} - {note.title}")
        
        if not note.file:
            print("No file attached to note")
            raise Http404("No file attached to this note")
        
        print(f"File field value: {note.file}")
        print(f"File name: {note.file.name}")
        
        # Get the actual file path
        try:
            file_path = note.file.path
            print(f"File path: {file_path}")
        except ValueError as e:
            print(f"Error getting file path: {e}")
            raise Http404("File path error")
        
        # Check if file exists
        if not os.path.exists(file_path):
            print(f"File does not exist at: {file_path}")
            # Try alternative paths
            media_root = getattr(settings, 'MEDIA_ROOT', '')
            alt_path = os.path.join(media_root, str(note.file))
            print(f"Trying alternative path: {alt_path}")
            
            if os.path.exists(alt_path):
                file_path = alt_path
                print(f"Found file at alternative path: {file_path}")
            else:
                raise Http404("File not found on disk")
        
        # Get filename
        filename = os.path.basename(file_path)
        print(f"Serving file: {filename}")
        
        # Create download response
        try:
            response = FileResponse(
                open(file_path, 'rb'),
                content_type='application/octet-stream'
            )
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET'
            response['Access-Control-Allow-Headers'] = '*'
            
            print("File response created successfully")
            return response
            
        except Exception as e:
            print(f"Error creating file response: {e}")
            raise Http404(f"Error serving file: {str(e)}")
        
    except Exception as e:
        print(f"Download error: {e}")
        raise Http404(f"Download error: {str(e)}")

@api_view(['POST'])
@csrf_exempt
def increment_download(request, pk):
    """Increment download counter only"""
    try:
        note = get_object_or_404(Note, pk=pk)
        note.downloads += 1
        note.save(update_fields=['downloads'])
        print(f"Download counter incremented for note {pk}: {note.downloads}")
        return Response({'downloads': note.downloads, 'success': True})
    except Exception as e:
        print(f"Error incrementing download counter: {e}")
        return Response({'error': str(e)}, status=400)

@method_decorator(csrf_exempt, name='dispatch')
class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    
    def perform_create(self, serializer):
        note_id = self.kwargs['note_id']
        note = get_object_or_404(Note, id=note_id)
        serializer.save(note=note)

@method_decorator(csrf_exempt, name='dispatch')
class RatingCreateView(generics.CreateAPIView):
    serializer_class = RatingSerializer
    
    def perform_create(self, serializer):
        note_id = self.kwargs['note_id']
        note = get_object_or_404(Note, id=note_id)
        serializer.save(note=note)

@method_decorator(csrf_exempt, name='dispatch')
class FeedbackCreateView(generics.CreateAPIView):
    serializer_class = FeedbackSerializer

@api_view(['GET'])
def stats(request):
    total_semesters = Semester.objects.filter(is_active=True).count()
    total_subjects = Subject.objects.filter(is_active=True).count()
    total_notes = Note.objects.count()
    total_downloads = sum(Note.objects.values_list('downloads', flat=True))
    total_comments = Comment.objects.count()
    total_ratings = Rating.objects.count()
    
    return Response({
        'total_semesters': total_semesters,
        'total_subjects': total_subjects,
        'total_notes': total_notes,
        'total_downloads': total_downloads,
        'total_comments': total_comments,
        'total_ratings': total_ratings
    })

@api_view(['GET'])
def featured_notes(request):
    notes = Note.objects.filter(is_featured=True)[:6]
    serializer = NoteListSerializer(notes, many=True)
    return Response(serializer.data)
