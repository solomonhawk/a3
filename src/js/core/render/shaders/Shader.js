/**
 * @class Stores the set up for a WebGL shader <strong>[A3.Shader]</strong>.
 * This is the basis on which all other handy shaders, Phong, Lambert and
 * so are created.
 * 
 * @author Paul Lewis
 * @param {Object} data The data to pass through to the shader:
 * <ul>
 * <li>vertexShader - The source for the vertex shader</li>
 * <li>fragmentShader - The source for the fragment shader</li>
 * <li>attributes - [Optional] Any custom attributes</li>
 * <li>uniforms - [Optional] Any custom uniforms</li>
 * <ul>
 */
A3.Core.Render.Shaders.Shader = function(data) {
	
	// TODO Definitely rethink this one
	var VERTEX_SHADER_HEADER  = [
			"uniform mat4 uProjectionMatrix, uModelViewMatrix;",
			"uniform mat3 uNormalMatrix;",
			"attribute vec3 aVertColor;",
			"attribute vec3 aVertPosition;",
			"attribute vec3 aVertNormal;",
			"attribute vec2 aVertUV;",
			""
		].join("\n"),
		
		FRAGMENT_SHADER_HEADER  = [
			"#ifdef GL_ES",
			"precision highp float;",
			"#endif",
			"uniform sampler2D uTexture;",
      "uniform samplerCube uEnvironment;",
			"uniform float uAlpha;",
			""
		].join("\n"),
		
		LIGHTS                  = [
		  // lights
      "uniform vec3 uEyeDirection, uEyePosition;",
      
      "struct sLight {",
        "int type;",
        "bool active;",
        "float falloff;",
        "vec3 location;",
        "vec3 color;",
      "};",
      
      "uniform vec3 uAmbientLightColor;",
      "uniform sLight uLightSources[" + A3.Constants.MAX_LIGHTS + "];",
      ""
    ].join("\n"),
		
		vertexShaderSource		  = data.vertexShader || "",
		fragmentShaderSource	  = data.fragmentShader || "",
		customAttributes        = data.attributes,
		customUniforms          = data.uniforms;
		
	/*
	 * Apply the compiler directive for the texture here if
	 * we have supplied one
	 */
  if(!!data.texture) {
    vertexShaderSource       = "#define USE_TEXTURE 1\n" + vertexShaderSource;
    fragmentShaderSource     = "#define USE_TEXTURE 1\n" + fragmentShaderSource;
  }
  
  /*
   * Same as above but for environment mapping
   */
  if(!!data.environmentMap) {
    vertexShaderSource       = "#define USE_ENVMAP 1\n" + vertexShaderSource;
    fragmentShaderSource     = "#define USE_ENVMAP 1\n" + fragmentShaderSource;
  }
  
  if(!!data.fragmentLighting) {
    FRAGMENT_SHADER_HEADER += LIGHTS;
  } else {
    VERTEX_SHADER_HEADER += LIGHTS;
  }
		
	/**
	 * @description The compiled WebGL shader
	 * @type Shader
	 */
	this.shaderProgram         = null;
	
	/**
	 * @description The texture this shader should use
	 * @type A3.Core.Render.Textures.Texture
	 */
	this.texture               = data.texture;
	
	/**
	 * @description The environment map (cube) this shader should use
	 * @type A3.Core.Render.Textures.EnvironmentMap
	 */
	this.environmentMap        = data.environmentMap;
	
	/**
	 * @description The vertex shader text for this shader
	 * @type String
	 */
	this.vertexShaderSource    = VERTEX_SHADER_HEADER + vertexShaderSource;
	
	/**
	 * @description The fragment shader text for this shader
	 * @type String
	 */
	this.fragmentShaderSource  = FRAGMENT_SHADER_HEADER + fragmentShaderSource;
	
	/**
	 * @description The custom uniforms we want to pass to the shader
	 * @type Object
	 */
	this.customUniforms        = customUniforms || {};
	
	/**
	 * @description The custom attributes we want to pass to the shader
	 * @type Object
	 */
	this.customAttributes      = customAttributes || {};
	
	/**
	 * Whether this shader has been successfully initialized
	 * @type Boolean
	 */
	this.initialized           = false;
};

A3.Core.Render.Shaders.Shader.prototype = {
	
	/**
	 * The initialization of the shader. Goes through
	 * the process of setting up the shader program,
	 * attaching the source and compiling it.
	 * 
	 * @param {WebGLContext} gl The WebGL context used to process the shader
	 */
	initialize: function(gl) {
		
		// don't recompile if we don't need to
		if(!this.initialized) {
			
			// create the shaders and program
			var vertexShader			   = gl.createShader(gl.VERTEX_SHADER),
				fragmentShader			   = gl.createShader(gl.FRAGMENT_SHADER),
				attributes				     = null,
				attCount				       = 0,
				light					         = 0,
				lightCount				     = A3.Constants.MAX_LIGHTS,
				
				// custom uniforms
				customUniformList		   = Object.keys(this.customUniforms),
				customUniformCount	   = customUniformList.length,
				customUniformName		   = null,
				
				// custom attributes
				customAttributeList		 = Object.keys(this.customAttributes),
				customAttributeCount	 = customAttributeList.length,
				customAttributeName		 = null,
				customAttribute			   = null;
				
			this.shaderProgram	     = gl.createProgram();
			
			// populate
			gl.shaderSource(
				vertexShader,
				this.vertexShaderSource
			);
			
			gl.shaderSource(
				fragmentShader,
				this.fragmentShaderSource
			);
			
			// compile
			gl.compileShader(vertexShader);
			gl.compileShader(fragmentShader);
			
			// handle vertex shader errors
			if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
				console.error("Vertex shader compile failed");
				console.error(this.vertexShaderSource);
				throw gl.getShaderInfoLog(vertexShader);
			}
			
			// handle fragment shader errors
			if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
				console.error("Fragment shader compile failed");
				console.error(this.fragmentShaderSource);
				throw gl.getShaderInfoLog(fragmentShader);
			}
			
			// attach the vertex and fragment
			// shaders to the program and link
			gl.attachShader(this.shaderProgram, vertexShader);
			gl.attachShader(this.shaderProgram, fragmentShader);
			gl.linkProgram(this.shaderProgram);
			
			// get the shader attributes
			this.shaderProgram.attributes = {
				"aVertPosition": gl.getAttribLocation(this.shaderProgram, "aVertPosition"),
				"aVertNormal": gl.getAttribLocation(this.shaderProgram, "aVertNormal"),
				"aVertColor": gl.getAttribLocation(this.shaderProgram, "aVertColor"),
				"aVertUV": gl.getAttribLocation(this.shaderProgram, "aVertUV"),
				"aCustoms": []
			};
			
			// now we have processed the built-in
			// attributes we should go through and enable each
			attributes	= Object.keys(this.shaderProgram.attributes);
			attCount	= attributes.length;
			 
			while(attCount--) {
				if(attributes[attCount] !== "aCustoms") {
					gl.enableVertexAttribArray(
						this.shaderProgram.attributes[attributes[attCount]]
					);
				}
			}
			
			// fill in the custom attributes
			while(customAttributeCount--) {
				
				// get its name for the lookup and
				// push it on to the array
				customAttributeName	 = customAttributeList[customAttributeCount];
				customAttribute		   = this.customAttributes[customAttributeName];
				
				this.shaderProgram.attributes.aCustoms.push(
					{
						name: customAttributeName,
						location: gl.getAttribLocation(this.shaderProgram, customAttributeName),
						data: gl.createBuffer(),
						dataValues: new Float32Array(customAttribute.value)
					}
				);
				
				customAttribute.needsUpdate = true;
				
				// enable it
				gl.enableVertexAttribArray(
					this.shaderProgram.attributes.aCustoms[this.shaderProgram.attributes.aCustoms.length-1].location
				);
			}
			
			// same for the uniforms
			this.shaderProgram.uniforms = {
				"uModelViewMatrix": gl.getUniformLocation(this.shaderProgram, "uModelViewMatrix"),
				"uProjectionMatrix": gl.getUniformLocation(this.shaderProgram, "uProjectionMatrix"),
				"uEyeDirection": gl.getUniformLocation(this.shaderProgram, "uEyeDirection"),
				"uEyePosition": gl.getUniformLocation(this.shaderProgram, "uEyePosition"),
				"uAmbientLightColor": gl.getUniformLocation(this.shaderProgram, "uAmbientLightColor"),
				"uNormalMatrix": gl.getUniformLocation(this.shaderProgram, "uNormalMatrix"),
				"uTexture": gl.getUniformLocation(this.shaderProgram, "uTexture"),
				"uEnvironment": gl.getUniformLocation(this.shaderProgram, "uEnvironment"),
        "uAlpha": gl.getUniformLocation(this.shaderProgram, "uAlpha"),
				"uLightSources": [],
				"uCustoms": []
			};
			
			// do lights
			for(light = 0; light < lightCount; light++) {
				this.shaderProgram.uniforms.uLightSources.push(
					{
						type: gl.getUniformLocation(this.shaderProgram, "uLightSources[" + light + "].type"),
						falloff: gl.getUniformLocation(this.shaderProgram, "uLightSources[" + light + "].falloff"),
						location: gl.getUniformLocation(this.shaderProgram, "uLightSources[" + light + "].location"),
						color: gl.getUniformLocation(this.shaderProgram, "uLightSources[" + light + "].color")
					}
				);
			}
			
			// fill in the custom uniforms
			while(customUniformCount--) {
				
				// get its name for the lookup
				customUniformName = customUniformList[customUniformCount];
				
				// get its name for the lookup and
				// push it on to the array
				this.shaderProgram.uniforms.uCustoms.push(
					{
						name: customUniformName,
						value: gl.getUniformLocation(this.shaderProgram, customUniformName)
					}
				);
			}
			
			// we're good
			this.initialized = true;
		}
	}
};

// shortcut
A3.Shader = A3.Core.Render.Shaders.Shader;
