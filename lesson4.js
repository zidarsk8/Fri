
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

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
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


var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

function initBuffers() {
  

        var textureCoords = [
          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.2, 1.2,
          0.2, 1.0,

          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0
        ];
        cubeVertexTextureCoordBuffer = gl.createBuffer();
        cubeVertexTextureCoordBuffer.itemSize = 2;
        cubeVertexTextureCoordBuffer.numItems = textureCoords.length;  
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);

    fac = [
     5, 7, 6,
     2, 6, 3,
     5, 1, 4,
     5, 4, 7,
     3, 6, 7,
     3, 7, 4,
     1, 5, 2,
     5, 6, 2,
     1, 2, 3,
     1, 3, 4
    ];
    vertices = [
         1.000000, -1.000000, -1.000000,
         1.000000, -1.000000, -1.000000,
         1.000000, -1.000000, 1.000000,
        -1.000000, -1.000000, 1.000000,
        -1.000000, -1.000000, -1.000000,
         1.000000, 1.000000, -1.000000,
        -0.000001, 1.000000, 1.000000,
        -1.000000, 1.000000, -1.000000
    ];
    
    cubeVertexPositionBuffer = gl.createBuffer();
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = vertices.length/cubeVertexPositionBuffer.itemSize;  
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


    var cubeVertexIndices = [
     7, 6, 5,
 2, 6, 3,
 5, 1, 4,
 5, 4, 7,
 3, 6, 7,
 3, 7, 4,
 1, 5, 2,
 5, 6, 2,
 1, 2, 3,
 1, 3, 4
    ];
    
    cubeVertexIndexBuffer = gl.createBuffer();
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = cubeVertexIndices.length/cubeVertexIndexBuffer.itemSize;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    
    
    
    cubeVertexColorBuffer = gl.createBuffer();
    cubeVertexColorBuffer.itemSize = 4;
    cubeVertexColorBuffer.numItems = 24;
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);

    
    var unpackedColors = [];
    for (var i=0; i<cubeVertexPositionBuffer.numItems ; i++){
      unpackedColors = unpackedColors.concat([(i/cubeVertexPositionBuffer.numItems), 1-(i/cubeVertexPositionBuffer.numItems), 0.8, 1]);
    }
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
}


var rCubeX = 0;
var rCubeY = 0;

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);

    mat4.translate(mvMatrix, [-0.0, 0.0, -8.0]);


    mvPushMatrix();
    //console.log("rotateCube "+rCube);
    mat4.rotate(mvMatrix, degToRad(rCubeX), [0, 1, 0]);
    mat4.rotate(mvMatrix, degToRad(rCubeY), [1, 0, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    mvPopMatrix();

}

var neheTexture;
function initTexture() {
  neheTexture = gl.createTexture();
  neheTexture.image = new Image();
  neheTexture.image.onload = function() {
    handleLoadedTexture(neheTexture)
  }

  neheTexture.image.src = "brick.jpg";
}
function handleLoadedTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;


function handleMouseDown(event) {
    console.log("mouse down");
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    
    var arr = [];
    console.log(arr);
    arr.push(2);
    arr.push(1);
    arr.push(3);
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

    rCubeX += deltaX / 3;
    rCubeY += deltaY / 3;
    
    lastMouseX = newX
    lastMouseY = newY;
}


function tick() {
//    requestAnimFrame(tick);
    drawScene();
    frameRate++;
}

var frameRate = 0;
function webGLStart() {
    var canvas = document.getElementById("lesson04-canvas");
    initGL(canvas);
    initShaders();
    initBuffers();    
    initTexture();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
//    tick();
    setInterval("tick()", 50);
    setInterval(function(){
      document.getElementById("fps").innerHTML=frameRate;
      frameRate = 0;
    },1000);
}
