from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length = 255)
    description = models.CharField(max_length = 1000)
    x = models.FloatField()
    y = models.FloatField()
    z = models.FloatField()   
    
    @staticmethod
    def search(term):
        
        return Tag.objects.all().filter(name__icontains=term).order_by("name")[:10]
    
            
    def __unicode__(self):
        return '{!s} ({:-f}, {:-f}, {:-f}) - {!s}'.format(
            self.name, self.x, self.y, self.z, self.description
        )
