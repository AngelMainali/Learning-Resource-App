from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Semester(models.Model):
    number = models.IntegerField(unique=True, validators=[MinValueValidator(1), MaxValueValidator(8)])
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['number']
    
    def __str__(self):
        return f"Semester {self.number} - {self.name}"
    
    @property
    def total_subjects(self):
        return self.subjects.count()
    
    @property
    def total_notes(self):
        return Note.objects.filter(subject__semester=self).count()

class Subject(models.Model):
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='subjects')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    credits = models.IntegerField(default=3)
    thumbnail = models.ImageField(upload_to='subject_thumbnails/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    @property
    def total_notes(self):
        return self.notes.count()
    
    @property
    def total_downloads(self):
        return sum(note.downloads for note in self.notes.all())
    
    @property
    def average_rating(self):
        notes = self.notes.all()
        if not notes:
            return 0
        total_rating = sum(note.average_rating for note in notes)
        return total_rating / len(notes) if notes else 0

class Note(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=200)
    description = models.TextField()
    content = models.TextField(blank=True)
    file = models.FileField(upload_to='notes/', null=True, blank=True)
    thumbnail = models.ImageField(upload_to='note_thumbnails/', null=True, blank=True)
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")
    chapter = models.CharField(max_length=100, blank=True)
    note_type = models.CharField(max_length=50, default='lecture', choices=[
        ('lecture', 'Lecture Notes'),
        ('assignment', 'Assignment'),
        ('tutorial', 'Tutorial'),
        ('exam', 'Exam Paper'),
        ('reference', 'Reference Material'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    downloads = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.subject.code} - {self.title}"
    
    @property
    def average_rating(self):
        ratings = self.ratings.all()
        if ratings:
            return sum(rating.score for rating in ratings) / len(ratings)
        return 0
    
    @property
    def total_ratings(self):
        return self.ratings.count()

class Comment(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='comments')
    author_name = models.CharField(max_length=100)
    author_email = models.EmailField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Comment by {self.author_name} on {self.note.title}'

class Rating(models.Model):
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='ratings')
    author_name = models.CharField(max_length=100)
    author_email = models.EmailField()
    score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['note', 'author_email']
    
    def __str__(self):
        return f'{self.score} stars by {self.author_name} for {self.note.title}'

class Feedback(models.Model):
    FEEDBACK_TYPES = [
        ('suggestion', 'Suggestion'),
        ('bug', 'Bug Report'),
        ('general', 'General Feedback'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPES, default='general')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.feedback_type} - {self.subject}'
