from rest_framework import serializers
from .models import Semester, Subject, Note, Comment, Rating, Feedback

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'author_email', 'content', 'created_at']

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['id', 'author_name', 'author_email', 'score', 'created_at']

class NoteListSerializer(serializers.ModelSerializer):
    average_rating = serializers.ReadOnlyField()
    total_ratings = serializers.ReadOnlyField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'thumbnail', 'tags', 'chapter',
            'note_type', 'created_at', 'downloads', 'average_rating', 
            'total_ratings', 'subject_name', 'subject_code', 'is_featured'
        ]

class NoteDetailSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    total_ratings = serializers.ReadOnlyField()
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    semester_number = serializers.IntegerField(source='subject.semester.number', read_only=True)
    
    class Meta:
        model = Note
        fields = [
            'id', 'title', 'description', 'content', 'file', 'thumbnail',
            'tags', 'chapter', 'note_type', 'created_at', 'updated_at', 
            'downloads', 'comments', 'ratings', 'average_rating', 
            'total_ratings', 'subject_name', 'subject_code', 'semester_number'
        ]

class SubjectListSerializer(serializers.ModelSerializer):
    total_notes = serializers.ReadOnlyField()
    total_downloads = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    semester_number = serializers.IntegerField(source='semester.number', read_only=True)
    
    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'code', 'description', 'credits', 'thumbnail',
            'total_notes', 'total_downloads', 'average_rating', 'semester_number'
        ]

class SubjectDetailSerializer(serializers.ModelSerializer):
    notes = NoteListSerializer(many=True, read_only=True)
    total_notes = serializers.ReadOnlyField()
    total_downloads = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    semester_number = serializers.IntegerField(source='semester.number', read_only=True)
    semester_name = serializers.CharField(source='semester.name', read_only=True)
    
    class Meta:
        model = Subject
        fields = [
            'id', 'name', 'code', 'description', 'credits', 'thumbnail',
            'notes', 'total_notes', 'total_downloads', 'average_rating',
            'semester_number', 'semester_name'
        ]

class SemesterListSerializer(serializers.ModelSerializer):
    total_subjects = serializers.ReadOnlyField()
    total_notes = serializers.ReadOnlyField()
    
    class Meta:
        model = Semester
        fields = [
            'id', 'number', 'name', 'description', 'total_subjects', 'total_notes'
        ]

class SemesterDetailSerializer(serializers.ModelSerializer):
    subjects = SubjectListSerializer(many=True, read_only=True)
    total_subjects = serializers.ReadOnlyField()
    total_notes = serializers.ReadOnlyField()
    
    class Meta:
        model = Semester
        fields = [
            'id', 'number', 'name', 'description', 'subjects', 
            'total_subjects', 'total_notes'
        ]

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'name', 'email', 'feedback_type', 'subject', 'message', 'created_at']
