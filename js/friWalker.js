var gl = null;
var pitch = 0;
var pitchRate = 0;
var yaw = 0;
var yawRate = 0;
var xPos = 1.0;
var yPos = 0.5;
var zPos = 8;
var movingSpeed = 0.01;
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
var faks = null;



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
  for (mat in faks.materials){
	  
	  (function(){
		  
		  var texty = gl.createTexture();
		  texty.image = new Image();
		  texty.image.onload = //handleLoadedTexture(mat_textures[faks.materials[mat]]);
		  
		  function () {
			  handleLoadedTexture(texty);
			  //alert("OnLoad: " + texty.image.src);
		  };
		  texty.image.src = faks.materials[mat] + ".jpg";
		  mat_textures[faks.materials[mat]] = texty;
	  })();
	  
	  
//	  mat_textures[faks.materials[mat]] = gl.createTexture();
//	  mat_textures[faks.materials[mat]].image = new Image();
//	  mat_textures[faks.materials[mat]].image.onload = function () {
//	      handleLoadedTexture(mat_textures[faks.materials[mat]])
//	  }
//	  //neh.image.src = "Material.jpg";
//	  mat_textures[faks.materials[mat]].image.src = faks.materials[mat] + ".jpg";
//	  console.log(mat_textures[faks.materials[mat]]);
	  
	  images.push(floor);
	  //mat_textures[faks.materials[mat]] = floor;
  }
  //console.log(floor);
//  floor = gl.createTexture();
//  floor.image = new Image();
//  floor.image.onload = function () {
//      handleLoadedTexture(floor)
//  }
//  //neh.image.src = "Material.jpg";
//  floor.image.src = "wood-floor.jpg";
//  
//  bricky = gl.createTexture();
//  bricky.image = new Image();
//  bricky.image.onload = function () {
//      handleLoadedTexture(bricky)
//  }
//  //neh.image.src = "Material.jpg";
//  bricky.image.src = "Material.jpg";
//  
//  
//  glassy = gl.createTexture();
//  glassy.image = new Image();
//  glassy.image.onload = function () {
//      handleLoadedTexture(glassy)
//  }
//  //neh.image.src = "Material.jpg";
//  glassy.image.src = "glass.jpg";
  
  //console.log(mat_textures);
//  mat_textures["wood-floor"] = gl.createTexture();
//  mat_textures["wood-floor"].image = new Image();
//  mat_textures["wood-floor"].image.onload = function () {
//      handleLoadedTexture(mat_textures["wood-floor"]);
//  }
//  //neh.image.src = "Material.jpg";
//  mat_textures["wood-floor"].image.src = "wood-floor.jpg";
//  
//  mat_textures["Material"] = gl.createTexture();
//  mat_textures["Material"].image = new Image();
//  mat_textures["Material"].image.onload = function () {
//      handleLoadedTexture(mat_textures["Material"]);
//  }
//  //neh.image.src = "Material.jpg";
//  mat_textures["Material"].image.src = "Material.jpg";
//  
//  
//  mat_textures["glass"] = gl.createTexture();
//  mat_textures["glass"].image = new Image();
//  mat_textures["glass"].image.onload = function () {
//      handleLoadedTexture(mat_textures["glass"]);
//  }
//  //neh.image.src = "Material.jpg";
//  mat_textures["glass"].image.src = "glass.jpg";
  
  console.log(mat_textures);
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
  
	
  $.each(faks.materials, function(key, material){
	
	var bo = faks.getTriangleFaces(material);
	
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
		  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array(bo[key]), gl.STATIC_DRAW);		
	  }
	  else{
		  gl.bindBuffer(gl.ARRAY_BUFFER, buff[key]);
		  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bo[key]), gl.STATIC_DRAW);
	  }
		  
		  
	}
    buffers[material] = buff;
    vertexIndices[material] = bo.fac;
  });  
    
//  cubeVertexPositionBuffer = gl.createBuffer();
//  cubeVertexPositionBuffer.itemSize = 3;
//  cubeVertexPositionBuffer.numItems = vertices.length/cubeVertexPositionBuffer.itemSize;
//  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
//  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
//  
//  cubeVertexNormalBuffer = gl.createBuffer();
//  cubeVertexNormalBuffer.itemSize = 3;
//  cubeVertexNormalBuffer.numItems = vertexNormals.length/cubeVertexNormalBuffer.itemSize;
//  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
//  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);
//  
//  cubeVertexTextureCoordBuffer = gl.createBuffer();
//  cubeVertexTextureCoordBuffer.itemSize = 2;
//  cubeVertexTextureCoordBuffer.numItems = textureCoords.length/cubeVertexTextureCoordBuffer.itemSize;
//  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
//  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
//  
//  cubeVertexIndexBuffer = gl.createBuffer();
//  cubeVertexIndexBuffer.itemSize = 1;
//  cubeVertexIndexBuffer.numItems = cubeVertexIndices.length/cubeVertexIndexBuffer.itemSize;
//  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
//  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}


function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);

  mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
  mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
  mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);
  var i = 0;
  for (var mat in buffers){
  
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mat].vec);
	  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, buffers[mat].vec.itemSize, gl.FLOAT, false, 0, 0);
	  
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mat].nor);
	  gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, buffers[mat].nor.itemSize, gl.FLOAT, false, 0, 0);
	  
	  gl.bindBuffer(gl.ARRAY_BUFFER, buffers[mat].tex);
	  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, buffers[mat].tex.itemSize, gl.FLOAT, false, 0, 0);
	
	  //lightning stuff:
	  gl.uniform1i(shaderProgram.useLightingUniform, true);
	  //light color:
	  gl.uniform3f( shaderProgram.ambientColorUniform, 0.9, 0.9, 0.9 );
	  //direction:
	  var lightingDirection = [  0, 0, 0];
	  
	  var adjustedLD = vec3.create();
	  vec3.normalize(lightingDirection, adjustedLD);
	  vec3.scale(adjustedLD, 1);
	//  vec3.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
	//  vec3.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
	
	  gl.uniform3fv(shaderProgram.lightingDirectionUniform, adjustedLD);
	  
	  gl.uniform3f( shaderProgram.directionalColorUniform, 0.7, 0.7, 0.7 );
	  
	
	  
	  setMatrixUniforms();
	  gl.activeTexture(gl.TEXTURE0);
	  
	  //Draw the floors:
	

	  
	  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[mat].fac);
//	  if (mat == 'Material'){
//		  
//		  gl.bindTexture(gl.TEXTURE_2D, bricky);  
//	  }
//	  else if (mat == 'glass'){
//		  gl.bindTexture(gl.TEXTURE_2D, glassy);
//	  }
//	  else{
//		  gl.bindTexture(gl.TEXTURE_2D, floor);
//	  }
	  
	  gl.bindTexture(gl.TEXTURE_2D, mat_textures[mat]);
	  //console.log(mat_textures[mat]);
	  gl.drawElements(gl.TRIANGLES, buffers[mat].fac.numItems, gl.UNSIGNED_SHORT, vertexIndices[mat]);

	  gl.uniform1i(shaderProgram.samplerUniform, 0);

  }
  //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  //cubeVertexIndexBuffer.numItems
  //gl.bindTexture(gl.TEXTURE_2D, wallTexture);  
  //gl.drawElements(gl.TRIANGLES, 2000, gl.UNSIGNED_SHORT, cubeVertexIndices);
  //gl.bindTexture(gl.TEXTURE_2D, neheTexture);  
  //gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, cubeVertexIndices);


}



function handleKeyDown(event) {
  currentlyPressedKeys[event.keyCode] = true;
}


function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
}



function handleKeys() {
  speed = 0;
  pitchRate = 0;
  yawRate = 0;
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
      yaw += yawRate * elapsed;
      pitch += pitchRate * elapsed;
  }
  lastTime = timeNow;
}


function tick() {
  // comment requestAnimFrame(tick); when debugging and use setInterval instead
  //requestAnimFrame(tick);
  handleKeys();
  animate();
  drawScene();
  fps++;
}

    
function webGLStart() {
  var canvas = document.getElementById("lesson05-canvas");
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
  setInterval("tick()", 50);
  tick();
  setInterval(function(){
    document.getElementById("fps").innerHTML="FPS: "+fps+"<br>x:"+xPos+"<br>y:"+yPos+"<br>z:"+zPos+"<br>pitch:"+pitch+"<br>yaw:"+yaw;
    fps = 0;
  }, 1000);
}

$.getJSON('faks.js', function(data){
  faks = data;
  faks.getTriangleFaces = function(material){
    var ro = {vec:[], fac:[], tex:[], nor:[] }; //return object
    var vecCounter = 0;
    
    for (var f in this.faces){
      
      var curentFace = this.faces[f];
      if (curentFace.material != material)
    	  continue;
      if (curentFace.vertices.length == 3){
        for (var i=0 ; i<3 ; i++){
          //add distinct vertex vector for each face
          ro.vec[vecCounter*3]= this.vertices[curentFace.vertices[i]].x;
          ro.vec[vecCounter*3+1]= this.vertices[curentFace.vertices[i]].y;
          ro.vec[vecCounter*3+2]= this.vertices[curentFace.vertices[i]].z;
          //add distinct normal
          if(curentFace.normals.length > 0){
        	  ro.nor[vecCounter*3]= this.normals[curentFace.normals[i]].x;
        	  ro.nor[vecCounter*3+1]= this.normals[curentFace.normals[i]].y;
        	  ro.nor[vecCounter*3+2]= this.normals[curentFace.normals[i]].z;
        	  
        	//add texture coordinate for this vector

              if(ro.nor[vecCounter*3] != 0){
            	  ro.tex[vecCounter*2] = this.vertices[curentFace.vertices[i]].z;
            	  ro.tex[vecCounter*2+1] = this.vertices[curentFace.vertices[i]].y;
              }
              if(ro.nor[vecCounter*3+2] != 0){
            	  ro.tex[vecCounter*2] = this.vertices[curentFace.vertices[i]].x;
            	  ro.tex[vecCounter*2+1] = this.vertices[curentFace.vertices[i]].y;
              }
              if(ro.nor[vecCounter*3+1] != 0){
            	  ro.tex[vecCounter*2] = this.vertices[curentFace.vertices[i]].x;
            	  ro.tex[vecCounter*2+1] = this.vertices[curentFace.vertices[i]].z;
              }
          }      

          //push vector to faces array
          ro.fac.push(vecCounter++);
        }
      }
    }
    return ro;
  }
  webGLStart();
});