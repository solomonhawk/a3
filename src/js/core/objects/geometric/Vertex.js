/**
 * @class Stores the vertex position and normal
 * 
 * @param {Number} x The x position of the vertex
 * @param {Number} y The y position of the vertex
 * @param {Number} z The z position of the vertex
 */
A3.Core.Objects.Geometric.Vertex = function(x,y,z) {
	
	/**
	 * @description The vertex's normal
	 * @type A3.Core.Math.Vector3
	 */
	this.normal         = new A3.Core.Math.Vector3(0,0,0);
	
	/**
	 * @description The position of the vertex
	 * @type A3.Core.Math.Vector3
	 */
	this.position       = new A3.Core.Math.Vector3(x,y,z);
	
	/**
	 * @description The internal array for the position vector
	 * @type Number[]
	 */
	this.positionArray  = new Array(3);
	
	/**
	 * @description The internal array for the normal vector
	 * @type Number[]
	 */
	this.normalArray		= new Array(3);
};

A3.Core.Objects.Geometric.Vertex.prototype = {
	
	/**
	 * Copies values from another vertex
	 */
	copy: function(vertex) {
		this.position.copy(vertex.position);
		
		return this;
	},
	
	/**
	 * Returns this vertex's position as an array
	 */
	toPositionArray: function() {
		
		this.positionArray[0] = this.position.x;
		this.positionArray[1] = this.position.y;
		this.positionArray[2] = this.position.z;
		
		return this.positionArray;
	},
	
	/**
	 * Returns this vertex's normal values as an array
	 */
	toNormalArray: function() {
		
		this.normalArray[0] = this.normal.x;
		this.normalArray[1] = this.normal.y;
		this.normalArray[2] = this.normal.z;
		
		return this.normalArray;
	}
};

A3.Vertex = A3.Core.Objects.Geometric.Vertex;
