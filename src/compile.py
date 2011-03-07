#!/usr/bin/python
import os
import sys

fileList = [
	"extensions.js",
	"sylvester.js",
	"glutils.js",
	"Engine.js",
	"soyutils.js",
	"shader-vs.js",
	"shader-fs.js",
	"SpriteEngine.js",
	"base64.js",
	"canvas2image.js",
	"FontRenderer.js",
]

print """
 ^o^  Compiling your scripts
"""

command = "java -jar compiler.jar "
for f in fileList:
	command = command + '--js "'+f+'" '
command = command + ' --js_output_file="SpriteEngine-min.js" --compilation_level=SIMPLE_OPTIMIZATIONS'
os.system(command) 

