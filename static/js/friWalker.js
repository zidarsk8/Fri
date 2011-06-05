var gl = null;
var pitch = 0;
var pitchRate = 0;
var yaw = 0;
var yawRate = 0;
var xPos = 1.0;
var yPos = 5.8;
var zPos = 8;
var movingSpeed = 0.005;
var speed = 0;
var lastTime = 0;
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var xRot = 0;
var yRot = 0.4;
var joggingAngle = 0;
var shaderProgram;
var neheTexture;
var wallTexture;
var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();
var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;
var currentlyPressedKeys = {};
var fps = 0;
var fly;
var starPosition = [0,0,0];
var starAnimation = 2;
var debug = false;
var debugtimeout = 50;
var mat_textures = {};
var floor;
var bricky;
var glassy;
var flyMode = true;
var vertexIndices = {};
var buffers = {};
var faksBoxes;
var debigCapture = false;


var object = {
	translateVector : [0,0,0],
	setTextureScale : function(material, scale){
		for(var i in this.materials){
			if (this.materials[i].name == material){
				this.materials[i].scale = scale;
			}
		}
	},
	setTextureOfset : function(material, x,y){
		for(var i in this.materials){
			if (this.materials[i].name == material){
				this.materials[i].ofsetX = x;
				this.materials[i].ofsetY = y;
			}
		}
	},
	drawScene : function(){
	    mat4.identity(mvMatrix);
        mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
        mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
        mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);
	},
	setTranslate : function(vec){
		this.translateVector = vec;
	},
	calculateCenter : function(){
	    
	    //console.log(this.vertices);
	    var ver_max = {x: Number.MIN_VALUE,y: Number.MIN_VALUE,z: Number.MIN_VALUE};
	    var ver_min = {x: Number.MAX_VALUE,y: Number.MAX_VALUE,z: Number.MAX_VALUE};
	    console.log(ver_min);
	    $.each(this.vertices, function(index, ver){
	        $.each(ver, function(i, v){
	      //  console.log(i,v)
	            if(v < ver_min[i]) ver_min[i] = v;
	            if(v > ver_max[i]) ver_max[i] = v;
	        });
	    });
	    // There will be rounding erros:
	    return [Math.round((ver_max.x+ver_min.x)*1000)/1000,Math.round((ver_max.z+ver_min.z)*1000)/1000,Math.round((ver_max.z+ver_min.z)*1000)/1000]
	},
	data: {
		faces: [],
		materials : [],
		normals : [],
		vertices : []
	},
	getTriangleFaces : function(material){
		var ro = {vec:[], fac:[], tex:[], nor:[]}; //return object
		var vecCounter = 0;
		for (var f in this.faces){

			var curentFace = this.faces[f];

			if (curentFace.material != material)
				continue;

			if (curentFace.vertices.length == 3){
				for (var i=0 ; i<3 ; i++){
					//add distinct vertex vector for each face
					if (! this.vertices[curentFace.vertices[i]]) {
						continue;
					}
					ro.vec[vecCounter*3]= this.vertices[curentFace.vertices[i]].x-this.translateVector[0];
					ro.vec[vecCounter*3+1]= this.vertices[curentFace.vertices[i]].y-this.translateVector[1];
					ro.vec[vecCounter*3+2]= this.vertices[curentFace.vertices[i]].z-this.translateVector[2];
					//add distinct normal
					if(curentFace.normals.length > 0){

						if (! this.normals[curentFace.normals[i]]) {
							continue;
						}
						ro.nor[vecCounter*3]= this.normals[curentFace.normals[i]].x;
						ro.nor[vecCounter*3+1]= this.normals[curentFace.normals[i]].y;
						ro.nor[vecCounter*3+2]= this.normals[curentFace.normals[i]].z;

						//add texture coordinate for this vector
						var scale = this.materials[material].scale ;
						var ofsetX = this.materials[material].ofsetX ;
						var ofsetY = this.materials[material].ofsetY ;
						if(Math.abs(ro.nor[vecCounter*3+1]) > 0.5){
							ro.tex[vecCounter*2] = scale * (ofsetX + this.vertices[curentFace.vertices[i]].x);
							ro.tex[vecCounter*2+1] = scale * (ofsetY + this.vertices[curentFace.vertices[i]].z);
						}else if(Math.abs(ro.nor[vecCounter*3]) > 0.5){
							ro.tex[vecCounter*2] = scale * (ofsetX + this.vertices[curentFace.vertices[i]].z);
							ro.tex[vecCounter*2+1] = scale * (ofsetY + this.vertices[curentFace.vertices[i]].y);
						}else{
							ro.tex[vecCounter*2] = scale * (ofsetX + this.vertices[curentFace.vertices[i]].x);
							ro.tex[vecCounter*2+1] = scale * (ofsetY + this.vertices[curentFace.vertices[i]].y);
						}
					}		

					//push vector to faces array
					ro.fac.push(vecCounter++);
				}
			}
		}
		return ro;
	},
	addObject : function(object){
		var ni = this.normals.length; //normal index
		var vi = this.vertices.length; //vertex index
		var fi = this.vertices.length; //vertex index
		var mi = this.materials.length; //vertex index
		
		for (var i in object.materials){
			this.materials[parseInt(i)+mi] = (object.materials[i]);
		}

		
		for (i in object.vertices){
			object.vertices[i].x += this.translateVector[0];
			object.vertices[i].y += this.translateVector[1];
			object.vertices[i].z += this.translateVector[2];
			this.vertices[parseInt(i)+vi] = object.vertices[i];

		}

		for (i in object.normals){
			this.normals[parseInt(i)+ni] = object.normals[i];
		}
		for (i in object.faces){
			for (var j in object.faces[i].normals){
				object.faces[i].normals[j] += ni;
			}
			for (j in object.faces[i].normals){
				object.faces[i].vertices[j] += vi;
			}
			object.faces[i].material += mi; //commnet this line if you want more objects to appear
			this.faces.push(object.faces[i]);
		}
	}
};



function initGL(canvas) {
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) {
		console.log(e);
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
        str += k.textContent;
    }
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}

function initShaders() {
	var fragmentShader = getShader(gl, "shader-fs");
	var vertexShader = getShader(gl, "shader-vs");

	shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert("Could not initialise shaders");
	}

	gl.useProgram(shaderProgram);

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.useLightingUniform = gl.getUniformLocation(shaderProgram, "uUseLighting");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
	shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");
	shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
}

function handleLoadedTexture(texture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initTexture() {
  var images = new Array();	
  $.each(objects, function(index,object){
      mat_textures[index] = {};
      for (mat in object.materials){
	      
	      (function(){
		       
		      var texty = gl.createTexture();
		      texty.image = new Image();
		      texty.image.onload = //handleLoadedTexture(mat_textures[object.materials[mat]]);
		      
		      function () {
			      handleLoadedTexture(texty);
			      //alert("OnLoad: " + texty.image.src);
		      };
		      texty.image.src = "static/textures/" + object.materials[mat].img;
		      mat_textures[index][object.materials[mat].name] = texty;
	      })();
	      
	      images.push(floor);
	      //mat_textures[object.materials[mat]] = floor;
      }
  });
  

}


function mvPushMatrix() {
  var copy = mat4.create();
  mat4.set(mvMatrix, copy);
  mvMatrixStack.push(copy);
}

function mvPopMatrix() {
  if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
  }
  mvMatrix = mvMatrixStack.pop();
}


function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  
  var normalMatrix = mat3.create();
  mat4.toInverseMat3(mvMatrix, normalMatrix);
  mat3.transpose(normalMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function initBuffers() {
    
	$.each(objects, function(index, object){
	    buffers[index] = {};
	    vertexIndices[index] = {};
	    $.each(object.materials, function(mat, material){
		    var bo = object.getTriangleFaces(mat);
           
		    var buff = {
			     vec : gl.createBuffer(),
			     nor : gl.createBuffer(),
			     tex : gl.createBuffer(),
			     fac : gl.createBuffer()
		    };	 

		    var item_size = {'vec':3, 'nor':3, 'tex':2, 'fac':1};

		    for(var key in buff){
			    buff[key].itemSize = item_size[key];
			    buff[key].numItems = bo[key].length/buff[key].itemSize;
			    if (buff[key].itemSize == 1){
				    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff[key]);
				    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bo[key]), gl.STATIC_DRAW);		
			    }
			    else{
				    gl.bindBuffer(gl.ARRAY_BUFFER, buff[key]);
				    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bo[key]), gl.STATIC_DRAW);
			    }


		    }
		    buffers[index][material.name] = buff;
		    vertexIndices[index][material.name] = bo.fac;
	    });  	
	});	
	//console.log(buffers);
	

}


function drawScene() {

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(35, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);



    //lightning stuff:
    gl.uniform1i(shaderProgram.useLightingUniform, true);
    //light color:
    gl.uniform3f( shaderProgram.ambientColorUniform, 0.5, 0.5, 0.5 );
    //direction:
    var lightingDirection = [ 10, 25 ,-3];

    var adjustedLD = vec3.create();
    vec3.normalize(lightingDirection, adjustedLD);
    vec3.scale(adjustedLD, 1);

    gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);

    gl.uniform3f( shaderProgram.directionalColorUniform, 0.4, 0.4, 0.4 );
    $.each(buffers, function(index, buf){

        for (var mat in buf){
            
            gl.bindBuffer(gl.ARRAY_BUFFER, buf[mat].vec);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, buf[mat].vec.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buf[mat].nor);
            gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, buf[mat].nor.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buf[mat].tex);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, buf[mat].tex.itemSize, gl.FLOAT, false, 0, 0);
            
            mvPushMatrix();
            objects[index].drawScene();
            setMatrixUniforms();
            gl.activeTexture(gl.TEXTURE0);

            //Draw the floors:



            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf[mat].fac);

            gl.uniform1i(shaderProgram.samplerUniform, 0);

            if (mat == "glass") {
              gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
              gl.enable(gl.BLEND);
              //gl.disable(gl.DEPTH_TEST);
              gl.uniform1f(shaderProgram.alphaUniform, 0.2);
            }
            else if (index == "arrow"){
            
               gl.disable(gl.BLEND);
              gl.enable(gl.DEPTH_TEST);
              gl.uniform1f(shaderProgram.alphaUniform, 1);
            }
            else {
              gl.disable(gl.BLEND);
              gl.enable(gl.DEPTH_TEST);
              gl.uniform1f(shaderProgram.alphaUniform, 1);
            }

            gl.bindTexture(gl.TEXTURE_2D, mat_textures[index][mat]);
            //console.log(mat_textures[mat]);
            gl.drawElements(gl.TRIANGLES, buf[mat].fac.numItems, gl.UNSIGNED_SHORT, vertexIndices[mat]);
            mvPopMatrix();
        }
    });

}

function handleKeys() {
  speed = 0;
  pitchRate = 0;
  yawRate = 0;
  fly = 0;
  if (currentlyPressedKeys[33]) { // Page Up
    pitchRate = 0.1;
  } else if (currentlyPressedKeys[34]) { // Page Down
    pitchRate = -0.1;
  }
  if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) { // Left cursor key or A
    yawRate = 0.1;
  } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) { // Right cursor key or D
    yawRate = -0.1;
  }
  if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) { // Up cursor key or W
    speed = movingSpeed;
  } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) { // Down cursor key
    speed = -movingSpeed;
  }
  if (currentlyPressedKeys[70] ) { // F
    debigCapture = true;
  }  
  if (currentlyPressedKeys[16]) { // Shift
    fly = movingSpeed;
  } else if (currentlyPressedKeys[32]) { // Space
    fly = -movingSpeed;
  }
}

function handleMouseDown(event) {
  mouseDown = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}
function handleMouseUp(event) {
  mouseDown = false;
}
function handleMouseMove(event) {
  if (!mouseDown) {
      return;
  }
  var newX = event.clientX;
  var newY = event.clientY;
  var deltaX = newX - lastMouseX
  var deltaY = newY - lastMouseY;
  xRot += deltaX / 3;
  yRot += deltaY / 3;
  lastMouseX = newX
  lastMouseY = newY;
}
var rTri = 0;
incStarAnim = true;
function animate() {
	var timeNow = new Date().getTime();
	var newx = 0;
	var newy = yPos;
	var newz = 0;
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		if (speed != 0 && elapsed != 0) {
			newx = Math.sin(degToRad(yaw)) * speed * elapsed;
			newz = Math.cos(degToRad(yaw)) * speed * elapsed;
			if (flyMode && mouseDown){
				newy += Math.sin(degToRad(pitch)) * speed * elapsed;
			}
			// joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
			// yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4
		}
		if (fly != 0 && elapsed != 0) {
			newy -= fly * elapsed;
		}
		yaw += yawRate * elapsed;
		pitch += pitchRate * elapsed;
		rTri += (90 * elapsed) / 1000.0;

		if(starAnimation > 0.6) incStarAnim = false;
		if(starAnimation < 0) incStarAnim = true;
		if(incStarAnim) starAnimation = Math.sin(starAnimation + elapsed/1000);
		else starAnimation =  Math.sin(starAnimation - elapsed/1000);
	}
	
	lastTime = timeNow;
	var coll = testCollision(xPos-newx,newy,zPos-newz);
	if (!coll.collision){
		xPos -= newx;
		yPos = newy;
		zPos -= newz;
	}else{
		//console.log(coll.normal);
//		xPos -= newx*(1-Math.abs(coll.normal.x));
//		yPos = newy;
//		zPos -= newz*(1-Math.abs(coll.normal.z));
	}
}

function testCollision(newx,newy,newz){
	var coll = {collision:false, normal:{x:0,y:0,z:0}};
	var face1 = {
			'normal' : {x: 0 ,y:1 ,z:0},
			'vertices' : [
				{x: -0.1 + newx , y:0.0 + newy ,z:-0.1 + newz},
				{x: -0.1 + newx, y:0.0 + newy ,z:0.1 + newz},
				{x: 0.1 + newx, y:0.0 + newy ,z:0.1+ newz}
			]
		};
	var face2 = {
			'normal' : {x:0 ,y:1 ,z:0},
			'vertices' : [
				{x: -0.1 + newx , y:0.0 + newy ,z:-0.1 + newz},
				{x: 0.1 + newx, y:0.0 + newy ,z:-0.1 + newz},
				{x: 0.1 + newx, y:0.0 + newy ,z:0.1+ newz}
			]
		};
	var face3 = {
			'normal' : {x:1 ,y:0 ,z:0},
			'vertices' : [
				{x: 0.0 + newx , y:-0.15 + newy ,z:-0.15 + newz},
				{x: 0.0 + newx, y:0.15 + newy ,z:-0.15 + newz},
				{x: 0.0 + newx, y:0.15 + newy ,z:0.15+ newz}
			]
		};
		
	if (debigCapture){
		console.log();
		console.log();
		console.log();
		console.log();
		console.log(newx,newy,newz);
		console.log(Math.floor(newx),Math.floor(newy),Math.floor(newz));
		console.log("boxes ",faksBoxes[Math.floor(newx)][Math.floor(newy)][Math.floor(newz)]);
	}
	
//	for (var i in objects.faks.faces){
	var fx = Math.floor(newx);
	var fy = Math.floor(newy);
	var fz = Math.floor(newz);
	for (var f in faksBoxes[fx][fy][fz]){
		var i = faksBoxes[fx][fy][fz][f];
		if (objects.faks.faces[i].vertices.length==3 &&
			objects.faks.vertices[objects.faks.faces[i].vertices[0]] != objects.faks.vertices[objects.faks.faces[i].vertices[1]] &&
			objects.faks.vertices[objects.faks.faces[i].vertices[0]] != objects.faks.vertices[objects.faks.faces[i].vertices[2]]
			){
		    var curFace = {
					'normal' : objects.faks.normals[objects.faks.faces[i].normals[0]],
					'vertices' : [
						objects.faks.vertices[objects.faks.faces[i].vertices[0]],
						objects.faks.vertices[objects.faks.faces[i].vertices[1]],
						objects.faks.vertices[objects.faks.faces[i].vertices[2]]
					]
				};
			if (debigCapture){
				if (i>10 ){
					console.log("wtf");
				}
				console.log("curentFace",i);
				console.log(curFace);
				console.log("compare face ",face1);
			}
			if (Math.abs(curFace.normal.x+curFace.normal.y+curFace.normal.z) >0.0 && 
				(triangleIntersectionTest(face1, curFace ) || 
				triangleIntersectionTest(face2, curFace ) ||
				triangleIntersectionTest(face3, curFace ))){
				console.log(i);
				coll.collision = true;
				coll.normal.x = Math.min (1, coll.normal.x+curFace.normal.x);
				coll.normal.y = Math.min (1, coll.normal.y+curFace.normal.y);
				coll.normal.z = Math.min (1, coll.normal.z+curFace.normal.z);
			}else{
				if (debigCapture) console.log("noIntersection");
			}
		}
	}
	debigCapture = false;
	return coll;
}

function tick() {
  // comment requestAnimFrame(tick); when debugging and use setInterval instead
  if (!debug) requestAnimFrame(tick);
  
  //console.log("fuuu : "+intersection(object.faces[0],object.faces[1]));
  
  handleKeys();
  animate();
  drawScene();
  fps++;
  //console.log("fuuu : "+intersection(objects.faks.faces[0],objects.faks.faces[1]));
  
}

function splitBoxes(){
	var minx = 0,maxx = 0,miny = 0,maxy = 0,minz = 0,maxz = 0;
	for (var i in objects.faks.vertices){
		if (objects.faks.vertices[i].x < minx) minx = Math.floor(objects.faks.vertices[i].x); 
		if (objects.faks.vertices[i].x > maxx) maxx = Math.ceil(objects.faks.vertices[i].x); 
		if (objects.faks.vertices[i].y < miny) miny = Math.floor(objects.faks.vertices[i].y); 
		if (objects.faks.vertices[i].y > maxy) maxy = Math.ceil(objects.faks.vertices[i].y); 
		if (objects.faks.vertices[i].z < minz) minz = Math.floor(objects.faks.vertices[i].z); 
		if (objects.faks.vertices[i].z > maxz) maxz = Math.ceil(objects.faks.vertices[i].z); 
	}
	console.log(minx,maxx,miny,maxy,minz,maxz);
	faksBoxes = [];
	var counter = 0;
	for (var x = minx-1 ; x<= maxx ; x++){
		faksBoxes [x] = [];
		for (var y = miny-1 ; y<= maxy ; y++){
			faksBoxes [x][y] = [];
			for (var z = minz-1 ; z<= maxz ; z++){
				faksBoxes[x][y][z]=[];
				counter++;
			}
		}
	}
	console.log("counter ",counter);
	for(i in objects.faks.faces){
		if (objects.faks.faces[i].type == 3){
			minx = Math.floor(Math.min(objects.faks.vertices[objects.faks.faces[i].vertices[0]].x,
							objects.faks.vertices[objects.faks.faces[i].vertices[1]].x,
							objects.faks.vertices[objects.faks.faces[i].vertices[2]].x))-1;
			maxx = Math.ceil(Math.max(objects.faks.vertices[objects.faks.faces[i].vertices[0]].x,
							objects.faks.vertices[objects.faks.faces[i].vertices[1]].x,
							objects.faks.vertices[objects.faks.faces[i].vertices[2]].x));
			miny = Math.floor(Math.min(objects.faks.vertices[objects.faks.faces[i].vertices[0]].y,
							objects.faks.vertices[objects.faks.faces[i].vertices[1]].y,
							objects.faks.vertices[objects.faks.faces[i].vertices[2]].y))-1;
			maxy = Math.ceil(Math.max(objects.faks.vertices[objects.faks.faces[i].vertices[0]].y,
							objects.faks.vertices[objects.faks.faces[i].vertices[1]].y,
							objects.faks.vertices[objects.faks.faces[i].vertices[2]].y));
			minz = Math.floor(Math.min(objects.faks.vertices[objects.faks.faces[i].vertices[0]].z,
							objects.faks.vertices[objects.faks.faces[i].vertices[1]].z,
							objects.faks.vertices[objects.faks.faces[i].vertices[2]].z))-1;
			maxz = Math.ceil(Math.max(objects.faks.vertices[objects.faks.faces[i].vertices[0]].z,
							objects.faks.vertices[objects.faks.faces[i].vertices[1]].z,
							objects.faks.vertices[objects.faks.faces[i].vertices[2]].z));
			
			for (x = minx ; x<= maxx ; x++){
				for (y = miny ; y<= maxy ; y++){
					for (z = minz ; z<= maxz ; z++){
						faksBoxes[x][y][z].push(i);
					}
				}
			}
		}
	}
	console.log(faksBoxes);
}

function webGLStart() {
    
    objects = {
        faks: jQuery.extend(faks, object),
        arrow: jQuery.extend(true,arrow, object),       
        star: jQuery.extend(true,star, object)
    };
    splitBoxes();
    objects.arrow.translateVector = objects.arrow.calculateCenter();
    //console.log(objects.star.translateVector);
	var canvas = document.getElementById("fri_walker_canvas");
	faks.setTextureScale("Material", 4);
	faks.setTextureScale("wood-floor", 2);
	faks.setTextureScale("horizon", 0.06);
	faks.setTextureOfset("horizon", 0, -5.33);
	
	
	
	objects.star.drawScene = function(){	
	    
        mat4.identity(mvMatrix);

        
        mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
        mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
        mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);
        mat4.translate(mvMatrix, starPosition);
        mat4.rotate(mvMatrix, degToRad(rTri), [1, 0, 1]);   
	}
	
	objects.arrow.drawScene = function(){	
        mat4.identity(mvMatrix);

        
        mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
        mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
        mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);
        mat4.translate(mvMatrix, starPosition);
        mat4.rotate(mvMatrix, degToRad(rTri), [1, 1, 1]);   
  
	}
	//star.rotate([1,0,0],90)
	//arrow.rotate([1,0,0], 90);


	initGL(canvas);
	initShaders();
	initBuffers();
	initTexture();

	
	//console.log("sekata",cross);
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	//  use set interval for debugging cause requestAnimFrame(tick); is causing problems for firebug
	if (debug) setInterval("tick()", debugtimeout);
	tick();
	setInterval(function(){
	document.getElementById("fps").innerHTML="<b>FPS:</b> "+fps+" <b>x:</b> "+xPos+" <b>y:</b> "+yPos+" <b>z:</b> "+zPos+" <b>pitch:</b> "+pitch+" <b>yaw:</b> "+yaw;
	fps = 0;
	}, 1000);
}

