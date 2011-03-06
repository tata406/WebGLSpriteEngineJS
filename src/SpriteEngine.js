SpriteEngine = function() {
	this.shaderProgram = null;
	this.vMulColor = [1,1,1,1];
}

SpriteEngine.prototype = new Engine();
SpriteEngine.prototype.constructor = SpriteEngine;

SpriteEngine.prototype.initSettings = function() {
    Engine.prototype.initSettings.call(this);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
}

SpriteEngine.prototype.initShaders = function() {
    document.head.innerHTML += shaders.create_fragment_shader();
    document.head.innerHTML += shaders.create_vertex_shader();
    this.shaderProgram = this.createShaderProgram(["shader-fs","shader-vs"]);
    this.gl.useProgram(this.shaderProgram);
 
    this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    this.gl.enableVertexAttribArray(this.shaderProgram.vertexPositionAttribute);
    this.shaderProgram.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexColor");
    this.gl.enableVertexAttribArray(this.shaderProgram.vertexColorAttribute);
    this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
    this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);

    this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
    this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
    this.shaderProgram.uSampler = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
    this.shaderProgram.vMulColor = this.gl.getUniformLocation(this.shaderProgram, "vMulColor");
    this.shaderProgram.startS = this.gl.getUniformLocation(this.shaderProgram, "startS");
    this.shaderProgram.endS = this.gl.getUniformLocation(this.shaderProgram, "endS");
    this.shaderProgram.startT = this.gl.getUniformLocation(this.shaderProgram, "startT");
    this.shaderProgram.endT = this.gl.getUniformLocation(this.shaderProgram, "endT");
  }
SpriteEngine.prototype.setUniforms = function() {
    this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, new Float32Array(this.pMatrix.flatten()));
    this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, new Float32Array(this.mvMatrix.flatten()));
    this.gl.uniform4fv(this.shaderProgram.vMulColor, new Float32Array(this.vMulColor));
  } 

SpriteEngine.prototype.drawSprite = function(sprite,src_x,src_y,src_width,src_height) {
    var positionBuffer = sprite[0];
    var colorBuffer = sprite[1];
    var textureCoordBuffer = sprite[2];
    var texture = sprite[3];
    var w = texture.image.width;
    var h = texture.image.height;
    if( src_x == undefined ) {
        src_x = 0;
    }
    if( src_width == undefined ) {
        src_width = w;
    }
    if( src_y == undefined ) {
        src_y = 0;
    }
    if( src_height == undefined ) {
        src_height = h;
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, positionBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
    this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, colorBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordBuffer);
    this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, textureCoordBuffer.itemSize, this.gl.FLOAT, false, 0, 0);
    
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(this.shaderProgram.samplerUniform, 0);
   
    this.setUniforms();

    this.gl.uniform1f(this.shaderProgram.startS, src_x/w );
    this.gl.uniform1f(this.shaderProgram.endS, src_width/w );
    this.gl.uniform1f(this.shaderProgram.startT, (h-(src_y+src_height))/h );
    this.gl.uniform1f(this.shaderProgram.endT, (src_height)/h );
 
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, positionBuffer.numItems);
}

SpriteEngine.prototype.createSprite = function(width,height,spriteColor,url) {
    var vertices = [
         width, height, 0.0,
         0, height, 0.0,
         width, 0, 0.0,
         0, 0,  0.0
    ];
    var vertexPositionBuffer = this.createBuffer(vertices,3,4);
    
    var color = [
      spriteColor[0],spriteColor[1],spriteColor[2],spriteColor[3],
      spriteColor[0],spriteColor[1],spriteColor[2],spriteColor[3],
      spriteColor[0],spriteColor[1],spriteColor[2],spriteColor[3],
      spriteColor[0],spriteColor[1],spriteColor[2],spriteColor[3]
    ];
    var vertexColorBuffer = this.createBuffer(color,4,4);
	
    var coords = [
         1,0,
	 0,0,
         1,1,
         0,1
    ];
    var textureCoordBuffer = this.createBuffer(coords,2,4);
    
    return [vertexPositionBuffer, vertexColorBuffer, textureCoordBuffer, this.loadTexture(url)];
}

SpriteEngine.prototype.move = function(x,y) {
	this.mvTranslate([x,y,0]);
}

SpriteEngine.prototype.rotate = function(deg) {
	this.mvRotate(deg,[0,0,1]);
}

SpriteEngine.prototype.reset = function() {
	this.loadIdentity();
}

SpriteEngine.prototype.setTint = function(r,g,b) {
	this.vMulColor = [r,g,b,this.vMulColor[3]];
}

SpriteEngine.prototype.setAlpha = function(a) {
	this.vMulColor = [this.vMulColor[0],this.vMulColor[1],this.vMulColor[2],a];
}

SpriteEngine.prototype.clear = function(r,g,b) {
	if( r != undefined ) {
		this.gl.clearColor(r,g,b,1.0);
	}
    	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}

SpriteEngine.prototype.setView = function(x, y, width, height) {
    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    this.ortho(this.gl.viewportWidth,this.gl.viewportHeight);
}

SpriteEngine.prototype.height = function() {
    return this.gl.viewportHeight;
}
SpriteEngine.prototype.width = function() {
    return this.gl.viewportWidth;
}
