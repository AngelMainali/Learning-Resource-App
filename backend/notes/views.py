from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
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
    queryset = Semester.objects.filter(is_active=True)
    serializer_class = SemesterDetailSerializer

class SubjectListView(generics.ListAPIView):
    serializer_class = SubjectListSerializer
    
    def get_queryset(self):
        semester_id = self.kwargs.get('semester_id')
        if semester_id:
            return Subject.objects.filter(semester_id=semester_id, is_active=True)
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
    note = get_object_or_404(Note, pk=pk)
    
    if not note.file:
        raise Http404("File not found")
    
    # Increment download count
    note.downloads += 1
    note.save()
    
    response = HttpResponse(note.file.read(), content_type='application/octet-stream')
    response['Content-Disposition'] = f'attachment; filename="{note.file.name.split("/")[-1]}"'
    return response

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
