from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse, Http404, FileResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.clickjacking import xframe_options_exempt
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
            # Get semester by NUMBER (not database ID)
            return Semester.objects.get(number=semester_number, is_active=True)
        except Semester.DoesNotExist:
            raise Http404(f"Semester {semester_number} not found")

class SubjectListView(generics.ListAPIView):
    serializer_class = SubjectListSerializer
    
    def get_queryset(self):
        semester_number = self.kwargs.get('semester_id')
        if semester_number:
            # Get subjects by semester NUMBER (not database ID)
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
def download_note(request, pk):
    """Download note file WITHOUT incrementing counter (counter handled separately)"""
    note = get_object_or_404(Note, pk=pk)
    
    if not note.file:
        raise Http404("File not found")
    
    try:
        file_path = note.file.path
        if not os.path.exists(file_path):
            raise Http404("File not found on disk")
        
        # Get filename
        filename = os.path.basename(file_path)
        
        # Create download response WITHOUT incrementing counter
        response = FileResponse(
            open(file_path, 'rb'),
            content_type='application/octet-stream'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        raise Http404(f"Error downloading file: {str(e)}")

@api_view(['GET'])
@xframe_options_exempt
def serve_note_file(request, pk):
    """Serve note file for viewing (without incrementing download counter)"""
    note = get_object_or_404(Note, pk=pk)
    
    if not note.file:
        raise Http404("File not found")
    
    try:
        file_path = note.file.path
        if not os.path.exists(file_path):
            raise Http404("File not found on disk")
        
        # Get file extension
        file_extension = os.path.splitext(file_path)[1].lower()
        filename = os.path.basename(file_path)
        
        # Set content type
        content_type_map = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.txt': 'text/plain',
            '.csv': 'text/csv',
        }
        
        content_type = content_type_map.get(file_extension, 'application/octet-stream')
        
        # Create response for viewing (not downloading)
        response = FileResponse(
            open(file_path, 'rb'),
            content_type=content_type
        )
        
        # Add CORS headers
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = '*'
        response['Cache-Control'] = 'public, max-age=3600'
        
        # Set content disposition for inline viewing
        if file_extension in ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt']:
            response['Content-Disposition'] = f'inline; filename="{filename}"'
        else:
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        raise Http404(f"Error serving file: {str(e)}")

@api_view(['POST'])
@csrf_exempt
def increment_download(request, pk):
    """Increment download counter only"""
    note = get_object_or_404(Note, pk=pk)
    note.downloads += 1
    note.save(update_fields=['downloads'])
    return Response({'downloads': note.downloads, 'success': True})

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
