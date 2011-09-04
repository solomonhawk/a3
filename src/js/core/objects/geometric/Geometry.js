/**
 * Represents an object's geometry, such as its vertex positions, normals,
 * faces, colors and UV coordinates <strong>A3.Geometry</strong>.
 * 
 * @author Paul Lewis
 *  
 * @param {A3.Core.Objects.Geometric.Vertex[]} vertices The mesh vertices
 * @param {A3.Core.Objects.Geometric.Face4[]} faces The mesh faces
 * @param {A3.Core.Math.Vector3[]} colors The vertex colors
 * @param {A3.Core.Math.Vector2[]} faceUVs The face UV coordinates
 */
A3.Core.Objects.Geometric.Geometry = function(data) {
	
	/**
	 * @description The vertices of the mesh
	 * @type A3.Core.Objects.Geometric.Vertex[]
	 */
	this.vertices              = data.vertices;
	
	/**
	 * @description The faces of the mesh
	 * @type A3.Core.Objects.Geometric.Face4[]
	 */
	this.faces                 = data.faces || [];
	
	/**
	 * @description The color values per vertex
	 * @type A3.Core.Math.Vector3[]
	 */
	this.colors                = data.colors || [];
	
	/**
	 * @description The UVs that are passed in for each face
	 * @type A3.Core.Math.Vector2[]
	 */
	this.faceUVs               = data.faceUVs || [];
	
	/**
   * @description The UV values per vertex
   * @type A3.Core.Math.Vector2[]
   */
  this.uvs                   = (!!this.faceUVs ? new Array(this.vertices.length) : []);
	
	/**
	 * @description Flags if the vertices have been updated
	 * and if we need to update the WebGL buffers
	 * @type Boolean
	 */
	this.verticesNeedUpdate    = true;
	
	/**
	 * @description Flags if the vertex colours have been updated
	 * and if we need to update the WebGL buffers
	 * @type Boolean
	 */
	this.colorsNeedUpdate      = true;
	
	/**
	 * @description Flags if the vertex normals have been updated
	 * and if we need to update the WebGL buffers
	 * @type Boolean
	 */
	this.normalsNeedUpdate     = true;
	
	/**
	 * @description Flags if the faces (element arrays) have been updated
	 * and if we need to update the WebGL buffers
	 * @type Boolean
	 */
	this.elementsNeedUpdate    = true;
	
	/**
	 * @description Flags if the UV coordinates have been updated
	 * and if we need to update the WebGL buffers
	 * @type Boolean
	 */
	this.uvsNeedUpdate         = true;
	
	/**
	 * @description The array used to actually populate the WebGL buffers for
	 * the vertex positions. <strong>If you update this manually and then
	 * call updateVertexPositionArray() your values will be overwritten.</strong>
	 * @type Float32Array
	 */
	this.vertexPositionArray   = null;
	
	/**
	 * @description The array used to actually populate the WebGL buffers for
	 * the vertex normals. <strong>If you update this manually and then
	 * call updateVertexNormalArray() your values will be overwritten.</strong>
	 * @type Float32Array
	 */
	this.vertexNormalArray     = null;
	
	/**
	 * @description The array used to actually populate the WebGL buffers for
	 * the vertex colors. <strong>If you update this manually and then
	 * call updateVertexColorArray() your values will be overwritten.</strong>
	 * @type Float32Array
	 */
	this.vertexColorArray      = null;
	
	/**
	 * @description The array used to actually populate the WebGL buffers for
	 * the elements array. <strong>If you update this manually and then
	 * call updateFaceElementArray() your values will be overwritten.</strong>
	 * @type Float32Array
	 */
	this.faceElementArray      = null;
	
	/**
	 * @description The array used to actually populate the WebGL buffers for
	 * the UV coordinates. <strong>If you update this manually and then
	 * call getFaceElementArray() your values will be overwritten.</strong>
	 * @type Float32Array
	 */
	this.uvArray               = null;
	
	/**
	 * @description Whether the object will average normals of shared vertices
	 * thereby giving a smooth appearance, or if it won't, and will then give
	 * us a flat appearance.
	 * @type Boolean
	 */
	this.drawAsFlat            = data.flatShaded || false;
	
	// split out any shared vertices
	this.separateFaces();
	
	// calculate the vertex normals
	this.calculateNormals();
	
	// populate the position, normal and elements arrays
	this.updateVertexPositionArray();
	this.updateVertexNormalArray();
	this.updateVertexColorArray();
	this.updateFaceElementArray();
	this.updateUVArray();
	
};

A3.Core.Objects.Geometric.Geometry.prototype = {
	
	/**
	 * Calculates the normals for the vertices]
	 */
	calculateNormals: function() {
		var face          = null,
			f               = null,
			v               = null,
			normal          = null,
			vertex          = null,
			vertex1Position	= new A3.Core.Math.Vector3(),
			vertex2Position	= new A3.Core.Math.Vector3(),
			vertex3Position	= new A3.Core.Math.Vector3();
		
		for(f = 0; f < this.faces.length; f++) {
			
			face = this.faces[f];
			
			vertex1Position.copy(this.vertices[face.v1].position);
			vertex2Position.copy(this.vertices[face.v2].position);
			vertex3Position.copy(this.vertices[face.v3].position);
			
			// get the vectors between 1 & 2, and 2 & 3
			// then cross product them to get the normal
			vertex1Position.subtract(vertex2Position);
			vertex2Position.subtract(vertex3Position);
			
			normal = vertex1Position.cross(vertex2Position);
			
			// we simply add it for now since we could
			// have this vertex attached to three faces
			// and we should allow each to apply their
			// normal vector
			this.addToNormal(this.vertices[face.v1], normal);
      this.addToNormal(this.vertices[face.v2], normal);
      this.addToNormal(this.vertices[face.v3], normal);
			
			if(!!face.v4) {
        this.addToNormal(this.vertices[face.v4], normal);
			}
		}
		
		// normalize each vector's normal
		for(v = 0; v < this.vertices.length; v++) {
			vertex = this.vertices[v];
			vertex.normal.normalize();
		}
	},
	
	addToNormal: function(vertex, normal) {
	  
	  var sGroup = 0;
	  
	  if(!!vertex.smoothGroup) {
	    
	    sGroup = vertex.smoothGroup.length;
	    while(sGroup--) {
	      this.vertices[vertex.smoothGroup[sGroup]].normal.add(normal);
	    }
	    
	  } else {
	    vertex.normal.add(normal);
	  }
	},
	
	/**
	 * Separates out the vertices from any faces that
	 * share them. As we hit each vertex we test to see
	 * if it is in use elsewhere and, if so, we duplicate
	 * it and update the face elements array
	 * 
	 * @private
	 */
	separateFaces: function(copyNormals){
		
		var f	       = 0,
			v          = 1,
			fv         = 0,
			vCount     = 3,
			newVertex  = null,
			face       = null,
			vertex     = null,
			color      = null;
		
		for(f = 0; f < this.faces.length; f++) {
			
			face	= this.faces[f];
			vCount	= (face instanceof A3.Core.Objects.Geometric.Face3 ? 3 : 4);
			
			// go through each face vertex
			for(v = 1; v <= vCount; v++) {
				
				// get the vertex and color
				vertex	= this.vertices[face["v"+v]];
				color	= this.colors[face["v"+v]];
				
				// test if it's in use. If not we
				// just carry on
				if(!vertex.inUse) {
					vertex.inUse = true;
				} else {
				  
				  // duplicate
					newVertex = new A3.Core.Objects.Geometric.Vertex(
						vertex.position.x,
						vertex.position.y,
						vertex.position.z
					);
					
					// copy the normals if we want to
					if(copyNormals) {
						newVertex.normal.x = vertex.normal.x;
						newVertex.normal.y = vertex.normal.y;
						newVertex.normal.z = vertex.normal.z;
					}
					
					// push it on
					this.vertices.push(newVertex);
					
					if(!this.drawAsFlat) {
					  if(!vertex.smoothGroup) {
					    vertex.smoothGroup = [];
					  }
					  newVertex.smoothGroup = vertex.smoothGroup;
          }
          
          // push on the original vert and
          // the new one to the smooth group
					vertex.smoothGroup.push(this.vertices.length-1);
					vertex.smoothGroup.push(face["v"+v]);
					
					// if we have a vertex color
					// now would be a good time to
					// copy that as well
					if(!!color) {
						this.colors.push(
							new A3.Core.Math.Vector3(
								color.x,
								color.y,
								color.z
							)
						);
					}
					face["v"+v] = (this.vertices.length-1);
				}
				
				// now assign the face uv value to the correct
				// place in the uv array
				if(fv < this.faceUVs.length) {
					this.uvs[face["v"+v]] = this.faceUVs[fv];
				}
				fv++;
			}
		}
	},
	
	/**
	 * Returns the vertex positions in an array
	 * ready for passing to a WebGL buffer
	 */
	updateUVArray: function() {
		
		var uv           = 0,
			innerUV        = 0,
			uvArray        = new Array(this.uvs.length * 2),
			uvHolder       = [],
			individualUV   = null;
			
		for(uv = 0; uv < this.uvs.length; uv++) {
			
			// write out the UV to an array
			individualUV = this.uvs[uv];
			
			if(!!individualUV) {
				individualUV.toArray(uvHolder);
				
				// push it into the full array for
				// populating the buffer
				uvArray[innerUV++] = uvHolder[0];
				uvArray[innerUV++] = uvHolder[1];
			}
		}
		
		this.uvsNeedUpdate    = true;
		this.uvArray          = new Float32Array(uvArray);

		return this.uvArray;
	},
	
	/**
	 * Returns the UV coordinates positions in an array
	 * ready for passing to a WebGL buffer
	 */
	updateVertexPositionArray: function() {
		
		var v                  = 0,
			innerV               = 0,
			vCount               = this.vertices.length * 3,
			vertexPositionArray  = new Array(vCount),
			individualVert       = null;
			
		for(v = 0; v < this.vertices.length; v++) {
			
			// push out the vert as an array
			// and populate
			individualVert       = this.vertices[v].toPositionArray();
			
			vertexPositionArray[innerV++]	= individualVert[0];
			vertexPositionArray[innerV++]	= individualVert[1];
			vertexPositionArray[innerV++]	= individualVert[2];
			
		}

		this.verticesNeedUpdate		= true;
		this.vertexPositionArray	= new Float32Array(vertexPositionArray);
		
		return this.vertexPositionArray;
	},
	
	/**
	 * Returns the vertex normals in an array
	 * for passing to WebGL
	 */
	updateVertexNormalArray: function() {
		
		var v                = 0,
			innerV             = 0,
			vCount             = this.vertices.length * 3,
			vertexNormalArray  = new Array(vCount),
			individualVert     = null;
		
		for(v = 0; v < this.vertices.length; v++) {
			
			// push out the vertex normal as an
			// array and populate
			individualVert		 = this.vertices[v].toNormalArray();
			
			vertexNormalArray[innerV++]	= individualVert[0];
			vertexNormalArray[innerV++]	= individualVert[1];
			vertexNormalArray[innerV++]	= individualVert[2];
			
		}
		
		this.normalsNeedUpdate	= true;
		this.vertexNormalArray	= new Float32Array(vertexNormalArray);
		
		return this.vertexNormalArray;
	},
	
	/**
	 * Returns the vertex colors in an array
	 * for passing to WebGL
	 */
	updateVertexColorArray: function() {
		
		var c					      = 0,
			innerC            = 0,
			vertexColorArray	= [],
			colorHolder       = [];
		
		for(c = 0; c < this.colors.length; c++) {
			
			// get the color out as an array
			this.colors[c].toArray(colorHolder);
			
			vertexColorArray[innerC++] = colorHolder[0];
			vertexColorArray[innerC++] = colorHolder[1];
			vertexColorArray[innerC++] = colorHolder[2];
		}
		
		this.colorsNeedUpdate	= true;
		this.vertexColorArray	= new Float32Array(vertexColorArray);
		
		return this.vertexColorArray;
	},
	
	/**
	 * Returns an array of indices ready
	 * for passing to WebGL
	 */
	updateFaceElementArray: function() {
		
		var f               = 0,
			innerF            = 0,
			faceElementArray	= [],
			individualFace		= null;
		
		for(f = 0; f < this.faces.length; f++) {
			
			// export the face as an array
			individualFace = this.faces[f].toElementArray();
			
			// now populate
			for(innerF = 0; innerF < individualFace.length; innerF++) {
				faceElementArray.push(individualFace[innerF]);
			}
		}
		
		this.elementsNeedUpdate	= true;
		this.faceElementArray	= new Uint16Array(faceElementArray);
		
		return this.faceElementArray;
	}
};

A3.Geometry = A3.Core.Objects.Geometric.Geometry;