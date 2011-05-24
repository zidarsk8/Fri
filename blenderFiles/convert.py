#!/usr/bin/python

import sys
import json

if len(sys.argv) != 3:
    print "use like this: ./convert.py input_file output_file"
    exit(1)
    
f = open(sys.argv[1], 'r')

def parse_xyz(str):
    arr = l[2:].strip().split(' ')
    return {'x':float(arr[0]), 'y':float(arr[1]), 'z':float(arr[2])}

obj = {'name': "", 'vertices': [], 'normals': [], 'faces':[],}
output = ""
for l in f:
    if l[0] == 'o':
        obj["name"] = l[2:].strip()
        
    if l[0] == 'v':
        obj['vertices'].append(parse_xyz(l[2:]))
        
    if l[0:2] == 'vn':
        obj['normals'].append(parse_xyz(l[3:]))
        
    if l[0:1] == 'f':
        face = {'type':0, 'vertices': [], 'normals':[]}
        arr = l[2:].strip().split(' ')
        face["type"] = len(arr)
        
        for i in arr:
            n = i.split('//')
            face["vertices"].append(int(n[0])-1)
            
            if len(n) == 2:
                face["normals"].append(int(int(n[1])-1))
               
        obj["faces"].append(face)
        
    if l[0] == 'n':
        output += ""     
        
json.dump(obj, open(sys.argv[2], 'w'), indent=4)
print "Done"
    

