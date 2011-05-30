# Create your views here.
from django.core import serializers
from django.http import HttpResponse
from models import Tag
from pprint import pprint
def tags_get(request, tag):

    return HttpResponse(serializers.serialize("json", Tag.search(tag)), mimetype='application/json')
    
def tag_add(request):
    print "add"
    return HttpResponse(serializers.serialize("json",  ["AAA"]), mimetype='application/json')
