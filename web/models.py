from django.db import models

class Tag(models.Model):
    name = models.CharField(max_length = 255)
    description = models.CharField(max_length = 1000)
    x = models.FloatField()
    y = models.FloatField()
    z = models.FloatField()   
    
    @staticmethod
    def search(term):
        tags = ""
        if term != "":
            tags = Tag.objects.all().filter(name__icontains=term).order_by("name")[:10]
        else:
            tags = Tag.objects.all().order_by("name")[:10]
            
        # It's really weird but I can't return tags.values(), because json.dumps returns a type error    
        arr = []
        for i in tags.values():
            arr.append(i)
        return arr
            
    def __unicode__(self):
        return '{!s} ({:-f}, {:-f}, {:-f}) - {!s}'.format(
            self.name, self.x, self.y, self.z, self.description
        )

