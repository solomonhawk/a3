/**
 * @class Storage for a mesh triangle face <strong>[A3.Face3]</strong>.
 * Stores the indices of the vertices that make up
 * the face in build order, which is counter-clockwise
 * 
 * @author Paul Lewis
 * 
 * @param {Number} v1 The index of vertex 1
 * @param {Number} v2 The index of vertex 2
 * @param {Number} v3 The index of vertex 3
 */
A3.Core.Objects.Geometric.Face3 = function(v1, v2, v3) {
	
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
	 * @description The face's normal vector
	 * @type A3.Core.Math.Vector3
	 */
	this.normal = null;
	
	/**
	 * @description Holder array for the vertex indices
	 * @type Number[]
	 */
	this.elementArray = new Array(3);
	
};

A3.Core.Objects.Geometric.Face3.prototype = {
	
	/**
	 * Returns an array of the indices based
	 * on the basis that they will be 
	 * drawn out a triangle
	 */
	toElementArray: function() {
		
		this.elementArray[0] = this.v1;
		this.elementArray[1] = this.v2;
		this.elementArray[2] = this.v3;
		
		return this.elementArray;
	}
};

// shortcut
A3.Face3 = A3.Core.Objects.Geometric.Face3;
