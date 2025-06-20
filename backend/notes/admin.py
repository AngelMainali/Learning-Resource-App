from django.contrib import admin
from django.utils.html import format_html
from django.contrib import messages
from django import forms
from .models import Semester, Subject, Note, Comment, Rating, Feedback

class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleFileField(forms.FileField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput())
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):
            result = [single_file_clean(d, initial) for d in data]
        else:
            result = single_file_clean(data, initial)
        return result

class BulkNoteForm(forms.ModelForm):
    files = MultipleFileField(
        required=False,
        help_text="Select multiple files to upload as separate notes"
    )
    
    class Meta:
        model = Note
        fields = ['subject', 'note_type', 'chapter', 'tags']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make files field not required for editing existing notes
        if self.instance and self.instance.pk:
            self.fields['files'].required = False
    
    def save_m2m(self):
        # Required method for Django admin compatibility
        pass
    
    def save(self, commit=True):
    # For admin compatibility, just save the instance normally
    # The actual bulk creation is handled in NoteAdmin.save_model
     return super().save(commit=commit)

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['number', 'name', 'total_subjects', 'total_notes', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    readonly_fields = ['total_subjects', 'total_notes', 'created_at']

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'semester', 'total_notes', 'is_active']
    list_filter = ['semester', 'is_active']
    search_fields = ['name', 'code']
    readonly_fields = ['total_notes', 'total_downloads', 'created_at']

class NoteInline(admin.StackedInline):
    model = Note
    fields = ['title', 'file', 'note_type', 'chapter', 'tags', 'is_featured']
    extra = 0
    classes = ['collapse']

# Add inline to Subject admin
SubjectAdmin.inlines = [NoteInline]

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    form = BulkNoteForm
    list_display = ['title', 'subject', 'note_type', 'downloads', 'is_featured', 'created_at']
    list_filter = ['subject__semester', 'subject', 'note_type', 'is_featured']
    search_fields = ['title', 'subject__name']
    readonly_fields = ['downloads', 'average_rating', 'total_ratings', 'created_at', 'updated_at']
    list_editable = ['is_featured']
    
    def get_form(self, request, obj=None, **kwargs):
        if obj is None:  # Adding new note - use bulk upload form
            kwargs['form'] = BulkNoteForm
        else:  # Editing existing note - use default ModelForm
            # Use default ModelForm for editing
            pass
        
        form = super().get_form(request, obj, **kwargs)
        
        if obj is None and hasattr(form, 'base_fields'):  # Adding new note
            form.base_fields['subject'].queryset = Subject.objects.select_related('semester').filter(is_active=True).order_by('semester__number', 'name')
        
        return form
        
    def get_fieldsets(self, request, obj=None):
        if obj is None:  # Adding new note
            return (
                ('Upload Notes', {
                    'fields': ('subject', 'files', 'note_type'),
                    'description': 'Select subject and upload multiple files. Each file will create a separate note with auto-generated title.'
                }),
                ('Optional Settings (applies to all uploaded files)', {
                    'fields': ('chapter', 'tags'),
                    'classes': ('collapse',)
                }),
            )
        else:  # Editing existing note
            return (
                ('Note Details', {
                    'fields': ('subject', 'title', 'description', 'file', 'note_type'),
                }),
                ('Optional Details', {
                    'fields': ('chapter', 'tags', 'thumbnail', 'is_featured'),
                    'classes': ('collapse',)
                }),
                ('Statistics', {
                    'fields': ('downloads', 'average_rating', 'total_ratings', 'created_at', 'updated_at'),
                    'classes': ('collapse',)
                }),
            )
    
    def save_model(self, request, obj, form, change):
        if not change and hasattr(form, 'cleaned_data') and form.cleaned_data.get('files'):
            # Handle multiple file upload for new notes
            files = form.cleaned_data.get('files', [])
            if not isinstance(files, list):
                files = [files] if files else []
            
            if files:
                # Create multiple notes from files
                notes_created = []
                for file in files:
                    if file:
                        # Create a new note for each file
                        note = Note(
                            subject=form.cleaned_data['subject'],
                            note_type=form.cleaned_data['note_type'],
                            chapter=form.cleaned_data.get('chapter', ''),
                            tags=form.cleaned_data.get('tags', ''),
                            file=file
                        )
                        # Auto-generate title from filename
                        filename = file.name.rsplit('.', 1)[0]
                        note.title = filename.replace('_', ' ').replace('-', ' ').title()
                        note.description = f"Notes for {note.title}"
                        note.save()
                        notes_created.append(note)
                
                if notes_created:
                    count = len(notes_created)
                    messages.success(request, f'Successfully created {count} notes from uploaded files.')
                    return
        
        # Handle single note save (editing or single file upload)
        if not obj.title and obj.file:
            filename = obj.file.name.rsplit('.', 1)[0]
            obj.title = filename.replace('_', ' ').replace('-', ' ').title()
        if not obj.description and obj.title:
            obj.description = f"Notes for {obj.title}"
        
        super().save_model(request, obj, form, change)

    actions = ['mark_featured', 'unmark_featured']
    
    def mark_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} notes marked as featured.')
    mark_featured.short_description = "Mark selected notes as featured"
    
    def unmark_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} notes unmarked as featured.')
    unmark_featured.short_description = "Remove featured status"

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['note', 'author_name', 'created_at']
    list_filter = ['created_at', 'note__subject']
    search_fields = ['author_name', 'content']
    readonly_fields = ['created_at']

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ['note', 'author_name', 'score', 'created_at']
    list_filter = ['score', 'created_at']
    search_fields = ['author_name']
    readonly_fields = ['created_at']

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['subject', 'feedback_type', 'name', 'created_at']
    list_filter = ['feedback_type', 'created_at']
    search_fields = ['name', 'subject']
    readonly_fields = ['created_at']
