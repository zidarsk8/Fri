# Create your views here.
import json
from django.core import serializers
from django.http import HttpResponse
from models import Tag
from pprint import pprint
def tags_get(request, tag):

    return HttpResponse(serializers.serialize("json", Tag.search(tag)), mimetype='application/json')
    
def tag_add(request):
    #if request.method != "POST":
     #   return HttpResponse(json.dumps({"message": "Please use POST"}), mimetype='application/json')
    tag = new Tag()
    print request.POST
    
    return HttpResponse(json.dumps([["AAA"]]), mimetype='application/json')

