#!/usr/bin/python

import sys

if len(sys.argv) != 3:
    print "use like this: ./convert.py input_file output_file"
    exit(1)
    
f = open(sys.argv[1], 'r')


output = ""
for l in f:
    if l[0] == 'o':
        output += l[2:]
        
    if l[0] == 'v':
        output += ""
        
    if l[0] == 'n':
        output += ""   
        
    if l[0:2] == 'vn':
        output += l[0:1]
        
    if l[0] == 'n':
        output += ""     
        
print output
    

