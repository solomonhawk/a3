/**
 * @class Stores the details for a mesh <strong>[A3.Mesh]</strong>.
 * Handles faces, vertices and the shader
 * 
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 */
A3.Core.Objects.Mesh = function(data) {
	
	/* call the Object3D function
	 * here to reset all the 'this'
	 * variables, else all meshes
	 * share the same matrices and
	 * other properties.
	 */
	A3.Core.Object3D.call(this);
	
	// ensure valid data values
	data                 = A3.Utility.checkValue(data, {});
	data.vertexDataSize  = A3.Utility.checkValue(data.vertexDataSize, 3);
	data.normalDataSize  = A3.Utility.checkValue(data.normalDataSize, 3);
	data.colorDataSize   = A3.Utility.checkValue(data.colorDataSize, 3);
	data.uvDataSize      = A3.Utility.checkValue(data.uvDataSize, 2);
	data.renderType      = A3.Utility.checkValue(data.renderType, "solid");
	data.blendType       = A3.Utility.checkValue(data.blendType, "normal");
	data.depthTest       = A3.Utility.checkValue(data.depthTest, true);
	
	/**
	 * @description The geometry abstraction. Useful to keep around if you update
	 * the underlying data in any way.
	 * 
	 * @type A3.Core.Objects.Geometric.Geometry
	 */
	this.geometry = null;
	
	/**
	 * @description Sets the size of each vertex's data, which will normally be 3 (x,y,z)
	 * 
	 * @type Number
	 */
	this.vertexDataSize = data.vertexDataSize;
	
	/**
	 * @description Sets the size of each vertex's normal, typically 3
	 * 
	 * @type Number
	 */
	this.normalDataSize = data.normalDataSize;
	
	/**
	 * @description Sets the size of each vertex's color value, typically 3 (RGB)
	 * 
	 * @type Number
	 */
	this.colorDataSize = data.colorDataSize;
	
	/**
	 * @description Sets the size of each vertex's UV coordinate, typically 2 (x,y)
	 * 
	 * @type Number
	 */
	this.uvDataSize = data.uvDataSize;
	
	/**
	 * @description The matrix for the normals. Used to convert the normal
	 * into eye space so that we can do lighting calculations more easily
	 * 
	 * @type A3.Core.Math.Matrix3
	 */
	this.matrixNormals = new A3.Core.Math.Matrix3();
	
	/**
	 * @description Determines if we store the array of vertices, colours, etc
	 * once we have bound to the buffers. Also used for the STATIC\_DRAW / DYNAMIC\_DRAW
	 * setting in the buffer. Only set to true if you plan to update the buffer values
	 * 
	 * @type Boolean
	 */
	this.dynamic = data.dynamic || false;
	
	/**
	 * @description The shader to use for this mesh
	 * 
	 * @type Shader
	 */
	this.shader = data.shader;
	
	/**
	 * @description The mesh's render &quot;mode&quot; - either particles or a solid mesh
	 * 
	 * @type Number
	 */
	this.renderType = data.renderType.toLowerCase() === "particle" ?
						A3.Constants.RENDER_TYPES.PARTICLES :
						A3.Constants.RENDER_TYPES.SOLID;
	
	/**
	 * @description The mesh's render type. This can be either normal or additive.
	 * 
	 * @type Number, enumerated from A3.Constants.BLEND_TYPES
	 */
	this.blendType  = data.blendType.toLowerCase() === "additive" ?
						A3.Constants.BLEND_TYPES.ADDITIVE :
						A3.Constants.BLEND_TYPES.NORMAL;
	
	/**
	 * @description The mesh's opacity. Typically a value between 0 and 1.
	 * 
	 * @type Number
	 */
	this.opacity = data.opacity || 1;
	
	/**
	 * @description Declares whether or not the object is transparent. If the
	 * opacity is set to anything other than 1 or the mesh is set to be transparent
	 * (via the constructor: data.transparent) then it will be true. By default, it
	 * will be false.
	 * 
	 * @type Boolean
	 */
	this.transparent = data.transparent || false;
	
	/**
	 * @description Declares whether or not the object is to be depth tested. By default
	 * if the object is transparent we should disable the depth test, but there may
	 * be instances where this is not cool, and so you have the option
	 * 
	 * @type Boolean
	 */
	this.depthTest = data.depthTest;
	
	/**
	 * @description The buffers to be used for this mesh
	 * @type Object
	 */
	this.buffers = {
		'vertices': null,
		'elements': null,
		'normals':  null,
		'uvs':      null,
		'colors':   null
	};
	
	// if we've been passed a geometry object store it
	if(!!data.geometry) {
		this.geometry = data.geometry;
	}
};

A3.Core.Objects.Mesh.prototype = new A3.Core.Object3D();

/**
 * Sets up all the buffers for the prototype and populates
 * them using our abstracted data.
 * 
 * @private
 * @param {WebGLContext} gl The WebGL context to use
 */
A3.Core.Objects.Mesh.prototype.initialize = function(gl) {
	
	// base our hinting on the dynamic property
	// of the mesh object
	var hint = this.dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
	
	// Vertex positions
	if(this.geometry.verticesNeedUpdate) {
		
		if(!this.buffers.vertices) {
			this.buffers.vertices = {
				data: gl.createBuffer(),
				size: this.geometry.vertexPositionArray.length / this.vertexDataSize
			};
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertices.data);
		gl.bufferData(gl.ARRAY_BUFFER, this.geometry.vertexPositionArray, hint);
		
		this.geometry.verticesNeedUpdate = false;
	}
	
	// Vertex normals
	if(this.geometry.normalsNeedUpdate) {
		
		if(!this.buffers.normals) {
			this.buffers.normals = {
				data: gl.createBuffer(),
				size: this.geometry.vertexNormalArray.length / this.vertexDataSize
			};
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normals.data);
		gl.bufferData(gl.ARRAY_BUFFER, this.geometry.vertexNormalArray, hint);
		
		this.geometry.normalsNeedUpdate = false;
	}
	
	// Vertex colours
	if(this.geometry.colorsNeedUpdate) {
		
		if(!this.buffers.colors) {
			this.buffers.colors = {
				data: gl.createBuffer(),
				size: this.geometry.vertexColorArray.length / this.colorDataSize
			};
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colors.data);
		gl.bufferData(gl.ARRAY_BUFFER, this.geometry.vertexColorArray, hint);
		
		this.geometry.colorsNeedUpdate = false;
	}
	
	// Elements
	if(this.geometry.elementsNeedUpdate) {
		
		if(!this.buffers.elements) {
			this.buffers.elements = {
				data: gl.createBuffer(),
				size: this.geometry.faceElementArray.length
			};
		}
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.elements.data);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.geometry.faceElementArray, hint);
		
		this.geometry.elementsNeedUpdate = false;
	}
	
	// UV Coordinates
	if(this.geometry.uvsNeedUpdate) {
		
		if(!this.buffers.uvs) {
			this.buffers.uvs = {
				data: gl.createBuffer(),
				size: this.geometry.uvArray.length
			};
		}
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.uvs.data);
		gl.bufferData(gl.ARRAY_BUFFER, this.geometry.uvArray, hint);
		
		this.geometry.uvsNeedUpdate = false;
	}
	
	// initialize the shader
	this.shader.initialize(gl);
};

// shortcut
A3.Mesh = A3.Core.Objects.Mesh;