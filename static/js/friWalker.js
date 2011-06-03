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
var debug = false;
var debugtimeout = 10000;

var faks = {
	translateVector : [0,0,0],
	setTranslate : function(vec){
		this.translateVector = vec;
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
	for (var f in this.data.faces){
		
		var curentFace = this.data.faces[f];
		
		if (curentFace.material != material)
			continue;

		if (curentFace.vertices.length == 3){
		for (var i=0 ; i<3 ; i++){
			//add distinct vertex vector for each face
			if (! this.data.vertices[curentFace.vertices[i]]) {
				continue;
			}
			ro.vec[vecCounter*3]= this.data.vertices[curentFace.vertices[i]].x;
			ro.vec[vecCounter*3+1]= this.data.vertices[curentFace.vertices[i]].y;
			ro.vec[vecCounter*3+2]= this.data.vertices[curentFace.vertices[i]].z;
			//add distinct normal
			if(curentFace.normals.length > 0){
				
				if (! this.data.normals[curentFace.normals[i]]) {
					continue;
				}
				ro.nor[vecCounter*3]= this.data.normals[curentFace.normals[i]].x;
				ro.nor[vecCounter*3+1]= this.data.normals[curentFace.normals[i]].y;
				ro.nor[vecCounter*3+2]= this.data.normals[curentFace.normals[i]].z;
				
			//add texture coordinate for this vector
				
				if(Math.abs(ro.nor[vecCounter*3+1]) > 0.5){
					ro.tex[vecCounter*2] = faks.data.materials[material].scale * this.data.vertices[curentFace.vertices[i]].x;
					ro.tex[vecCounter*2+1] = faks.data.materials[material].scale * this.data.vertices[curentFace.vertices[i]].z;
				}else if(Math.abs(ro.nor[vecCounter*3]) > 0.5){
					ro.tex[vecCounter*2] = faks.data.materials[material].scale * this.data.vertices[curentFace.vertices[i]].z;
					ro.tex[vecCounter*2+1] = faks.data.materials[material].scale * this.data.vertices[curentFace.vertices[i]].y;
				}else{
					ro.tex[vecCounter*2] = faks.data.materials[material].scale * this.data.vertices[curentFace.vertices[i]].x;
					ro.tex[vecCounter*2+1] = faks.data.materials[material].scale * this.data.vertices[curentFace.vertices[i]].y;
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
		var ni = this.data.normals.length; //normal index
		var vi = this.data.vertices.length; //vertex index
		var fi = this.data.vertices.length; //vertex index
		
		for (var i in object.materials){
			this.data.materials.push(object.materials[i]);
		}
		
		for (i in object.vertices){
			object.vertices[i].x += this.translateVector[0];
			object.vertices[i].y += this.translateVector[1];
			object.vertices[i].z += this.translateVector[2];
			this.data.vertices[parseInt(i)+vi] = object.vertices[i];
		}
		for (i in object.normals){
			this.data.normals[parseInt(i)+ni] = object.normals[i];
		}
		for (i in object.faces){
			for (var j in object.faces[i].normals){
				object.faces[i].normals[j] += ni;
			}
			for (j in object.faces[i].normals){
				object.faces[i].vertices[j] += vi;
			}
			this.data.faces.push(object.faces[i]);
		}
	}
};

/***********************************************************/
/***********************************************************/


/**
 * normalize a vector. |a| = 1
 */
function normalize(vec){
	var square = 0;
	var vec2 = {};
	for (var i in vec){
		square += vec[i]*vec[i];
		vec2[i] = vec[i];
	}
	var size = Math.sqrt(square);
	//check skope of vars in javascript. netbeans says this is redeclaration of i - for (var i...
	for (i in vec2){
	  vec2[i] = vec2[i]/size;
	}
	return vec2;
}
/**
 * compute a dot product of two normalized vectors
 */
function normalizedDotProduct(v1,v2){
	return dotProduct(normalize(v1),normalize(v2));
}
/**
 *compute dot product of two same sized vectors 
 */
function dotProduct(vec1,vec2){
	var sum = 0;
	for (var i in vec1){
		sum += vec1[i]*vec2[i];
	}
	return sum;
}
/**
 *compute dot product of two 3D vectors
 */
function dotProduct3d(vec1,vec2){
	  return vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2];
}
/**
 * substract vec1 from vec2
 */
function subVec3d(vec1,vec2){
	return [vec2[0]-vec1[0],
			vec2[1]-vec1[1],
			vec2[2]-vec1[2]];
}
/**
* cross product of two 3D vectors
*/
function crossProduct(vec1, vec2){
	return {x:vec1.y*vec2.z-vec2.y*vec1.z,
			y:vec1.x*vec2.z-vec2.x*vec1.z,
			z:vec1.x*vec2.y-vec2.x*vec1.y};
}
/**
* absolute values of cross product of two 3D vectors
*/
function absCrossProduct(vec1, vec2){
	return {x: Math.abs(vec1.y*vec2.z-vec2.y*vec1.z),
			y: Math.abs(vec1.x*vec2.z-vec2.x*vec1.z),
			z: Math.abs(vec1.x*vec2.y-vec2.x*vec1.y)};
}

function sameSide(planePoint,planeNormal,point1,point2){
	return  dotProduct(planeNormal, subVec3d(planePoint, point1))*
			dotProduct(planeNormal, subVec3d(planePoint, point2));
}


function minComponent(face, componenet){
	return Math.min(faks.data.vertices[face.vertices[0]][componenet],
			Math.min(faks.data.vertices[face.vertices[1]][componenet],
					faks.data.vertices[face.vertices[2]][componenet]));
}

function maxComponent(face, componenet){
	return Math.max(faks.data.vertices[face.vertices[0]][componenet],
			Math.max(faks.data.vertices[face.vertices[1]][componenet],
		 			faks.data.vertices[face.vertices[2]][componenet]));
}

function triangleIntersectionTest(face1,face2){
	var normal1 = faks.data.normals[face1.normals[0]]; //face1.normals[1] face1.normals[2] should be the same 
	var normal2 = faks.data.normals[face2.normals[0]]; //face1.normals[1] face1.normals[2] should be the same 
	var d1 = -dotProduct(normal1, faks.data.vertices[face1.vertices[0]]);
	var d2 = -dotProduct(normal2, faks.data.vertices[face2.vertices[0]]);
	
	//calculate distances of of all vertexes in face1 from the plane of face2
	var d1v0 = dotProduct(normal2, faks.data.vertices[face1.vertices[0]]) + d2;
	var d1v1 = dotProduct(normal2, faks.data.vertices[face1.vertices[1]]) + d2;
	var d1v2 = dotProduct(normal2, faks.data.vertices[face1.vertices[2]]) + d2;
	
	if ((d1v0 > 0 && d1v1 > 0 && d1v2 >0) || (d1v0 < 0 && d1v1 < 0 && d1v2 < 0)){
		return 0; // no collisoin possible, the triangle is above or below the plane
	}
	
	if (d1v0 == 0 && d1v1 == 0 && d1v2 ==0){
		return 1;// triangles are laying on the same plane
	}
	
	//calculate distances of of all vertexes in face2 from the plane of face1
	var d2v0 = dotProduct(normal1, faks.data.vertices[face2.vertices[0]]) + d1;
	var d2v1 = dotProduct(normal1, faks.data.vertices[face2.vertices[1]]) + d1;
	var d2v2 = dotProduct(normal1, faks.data.vertices[face2.vertices[2]]) + d1;

	if ((d2v0 > 0 && d2v1 > 0 && d2v2 >0) || (d2v0 < 0 && d2v1 < 0 && d2v2 < 0)){
		return 0; // no collisoin possible, the triangle is above or below the plane
	}
	
	var L = absCrossProduct(normal1, normal2); //intersect vector of the two planes
	var max = 'y';
	if (L.x>L.y && L.x>L.z){ // x cord is the biggest
		max = 'x';
	}else if( L.z>L.y){ // z cord is the biggest
		max = 'z';
	}// y cord is the biggest
	
	var p1v0 = faks.data.vertices[face1.vertices[0]][max];
	var p1v1 = faks.data.vertices[face1.vertices[1]][max];
	var p1v2 = faks.data.vertices[face1.vertices[2]][max];
	var p2v0 = faks.data.vertices[face2.vertices[0]][max];
	var p2v1 = faks.data.vertices[face2.vertices[1]][max];
	var p2v2 = faks.data.vertices[face2.vertices[2]][max];
	
	if (d1v0 * d1v1 < 0){
		t11 = p1v0 + (p1v1-p1v0) * (d1v0 / (d1v0 - d1v1));
		if (d1v0 * d1v2 < 0){
			t12 = p1v0 + (p1v2-p1v0) * (d1v0 / (d1v0 - d1v2));
		}else{
			t12 = p1v1 + (p1v2-p1v1) * (d1v1 / (d1v1 - d1v2));
		}
	}else{
		t11 = p1v2 + (p1v0-p1v2) * (d1v2 / (d1v2 - d1v0));
		t12 = p1v2 + (p1v1-p1v2) * (d1v2 / (d1v2 - d1v1));
	}
	
	if (d2v0 * d2v1 < 0){
		t21 = p2v0 + (p2v1-p2v0) * (d2v0 / (d2v0 - d2v1));
		if (d2v0 * d2v2 < 0){
			t22 = p2v0 + (p2v2-p2v0) * (d2v0 / (d2v0 - d2v2));
		}else{
			t22 = p2v1 + (p2v2-p2v1) * (d2v1 / (d2v1 - d2v2));
		}
	}else{
		t21 = p2v2 + (p2v0-p2v2) * (d2v2 / (d2v2 - d2v0));
		t22 = p2v2 + (p2v1-p2v2) * (d2v2 / (d2v2 - d2v1));
	}
	
	if (Math.min(t21,t22)>Math.max(t11,t12) || Math.max(t21,t22)<Math.min(t11,t12)){
		return 0;
	}

	return 1;
}

/***********************************************************/
/***********************************************************/
/***********************************************************/


function initGL(canvas) {
  try {
    gl = canvas.getContext("experimental-webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
  } catch (e) {
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
var mat_textures = {};
var floor;
var bricky;
var glassy;
function initTexture() {
  var images = new Array();	
  for (mat in faks.data.materials){
	  
	  (function(){
		   
		  var texty = gl.createTexture();
		  texty.image = new Image();
		  texty.image.onload = //handleLoadedTexture(mat_textures[faks.data.materials[mat]]);
		  
		  function () {
			  handleLoadedTexture(texty);
			  //alert("OnLoad: " + texty.image.src);
		  };
		  texty.image.src = "static/" + faks.data.materials[mat].img;
		  mat_textures[faks.data.materials[mat].name] = texty;
	  })();
	  
	  images.push(floor);
	  //mat_textures[faks.data.materials[mat]] = floor;
  }
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

var vertexIndices = [];
var buffers = [];
function initBuffers() {
  

  $.each(faks.data.materials, function(mat, material){
	var bo = faks.getTriangleFaces(mat);
	
	
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
    buffers[material.name] = buff;
    vertexIndices[material.name] = bo.fac;

  });  

}


function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);

  mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
  mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
  mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);

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

  var i = 0;
  for (var mat in buffers){

	  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mat].vec);
	  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, buffers[mat].vec.itemSize, gl.FLOAT, false, 0, 0);
	  
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mat].nor);
	  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, buffers[mat].nor.itemSize, gl.FLOAT, false, 0, 0);
	  
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mat].tex);
	  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, buffers[mat].tex.itemSize, gl.FLOAT, false, 0, 0);


	  
	  setMatrixUniforms();
	  gl.activeTexture(gl.TEXTURE0);
	  
	  //Draw the floors:
	

	  
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[mat].fac);

	  gl.uniform1i(shaderProgram.samplerUniform, 0);
	  
	  if (mat == "glass") {
		  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		  gl.enable(gl.BLEND);
		  //gl.disable(gl.DEPTH_TEST);
		  gl.uniform1f(shaderProgram.alphaUniform, 0.2);
	  } else {
		  gl.disable(gl.BLEND);
		  gl.enable(gl.DEPTH_TEST);
		  gl.uniform1f(shaderProgram.alphaUniform, 1);
	  }
	  
	  gl.bindTexture(gl.TEXTURE_2D, mat_textures[mat]);
	  //console.log(mat_textures[mat]);
	  gl.drawElements(gl.TRIANGLES, buffers[mat].fac.numItems, gl.UNSIGNED_SHORT, vertexIndices[mat]);

  }

}


function handleKeyDown(event) {
  if(prevent_default)
    currentlyPressedKeys[event.keyCode] = true;
}


function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
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
  
  if (currentlyPressedKeys[17]) { // Space
    fly = movingSpeed;
  } else if (currentlyPressedKeys[32]) { // Control
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


function animate() {
  var timeNow = new Date().getTime();
  if (lastTime != 0) {
      var elapsed = timeNow - lastTime;
      if (speed != 0 && elapsed != 0) {
          xPos -= Math.sin(degToRad(yaw)) * speed * elapsed;
          zPos -= Math.cos(degToRad(yaw)) * speed * elapsed;
//          joggingAngle += elapsed * 0.6; // 0.6 "fiddle factor" - makes it feel more realistic :-)
//          yPos = Math.sin(degToRad(joggingAngle)) / 20 + 0.4
      }
      if (fly != 0 && elapsed != 0) {
          yPos -= fly * elapsed;
      }
      yaw += yawRate * elapsed;
      pitch += pitchRate * elapsed;
  }
  lastTime = timeNow;
}


function tick() {
  // comment requestAnimFrame(tick); when debugging and use setInterval instead
  if (!debug) requestAnimFrame(tick);
  
  //console.log("fuuu : "+intersection(faks.data.faces[0],faks.data.faces[1]));
  
  handleKeys();
  animate();
  drawScene();
  fps++;
}


function splitFaces(faks){
//	for (var f in faks.data.faces){
//		
//	}
}

function webGLStart() {
  splitFaces(faks.data);
  var canvas = document.getElementById("lesson05-canvas");
  for(i in faks.data.materials){
    if(faks.data.materials[i].name == "Material"){
        faks.data.materials[i].scale = 2;
    }
    else if(faks.data.materials[i].name == "wood-floor"){
        faks.data.materials[i].scale = 4;
    }
    else if(faks.data.materials[i].name == "horizon"){
        faks.data.materials[i].scale = 0.06;
    }
  }
  initGL(canvas);
  initShaders();
  initBuffers();
  initTexture();
  
  canvas.onmousedown = handleMouseDown;
  document.onmouseup = handleMouseUp;
  document.onmousemove = handleMouseMove;
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;

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

$.getJSON('static/faks.js', function(data){
  faks.addObject(data);
  faks.setTranslate([1,5.8,8]);
  faks.addObject(star);
//  faks.data = data;
  
  webGLStart();
});
