/**
 * @class Provides some convenience
 * in terms of RGBA colours and xyzw values <strong>[A3.V4]</strong>. Vector
 * values can be accessed as x,y,z,w. Also provides
 * bounce-down methods to a 3D vector 
 * 
 * @author Paul Lewis
 * 
 * @param {Number} x The x or r value of the vector
 * @param {Number} y The y or g value of the vector
 * @param {Number} z The z or b value of the vector
 * @param {Number} w The w or a value of the vector
 */
A3.Core.Math.Vector4 = function(x,y,z,w) {
	return this.set(x,y,z,w);
};

A3.Core.Math.Vector4.prototype = {
	
	/**
	 * Updates the vector's value
	 * 
	 * @param {Number} x The x value of the vector
	 * @param {Number} y The y value of the vector
	 * @param {Number} z The z value of the vector
	 * @param {Number} w The w value of the vector
	 */
	set: function(x,y,z,w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	},
	
	/**
	 * Retrieves a 3D vector from the x,y,z components
	 */
	xyz: function() {
		return new A3.Core.Math.Vector3(this.x, this.y, this.z);
	},
	
	/**
	 * Does the same as the .xyz() function but is
	 * provided for your convenience
	 */
	rgb: function() {
		return this.xyz();
	},
	
	/**
	 * Zeros a vector
	 */
	zero: function() {
		this.x = this.y = this.z = this.w = 0;
	},
	
	/**
	 * Converts the vector to an array
	 * 
	 * @param {Float32Array} holder The array to populate
	 */
	toArray: function(holder) {
		
		holder[0] = this.x;
		holder[1] = this.y;
		holder[2] = this.z;
		holder[3] = this.w;
		
		return holder;
	},
	
	/**
	 * Converts the vector to a string
	 * for easier reading
	 */
	toString: function() {
		return "Vector4[" + this.x + "," + this.y + "," + this.z + "," + this.w + "]";
	}
};

// shortcut
A3.V4 = A3.Core.Math.Vector4;