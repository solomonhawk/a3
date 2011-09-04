/**
 * @class Responsible for
 * taking everything else and actually
 * using WebGL to draw it <strong>[A3.R]</strong>
 * 
 * @author Paul Lewis
 * @param {Number} width The width of the renderer
 * @param {Number} height The height of the renderer
 * @param {Object} options The options with which to configure the renderer
 */
A3.Core.Render.Renderer = function(width, height, options) {
	
	// ensure we have basic vals
	// to run against
	width   = width || 404;
	height	= height || 250;
	options = options || {};
	
	return this.create(width, height, options);
};

A3.Core.Render.Renderer.prototype = {
	
	/**
	 * Creates and sets up the renderer
	 * 
	 * @param {Number} width The width of the renderer
	 * @param {Number} height The height of the renderer
	 * @param {Object} options The options with which to configure the renderer
	 */
	create: function(width, height, options) {
		
		/** 
		 * @description The WebGL canvas DOM Element
		 * @type DOMNode 
		 */
		this.domElement = null;
		
		/**
		 * @description The WebGL context
		 * @type WebGLContext
		 */
		this.gl = null;
		
		/**
		 * @description Whether or not the renderer should auto-clear
		 * on each draw - set with <strong>options.autoClear</strong>
		 * 
		 * @type Boolean
		 * @default true
		 */
		this.autoClear = A3.Utility.checkValue(options.autoClear, true);
		
		/**
		 * @description The clear colour of the WebGL 
		 * context - set with <strong>options.clearColor</strong>
		 * 
		 * @type A3.Core.Math.Vector4
		 * @default [0,0,0,1]: black
		 */
		this.clearColor = options.clearColor || new A3.Core.Math.Vector4(0.0,0.0,0.0,0.0);
		
		/**
		 * @description Whether or not the renderer should use
		 * antialiasing - set with <strong>options.antialias</strong>
		 * 
		 * @type Boolean
		 * @default true
		 */
		this.antialias = A3.Utility.checkValue(options.antialias, true);
		
		/**
		 * @description The opaque renderable objects in the scene - autopopulated
		 * 
		 * @type A3.Core.Object3D[]
		 */
		this.opaqueRenderableObjects = [];
		
		/**
		 * @description The transparent renderable objects in the scene - autopopulated
		 * 
		 * @type A3.Core.Object3D[]
		 */
		this.transparentRenderableObjects = [];
		
		/**
		 * @description The lights in the scene - autopopulated
		 * 
		 * @type A3.Core.Object3D[]
		 */
		this.lights = [];
		
		/*
		 * Here are some variables I use in the render loop. I create
		 * them here because of memory usage. If they're created in
		 * the render loop on the fly then memory usage goes through
		 * the roof. Instead they are created here and the values are
		 * overwritten in the array for each render pass
		 */
		this.projectionMatrix         = new A3.Core.Math.Matrix4();
		this.projectionMatrixArray    = new Float32Array(16);
		this.modelViewMatrixArray     = new Float32Array(16);
		this.normalMatrixArray        = new Float32Array(9);
		this.lastShaderProgram        = null;
		this.ambientLightColor        = new A3.Core.Math.Vector3(0,0,0);
		this.ambientlightColorArray   = new Float32Array(3);
		this.lightLocationArray       = new Float32Array(3);
		this.lightColorArray          = new Float32Array(3);
		this.eyeDirectionVector       = new A3.Core.Math.Vector3(0,0,0);
		this.eyeDirectionArray        = new Float32Array(3);
		this.eyePositionArray         = new Float32Array(3);
		
		// now initialize everything
		this._initialize(width, height, options);	
		
		return this;
	},
	
	/**
	 * Actually does the donkey work of setting everything up
	 * 
	 * @throws {Error} If the WebGL context creation fails
	 * @private
	 */
	_initialize: function(width, height, options) {
		
		this.domElement = options.domElement || document.createElement('canvas');
		try {
			
			this.gl = this.domElement.getContext('experimental-webgl', {antialias:this.antialias});
			this.gl.clearColor(
				this.clearColor.x,
				this.clearColor.y,
				this.clearColor.z,
				this.clearColor.w);
			
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.depthFunc(this.gl.LEQUAL);
			this.gl.depthMask(true);
				
		} catch (exception) {
			console.error("WebGL Context Creation Failed");
		}
		
		this.resize(width, height);
		
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.cullFace(this.gl.BACK);
		this.gl.frontFace(this.gl.CCW);
	},
	
	/**
	 * Resizes the dom element
	 * 
	 * @param {Number} width The new width of the renderer
	 * @param {Number} height The new height of the renderer
	 */
	resize: function(width, height) {
		
		if(!!this.domElement && !!this.gl) {
			
			// DOM
			this.domElement.width    = width;
			this.domElement.height   = height;
			
			// WebGL
			this.gl.viewportWidth    = width;
			this.gl.viewportHeight   = height;
			
			// Finally set the viewport
			this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
			
			if(this.autoClear) {
			  this.clear();
			}
		}
	},
	
	/**
	 * Clears the WebGL context
	 */
	clear: function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	},
	
	/**
	 * Asks the renderer to render the scene
	 * 
	 * @param {Scene} scene The scene to render
	 * @param {Camera} camera The camera to use
	 */
	render: function(scene, camera) {
		
		var viewMatrix       = null,
			projectionMatrix   = null,
			mesh               = null;
		
		// reset the projection matrix and the last
		// used shader program
		this.projectionMatrix.zero();
		this.lastShaderProgram = null;
		
		if(this.autoClear) {
		  this.clear();
		}
		
		// update the camera and scene so we apply 
		// all the matrix updates down the hierarchy
		camera.update();
		scene.update();
		
		// get the current matrices out of the camera
		// and multiply them together
		viewMatrix        = camera.inverseMatrix;
		projectionMatrix  = camera.projectionMatrix;
		
		this.projectionMatrix.copy(projectionMatrix).multiply(viewMatrix);
		
		// now get out WebGL friendly versions
		this.projectionMatrix.toArray(this.projectionMatrixArray);
		this.eyeDirectionVector
			.copy(camera.position)
			.negate()
			.normalize()
			.toArray(this.eyeDirectionArray);
			
		camera.position.toArray(this.eyePositionArray);
			
		// TODO Optimise: this doesn't need to be done every time
		// clear the renderable objects and lights
		// and build up the arrays
		this.opaqueRenderableObjects.length = 0;
		this.transparentRenderableObjects.length = 0;
		this.lights.length = 0;
		
		// now build up the renderables
		this.appendChildren(scene);
			
		/*
		 * We draw the opaque objects first followed by
		 * the transparent ones back to front. Don't ask me,
		 * I just work here! OK, apparently it's a quirk of
		 * the wonder that is (Open|Web)GL and Giles has it
		 * totally covered
		 * 
		 * @see http://learningwebgl.com/blog/?p=859
		 */
    this.transparentRenderableObjects.sort(this.sortByZ);
    
    // now render
		this.renderObjectArray(this.opaqueRenderableObjects);
		this.renderObjectArray(this.transparentRenderableObjects);
		
		// reset the scene and camera
		scene.dirty         = false;
		camera.dirty        = false;
		
		// do some garbage collection and tidy
		// up of the variables
		projectionMatrix    = null;
		viewMatrix          = null;
		mesh                = null;
	},
	
	/**
	 * Function used for sorting transparent objects in reverse Z
	 * order for the wonder of WebGL
	 * 
	 * @private
	 * @param {Object3D} m1 The first object to test
	 * @param {Object3D} m2 The second object to test
	 */
	sortByZ: function(m1,m2) {
		if(m1.position.z > m2.position.z) {
			return -1;
		} else if(m1.position.z < m2.position.z) {
			return 1;
		} else {
			return 0;
		}
	},
	
	/**
	 * Switches between opaque and 
	 */
	switchRenderMode: function(mode) {
		
		switch(mode) {
			
			// Additive	
			case "additive":
				this.gl.enable(this.gl.BLEND);
				this.gl.blendEquation(this.gl.FUNC_ADD);
				this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
				break;
			
			// Transparent	
			case "transparent":
				this.gl.enable(this.gl.BLEND);
				this.gl.blendEquation(this.gl.FUNC_ADD);
				this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
				break;
				
			// Nothing	
			default:
				this.gl.disable(this.gl.BLEND);
				break;
		}
	},
	
	/**
	 * Renders the two groups of objects, the opaque
	 * ones and the transparent ones.
	 * 
	 * @param {Object3D[]} renderArray Which array to render
	 */
	renderObjectArray: function(renderArray) {
		
		var renderables  = renderArray.length,
			renderable     = null;
						
		while(renderables--) {
			
			// cache
			renderable = renderArray[renderables];
			
			if(renderable.blendType === A3.Constants.BLEND_TYPES.ADDITIVE) {
				this.switchRenderMode("additive");
			} else if(renderable.transparent) {
				this.switchRenderMode("transparent");
			} else {
				this.switchRenderMode("normal");
			}
			
			// draw
			this.renderObject(renderable);
			
			// reset
			renderable.dirty = false;
		}
	},
	
	/**
	 * Creates a flattened array of the child objects
	 * in the scene that are renderable. Goes down
	 * recursively through the tree, depth first
	 * 
	 * @private
	 * @param {A3.Core.Object3D} object3D The starting point for the recursion
	 */
	appendChildren: function(object3D) {
		
		if(!!object3D.visible) {
			
			// if this is a mesh, it's renderable
			if(object3D instanceof A3.Core.Objects.Mesh) {
				
				// ensure it is initialized
				object3D.initialize(this.gl);
				
				// if it's transparent or additive, add to the
				// transparent array, otherwise it's opaque
				if(object3D.transparent || object3D.blendType === A3.Constants.BLEND_TYPES.ADDITIVE) {
					this.transparentRenderableObjects.push(object3D);
				} else {
					this.opaqueRenderableObjects.push(object3D);
				}
			}
			
			if(object3D instanceof A3.Core.Objects.Lights.Light) {
				this.lights.push(object3D);
			}
			
			if(!!object3D.children.length) {
				var c = object3D.children.length;
				while(c--) {
					this.appendChildren(object3D.children[c]);
				}
			}
		}
	},
	
	/**
	 * Renders a mesh out to the context
	 * 
	 * @private
	 * @param {A3.Core.Objects.Mesh} The mesh to render
	 * @param {Float32Array} The camera's projection matrix flattened ready for WebGL
	 */
	renderObject: function(mesh) {
		
		var meshShaderProgram       = mesh.shader.shaderProgram,
		
			// standard attributes
			vertexPositionAttribute    = meshShaderProgram.attributes.aVertPosition,
			vertexNormalAttribute      = meshShaderProgram.attributes.aVertNormal,
			vertexColorAttribute       = meshShaderProgram.attributes.aVertColor,
			vertexUVAttribute          = meshShaderProgram.attributes.aVertUV,
			
			// standard uniforms
			modelViewMatrixUniform     = meshShaderProgram.uniforms.uModelViewMatrix,
			projectionMatrixUniform    = meshShaderProgram.uniforms.uProjectionMatrix,
			normalMatrixUniform        = meshShaderProgram.uniforms.uNormalMatrix,
			ambientLightColorUniform   = meshShaderProgram.uniforms.uAmbientLightColor,
			eyeDirectionUniform        = meshShaderProgram.uniforms.uEyeDirection,
			eyePositionUniform         = meshShaderProgram.uniforms.uEyePosition,
			textureUniform             = meshShaderProgram.uniforms.uTexture,
			environmentUniform         = meshShaderProgram.uniforms.uEnvironment,
			alphaUniform               = meshShaderProgram.uniforms.uAlpha,
			
			// custom attributes
			customAttributes           = meshShaderProgram.attributes.aCustoms,
			customAttributesCount      = customAttributes.length,
			customAttributeObject      = null,
			customAttributeShader      = null,
			
			// custom uniforms
			customUniforms             = meshShaderProgram.uniforms.uCustoms,
			customUniformsCount        = customUniforms.length,
			customUniformObject        = null,
			customUniformShader        = null,
			
			// light information
			lightCount                 = 0,
			lightIndex                 = 0,
			lightUniform               = null,
			light                      = null;
			
		// reset the ambient lighting
		this.ambientLightColor.zero();
		
		mesh.matrixWorld.toArray(this.modelViewMatrixArray);
		mesh.matrixNormals.toArray(this.normalMatrixArray);
		
		// SHADER:
		// update to use the mesh's shader if it
		// has changed since the last object
		if(meshShaderProgram !== this.lastShaderProgram) {
			this.gl.useProgram(meshShaderProgram);
			this.lastShaderProgram = meshShaderProgram;
			
			// set the projection matrix for this shader
			this.gl.uniformMatrix4fv(projectionMatrixUniform, false, this.projectionMatrixArray);
		}
		
		// set the object's alpha value
		if(!mesh.transparent) {
			mesh.opacity = 1;
		}
		this.gl.uniform1f(alphaUniform, mesh.opacity);
		
		// toggle depth testing
		if(mesh.depthTest) {
			this.gl.enable(this.gl.DEPTH_TEST);
		} else {
			this.gl.disable(this.gl.DEPTH_TEST);
		}
		
		// LIGHTS:
		while(lightCount < A3.Constants.MAX_LIGHTS) {
			
			// get the light
			light			= this.lights[lightIndex];
			lightUniform	= meshShaderProgram.uniforms.uLightSources[lightCount];
			
			if(!!light) {
				if(light.type !== A3.Constants.LIGHT_TYPES.AMBIENT) {
					
					if(light.type === A3.Constants.LIGHT_TYPES.DIRECTIONAL) {
						light.location.x = light.position.x - light.target.x;
						light.location.y = light.position.y - light.target.y;
						light.location.z = light.position.z - light.target.z;
						light.location.normalize();
					} else {
						light.location.x = light.position.x;
						light.location.y = light.position.y;
						light.location.z = light.position.z;
					}
					
					// populate the holder arrays
					light.location.toArray(this.lightLocationArray);
					light.color.toArray(this.lightColorArray);
					
					// now pass to the GL context
					this.gl.uniform1i(lightUniform.type, light.type);
					this.gl.uniform1f(lightUniform.falloff, light.fallOffDistance || 0);
					this.gl.uniform3fv(lightUniform.location, this.lightLocationArray);
					this.gl.uniform3fv(lightUniform.color, this.lightColorArray);
					lightCount++;
					
				} else {
					
					// if it's an ambient light add its color to the ambient light
					// and allow another light to be passed through
					this.ambientLightColor.x += light.color.x;
					this.ambientLightColor.y += light.color.y;
					this.ambientLightColor.z += light.color.z;
				}
			} else {
				// set the light to 'off'
				this.gl.uniform1i(lightUniform.type, A3.Constants.LIGHT_TYPES.NONE);
				lightCount++;
			}
			lightIndex++;
		}
		
		// populate the ambient light array
		this.ambientLightColor.toArray(this.ambientlightColorArray);
		this.gl.uniform3fv(ambientLightColorUniform, this.ambientlightColorArray);
		
		// CUSTOM UNIFORMS:
		while(customUniformsCount--) {
			
			// grab the shader side of the uniform and
			// the JavaScript side of it
			customUniformShader = customUniforms[customUniformsCount];
			customUniformObject	= mesh.shader.customUniforms[customUniformShader.name];
			
			// if we definitely have both then this was linked
			// properly during the shader contruction
			if(!!customUniformObject && !!customUniformShader.value) {
				
				// inspect the type and populate
				switch(customUniformObject.type) {
					case "float":
						this.gl.uniform1f(customUniformShader.value, customUniformObject.value);
						break;
				}
			}
		}
		
		// CUSTOM ATTRIBUTES:
		// update custom attributes before we
		// go ahead and access them
		while(customAttributesCount--) {
			
			// grab the shader and JavaScript versions
			// of the attribute
			customAttributeShader	= customAttributes[customAttributesCount];
			customAttributeObject	= mesh.shader.customAttributes[customAttributeShader.name];
			
			// check we have both
			if(!!customAttributeObject && !!customAttributeShader.location) {
				
				// now populate
				switch(customAttributeObject.type) {
					case "float":
					
						// bind the buffer
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, customAttributeShader.data);
						
						// check if we should update this buffer's values
						// and, if so, go ahead and do that now
						if(customAttributeObject.needsUpdate) {
							
							// update the data values
							customAttributeShader.dataValues.set(customAttributeObject.value);
							
							// push into the GL buffer
							this.gl.bufferData(this.gl.ARRAY_BUFFER, customAttributeShader.dataValues, this.gl.STATIC_DRAW);
						}
						
						// finally populate the shader
						this.gl.vertexAttribPointer(customAttributeShader.location, 1, this.gl.FLOAT, false, 0, 0);
						break;
				}
			}
		}
		
		// CAMERA / EYE DIRECTION:
		this.gl.uniform3fv(eyePositionUniform, this.eyePositionArray);
		this.gl.uniform3fv(eyeDirectionUniform, this.eyeDirectionArray);
		
		// MATRICES:
		this.gl.uniformMatrix4fv(modelViewMatrixUniform, false, this.modelViewMatrixArray);
		this.gl.uniformMatrix3fv(normalMatrixUniform, false, this.normalMatrixArray);
		
		// UVs:
		if(mesh.renderType === A3.Constants.RENDER_TYPES.PARTICLES) {
		  vertexUVAttribute = 0;
		}
		
		if(!!mesh.shader.texture && mesh.shader.texture.isReady() && ~vertexUVAttribute) {
			
			// upload the texture to the GPU
			if(!mesh.shader.texture.data) {
				this.processTexture(mesh.shader.texture);
			}
			
			// set the texture
			this.gl.activeTexture(this.gl.TEXTURE0 + mesh.shader.texture.index);
			this.gl.bindTexture(this.gl.TEXTURE_2D, mesh.shader.texture.data);
			this.gl.uniform1i(textureUniform, mesh.shader.texture.index);
			
			// pass the UV data
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.uvs.data);
			this.gl.vertexAttribPointer(vertexUVAttribute, mesh.uvDataSize, this.gl.FLOAT, false, 0, 0);
		}
		
		if(!!mesh.shader.environmentMap && mesh.shader.environmentMap.isReady()) {
      
      // upload the texture to the GPU
      if(!mesh.shader.environmentMap.data) {
        this.processEnvironmentMap(mesh.shader.environmentMap);
      }
      
      // set the texture
      this.gl.activeTexture(this.gl.TEXTURE0 + mesh.shader.environmentMap.index);
      this.gl.bindTexture(this.gl.TEXTURE_2D, mesh.shader.environmentMap.data);
      this.gl.uniform1i(environmentUniform, mesh.shader.environmentMap.index);
    }
		
		// DRAW SOLIDS:
		if(mesh.renderType === A3.Constants.RENDER_TYPES.SOLID) {
			
			// NORMALS:
			if(~vertexNormalAttribute) {
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.normals.data);
				this.gl.vertexAttribPointer(vertexNormalAttribute, mesh.normalDataSize, this.gl.FLOAT, false, 0, 0);
			}
			
			// COLOURS:
			if(~vertexColorAttribute) {
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.colors.data);
				this.gl.vertexAttribPointer(vertexColorAttribute, mesh.colorDataSize, this.gl.FLOAT, false, 0, 0);
			}
			
			// VERTICES:
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.vertices.data);
			this.gl.vertexAttribPointer(vertexPositionAttribute, mesh.vertexDataSize, this.gl.FLOAT, false, 0, 0);
		
			// ELEMENTS, DRAW:
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.buffers.elements.data);
			this.gl.drawElements(this.gl.TRIANGLES, mesh.buffers.elements.size, this.gl.UNSIGNED_SHORT, 0);
			
		} else {
			
			// COLOURS:
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.colors.data);
			this.gl.vertexAttribPointer(vertexColorAttribute, mesh.colorDataSize, this.gl.FLOAT, false, 0, 0);
			
			// VERTICES:
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.vertices.data);
			this.gl.vertexAttribPointer(vertexPositionAttribute, mesh.vertexDataSize, this.gl.FLOAT, false, 0, 0);
		
			// DRAW PARTICLES:
			this.gl.drawArrays(this.gl.POINTS, 0, mesh.buffers.vertices.size);
		}
	},
	
	/**
	 * Uploads the texture to the GPU
	 * 
	 * @param {A3.Core.Render.Textures.Texture} texture The texture to work with
	 */
	processTexture: function(texture) {
		
		// add the WebGL texture to the object
		texture.data = this.gl.createTexture();
		
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.data);
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.domElement);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		
		// now unbind
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	},
	
	/**
	 * Generates a sampler cube and uploads it to the GPU
	 * 
   * @param {Object} environmentMap An object with Textures as properties:
   * <ul>
   *  <li>px: The positive x-axis texture</li>
   *  <li>nx: The negative x-axis texture</li>
   *  <li>py: The positive y-axis texture</li>
   *  <li>ny: The negative y-axis texture</li>
   *  <li>pz: The positive z-axis texture</li>
   *  <li>nz: The negative z-axis texture</li>
   * </ul
	 */
	processEnvironmentMap: function(environmentMap) {
	  
	  // add the WebGL cubemap to the object
	  environmentMap.data = this.gl.createTexture();
	  
	  this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, environmentMap.data);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
	  
	  // X Axis
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.px.domElement);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.nx.domElement);
    
    // Y Axis
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.py.domElement);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.ny.domElement);
    
    // Z Axis
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.pz.domElement);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.nz.domElement);
    
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    
    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
    
    // now unbind
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
};

// shortcut
A3.R = A3.Core.Render.Renderer;