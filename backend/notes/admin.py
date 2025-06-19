from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Semester, Subject, Note, Comment, Rating, Feedback

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['number', 'name', 'total_subjects', 'total_notes', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['total_subjects', 'total_notes', 'created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('number', 'name', 'description', 'is_active')
        }),
        ('Statistics', {
            'fields': ('total_subjects', 'total_notes', 'created_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'semester', 'credits', 'total_notes', 'is_active']
    list_filter = ['semester', 'credits', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['total_notes', 'total_downloads', 'created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('semester', 'code', 'name', 'description', 'credits')
        }),
        ('Settings', {
            'fields': ('thumbnail', 'is_active')
        }),
        ('Statistics', {
            'fields': ('total_notes', 'total_downloads', 'created_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'subject', 'note_type', 'chapter', 'downloads', 'is_featured', 'created_at']
    list_filter = ['subject__semester', 'subject', 'note_type', 'is_featured', 'created_at']
    search_fields = ['title', 'description', 'tags', 'chapter', 'content']
    readonly_fields = ['downloads', 'average_rating', 'total_ratings', 'created_at', 'updated_at']
    list_editable = ['is_featured']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('subject', 'title', 'description')
        }),
        ('Content', {
            'fields': ('content', 'file', 'thumbnail'),
        }),
        ('Classification', {
            'fields': ('note_type', 'chapter', 'tags'),
        }),
        ('Settings', {
            'fields': ('is_featured',),
        }),
        ('Statistics', {
            'fields': ('downloads', 'average_rating', 'total_ratings', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['note', 'author_name', 'author_email', 'created_at']
    list_filter = ['created_at', 'note__subject']
    search_fields = ['author_name', 'content', 'note__title']
    readonly_fields = ['created_at']

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['note', 'author_name', 'score', 'created_at']
    list_filter = ['score', 'created_at', 'note__subject']
    search_fields = ['author_name', 'note__title']
    readonly_fields = ['created_at']

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['subject', 'feedback_type', 'name', 'email', 'created_at']
    list_filter = ['feedback_type', 'created_at']
    search_fields = ['name', 'subject', 'message']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Feedback Details', {
            'fields': ('feedback_type', 'subject', 'message')
        }),
        ('Contact Information', {
            'fields': ('name', 'email')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
