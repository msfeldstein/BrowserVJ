// var ISFRenderer = function (isf, context) {
//   this.isf = isf;
//   this.gl = context;
//   this._textureIndex = 0;
  
//   this._setupInputs();
//   this._setupGL();
//   this._setupBuffers();
// };

// ISFRenderer.prototype._setupGL = function () {
//   this.vShader = this._createShader(this.isf.vertexShader, this.gl.VERTEX_SHADER);
//   this.fShader = this._createShader(this.isf.fragmentShader, this.gl.FRAGMENT_SHADER);
//   this.program = this._createProgram(this.vShader, this.fShader);
//   this._setupTriangles(this.program);
//   this.gl.useProgram(this.program)
// }

// ISFRenderer.prototype._setupInputs = function () {
//   this._inputs = {};
//   this._startTime = Date.now();
//   this._findUniforms();
//   for ( var isfInput in this.isf.inputs) {
//     if (isfInput.DEFAULT) {
//       this.uniforms[isfInput.NAME].value = isfInput.DEFAULT;
//     }
//   }
// }

// ISFRenderer.prototype._setupBuffers = function () {
//   this._buffers = [];
//   for ( var i = 0; i < this.isf.passes.length; ++i ) {
//     var passInfo = this.isf.passes[i];
//     passInfo.target = passInfo.target;// || "___OUTPUT_TO_SCREEN___";
//     var buffer = {}
//     buffer.name = passInfo.target;
//     buffer.persistent = passInfo.persistent;
//     buffer.textureUnit = this._newTexIndex();
//     buffer.texture = this._createTexture();
//     buffer.fbo = this.gl.createFramebuffer();
//     this.gl.bindFramebuffer(
//       this.gl.FRAMEBUFFER,
//       buffer.fbo);
//     this.gl.framebufferTexture2D(
//       this.gl.FRAMEBUFFER,
//       this.gl.COLOR_ATTACHMENT0,
//       this.gl.TEXTURE_2D,
//       buffer.texture,
//       0);
//     this.gl.activeTexture(this.gl.TEXTURE0 + buffer.textureUnit);
//     this.gl.bindTexture(this.gl.TEXTURE_2D, buffer.texture);
//     this._buffers.push(buffer);
//   }
//   this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
// }

// ISFRenderer.prototype._setupTriangles = function (program) {
//   this.gl.useProgram(program)
//   var positionLocation = this.gl.getAttribLocation(program, "position")
//   var buffer = this.gl.createBuffer()
//   this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
//   this.gl.bufferData(
//     this.gl.ARRAY_BUFFER,
//     new Float32Array([
//       -1.0, -1.0,
//       1.0, -1.0, 
//       -1.0,  1.0, 
//       -1.0,  1.0, 
//       1.0, -1.0, 
//       1.0,  1.0
//     ]),
//     this.gl.STATIC_DRAW
//   )
//   this.gl.enableVertexAttribArray(positionLocation)
//   this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0)
// }

// ISFRenderer.prototype._setValue = function (name, value) {
//   var input = this.uniforms[name];
//   if (input) {
//     input.value = value;
//     input.dirty = true;
//   }
// }

// ISFRenderer.prototype.render = function (w, h, renderDestination) {
//   this._setValue( "TIME", (Date.now() - this._startTime) / 1000 )
//   this._setValue( "RENDERSIZE", [w, h])
  
//   this.gl.useProgram(this.program);

//   // First bind all the pass buffers into the appropriate textures.
//   for ( var i in this._buffers ){
//     var buffer = this._buffers[i];
//     this.gl.activeTexture( this.gl.TEXTURE0 + buffer.textureUnit );
//     this.gl.bindTexture( this.gl.TEXTURE_2D, buffer.texture );
//     if ( buffer.name ) {
//       var loc = this.gl.getUniformLocation( this.program, buffer.name );
//       this.gl.uniform1i( loc, buffer.textureUnit );
//       this.setValue( "_" + buffer.name + "_imgSize", [buffer.width, buffer.height] );
//       this.setValue( "_" + buffer.name + "_imgRect", [0, 0, 1, 1] );
//       this.setValue( "_" + buffer.name + "_flip", false );
//     }
//     this.gl.bindTexture( this.gl.TEXTURE_2D, null );
//   }

//   var lastTarget = null;

//   for ( var i = 0; i < this.isf.passes.length; ++i ) {
//     var pass = this.isf.passes[i];
//     this._setValue( "PASSINDEX", i );
//     if (pass.target) {
//       var buffer = this._findBuffer(pass.target);
//       if ( w != buffer.width || h != buffer.height) {
//         buffer.width = w;
//         buffer.height = h;
//         this.gl.bindTexture(this.gl.TEXTURE_2D, buffer.texture);
//         var pixelType = buffer.float ? this.gl.FLOAT : this.gl.UNSIGNED_BYTE;
//         this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, w, h, 0, this.gl.RGBA, pixelType, null);
//         this.gl.bindTexture(this.gl.TEXTURE_2D, null);
//       }
//       this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, buffer.fbo);
//       this.gl.viewport(0, 0, buffer.width, buffer.height);
//       this._setValue( "RENDERSIZE", [buffer.width, buffer.height] );
//       lastTarget = buffer;
//     } else {
//       this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
//       this.gl.viewport(0, 0, w, h);
//       this._setValue( "RENDERSIZE", [w, h] );
//       lastTarget = null;
//     }
//   }
//   this._pushUniforms();
//   this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
// }

// ISFRenderer.prototype._findUniforms = function () {
//   var lines = this.isf.fragmentShader.split("\n");
//   var uniforms = {};
//   for (var i in lines) {
//     var line = lines[i];
//     if (line.indexOf("uniform") == 0) {
//       var tokens = line.split(/\W+/);
//       var name = tokens[2];
//       var uniform = this._typeToUniform(tokens[1]);
//       uniform.name = name;
//       uniform.dirty = true;
//       uniforms[name] = uniform;
//     }
//   }
//   this.uniforms = uniforms;
//   return uniforms;
// }

// ISFRenderer.prototype._typeToUniform = function(type) {
//   var uniform = {
//     "float": {type: "f", value: 0},
//     "vec2": {type: "v2", value: [0,0]},
//     "vec3": {type: "v3", value: [0,0,0]},
//     "vec4": {type: "v4", value: [0,0,0,0]},
//     "bool": {type: "i", value: 0},
//     "int": {type: "i", value: 0},
//     "color": {type: "v4", value: [0,0,0,0]},
//     "point2D": {type: "v2", value: [0,0], isPoint: true},
//     "sampler2D": {type: "t", value: {complete: false, readyState: 0}, texture: null, textureUnit: null},
//   }[type];
//   if (!uniform) throw "Unknown uniform type in ISFRenderer.typeToUniform: "+type;
//   return uniform;
// }

// ISFRenderer.prototype._pushUniforms = function () {
//   for (var k in this.uniforms) {
//     var input = this.uniforms[k];
//     if (input.dirty) {
//       var loc = this.gl.getUniformLocation(this.program, input.name);
//       if (loc == -1) {
//         console.log("Couldn't find uniform ", input.name)
//         continue;
//       }
//       var v = input.value;
//       switch (input.type) {
//         case "f":
//           this.gl.uniform1f(loc, v);
//           break;
//         case "v2":
//           this.gl.uniform2f(loc, v[0], v[1]);
//           break;
//         case "v3":
//           this.gl.uniform3f(loc, v[0], v[1], v[2]);
//           break;
//         case "v4":
//           this.gl.uniform4f(loc, v[0], v[1], v[2], v[3]);
//           break;
//         case "i":
//           this.gl.uniform1i(loc, v);
//           break;
//         default:
//           console.log("Unknown type", input);
//       }
//       input.dirty = false;
//     }
//   }
// }

// ISFRenderer.prototype._createTexture = function () {
//   var texture = this.gl.createTexture();
//   this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
//   this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
//   this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
//   this.gl.bindTexture(this.gl.TEXTURE_2D, null);
//   return texture;
// }

// ISFRenderer.prototype._createShader = function (src, type) {
//   var shader = this.gl.createShader(type);
//   this.gl.shaderSource(shader, src);
//   this.gl.compileShader(shader);
//   var compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
//   if (!compiled) {
//     var lastError = this.gl.getShaderInfoLog(shader)
//     throw { message: "Error Compiling Shader", error: lastError}
//   }
//   return shader;
// }

// ISFRenderer.prototype._createProgram = function (vShader, fShader) {
//   var program = this.gl.createProgram();
//   this.gl.attachShader(program, vShader);
//   this.gl.attachShader(program, fShader);
//   this.gl.linkProgram(program);
//   var linked = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
//   if (!linked) {
//     var lastError = this.gl.getProgramInfoLog(program);
//     throw { message: "Error Linking Program", error: lastError }
//   }
//   return program;
// }

// ISFRenderer.prototype._newTexIndex = function () {
//   return this._textureIndex++;
// }

// ISFRenderer.prototype._findBuffer = function(name) {
//   for (var i = 0; i < this._buffers.length; i++) {
//     if (this._buffers[i].name == name) return this._buffers[i];
//   }
//   return null;
// }

