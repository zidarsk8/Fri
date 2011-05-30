from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length = 255)
    description = models.CharField(max_length = 1000)
    x = models.FloatField()
    y = models.FloatField()
    z = models.FloatField()
    
    def __unicode__(self):
        return self.name + " " + self.description
