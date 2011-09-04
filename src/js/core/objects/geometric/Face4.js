/**
 * @class Storage for a mesh quad face <strong>[A3.Face4]</strong>.
 * Stores the indices of the vertices that make up
 * the face in build order, which is counter-clockwise
 * 
 * @author Paul Lewis
 * 
 * @param {Number} v1 The index of vertex 1
 * @param {Number} v2 The index of vertex 2
 * @param {Number} v3 The index of vertex 3
 * @param {Number} v4 The index of vertex 4
 */
A3.Core.Objects.Geometric.Face4 = function(v1, v2, v3, v4) {
	
	/**
	 * @description The index of vertex 1
	 * @type Number
	 */
	this.v1 = v1;
	
	/**
	 * @description The index of vertex 2
	 * @type Number
	 */
	this.v2 = v2;
	
	/**
	 * @description The index of vertex 3
	 * @type Number
	 */
	this.v3 = v3;
	
	/**
	 * @description The index of vertex 4
	 * @type Number
	 */
	this.v4 = v4;
	
	/**
	 * @description The face's normal vector
	 * @type A3.Core.Math.Vector3
	 */
	this.normal = null;
	
	/**
	 * @description Holder array for the vertex indices
	 * @type Number[]
	 */
	this.elementArray = new Array(6);
	
};

A3.Core.Objects.Geometric.Face4.prototype = {
	
	/**
	 * Returns an array of the indices based
	 * on the fact that it will be 
	 * drawn out as two triangles
	 */
	toElementArray: function() {
	
		this.elementArray[0] = this.v1;
		this.elementArray[1] = this.v2;
		this.elementArray[2] = this.v3;
		this.elementArray[3] = this.v1;
		this.elementArray[4] = this.v3;
		this.elementArray[5] = this.v4;
		
		return this.elementArray;
	}
};

// shortcut
A3.Face4 = A3.Core.Objects.Geometric.Face4;
