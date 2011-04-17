
var gl;

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


var shaderProgram;

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

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
}


function handleLoadedTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, null);
}


var neheTexture;

function initTexture() {
  neheTexture = gl.createTexture();
  neheTexture.image = new Image();
  neheTexture.image.onload = function () {
      handleLoadedTexture(neheTexture)
  }

  neheTexture.image.src = "brick.jpg";
}


var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

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
}


function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

var cubeVertexPositionBuffer;
var cubeVertexTextureCoordBuffer;
var cubeVertexIndexBuffer;

var BlenderObject = {
  vertices : [
      {x: 1.000000,  y: -1.000000, z: -1.000000},
      {x: 1.000000,  y: -1.000000, z: -1.000000},
      {x: 1.000000,  y: -1.000000, z: 1.000000},
      {x: -1.000000, y: -1.000000, z: 1.000000},
      {x: -1.000000, y: -1.000000, z: -1.000000},
      {x: 1.000000,  y: 1.000000,  z: -1.000000},
      {x: -0.000001, y: 1.000000,  z: 1.000000},
      {x: -1.000000, y: 1.000000,  z: -1.000000}
  ],
  normals:[       
      {x: 1.000000,  y: -1.000000, z: -1.000000},
      {x: 1.000000,  y: -1.000000, z: -1.000000}
  ],
  faces: [
   {vertices : [5, 7, 6], normal: 0},
   {vertices : [2, 6, 3], normal: 0},
   {vertices : [5, 1, 4], normal: 0},
   {vertices : [5, 4, 7], normal: 0},
   {vertices : [3, 6, 7], normal: 0},
   {vertices : [3, 7, 4], normal: 0},
   {vertices : [1, 5, 2], normal: 0},
   {vertices : [5, 6, 2], normal: 0},
   {vertices : [1, 2, 3], normal: 0},
   {vertices : [1, 3, 4], normal: 0}
  ],
  getTriangleFaces : function(){
    var ro = {vec:[],fac:[], tex:[]}; //return object
    var vecCounter = 0;
    for (var f in this.faces){
      var curentFace = this.faces[f];
      if (curentFace.vertices.length == 3){
        for (var i=0 ; i<3 ; i++){
          //add distinct vertex vector for each face
          ro.vec[vecCounter*3]= this.vertices[curentFace.vertices[i]-1].x;
          ro.vec[vecCounter*3+1]= this.vertices[curentFace.vertices[i]-1].y;
          ro.vec[vecCounter*3+2]= this.vertices[curentFace.vertices[i]-1].z;
          //add texture coordinate for this vector
          ro.tex[vecCounter*2] = i%2;
          ro.tex[vecCounter*2+1] = (i-1)%2;
          //push vector to faces array
          ro.fac.push(vecCounter++);
        }
      }
    }
    return ro;
  }
};

function initBuffers() {
    
  var bo = BlenderObject.getTriangleFaces();

  var vertices = bo.vec;
  cubeVertexPositionBuffer = gl.createBuffer();
  cubeVertexPositionBuffer.itemSize = 3;
  cubeVertexPositionBuffer.numItems = vertices.length/cubeVertexPositionBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var textureCoords = bo.tex;
  cubeVertexTextureCoordBuffer = gl.createBuffer();
  cubeVertexTextureCoordBuffer.itemSize = 2;
  cubeVertexTextureCoordBuffer.numItems = textureCoords.length/cubeVertexTextureCoordBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

  var cubeVertexIndices = bo.fac;
  cubeVertexIndexBuffer = gl.createBuffer();
  cubeVertexIndexBuffer.itemSize = 1;
  cubeVertexIndexBuffer.numItems = cubeVertexIndices.length/cubeVertexIndexBuffer.itemSize;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}


var xRot = 0;
var yRot = 0;
var zRot = 0;

function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

  mat4.identity(mvMatrix);

  mat4.translate(mvMatrix, [0.0, 0.0, -5.0]);

  mat4.rotate(mvMatrix, degToRad(xRot), [0, 1, 0]);
  mat4.rotate(mvMatrix, degToRad(yRot), [1, 0, 0]);
  mat4.rotate(mvMatrix, degToRad(zRot), [0, 0, 1]);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, neheTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


var lastTime = 0;


var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;


function handleMouseDown(event) {
    console.log("mouse down");
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    
    var arr = BlenderObject.getTriangleFaces().vec;
    console.log(arr);
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



function tick() {
  //requestAnimFrame(tick);
  drawScene();
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

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  setInterval("tick()", 50);
  //tick();
}

