# Create your views here.
import json
from django.core import serializers
from django.http import HttpResponse
from models import Tag
from django.shortcuts import render_to_response

def tags_get(request, tag):

    return HttpResponse(serializers.serialize("json", Tag.search(tag)), mimetype='application/json')
    
def tag_add(request):
    t = Tag()
    t.x = float(request.GET['x'])
    t.y = float(request.GET['y'])
    t.z = float(request.GET['z'])
    t.name = request.GET['name']
    t.description = request.GET['description']
    t.save()
    return HttpResponse(json.dumps({'message': 'ok'}))
    
    #return HttpResponse(json.dumps([["AAA"]]), mimetype='application/json')
    
def index(request):
    return render_to_response('walker.html')

