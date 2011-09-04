/**
 * @class This is used in tons
 * of places but is effectively three numbers,
 * so x,y and z <strong>[A3.V3]</strong>
 * 
 * @author Paul Lewis
 * 
 * @param {Number} x The x value of the vector
 * @param {Number} y The y value of the vector
 * @param {Number} z The z value of the vector
 */
A3.Core.Math.Vector3 = function(x,y,z) {
	
	// default to the zero vector
	this.x = this.oldX = 0;
	this.y = this.oldY = 0;
	this.z = this.oldZ = 0;
	
	x = x || 0;
	y = y || 0;
	z = z || 0;
	
	return this.set(x,y,z);
};

A3.Core.Math.Vector3.prototype = {
	
	/**
	 * Checks if this vector is dirty.
	 */
	isDirty: function() {
		
		var clean = (this.x === this.oldX) &&
                (this.y === this.oldY) &&
                (this.z === this.oldZ);
	
		return (!clean);
		
	},
	
	/**
	 * Resets what we consider to be the &quot;old&quot; values
	 * for when we test isDirty()
	 * 
	 * @see A3.Core.Math.Vector3#isDirty
	 */
	resetDirty: function() {

		this.oldX = this.x;
		this.oldY = this.y;
		this.oldZ = this.z;

		return this;		
	},
	
	/**
	 * Updates the vector's value
	 * 
	 * @param {Number} x The x value of the vector
	 * @param {Number} y The y value of the vector
	 * @param {Number} z The z value of the vector
	 */
	set: function(x,y,z) {
		this.x = x;
		this.y = y;
		this.z = z;
		
		return this;
	},
	
	/**
	 * Copies the values from the vector passed in
	 * @param {A3.Core.Math.Vector3} vector The vector from which to copy the values
	 */
	copy: function(vector) {
		return this.set(
			vector.x,
			vector.y,
			vector.z
		);
	},
	
	/**
	 * Performs the dot product against
	 * the provided vector
	 * 
	 * @param {A3.Core.Math.Vector3} vector The vector to perform the dot product against
	 */
	dot: function(vector) {
		return this.x * vector.x + this.y * vector.y + this.z * vector.z;
	},
	
	/**
	 * Calculates the cross product against
	 * the provided vector
	 * 
	 * @param {A3.Core.Math.Vector3} vector The vector to perform the cross product against
	 */
	cross: function(vector) {
		
		var x = this.x,
        y = this.y,
        z = this.z;
		
		this.x = y * vector.z - z * vector.y;
		this.y = z * vector.x - x * vector.z;
		this.z = x * vector.y - y * vector.x;
		
		return this;
	},
	
	/**
	 * Returns the length of the vector.
	 */
	length: function() {
		
		return Math.sqrt(this.x * this.x + 
                     this.y * this.y + 
                     this.z * this.z);
	},
	
	/**
	 * Normalizes a vector
	 */
	normalize: function() {
		
		// get the length of the
		// vector
		len = 1 / this.length();
		
		// apply to components
		this.x *= len;
		this.y *= len;
		this.z *= len;
		
		return this;
	},
	
	/**
	 * Subtracts the components of the passed vector from the current one
	 * 
	 * @param {A3.Core.Math.Vector3} vector The vector to subtract
	 */
	subtract: function(vector) {
		
		this.x -= vector.x;
		this.y -= vector.y;
		this.z -= vector.z;
		
		return this;
	},
	
	/**
	 * Adds the components of the passed vector to the current one
	 * 
	 * @param {A3.Core.Math.Vector3} vector The vector to add
	 */
	add: function(vector) {
		this.x += vector.x;
		this.y += vector.y;
		this.z += vector.z;
		
		return this;
	},
	
	/**
	 * Multiplies the vector components by a scalar
	 * 
	 * @param {A3.Core.Math.Vector3} vector The vector to add
	 */
	multiplyByScalar: function(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;
		
		return this;
	},
	
	/**
	 * Zeros each component of the vector
	 */
	zero: function() {
		
		this.x = this.y = this.z = 0;
		
		return this;
	},
	
	/**
	 * Negates each component of the vector
	 */
	negate: function() {
		
		this.x = -this.x;
		this.y = -this.y;
		this.z = -this.z;
		
		return this;
	},
	
	/**
	 * Converts the vector to an array
	 * 
	 * @param {Float32Array} holder The array to populate
	 * @throws An error if a Float32Array is not provided
	 */
	toArray: function(holder) {
		
		if(!holder) {
			throw "You must provide a Float32Array to populate";
		}
		
		holder[0] = this.x;
		holder[1] = this.y;
		holder[2] = this.z;
		
		return holder;
	},
	
	/**
	 * Converts the vector to a string
	 * for easier reading
	 */
	toString: function() {
		return "Vector3[" + this.x + "," + this.y + "," + this.z + "]";
	}
};

// shortcut
A3.V3 = A3.Core.Math.Vector3;
