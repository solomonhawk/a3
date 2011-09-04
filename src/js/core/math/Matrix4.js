/**
 * @class Used all over the place
 * but primarily for projection and model
 * views and generally messing with objects <strong>[A3.M4]</strong>
 *
 * @author Paul Lewis
 */
A3.Core.Math.Matrix4 = function() {

	this.m11 = 0; this.m12 = 0; this.m13 = 0; this.m14 = 0;
	this.m21 = 0; this.m22 = 0; this.m23 = 0; this.m24 = 0;
	this.m31 = 0; this.m32 = 0; this.m33 = 0; this.m34 = 0;
	this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 0;

};

A3.Core.Math.Matrix4.prototype = {

	/**
	 * Sets the values on the matrix
	 *
	 * @param {Number} m11 Row 1, Column 1
	 * @param {Number} m12 Row 1, Column 2
	 * @param {Number} m13 Row 1, Column 3
	 * @param {Number} m14 Row 1, Column 4
	 * @param {Number} m21 Row 2, Column 1
	 * @param {Number} m22 Row 2, Column 2
	 * @param {Number} m23 Row 2, Column 3
	 * @param {Number} m24 Row 2, Column 4
	 * @param {Number} m31 Row 3, Column 1
	 * @param {Number} m32 Row 3, Column 2
	 * @param {Number} m33 Row 3, Column 3
	 * @param {Number} m34 Row 3, Column 4
	 * @param {Number} m41 Row 4, Column 1
	 * @param {Number} m42 Row 4, Column 2
	 * @param {Number} m43 Row 4, Column 3
	 * @param {Number} m44 Row 4, Column 4
	 */
	set: function(m11,m12,m13,m14,
				m21,m22,m23,m24,
				m31,m32,m33,m34,
				m41,m42,m43,m44  ) {

		this.m11 = m11; this.m12 = m12; this.m13 = m13; this.m14 = m14;
		this.m21 = m21; this.m22 = m22; this.m23 = m23; this.m24 = m24;
		this.m31 = m31; this.m32 = m32; this.m33 = m33; this.m34 = m34;
		this.m41 = m41; this.m42 = m42; this.m43 = m43; this.m44 = m44;

		return this;
	},

	/**
	 * Copies the values from the matrix passed in
	 * @param {A3.Core.Math.Matrix4} matrix The Matrix to copy
	 */
	copy: function(matrix) {

		this.m11 = matrix.m11;  this.m12 = matrix.m12;  this.m13 = matrix.m13;  this.m14 = matrix.m14;
		this.m21 = matrix.m21;  this.m22 = matrix.m22;  this.m23 = matrix.m23;  this.m24 = matrix.m24;
		this.m31 = matrix.m31;  this.m32 = matrix.m32;  this.m33 = matrix.m33;  this.m34 = matrix.m34;
		this.m41 = matrix.m41;  this.m42 = matrix.m42;  this.m43 = matrix.m43;  this.m44 = matrix.m44;

		return this;
	},

	/**
	 * Sets a matrix back to the identity matrix
	 */
	identity: function() {
		return this.set(
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1
		);
	},

	/**
	 * Zeros the matrix components
	 */
	zero: function() {
		return this.set(
			0,0,0,0,
			0,0,0,0,
			0,0,0,0,
			0,0,0,0
		);
	},

	/**
	 * Creates a matrix to represent a frustum -
	 * used for perspective and orthographic
	 * projections
	 *
	 * @see http://www.opengl.org/sdk/docs/man/xhtml/glFrustum.xml
	 *
	 * @param {Number} left The coordinate for the left clipping plane
	 * @param {Number} right The coordinate for the right clipping plane
	 * @param {Number} bottom The coordinate for the bottom clipping plane
	 * @param {Number} top The coordinate for the top clipping plane
	 * @param {Number} nearVal The distance to the near clipping plane
	 * @param {Number} farVal The distance to the far clipping plane
	 */
	frustum: function(left, right, bottom, top, nearVal, farVal) {

		var a = (right + left) / (right - left),
			b = (top + bottom) / (top - bottom),
			c = -(farVal + nearVal) / (farVal - nearVal),
			d = -(2 * farVal * nearVal) / (farVal - nearVal),
			x = (2 * nearVal) / (right - left),
			y = (2 * nearVal) / (top - bottom);

		return this.set(
			x,  0,  a,  0,
			0,  y,  b,  0,
			0,  0,  c,  d,
			0,  0, -1,  0
		);
	},

	/**
	 * Creates a perspective matrix for a camera.
	 * Uses the frustrum to do the work of tying
	 * everything together
	 *
	 * @param {Number} fieldOfView The field of view in degrees
	 * @param {Number} aspectRatio The ratio of width / height of the screen
	 * @param {Number} nearVal The distance to the near clipping plane
	 * @param {Number} farVal The distance to the far clipping plane
	 */
	perspective: function(fieldOfView, aspectRatio, nearVal, farVal) {

		var minX, maxX, minY, maxY;

		// This is the FOV / 2 converted to radians
		// and then multiplied by the near value -
		// gives us our max y position at the front
		// of the frustum. The min is just the opposite
		maxY = nearVal * Math.tan(fieldOfView * Math.PI / 360);
		minY = -maxY;

		// the min and max x are then the same as
		// the min and max y multiplied by the
		// aspect ratio
		minX = minY * aspectRatio;
		maxX = maxY * aspectRatio;

		return this.frustum(
			minX, maxX, minY, maxY, nearVal, farVal
		);

	},

	/**
	 * Adds to the translation values of a matrix
	 *
	 * @param {A3.Core.Math.Vector3} vector A vector containing the x,y and z components of the translation
	 */
	setTranslationFromVector: function(vector) {
		this.m14 += vector.x;
		this.m24 += vector.y;
		this.m34 += vector.z;

		return this;
	},

	/**
	 * Scales a matrix up using a vector
	 *
	 * @param {A3.Core.Math.Vector3} vector The vector containing the scale values
	 *
	 * @see http://en.wikipedia.org/wiki/Scaling_(geometry)
	 */
	scaleByVector: function(vector) {

		/*
		 * Technically we would be multiplying this matrix
		 * by a typical scale matrix, but that contains a lot of zeros so
		 * this is a shorthand way of doing the same calculation
		 */
		var x = vector.x, y = vector.y, z = vector.z;

		this.m11 *= x; this.m12 *= y; this.m13 *= z;
		this.m21 *= x; this.m22 *= y; this.m23 *= z;
		this.m31 *= x; this.m32 *= y; this.m33 *= z;
		this.m41 *= x; this.m42 *= y; this.m43 *= z;

		return this;
	},

	/**
	 * Scales the whole matrix by a scalar value
	 *
	 * @param {Number} scalar The value by which to multiply each matrix component
	 */
	scaleByScalar: function(scalar) {

		this.m11 *= scalar; this.m12 *= scalar; this.m13 *= scalar;
		this.m21 *= scalar; this.m22 *= scalar; this.m23 *= scalar;
		this.m31 *= scalar; this.m32 *= scalar; this.m33 *= scalar;
		this.m41 *= scalar; this.m42 *= scalar; this.m43 *= scalar;

		return this;

	},

	/**
	 * Sets a matrix's rotation values in XYZ order
	 * based on the vector passed in.
	 *
	 * @param {A3.Core.Math.Vector3} vector The vector specifying the rotation values in X,Y and Z
	 *
	 * @see http://www.robertblum.com/articles/2005/02/14/decomposing-matrices [NB sign of
	 * sin values are reversed because we are working in a right handed system (WebGL)
	 * not a left handed one (DirectX)]
	 */
	setRotationFromVector: function(vector) {

		var x = vector.x, y = vector.y, z = vector.z,
			cosX = Math.cos(x), sinX = Math.sin(x),
			cosY = Math.cos(y), sinY = Math.sin(y),
			cosZ = Math.cos(z), sinZ = Math.sin(z),

			// some multiplications repeat so do them once
			// and store the result
			cosZsinX = cosZ * sinX,
			sinXsinZ = sinX * sinZ,
			cosXcosZ = cosX * cosZ;

		this.m11 = cosY * cosZ;
		this.m12 = cosY * -sinZ;
		this.m13 = sinY;
		this.m21 = cosZsinX * sinY + sinZ * cosX;
		this.m22 = sinXsinZ * -sinY + cosXcosZ;
		this.m23 = -sinX * cosY;
		this.m31 = cosXcosZ * -sinY + sinXsinZ;
		this.m32 = cosX * sinY * sinZ + cosZsinX;
		this.m33 = cosX * cosY;

		return this;
	},

	/**
	 * Multiplies this matrix by another
	 *
	 * @param {A3.Core.Math.Matrix4} matrix The matrix by which to multiply the current one
	 */
	multiply: function(matrix) {

		// cache up all the values because we will change
		// them soon, and we need to refer to the old
		// values during the calculations
		var m1_m11 = this.m11, m1_m12 = this.m12, m1_m13 = this.m13, m1_m14 = this.m14,
			m1_m21 = this.m21, m1_m22 = this.m22, m1_m23 = this.m23, m1_m24 = this.m24,
			m1_m31 = this.m31, m1_m32 = this.m32, m1_m33 = this.m33, m1_m34 = this.m34,
			m1_m41 = this.m41, m1_m42 = this.m42, m1_m43 = this.m43, m1_m44 = this.m44,

			m2_m11 = matrix.m11, m2_m12 = matrix.m12, m2_m13 = matrix.m13, m2_m14 = matrix.m14,
			m2_m21 = matrix.m21, m2_m22 = matrix.m22, m2_m23 = matrix.m23, m2_m24 = matrix.m24,
			m2_m31 = matrix.m31, m2_m32 = matrix.m32, m2_m33 = matrix.m33, m2_m34 = matrix.m34,
			m2_m41 = matrix.m41, m2_m42 = matrix.m42, m2_m43 = matrix.m43, m2_m44 = matrix.m44;

		// row 1
		this.m11 = m1_m11 * m2_m11 + m1_m12 * m2_m21 + m1_m13 * m2_m31 + m1_m14 * m2_m41;
		this.m12 = m1_m11 * m2_m12 + m1_m12 * m2_m22 + m1_m13 * m2_m32 + m1_m14 * m2_m42;
		this.m13 = m1_m11 * m2_m13 + m1_m12 * m2_m23 + m1_m13 * m2_m33 + m1_m14 * m2_m43;
		this.m14 = m1_m11 * m2_m14 + m1_m12 * m2_m24 + m1_m13 * m2_m34 + m1_m14 * m2_m44;

		// row 2
		this.m21 = m1_m21 * m2_m11 + m1_m22 * m2_m21 + m1_m23 * m2_m31 + m1_m24 * m2_m41;
		this.m22 = m1_m21 * m2_m12 + m1_m22 * m2_m22 + m1_m23 * m2_m32 + m1_m24 * m2_m42;
		this.m23 = m1_m21 * m2_m13 + m1_m22 * m2_m23 + m1_m23 * m2_m33 + m1_m24 * m2_m43;
		this.m24 = m1_m21 * m2_m14 + m1_m22 * m2_m24 + m1_m23 * m2_m34 + m1_m24 * m2_m44;

		// row 3
		this.m31 = m1_m31 * m2_m11 + m1_m32 * m2_m21 + m1_m33 * m2_m31 + m1_m34 * m2_m41;
		this.m32 = m1_m31 * m2_m12 + m1_m32 * m2_m22 + m1_m33 * m2_m32 + m1_m34 * m2_m42;
		this.m33 = m1_m31 * m2_m13 + m1_m32 * m2_m23 + m1_m33 * m2_m33 + m1_m34 * m2_m43;
		this.m34 = m1_m31 * m2_m14 + m1_m32 * m2_m24 + m1_m33 * m2_m34 + m1_m34 * m2_m44;

		// row 4
		this.m41 = m1_m41 * m2_m11 + m1_m42 * m2_m21 + m1_m43 * m2_m31 + m1_m44 * m2_m41;
		this.m42 = m1_m41 * m2_m12 + m1_m42 * m2_m22 + m1_m43 * m2_m32 + m1_m44 * m2_m42;
		this.m43 = m1_m41 * m2_m13 + m1_m42 * m2_m23 + m1_m43 * m2_m33 + m1_m44 * m2_m43;
		this.m44 = m1_m41 * m2_m14 + m1_m42 * m2_m24 + m1_m43 * m2_m34 + m1_m44 * m2_m44;

		return this;
	},

	/**
	 * Calculates the determinant of the matrix. Primarily used for inverting the matrix
	 *
	 * @see http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
	 */
	determinant: function() {

		return  this.m14 * this.m23 * this.m32 * this.m41 -
				this.m13 * this.m24 * this.m32 * this.m41 -
				this.m14 * this.m22 * this.m33 * this.m41 +
				this.m12 * this.m24 * this.m33 * this.m41 +

				this.m13 * this.m22 * this.m34 * this.m41 -
				this.m12 * this.m23 * this.m34 * this.m41 -
				this.m14 * this.m23 * this.m31 * this.m42 +
				this.m13 * this.m24 * this.m31 * this.m42 +

				this.m14 * this.m21 * this.m33 * this.m42 -
				this.m11 * this.m24 * this.m33 * this.m42 -
				this.m13 * this.m21 * this.m34 * this.m42 +
				this.m11 * this.m23 * this.m34 * this.m42 +

				this.m14 * this.m22 * this.m31 * this.m43 -
				this.m12 * this.m24 * this.m31 * this.m43 -
				this.m14 * this.m21 * this.m32 * this.m43 +
				this.m11 * this.m24 * this.m32 * this.m43 +

				this.m12 * this.m21 * this.m34 * this.m43 -
				this.m11 * this.m22 * this.m34 * this.m43 -
				this.m13 * this.m22 * this.m31 * this.m44 +
				this.m12 * this.m23 * this.m31 * this.m44 +

				this.m13 * this.m21 * this.m32 * this.m44 -
				this.m11 * this.m23 * this.m32 * this.m44 -
				this.m12 * this.m21 * this.m33 * this.m44 +
				this.m11 * this.m22 * this.m33 * this.m44;
	},

	/**
	 * Inverts the matrix.
	 *
	 * @throws An error if the matrix determinant is zero
   * @see http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
	 */
	invert: function() {

		var m11 = this.m11, m12 = this.m12, m13 = this.m13, m14 = this.m14,
			m21 = this.m21, m22 = this.m22, m23 = this.m23, m24 = this.m24,
			m31 = this.m31, m32 = this.m32, m33 = this.m33, m34 = this.m34,
			m41 = this.m41, m42 = this.m42, m43 = this.m43, m44 = this.m44,

			determinant = this.determinant();

		if(determinant === 0) {
			throw("Matrix determinant is zero, can't invert.");
		}

		// check this out... like, a *lot* of calculations
		this.m11 = m23 * m34 * m42 - m24 * m33 * m42 + m24 * m32 * m43 - m22 * m34 * m43 - m23 * m32 * m44 + m22 * m33 * m44;
		this.m12 = m14 * m33 * m42 - m13 * m34 * m42 - m14 * m32 * m43 + m12 * m34 * m43 + m13 * m32 * m44 - m12 * m33 * m44;
		this.m13 = m13 * m24 * m42 - m14 * m23 * m42 + m14 * m22 * m43 - m12 * m24 * m43 - m13 * m22 * m44 + m12 * m23 * m44;
		this.m14 = m14 * m23 * m32 - m13 * m24 * m32 - m14 * m22 * m33 + m12 * m24 * m33 + m13 * m22 * m34 - m12 * m23 * m34;
		this.m21 = m24 * m33 * m41 - m23 * m34 * m41 - m24 * m31 * m43 + m21 * m34 * m43 + m23 * m31 * m44 - m21 * m33 * m44;
		this.m22 = m13 * m34 * m41 - m14 * m33 * m41 + m14 * m31 * m43 - m11 * m34 * m43 - m13 * m31 * m44 + m11 * m33 * m44;
		this.m23 = m14 * m23 * m41 - m13 * m24 * m41 - m14 * m21 * m43 + m11 * m24 * m43 + m13 * m21 * m44 - m11 * m23 * m44;
		this.m24 = m13 * m24 * m31 - m14 * m23 * m31 + m14 * m21 * m33 - m11 * m24 * m33 - m13 * m21 * m34 + m11 * m23 * m34;
		this.m31 = m22 * m34 * m41 - m24 * m32 * m41 + m24 * m31 * m42 - m21 * m34 * m42 - m22 * m31 * m44 + m21 * m32 * m44;
		this.m32 = m14 * m32 * m41 - m12 * m34 * m41 - m14 * m31 * m42 + m11 * m34 * m42 + m12 * m31 * m44 - m11 * m32 * m44;
		this.m33 = m12 * m24 * m41 - m14 * m22 * m41 + m14 * m21 * m42 - m11 * m24 * m42 - m12 * m21 * m44 + m11 * m22 * m44;
		this.m34 = m14 * m22 * m31 - m12 * m24 * m31 - m14 * m21 * m32 + m11 * m24 * m32 + m12 * m21 * m32 - m11 * m22 * m34;
		this.m41 = m23 * m32 * m41 - m22 * m33 * m41 - m23 * m31 * m42 + m21 * m33 * m42 + m22 * m31 * m43 - m21 * m32 * m43;
		this.m42 = m12 * m33 * m41 - m13 * m32 * m41 + m13 * m31 * m42 - m11 * m33 * m42 - m12 * m31 * m43 + m11 * m32 * m43;
		this.m43 = m13 * m22 * m41 - m12 * m23 * m41 - m13 * m21 * m42 + m11 * m23 * m42 + m12 * m21 * m43 - m11 * m22 * m43;
		this.m44 = m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33;

		this.scaleByScalar(1 / determinant);

		return this;

	},

	/**
	 * Modifies the matrix to look at a specific place
	 *
	 * @param {A3.Core.Math.Vector3} eye The position of the eye. Typically the camera or object position
	 * @param {A3.Core.Math.Vector3} target The position in 3D space to look at
	 * @param {A3.Core.Math.Vector3} up The world's up vector
	 */
	lookAt: function(eye, target, up) {

		var dirVec		= new A3.Core.Math.Vector3(),
			rightVec	= new A3.Core.Math.Vector3(),
			upVec		= new A3.Core.Math.Vector3();

		dirVec
			.copy(eye)
			.subtract(target)
			.normalize();

		// ensure we have a valid direction
		if(dirVec.length() === 0) {
			dirVec.z = 1;
		}

		// get the right vector
		rightVec
			.copy(up)
			.cross(dirVec)
			.normalize();

		// also check that the right vector is ok
		if(rightVec.length() === 0) {

			dirVec.z += 0.1;

			// redo the right vector calculation
			rightVec
				.copy(up)
				.cross(dirVec)
				.normalize();
		}

		// and now we have the dir and right, we can
		// work out what the real up vector should be
		upVec
			.copy(dirVec)
			.cross(rightVec)
			.normalize();

		// now we set the matrix values
		// based on these vectors
		this.m11 = rightVec.x; this.m12 = upVec.x; this.m13 = dirVec.x;
		this.m21 = rightVec.y; this.m22 = upVec.y; this.m23 = dirVec.y;
		this.m31 = rightVec.z; this.m32 = upVec.z; this.m33 = dirVec.z;

		return this;
	},

	/**
	 * Converts the Matrix4 to an array suitable for use in WebGL.
	 *
	 * @param {Float32Array} holder The array to be populated with the matrix data
	 * @throws An error if a Float32Array is not provided
	 */
	toArray: function(holder) {

		// create a holder if one isn't
		// provided to the function
		if(!holder) {
			throw "You must provide a Float32Array to populate";
		}

		/**
		 * Since this is used for sending data out to WebGL shaders typically,
		 * this populates using columns not rows.
		 *
		 * The only guidance I could find is that the translations (m14, m24 and m34)
		 * should occupy the 12th, 13th and 14th slot in the array which if you check
		 * means that this is going out in colums.
		 */
		holder[0]  = this.m11; holder[1]  = this.m21; holder[2]  = this.m31;  holder[3]  = this.m41;
		holder[4]  = this.m12; holder[5]  = this.m22; holder[6]  = this.m32;  holder[7]  = this.m42;
		holder[8]  = this.m13; holder[9]  = this.m23; holder[10] = this.m33;  holder[11] = this.m43;
		holder[12] = this.m14; holder[13] = this.m24; holder[14] = this.m34;  holder[15] = this.m44;

		return holder;
	},

	/**
	 * Pushes all the matrix values to string
	 */
	toString: function() {
		return "Matrix4["+
		this.m11+","+this.m12+","+this.m13+","+this.m14+","+
		this.m21+","+this.m22+","+this.m23+","+this.m24+","+
		this.m31+","+this.m32+","+this.m33+","+this.m34+","+
		this.m41+","+this.m42+","+this.m43+","+this.m44+"]";
	}
};

// shortcut namespacing
A3.M4 = A3.Core.Math.Matrix4;
