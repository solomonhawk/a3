/**
 * @class This is primarily used for UV coordinates of textures,
 * but really it could be used for any 2D radness you want <strong>[A3.V2]</strong>.
 * 
 * @author Paul Lewis
 * 
 * @param {Number} x The x value of the vector
 * @param {Number} y The y value of the vector
 */
A3.Core.Math.Vector2 = function(x,y) {
	
	// default to the zero vector
	this.x = this.oldX = 0;
	this.y = this.oldY = 0;
	
	x = x || 0;
	y = y || 0;
	
	return this.set(x,y);
};

A3.Core.Math.Vector2.prototype = {
	
	/**
	 * Checks if this vector is dirty.
	 * 
	 * @param {Boolean} reset Whether we should reset the dirty value
	 */
	isDirty: function(reset) {
		
		var clean = (this.x === this.oldX) &&
                (this.y === this.oldY);
	
		return (!clean);
		
	},
	
	/**
	 * Resets what we consider to be the &quot;old&quot; values
	 * for when we test isDirty()
	 * 
	 * @see A3.Core.Math.Vector2#isDirty
	 */
	resetDirty: function() {

		this.oldX = this.x;
		this.oldY = this.y;

		return this;		
	},
	
	/**
	 * Updates the vector's value
	 * 
	 * @param {Number} x The x value of the vector
	 * @param {Number} y The y value of the vector
	 */
	set: function(x,y) {
		this.x = x;
		this.y = y;
		
		return this;
	},
	
	/**
	 * Copies the values from the vector passed in
	 * @param {A3.Core.Math.Vector2} vector The vector from which to copy the values
	 */
	copy: function(vector) {
		return this.set(
			vector.x,
			vector.y
		);
	},
	
	/**
	 * Performs the dot product against
	 * the provided vector
	 * 
	 * @param {A3.Core.Math.Vector2} vector The vector to perform the dot product against
	 */
	dot: function(vector) {
		return this.x * vector.x + this.y * vector.y;
	},
	
	/**
	 * Returns the length of the vector.
	 */
	length: function() {
		
		return Math.sqrt(this.x * this.x + 
                     this.y * this.y);
	},
	
	/**
	 * Normalizes the vector
	 */
	normalize: function() {
		
		// get the length of the
		// vector
		len = 1 / this.length();
		
		// apply to components
		this.x *= len;
		this.y *= len;
		
		return this;
	},
	
	/**
	 * Subtracts the components of the passed vector from the current one
	 * 
	 * @param {A3.Core.Math.Vector2} vector The vector to subtract
	 */
	subtract: function(vector) {
		
		this.x -= vector.x;
		this.y -= vector.y;
		
		return this;
	},
	
	/**
	 * Adds the components of the passed vector to the current one
	 * 
	 * @param {A3.Core.Math.Vector2} vector The vector to add
	 */
	add: function(vector) {
		this.x += vector.x;
		this.y += vector.y;
		
		return this;
	},
	
	/**
	 * Multiplies the vector components by a scalar
	 * 
	 * @param {A3.Core.Math.Vector2} vector The vector to add
	 */
	multiplyByScalar: function(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		
		return this;
	},
	
	/**
	 * Zeros each component of the vector
	 */
	zero: function() {
		this.x = this.y = 0;
		
		return this;
	},
	
	/**
	 * Negates each component of the vector
	 */
	negate: function() {
		
		this.x = -this.x;
		this.y = -this.y;
		
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
		
		return holder;
	},
	
	/**
	 * Converts the vector to a string
	 * for easier reading
	 */
	toString: function() {
		return "Vector2[" + this.x + "," + this.y + "]";
	}
};

// shortcut
A3.V2 = A3.Core.Math.Vector2;
