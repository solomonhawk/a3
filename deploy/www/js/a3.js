/**
 * A3 - A simple 3D engine
 *
 * @version 0.1
 * @author Paul Lewis
 */
var A3 = {};

/**
 * A3 Constants
 */
A3.Constants = {

	/**
	 * @description The limit to the number of lights in the scene
	 * @type Number
	 */
	MAX_LIGHTS: 4,

	/**
	 * @description The light types
	 * @type Object
	 */
	LIGHT_TYPES: {
		NONE: 0,
		AMBIENT: 1,
		DIRECTIONAL: 2,
		POINT: 4
	},

	/**
	 * @description How the mesh should be rendered, i.e. solid / particle
	 * @type Object
	 */
	RENDER_TYPES: {
		SOLID: 1,
		PARTICLES: 2
	},

	/**
	 * @description How the mesh should be rendered, i.e. normal / additive
	 * @type Object
	 */
	BLEND_TYPES: {
		NORMAL: 1,
		ADDITIVE: 2
	}
};

/** Core */
A3.Core = {};

/** Core Camera */
A3.Core.Camera = {};

/** Core Math */
A3.Core.Math = {};

/** Core Remote */
A3.Core.Remote = {};

/** Core Objects */
A3.Core.Objects = {};

/** Core Lights */
A3.Core.Objects.Lights = {};

/** Core Geometric */
A3.Core.Objects.Geometric = {};

/** Core Primitives */
A3.Core.Objects.Primitives = {};

/** Core Renderer */
A3.Core.Render = {};

/** Core Shaders */
A3.Core.Render.Shaders = {};

/** Core Textures */
A3.Core.Render.Textures = {};

/** Core Scene */
A3.Core.Scene = {};

/** Addons */
A3.Addon = {};

/** Addons: Intersection */
A3.Addon.Intersection = {};
/**
 * @class Represents a 3D Matrix <strong>[A3.M3]</strong>. Used much less than
 * the 4D matrix, but still has a special place in everyone's heart. Like the
 * awkward younger brother at the party.
 *
 * @author Paul Lewis
 */
A3.Core.Math.Matrix3 = function() {

	this.m11 = 0; this.m12 = 0; this.m13 = 0;
	this.m21 = 0; this.m22 = 0; this.m23 = 0;
	this.m31 = 0; this.m32 = 0; this.m33 = 0;

};

A3.Core.Math.Matrix3.prototype = {

	/**
	 * Sets the values on the matrix
	 *
	 * @param {Number} m11 Row 1, Column 1
	 * @param {Number} m12 Row 1, Column 2
	 * @param {Number} m13 Row 1, Column 3
	 * @param {Number} m21 Row 2, Column 1
	 * @param {Number} m22 Row 2, Column 2
	 * @param {Number} m23 Row 2, Column 3
	 * @param {Number} m31 Row 3, Column 1
	 * @param {Number} m32 Row 3, Column 2
	 * @param {Number} m33 Row 3, Column 3
	 */
	set: function(m11,m12,m13,
					m21,m22,m23,
					m31,m32,m33) {

		this.m11 = m11; this.m12 = m12; this.m13 = m13;
		this.m21 = m21; this.m22 = m22; this.m23 = m23;
		this.m31 = m31; this.m32 = m32; this.m33 = m33;
	},

	/**
	 * Turns the columns into rows, and the
	 * rows into columns.
	 */
	transpose: function() {

		var m12 = this.m12,
			m13 = this.m13,
			m21 = this.m21,
			m23 = this.m23,
			m31 = this.m31,
			m32 = this.m32;

		this.m12 = m21; this.m13 = m31;
		this.m21 = m12; this.m23 = m32;
		this.m31 = m13; this.m32 = m23;
	},

	/**
	 * Calculates the determinant of the matrix. Primarily used for inverting the matrix
	 *
	 * @see http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/threeD/index.htm
	 */
	determinant: function() {

		return this.m11 * this.m22 * this.m33 +
				this.m12 * this.m23 * this.m31 +
				this.m13 * this.m21 * this.m32 -
				this.m11 * this.m23 * this.m32 -
				this.m12 * this.m21 * this.m33 -
				this.m13 * this.m22 * this.m31;
	},

	/**
	 * Inverts the matrix
	 *
	 * @throws An error if the matrix determinant is zero
	 */
	invert: function() {

		var m11 = this.m11, m12 = this.m12, m13 = this.m13,
			m21 = this.m21, m22 = this.m22, m23 = this.m23,
			m31 = this.m31, m32 = this.m32, m33 = this.m33,

		determinant = this.determinant();

		if(determinant === 0) {
			throw("Matrix determinant is zero, can't invert.");
		}

		this.m11 = m22 * m33 - m23 * m32;
		this.m12 = m13 * m32 - m12 * m33;
		this.m13 = m12 * m23 - m13 * m22;
		this.m21 = m23 * m31 - m21 * m33;
		this.m22 = m11 * m33 - m13 * m31;
		this.m23 = m13 * m21 - m11 * m23;
		this.m31 = m21 * m32 - m22 * m31;
		this.m32 = m12 * m31 - m11 * m32;
		this.m33 = m11 * m22 - m12 * m21;

		this.scaleByScalar(1 / determinant);

		return this;
	},

	/**
	 * Copies the top left 3x3 matrix out of a Matrix4
	 *
	 * @param {A3.Core.Math.Matrix4} matrix The Matrix4 to copy from
	 */
	copyMatrix4: function(matrix) {

		this.m11 = matrix.m11; this.m12 = matrix.m12; this.m13 = matrix.m13;
		this.m21 = matrix.m21; this.m22 = matrix.m22; this.m23 = matrix.m23;
		this.m31 = matrix.m31; this.m32 = matrix.m32; this.m33 = matrix.m33;

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

		return this;

	},

	/**
	 * Converts the Matrix3 to an array suitable for use in WebGL.
	 *
	 * @param {Float32Array} holder The array to be populated with the matrix data
	 * @throws An error if a Float32Array is not provided
	 */
	toArray: function(holder) {

		// whinge if a holder isn't
		// provided to the function
		if(!holder) {
			throw "You must provide a Float32Array to populate";
		}

		/*
		 * Since this is used for sending data out to WebGL shaders,
		 * this populates using columns not rows.
		 */
		holder[0] = this.m11; holder[1] = this.m21; holder[2] = this.m31;
		holder[3] = this.m12; holder[4] = this.m22; holder[5] = this.m32;
		holder[6] = this.m13; holder[7] = this.m23; holder[8] = this.m33;

		return holder;
	}
};

// shortcut namespacing
A3.M3 = A3.Core.Math.Matrix3;
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
	 * Multiplies a Vector3 by this matrix, for the purposes of unprojection. <strong>Please note, this affects the vector</strong>
	 *
	 * @param {A3.Core.Math.Vector3} vector The vector to multiply by this matrix
	 */
	multiplyVector3: function(vector) {

		// we assume that this is actually a 4D vector with a w component of 1
		var vx = vector.x, vy = vector.y, vz = vector.z,
			vw = 1 / (this.m41 * vx * this.m42 * vy + this.m43 * vz + this.m44);

		vector.x = this.m11 * vx + this.m12 * vy + this.m13 * vz + this.m14;
		vector.y = this.m21 * vx + this.m22 * vy + this.m23 * vz + this.m24;
		vector.z = this.m31 * vx + this.m32 * vy + this.m33 * vz + this.m34;

		// everything needs to be scaled by 1/w
		vector.multiplyByScalar(vw);

		return vector;
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
	 * @param {Number} scalar The scalar by which to multiply
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
A3.V4 = A3.Core.Math.Vector4;/**
 * @class Contains properties common to
 * all 3D objects in the engine, like the camera,
 * primitives, the scene <strong>[A3.O3D]</strong>.
 * 
 * @author Paul Lewis
 */
A3.Core.Object3D = function() {
	
	/**
	 * @description The name of the object
	 * @type String
	 */
	this.name = null;
	
	/**
	 * @description The array of the children Object3Ds
	 * 
	 * @type A3.Core.Object3D[]
	 */
	this.children = [];
	
	/**
	 * @description The reference to the parent Object3D
	 * 
	 * @type A3.Core.Object3D
	 */
	this.parent = null;
	
	/**
	 * @description The matrix of object affine transforms
	 * such as translation, rotation and scaling. These are
	 * in the object space, so around the object's origin.
	 * 
	 * @type A3.Core.Math.Matrix4
	 */
	this.matrix = new A3.Core.Math.Matrix4();
	
	/**
	 * @description The matrix that we use to
	 * position, rotate and scale the object relative to its parent,
	 * which ultimately positions the object in world space.
	 * 
	 * @type A3.Core.Math.Matrix4
	 */
	this.matrixWorld = new A3.Core.Math.Matrix4();
	
	/**
	 * @description The position that this object occupies <em>relative</em>
	 * to its parent. Ultimately the only object without a parent should be
	 * the scene itself. The object matrix's position values will be set
	 * from this vector when we update
	 * 
	 * @type A3.Core.Math.Vector3
	 */
	this.position = new A3.Core.Math.Vector3(0,0,0);
	
	/**
	 * @description The rotation that this object has. The rotations
	 * are applied to the object's matrix using Euler XYZ order.
	 * 
	 * @type A3.Core.Math.Vector3
	 */
	this.rotation = new A3.Core.Math.Vector3(0,0,0);
	
	/**
	 * @description The scale that this object has
	 * 
	 * @type A3.Core.Math.Vector3
	 */
	this.scale = new A3.Core.Math.Vector3(1,1,1);
	
	/**
	 * @description The object's up vector. Used for lookAt calculations
	 * 
	 * @type A3.Core.Math.Vector3
	 * @private
	 */
	this.up = new A3.Core.Math.Vector3(0,1,0);
	
	/**
	 * @description The target for this object, i.e. what it &quot;looks at&quot; which
	 * will be nothing by default, unless it's the basic camera.
	 * 
	 * @type A3.Core.Math.Vector3
	 */
	this.target = null;
	
	/**
	 * @description Whether or not this object is dirty. Is automatically set
	 * to true if the position, rotation or scale values have been changed. If
	 * this is true then all matrices for this object and its children will be
	 * recalculated
	 * 
	 * @type Boolean
	 */
	this.dirty = true;
	
	/**
	 * @description The object's visibility.
	 * 
	 * @type Boolean
	 */
	this.visible = true;

};

A3.Core.Object3D.prototype = {
	
	/**
	 * Adds a child to this object
	 * 
	 * @param {Object3D} child The child object to be added
	 * @throws An error if the child does not extend the Object3D prototype
	 */
	add: function(child) {
	
		if(child instanceof A3.Core.Object3D) {
			
			// if this is already the child of
			// another object we should remove
			// it first
			if(!!child.parent) {
				child.parent.remove(child);
			}
			
			// set the new parent, push it to
			// the child array and then ensure
			// that we update the render
			child.parent = this;
			this.children.push(child);
			this.dirty = true;
		} else {
			throw("Child object must have a prototype of Object3D");
		}
		
	},
	
	/**
	 * Removes a child from the array of children
	 * 
	 * @param {Object3D} child The child object to be removed
	 */
	remove: function(child) {
		var position = this.children.indexOf(child);
		
		// ooh, use of tilde
		if(~position) {
			this.children.splice(position, 1);
			this.dirty = true;
		}
	},
	
	/**
	 * Updates an object's internal matrix.
	 * 
	 * @param {Matrix4} parentMatrixWorld The world matrix of the parent object
	 * @param {Boolean} parentIsDirty Whether or not the parent's dirty flag is set
	 */
	update: function(parentMatrixWorld, parentIsDirty) {
		
		var childCount		= this.children.length;
		
		// if the dirty value has already been
		// set, the parent is dirty or any of
		// the vectors have changed this is dirty
		this.dirty		= parentIsDirty           ||
						        this.dirty              || 
						        this.position.isDirty() || 
						        this.rotation.isDirty() || 
						        this.scale.isDirty();
						
		// if it has changed in any way we
		// need to update the object's matrix
		if(this.dirty) {
			
			// reset it then we update it with the
			// specifics of our object
			this.matrix.identity();
			this.matrix.setTranslationFromVector(this.position);
			
			if(!this.target) {
				this.matrix.setRotationFromVector(this.rotation);
			} else {
				// TODO This assumes they're both in the same coordinate space - need to fix
				this.matrix.lookAt(this.position, this.target, this.up);	
			}
			
			this.matrix.scaleByVector(this.scale);
		
			/**
			 * if no parent world matrix
			 * exists, i.e. this is the root
			 * then create one and set it to the
			 * identity matrix
			 */
			if(!parentMatrixWorld) {
				this.matrixWorld.copy(this.matrix);
			} else {
				// copies the parent's world matrix
				this.matrixWorld.copy(parentMatrixWorld);
				
				// multiply the world matrix with the object matrix
				this.matrixWorld.multiply(this.matrix);
			}
			
			/**
			 * If this Object3D has a normals matrix
			 * then we calculate that here
			 * 
			 * @see http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/
			 */
			if(!!this.matrixNormals) {
				this.matrixNormals
					.copyMatrix4(this.matrixWorld)
					.invert()
					.transpose();
			}
		
			/**
			 * If this Object3D has an inverse matrix
			 * property, like the camera does, calculate it
			 */
			if(!!this.inverseMatrix) {
				// start with the world matrix
				// and then invert it
				this.inverseMatrix.copy(this.matrixWorld);
				this.inverseMatrix.invert();
			}
		}
			
		// pass through to the children
		while(childCount--) {
			this.children[childCount].update(this.matrixWorld, this.dirty);
		}
		
		// reset the dirty values to false
		this.position.resetDirty();
		this.rotation.resetDirty();
		this.scale.resetDirty();
		this.dirty = false;
	},
	
	/**
	 * Modifies the object's matrix to look at the vector passed in
	 * 
	 * @param {Vector3} vector The position to look at
	 */
	lookAt: function(vector) {
		this.target = vector;
	}
};

// shortcut
A3.O3D = A3.Core.Object3D;
/**
 * @class Utility functions. Does a few handy
 * jobs for us. Automatically instantiated to <strong>A3.Utility</strong>
 */
A3.Core.Utility = function() {
	
	/**
	 * Checks if a value is null or undefined rather
	 * than just a falsy value like 0 or []. If it
	 * is null or undefined we provide a default
	 * value for it to use instead.
	 * 
	 * @param {Mixed} value The value to check
	 * @param {Mixed} defaultValue The value to return if it isn't just a falsy value
	 */
	this.checkValue = function(value, defaultValue) {
		
		var returnValue = value;
		
		if(value === undefined || value === null) {
			returnValue = defaultValue;
		}
		
		return returnValue;
	};
	
};

// shortcut
A3.Utility = new A3.Core.Utility();
/**
 * @class Represents a 2D texture which we can map to our 3D objects
 * 
 * @author Paul Lewis
 */
A3.Core.Render.Textures.Texture = function(imagePath, index, callback) {
	
	var ready               = false;
	
	/**
	 * @description The index
	 */
	this.index              = index || 0;
	
	/**
	 * @description The underlying image DOM element for this texture
	 * @type DOMElement (Image)
	 */
	this.domElement         = new Image();
	
	// set up the onload and set the source
	this.domElement.onload	= function() {
		ready = true;
		
		if(!!callback) {
		  callback();
		}
	};
	this.domElement.src     = imagePath;
	
	/**
	 * Whether or not the texture has loaded
	 */
	this.isReady = function() {
		return ready;
	};
};

A3.Texture = A3.Core.Render.Textures.Texture;/**
 * @class Represents a 2D texture which we can map to our 3D objects
 * 
 * @author Paul Lewis
 */
A3.Core.Render.Textures.EnvironmentMap = function(config, index) {
	
	var ready = false,
	    count = 6,
	    callback = config.callback;
	
	/**
	 * Callback function for each texture as it loads in
	 */
  function loaded() {
    count--;
    ready = (count===0);
    if(ready && !!callback) {
      callback();
    }
  }
	
	/**
	 * @description The index that this cubemap will use when pushed
	 * to the GPU
	 * 
	 * @type Number
	 */
	this.index              = index || 0;
	
	
	/**
	 * @description The underlying image DOM element for the positive X texture
	 * 
	 * @type DOMElement (Image)
	 */
	this.px                 = new A3.Core.Render.Textures.Texture(config.px, index, loaded);
	
	/**
   * @description The underlying image DOM element for the negative X texture
   * 
   * @type DOMElement (Image)
   */
  this.nx                 = new A3.Core.Render.Textures.Texture(config.nx, index, loaded);
  
  /**
   * @description The underlying image DOM element for the positive Y texture
   * 
   * @type DOMElement (Image)
   */
  this.py                 = new A3.Core.Render.Textures.Texture(config.py, index, loaded);
  
  /**
   * @description The underlying image DOM element for the negative Y texture
   * 
   * @type DOMElement (Image)
   */
  this.ny                 = new A3.Core.Render.Textures.Texture(config.ny, index, loaded);
  
  /**
   * @description The underlying image DOM element for the positive Z texture
   * 
   * @type DOMElement (Image)
   */
  this.pz                 = new A3.Core.Render.Textures.Texture(config.pz, index, loaded);
  
  /**
   * @description The underlying image DOM element for the negative Z texture
   * 
   * @type DOMElement (Image)
   */
  this.nz                 = new A3.Core.Render.Textures.Texture(config.nz, index, loaded);
	
	/**
	 * Whether or not the texture has loaded
	 */
	this.isReady = function() {
		return ready;
	};
};

A3.EnvironmentMap = A3.Core.Render.Textures.EnvironmentMap;/**
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
/**
 * @class Contains a squad of WebGL shaders <strong>[A3.ShaderCache]</strong>.
 * 
 * @author Paul Lewis
 */
A3.Core.Render.Shaders.ShaderLibrary = function() {
	
	this.get = function(data) {
		
		var vertexShader         = null,
			fragmentShader         = null,
			lightingCallCount      = A3.Constants.MAX_LIGHTS,
			lightingCalls          = null,
			library                = A3.Core.Render.Shaders.ShaderLibrary;
		
		data                     = A3.Utility.checkValue(data, {});
		data.name                = A3.Utility.checkValue(data.name, "");
		data.type                = A3.Utility.checkValue(data.type, "");
		data.ambientReflection   = A3.Utility.checkValue(data.ambientReflection, 1);
		data.diffuseReflection   = A3.Utility.checkValue(data.diffuseReflection, 1);
		data.specularReflection  = A3.Utility.checkValue(data.specularReflection, 1);
		data.specularShininess	 = A3.Utility.checkValue(data.specularShininess, 20);
		data.particleSize			   = A3.Utility.checkValue(data.particleSize, 5);
		data.particleScale			 = A3.Utility.checkValue(data.particleScale, 0.01);
		data.specularColor			 = A3.Utility.checkValue(data.specularColor, new A3.Core.Math.Vector3(1,1,1));
	
		if(data.type === "Lambert") {
			data.specularReflection = "0.0";
		}
	
		switch(data.type) {
			
			/*
			 * Puts the vertex in the correct place and
			 * then sets its color to a hot pink
			 */
			case "Pink":
				vertexShader      = library.Shaders.Pink.vertexShader;
				fragmentShader    = library.Shaders.Pink.fragmentShader;
				break;
				
			/*
			 * Puts the vertex in the correct place and
			 * then sets its color to the vertex colour (with
			 * texture if appropriate)
			 */
			case "Basic":
				vertexShader      = library.Shaders.Basic.vertexShader;
				fragmentShader    = library.Shaders.Basic.fragmentShader;
				
				break;
				
			/*
			 * Puts the vertex in the correct place and
			 * then sets its color to a hot pink
			 */
			case "Particle":
				// set the chunk for inserting into the shader
				library.Chunks.ParticleSize   = convertNumber(data.particleSize);
				library.Chunks.ParticleScale  = convertNumber(data.particleScale);
			
				vertexShader      = replaceChunks(library.Shaders.Particle.vertexShader);
				fragmentShader    = replaceChunks(library.Shaders.Particle.fragmentShader);
						
				break;
			
			/*
			 * Puts the vertex in the correct place and
			 * then sets its color based on its normal value:
			 * 
			 *   x, -1 to 1 = 0.0 - 1.0, red
			 *   y, -1 to 1 = 0.0 - 1.0, green
			 *   z,  0 to 1 = 0.0 - 1.0, blue
			 */
			case "Normals":
				vertexShader      = library.Shaders.Normals.vertexShader;
				fragmentShader    = library.Shaders.Normals.fragmentShader;
				
				break;
			
			/*
			 * I think we can consider, broadly, Phong and Lambert the same
			 * way. Phong just has specular on top. In both cases we're effectively
			 * using Gouraud shading since we set the color at the vertex level.
			 */	
			case "Phong":
			case "Lambert":
			
				// start with nothing
				lightingCalls = "";
				
				// go through the lights 
				for(lightingCallCount = 0; lightingCallCount < A3.Constants.MAX_LIGHTS; lightingCallCount++) {
					
					/*
					 * Here we add on the effects of the lights
					 */
					lightingCalls += "addLight(" +
						         "lightDiffuseColor," +
						         "lightSpecularColor," + 
						         "uLightSources[" + lightingCallCount + "]," +
                     "aWorldVertexPosition," +
						         "aVertEyeNormal," +
                     "uEyeDirection," +
											convertNumber(data.diffuseReflection) + "," +
                      convertNumber(data.specularReflection) + "," +
                      convertNumber(data.specularShininess) + "," +
                      convertVector(data.specularColor) +");\n";
					
				}
				
				// set the chunk for inserting into the shader
				library.Chunks.LightingCalls = lightingCalls;
			
				// now pull the shaders out and replace the chunks
				vertexShader     = replaceChunks(library.Shaders.PhongLambert.vertexShader);
				fragmentShader	 = replaceChunks(library.Shaders.PhongLambert.fragmentShader);
				
				break;
		}
		
		return new A3.Core.Render.Shaders.Shader({
			name: data.name,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			texture: data.texture,
			environmentMap: data.environmentMap,
			attributes: data.attributes,
			uniforms: data.uniforms
		});
	};
	
	/**
	 * Replaces the chunks of GLSL with others, so
	 * things like the lighting code or variables
	 * we want to bake in
	 * 
	 * @param {String} shader The shader to look at
	 */
	function replaceChunks(shader) {
		
		var chunkPattern   = /CHUNK\[([^\]]*)\]/,
			library          = A3.Core.Render.Shaders.ShaderLibrary;
		
		while(chunkPattern.test(shader)){
			chunk  = shader.match(chunkPattern);
			shader = shader.replace(chunk[0], library.Chunks[chunk[1]]);
		}
		
		return shader;
	}
	
	/**
	 * Converts a number for GLSL, so basically parses a float out
	 * and ensures it has a trailing .0 if needed
	 * 
	 * @param {Number} number The number to convert
	 */
	function convertNumber(number) {
		if(typeof number === "number") {
			number = number.toString();
			if(parseInt(number, 10) === parseFloat(number, 10)) {
				number = number + ".0";
			}
		} else {
			number = "0.0";
		}
		return number;
	}
	
	/**
	 * Converts a vector for use in GLSL. Lovely.
	 * 
	 * @param {A3.Core.Math.Vector3} vector The vector to convert
	 */
	function convertVector(vector) {
		
		return "vec3(" + convertNumber(vector.x) + "," + 
						         convertNumber(vector.y) + "," + 
						         convertNumber(vector.z) + ")";
	}
};

// shortcut
A3.ShaderLibrary = new A3.Core.Render.Shaders.ShaderLibrary();
/**
 * @class Responsible for
 * taking everything else and actually
 * using WebGL to draw it <strong>[A3.R]</strong>
 * 
 * @author Paul Lewis
 * @param {Number} width The width of the renderer
 * @param {Number} height The height of the renderer
 * @param {Object} options The options with which to configure the renderer
 */
A3.Core.Render.Renderer = function(width, height, options) {
	
	// ensure we have basic vals
	// to run against
	width   = width || 404;
	height	= height || 250;
	options = options || {};
	
	return this.create(width, height, options);
};

A3.Core.Render.Renderer.prototype = {
	
	/**
	 * Creates and sets up the renderer
	 * 
	 * @param {Number} width The width of the renderer
	 * @param {Number} height The height of the renderer
	 * @param {Object} options The options with which to configure the renderer
	 */
	create: function(width, height, options) {
		
		/** 
		 * @description The WebGL canvas DOM Element
		 * @type DOMNode 
		 */
		this.domElement = null;
		
		/**
		 * @description The WebGL context
		 * @type WebGLContext
		 */
		this.gl = null;
		
		/**
		 * @description Whether or not the renderer should auto-clear
		 * on each draw - set with <strong>options.autoClear</strong>
		 * 
		 * @type Boolean
		 * @default true
		 */
		this.autoClear = A3.Utility.checkValue(options.autoClear, true);
		
		/**
		 * @description The clear colour of the WebGL 
		 * context - set with <strong>options.clearColor</strong>
		 * 
		 * @type A3.Core.Math.Vector4
		 * @default [0,0,0,1]: black
		 */
		this.clearColor = options.clearColor || new A3.Core.Math.Vector4(0.0,0.0,0.0,0.0);
		
		/**
		 * @description Whether or not the renderer should use
		 * antialiasing - set with <strong>options.antialias</strong>
		 * 
		 * @type Boolean
		 * @default true
		 */
		this.antialias = A3.Utility.checkValue(options.antialias, true);
		
		/**
		 * @description The opaque renderable objects in the scene - autopopulated
		 * 
		 * @type A3.Core.Object3D[]
		 */
		this.opaqueRenderableObjects = [];
		
		/**
		 * @description The transparent renderable objects in the scene - autopopulated
		 * 
		 * @type A3.Core.Object3D[]
		 */
		this.transparentRenderableObjects = [];
		
		/**
		 * @description The lights in the scene - autopopulated
		 * 
		 * @type A3.Core.Object3D[]
		 */
		this.lights = [];
		
		/*
		 * Here are some variables I use in the render loop. I create
		 * them here because of memory usage. If they're created in
		 * the render loop on the fly then memory usage goes through
		 * the roof. Instead they are created here and the values are
		 * overwritten in the array for each render pass
		 */
		this.projectionMatrix         = new A3.Core.Math.Matrix4();
		this.projectionMatrixArray    = new Float32Array(16);
		this.modelViewMatrixArray     = new Float32Array(16);
		this.normalMatrixArray        = new Float32Array(9);
		this.lastShaderProgram        = null;
		this.ambientLightColor        = new A3.Core.Math.Vector3(0,0,0);
		this.ambientlightColorArray   = new Float32Array(3);
		this.lightLocationArray       = new Float32Array(3);
		this.lightColorArray          = new Float32Array(3);
		this.eyeDirectionVector       = new A3.Core.Math.Vector3(0,0,0);
		this.eyeDirectionArray        = new Float32Array(3);
		this.eyePositionArray         = new Float32Array(3);
		
		// now initialize everything
		this._initialize(width, height, options);	
		
		return this;
	},
	
	/**
	 * Actually does the donkey work of setting everything up
	 * 
	 * @throws {Error} If the WebGL context creation fails
	 * @private
	 */
	_initialize: function(width, height, options) {
		
		this.domElement = options.domElement || document.createElement('canvas');
		try {
			
			this.gl = this.domElement.getContext('experimental-webgl', {antialias:this.antialias});
			this.gl.clearColor(
				this.clearColor.x,
				this.clearColor.y,
				this.clearColor.z,
				this.clearColor.w);
			
			this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.depthFunc(this.gl.LEQUAL);
			this.gl.depthMask(true);
				
		} catch (exception) {
			console.error("WebGL Context Creation Failed");
		}
		
		this.resize(width, height);
		
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.cullFace(this.gl.BACK);
		this.gl.frontFace(this.gl.CCW);
	},
	
	/**
	 * Resizes the dom element
	 * 
	 * @param {Number} width The new width of the renderer
	 * @param {Number} height The new height of the renderer
	 */
	resize: function(width, height) {
		
		if(!!this.domElement && !!this.gl) {
			
			// DOM
			this.domElement.width    = width;
			this.domElement.height   = height;
			
			// WebGL
			this.gl.viewportWidth    = width;
			this.gl.viewportHeight   = height;
			
			// Finally set the viewport
			this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
			
			if(this.autoClear) {
			  this.clear();
			}
		}
	},
	
	/**
	 * Clears the WebGL context
	 */
	clear: function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	},
	
	/**
	 * Asks the renderer to render the scene
	 * 
	 * @param {Scene} scene The scene to render
	 * @param {Camera} camera The camera to use
	 */
	render: function(scene, camera) {
		
		var viewMatrix       = null,
			projectionMatrix   = null,
			mesh               = null;
		
		// reset the projection matrix and the last
		// used shader program
		this.projectionMatrix.zero();
		this.lastShaderProgram = null;
		
		if(this.autoClear) {
		  this.clear();
		}
		
		// update the camera and scene so we apply 
		// all the matrix updates down the hierarchy
		camera.update();
		scene.update();
		
		// get the current matrices out of the camera
		// and multiply them together
		viewMatrix        = camera.inverseMatrix;
		projectionMatrix  = camera.projectionMatrix;
		
		this.projectionMatrix.copy(projectionMatrix).multiply(viewMatrix);
		
		// now get out WebGL friendly versions
		this.projectionMatrix.toArray(this.projectionMatrixArray);
		this.eyeDirectionVector
			.copy(camera.position)
			.negate()
			.normalize()
			.toArray(this.eyeDirectionArray);
			
		camera.position.toArray(this.eyePositionArray);
			
		// TODO Optimise: this doesn't need to be done every time
		// clear the renderable objects and lights
		// and build up the arrays
		this.opaqueRenderableObjects.length = 0;
		this.transparentRenderableObjects.length = 0;
		this.lights.length = 0;
		
		// now build up the renderables
		this.appendChildren(scene);
			
		/*
		 * We draw the opaque objects first followed by
		 * the transparent ones back to front. Don't ask me,
		 * I just work here! OK, apparently it's a quirk of
		 * the wonder that is (Open|Web)GL and Giles has it
		 * totally covered
		 * 
		 * @see http://learningwebgl.com/blog/?p=859
		 */
    this.transparentRenderableObjects.sort(this.sortByZ);
    
    // now render
		this.renderObjectArray(this.opaqueRenderableObjects);
		this.renderObjectArray(this.transparentRenderableObjects);
		
		// reset the scene and camera
		scene.dirty         = false;
		camera.dirty        = false;
		
		// do some garbage collection and tidy
		// up of the variables
		projectionMatrix    = null;
		viewMatrix          = null;
		mesh                = null;
	},
	
	/**
	 * Function used for sorting transparent objects in reverse Z
	 * order for the wonder of WebGL
	 * 
	 * @private
	 * @param {Object3D} m1 The first object to test
	 * @param {Object3D} m2 The second object to test
	 */
	sortByZ: function(m1,m2) {
		if(m1.position.z > m2.position.z) {
			return -1;
		} else if(m1.position.z < m2.position.z) {
			return 1;
		} else {
			return 0;
		}
	},
	
	/**
	 * Switches between opaque and 
	 */
	switchRenderMode: function(mode) {
		
		switch(mode) {
			
			// Additive	
			case "additive":
				this.gl.enable(this.gl.BLEND);
				this.gl.blendEquation(this.gl.FUNC_ADD);
				this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
				break;
			
			// Transparent	
			case "transparent":
				this.gl.enable(this.gl.BLEND);
				this.gl.blendEquation(this.gl.FUNC_ADD);
				this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
				break;
				
			// Nothing	
			default:
				this.gl.disable(this.gl.BLEND);
				break;
		}
	},
	
	/**
	 * Renders the two groups of objects, the opaque
	 * ones and the transparent ones.
	 * 
	 * @param {Object3D[]} renderArray Which array to render
	 */
	renderObjectArray: function(renderArray) {
		
		var renderables  = renderArray.length,
			renderable     = null;
						
		while(renderables--) {
			
			// cache
			renderable = renderArray[renderables];
			
			if(renderable.blendType === A3.Constants.BLEND_TYPES.ADDITIVE) {
				this.switchRenderMode("additive");
			} else if(renderable.transparent) {
				this.switchRenderMode("transparent");
			} else {
				this.switchRenderMode("normal");
			}
			
			// draw
			this.renderObject(renderable);
			
			// reset
			renderable.dirty = false;
		}
	},
	
	/**
	 * Creates a flattened array of the child objects
	 * in the scene that are renderable. Goes down
	 * recursively through the tree, depth first
	 * 
	 * @private
	 * @param {A3.Core.Object3D} object3D The starting point for the recursion
	 */
	appendChildren: function(object3D) {
		
		if(!!object3D.visible) {
			
			// if this is a mesh, it's renderable
			if(object3D instanceof A3.Core.Objects.Mesh) {
				
				// ensure it is initialized
				object3D.initialize(this.gl);
				
				// if it's transparent or additive, add to the
				// transparent array, otherwise it's opaque
				if(object3D.transparent || object3D.blendType === A3.Constants.BLEND_TYPES.ADDITIVE) {
					this.transparentRenderableObjects.push(object3D);
				} else {
					this.opaqueRenderableObjects.push(object3D);
				}
			}
			
			if(object3D instanceof A3.Core.Objects.Lights.Light) {
				this.lights.push(object3D);
			}
			
			if(!!object3D.children.length) {
				var c = object3D.children.length;
				while(c--) {
					this.appendChildren(object3D.children[c]);
				}
			}
		}
	},
	
	/**
	 * Renders a mesh out to the context
	 * 
	 * @private
	 * @param {A3.Core.Objects.Mesh} The mesh to render
	 * @param {Float32Array} The camera's projection matrix flattened ready for WebGL
	 */
	renderObject: function(mesh) {
		
		var meshShaderProgram       = mesh.shader.shaderProgram,
		
			// standard attributes
			vertexPositionAttribute    = meshShaderProgram.attributes.aVertPosition,
			vertexNormalAttribute      = meshShaderProgram.attributes.aVertNormal,
			vertexColorAttribute       = meshShaderProgram.attributes.aVertColor,
			vertexUVAttribute          = meshShaderProgram.attributes.aVertUV,
			
			// standard uniforms
			modelViewMatrixUniform     = meshShaderProgram.uniforms.uModelViewMatrix,
			projectionMatrixUniform    = meshShaderProgram.uniforms.uProjectionMatrix,
			normalMatrixUniform        = meshShaderProgram.uniforms.uNormalMatrix,
			ambientLightColorUniform   = meshShaderProgram.uniforms.uAmbientLightColor,
			eyeDirectionUniform        = meshShaderProgram.uniforms.uEyeDirection,
			eyePositionUniform         = meshShaderProgram.uniforms.uEyePosition,
			textureUniform             = meshShaderProgram.uniforms.uTexture,
			environmentUniform         = meshShaderProgram.uniforms.uEnvironment,
			alphaUniform               = meshShaderProgram.uniforms.uAlpha,
			
			// custom attributes
			customAttributes           = meshShaderProgram.attributes.aCustoms,
			customAttributesCount      = customAttributes.length,
			customAttributeObject      = null,
			customAttributeShader      = null,
			
			// custom uniforms
			customUniforms             = meshShaderProgram.uniforms.uCustoms,
			customUniformsCount        = customUniforms.length,
			customUniformObject        = null,
			customUniformShader        = null,
			
			// light information
			lightCount                 = 0,
			lightIndex                 = 0,
			lightUniform               = null,
			light                      = null;
			
		// reset the ambient lighting
		this.ambientLightColor.zero();
		
		mesh.matrixWorld.toArray(this.modelViewMatrixArray);
		mesh.matrixNormals.toArray(this.normalMatrixArray);
		
		// SHADER:
		// update to use the mesh's shader if it
		// has changed since the last object
		if(meshShaderProgram !== this.lastShaderProgram) {
			this.gl.useProgram(meshShaderProgram);
			this.lastShaderProgram = meshShaderProgram;
			
			// set the projection matrix for this shader
			this.gl.uniformMatrix4fv(projectionMatrixUniform, false, this.projectionMatrixArray);
		}
		
		// set the object's alpha value
		if(!mesh.transparent) {
			mesh.opacity = 1;
		}
		this.gl.uniform1f(alphaUniform, mesh.opacity);
		
		// toggle depth testing
		if(mesh.depthTest) {
			this.gl.enable(this.gl.DEPTH_TEST);
		} else {
			this.gl.disable(this.gl.DEPTH_TEST);
		}
		
		// LIGHTS:
		while(lightCount < A3.Constants.MAX_LIGHTS) {
			
			// get the light
			light			= this.lights[lightIndex];
			lightUniform	= meshShaderProgram.uniforms.uLightSources[lightCount];
			
			if(!!light) {
				if(light.type !== A3.Constants.LIGHT_TYPES.AMBIENT) {
					
					if(light.type === A3.Constants.LIGHT_TYPES.DIRECTIONAL) {
						light.location.x = light.position.x - light.target.x;
						light.location.y = light.position.y - light.target.y;
						light.location.z = light.position.z - light.target.z;
						light.location.normalize();
					} else {
						light.location.x = light.position.x;
						light.location.y = light.position.y;
						light.location.z = light.position.z;
					}
					
					// populate the holder arrays
					light.location.toArray(this.lightLocationArray);
					light.color.toArray(this.lightColorArray);
					
					// now pass to the GL context
					this.gl.uniform1i(lightUniform.type, light.type);
					this.gl.uniform1f(lightUniform.falloff, light.fallOffDistance || 0);
					this.gl.uniform3fv(lightUniform.location, this.lightLocationArray);
					this.gl.uniform3fv(lightUniform.color, this.lightColorArray);
					lightCount++;
					
				} else {
					
					// if it's an ambient light add its color to the ambient light
					// and allow another light to be passed through
					this.ambientLightColor.x += light.color.x;
					this.ambientLightColor.y += light.color.y;
					this.ambientLightColor.z += light.color.z;
				}
			} else {
				// set the light to 'off'
				this.gl.uniform1i(lightUniform.type, A3.Constants.LIGHT_TYPES.NONE);
				lightCount++;
			}
			lightIndex++;
		}
		
		// populate the ambient light array
		this.ambientLightColor.toArray(this.ambientlightColorArray);
		this.gl.uniform3fv(ambientLightColorUniform, this.ambientlightColorArray);
		
		// CUSTOM UNIFORMS:
		while(customUniformsCount--) {
			
			// grab the shader side of the uniform and
			// the JavaScript side of it
			customUniformShader = customUniforms[customUniformsCount];
			customUniformObject	= mesh.shader.customUniforms[customUniformShader.name];
			
			// if we definitely have both then this was linked
			// properly during the shader contruction
			if(!!customUniformObject && !!customUniformShader.value) {
				
				// inspect the type and populate
				switch(customUniformObject.type) {
					case "float":
						this.gl.uniform1f(customUniformShader.value, customUniformObject.value);
						break;
				}
			}
		}
		
		// CUSTOM ATTRIBUTES:
		// update custom attributes before we
		// go ahead and access them
		while(customAttributesCount--) {
			
			// grab the shader and JavaScript versions
			// of the attribute
			customAttributeShader	= customAttributes[customAttributesCount];
			customAttributeObject	= mesh.shader.customAttributes[customAttributeShader.name];
			
			// check we have both
			if(!!customAttributeObject && !!customAttributeShader.location) {
				
				// now populate
				switch(customAttributeObject.type) {
					case "float":
					
						// bind the buffer
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, customAttributeShader.data);
						
						// check if we should update this buffer's values
						// and, if so, go ahead and do that now
						if(customAttributeObject.needsUpdate) {
							
							// update the data values
							customAttributeShader.dataValues.set(customAttributeObject.value);
							
							// push into the GL buffer
							this.gl.bufferData(this.gl.ARRAY_BUFFER, customAttributeShader.dataValues, this.gl.STATIC_DRAW);
						}
						
						// finally populate the shader
						this.gl.vertexAttribPointer(customAttributeShader.location, 1, this.gl.FLOAT, false, 0, 0);
						break;
				}
			}
		}
		
		// CAMERA / EYE DIRECTION:
		this.gl.uniform3fv(eyePositionUniform, this.eyePositionArray);
		this.gl.uniform3fv(eyeDirectionUniform, this.eyeDirectionArray);
		
		// MATRICES:
		this.gl.uniformMatrix4fv(modelViewMatrixUniform, false, this.modelViewMatrixArray);
		this.gl.uniformMatrix3fv(normalMatrixUniform, false, this.normalMatrixArray);
		
		// UVs:
		if(mesh.renderType === A3.Constants.RENDER_TYPES.PARTICLES) {
		  vertexUVAttribute = 0;
		}
		
		if(!!mesh.shader.texture && mesh.shader.texture.isReady() && ~vertexUVAttribute) {
			
			// upload the texture to the GPU
			if(!mesh.shader.texture.data) {
				this.processTexture(mesh.shader.texture);
			}
			
			// set the texture
			this.gl.activeTexture(this.gl.TEXTURE0 + mesh.shader.texture.index);
			this.gl.bindTexture(this.gl.TEXTURE_2D, mesh.shader.texture.data);
			this.gl.uniform1i(textureUniform, mesh.shader.texture.index);
			
			// pass the UV data
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.uvs.data);
			this.gl.vertexAttribPointer(vertexUVAttribute, mesh.uvDataSize, this.gl.FLOAT, false, 0, 0);
		}
		
		if(!!mesh.shader.environmentMap && mesh.shader.environmentMap.isReady()) {
      
      // upload the texture to the GPU
      if(!mesh.shader.environmentMap.data) {
        this.processEnvironmentMap(mesh.shader.environmentMap);
      }
      
      // set the texture
      this.gl.activeTexture(this.gl.TEXTURE0 + mesh.shader.environmentMap.index);
      this.gl.bindTexture(this.gl.TEXTURE_2D, mesh.shader.environmentMap.data);
      this.gl.uniform1i(environmentUniform, mesh.shader.environmentMap.index);
    }
		
		// DRAW SOLIDS:
		if(mesh.renderType === A3.Constants.RENDER_TYPES.SOLID) {
			
			// NORMALS:
			if(~vertexNormalAttribute) {
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.normals.data);
				this.gl.vertexAttribPointer(vertexNormalAttribute, mesh.normalDataSize, this.gl.FLOAT, false, 0, 0);
			}
			
			// COLOURS:
			if(~vertexColorAttribute) {
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.colors.data);
				this.gl.vertexAttribPointer(vertexColorAttribute, mesh.colorDataSize, this.gl.FLOAT, false, 0, 0);
			}
			
			// VERTICES:
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.vertices.data);
			this.gl.vertexAttribPointer(vertexPositionAttribute, mesh.vertexDataSize, this.gl.FLOAT, false, 0, 0);
		
			// ELEMENTS, DRAW:
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.buffers.elements.data);
			this.gl.drawElements(this.gl.TRIANGLES, mesh.buffers.elements.size, this.gl.UNSIGNED_SHORT, 0);
			
		} else {
			
			// COLOURS:
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.colors.data);
			this.gl.vertexAttribPointer(vertexColorAttribute, mesh.colorDataSize, this.gl.FLOAT, false, 0, 0);
			
			// VERTICES:
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.buffers.vertices.data);
			this.gl.vertexAttribPointer(vertexPositionAttribute, mesh.vertexDataSize, this.gl.FLOAT, false, 0, 0);
		
			// DRAW PARTICLES:
			this.gl.drawArrays(this.gl.POINTS, 0, mesh.buffers.vertices.size);
		}
	},
	
	/**
	 * Uploads the texture to the GPU
	 * 
	 * @param {A3.Core.Render.Textures.Texture} texture The texture to work with
	 */
	processTexture: function(texture) {
		
		// add the WebGL texture to the object
		texture.data = this.gl.createTexture();
		
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture.data);
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texture.domElement);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		
		// now unbind
		this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	},
	
	/**
	 * Generates a sampler cube and uploads it to the GPU
	 * 
   * @param {Object} environmentMap An object with Textures as properties:
   * <ul>
   *  <li>px: The positive x-axis texture</li>
   *  <li>nx: The negative x-axis texture</li>
   *  <li>py: The positive y-axis texture</li>
   *  <li>ny: The negative y-axis texture</li>
   *  <li>pz: The positive z-axis texture</li>
   *  <li>nz: The negative z-axis texture</li>
   * </ul
	 */
	processEnvironmentMap: function(environmentMap) {
	  
	  // add the WebGL cubemap to the object
	  environmentMap.data = this.gl.createTexture();
	  
	  this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, environmentMap.data);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
	  
	  // X Axis
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.px.domElement);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.nx.domElement);
    
    // Y Axis
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.py.domElement);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.ny.domElement);
    
    // Z Axis
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.pz.domElement);
    this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, environmentMap.nz.domElement);
    
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    
    this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
    
    // now unbind
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	}
};

// shortcut
A3.R = A3.Core.Render.Renderer;/**
 * @class The root of all rendering activity and a container
 * for the objects in a scene <strong>[A3.Scene]</strong>
 * 
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 */
A3.Core.Scene.BasicScene = function() {
	
	// reset what 'this' refers to
	A3.Core.Object3D.call(this);

};

A3.Core.Scene.BasicScene.prototype = new A3.Core.Object3D();

// shortcut
A3.Scene = A3.Core.Scene.BasicScene;/**
 * @class Allows for simple positional
 * changes and looks at a target <strong>[A3.Camera]</strong>
 * 
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 * 
 * @param {Number} fieldOfView The field of view in degrees
 * @param {Number} aspectRatio The ratio of width to height of the camera's view
 * @param {Number} nearVal The distance to the near clipping plane
 * @param {Number} farVal The distance to the far clipping plane
 */
A3.Core.Camera.BasicCamera = function(fieldOfView, aspectRatio, nearVal, farVal) {
	
	// reset what 'this' refers to
	A3.Core.Object3D.call(this);
	
	this.name = "camera";
	
	/**
	 * @description The projection matrix used by the camera
	 * 
	 * @type A3.Core.Math.Matrix4
	 */
	this.projectionMatrix = new A3.Core.Math.Matrix4();

	/**
	 * @description The camera's inverse, or view, matrix. Used to
	 * reposition all the world items relative to the camera
	 * 
	 * @type A3.Core.Math.Matrix4
	 */
	this.inverseMatrix = new A3.Core.Math.Matrix4();
	
	// default the inverse matrix to identity
	this.inverseMatrix.identity();
	
	// pass through the values from the camera constructor
	this.projectionMatrix.perspective(fieldOfView, aspectRatio, nearVal, farVal);
	
	// assume we're looking at the origin
	this.target = new A3.Core.Math.Vector3(0,0,0);
	
	// and go back 1 unit in the +z axis so our lookat doesn't go crazy
	this.position = new A3.Core.Math.Vector3(0,0,1);
};

A3.Core.Camera.BasicCamera.prototype = new A3.Core.Object3D();

// shortcut
A3.Camera = A3.Core.Camera.BasicCamera;
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
A3.Mesh = A3.Core.Objects.Mesh;/**
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

A3.Geometry = A3.Core.Objects.Geometric.Geometry;/**
 * @class Represents a light source <strong>No shortcut - should not be
 * instantiated directly</strong>.
 * 
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 * 
 * @param {A3.Core.Math.Vector3} color The RGB of the color
 * @param {Number} intensity The intensity of the color
 */
A3.Core.Objects.Lights.Light = function(color, intensity) {
	
	// reset what 'this' refers to
	A3.Core.Object3D.call(this);
	
	/**
	 * @description The color and intensity of the light
	 * 
	 * @type A3.Core.Math.Vector4
	 */
	this.color = color;
	
	if(!!color) {
		
		// scale down the color by the intensity
		this.color.x *= intensity;
		this.color.y *= intensity;
		this.color.z *= intensity;
	}
	
	/**
	 * @description The type of light - defined in the A3 Constants
	 * @type Number
	 */
	this.type = 0;
	
	/**
	 * @description The direction / position of the light,
	 * depending on the type. Directional lights use this
	 * for their direction, point lights for their position
	 * 
	 * @type A3.Core.Math.Vector3
	 */
	this.location = new A3.Core.Math.Vector3(0,0,0);
};

A3.Core.Objects.Lights.Light.prototype = new A3.Core.Object3D();
/**
 * @class Represents an ambient light source <strong>[A3.AmbientLight]</strong>.
 * 
 * @augments A3.Core.Objects.Lights.Light
 * @author Paul Lewis
 * 
 * @param {A3.Core.Math.Vector3} color The RGB of the color
 * @param {Number} intensity The intensity of the color
 */
A3.Core.Objects.Lights.AmbientLight = function(color, intensity) {
	
	// reset what 'this' refers to
	A3.Core.Objects.Lights.Light.call(this, color, intensity);
	
	/**
	 * @description The light type
	 * @type {Number}
	 * @private
	 */
	this.type = A3.Constants.LIGHT_TYPES.AMBIENT;
};

A3.Core.Objects.Lights.AmbientLight.prototype = new A3.Core.Objects.Lights.Light();

// shortcut
A3.AmbientLight = A3.Core.Objects.Lights.AmbientLight;
/**
 * @class Represents a directional light source <strong>[A3.DirectionalLight]</strong>.
 * 
 * @augments A3.Core.Objects.Lights.Light
 * @author Paul Lewis
 * 
 * @param {A3.Core.Math.Vector3} color The RGB of the color
 * @param {Number} intensity The intensity of the color
 */
A3.Core.Objects.Lights.DirectionalLight = function(color, intensity) {
	
	// reset what 'this' refers to
	A3.Core.Objects.Lights.Light.call(this, color, intensity);
	
	// assume pointing at the origin
	this.target = new A3.Core.Math.Vector3(0,0,0);
	
	// assume a non-origin position
	this.position = new A3.Core.Math.Vector3(0,1,0);
	
	/**
	 * @description The light type
	 * @type Number
	 * @private
	 */
	this.type = A3.Constants.LIGHT_TYPES.DIRECTIONAL;
};

A3.Core.Objects.Lights.DirectionalLight.prototype = new A3.Core.Objects.Lights.Light();

// shortcut
A3.DirectionalLight = A3.Core.Objects.Lights.DirectionalLight;
/**
 * @class Represents a point light source <strong>[A3.PointLight]</strong>.
 * 
 * @augments A3.Core.Objects.Lights.Light
 * @author Paul Lewis
 * 
 * @param {A3.Core.Math.Vector3} color The RGB of the color
 * @param {Number} intensity The intensity of the color
 */
A3.Core.Objects.Lights.PointLight = function(color, intensity) {
	
	// reset what 'this' refers to
	A3.Core.Objects.Lights.Light.call(this, color, intensity);
	
	// assume anorigin position
	this.position = new A3.Core.Math.Vector3(0,0,0);
	
	/**
	 * The falloff distance for the light
	 * @type Number
	 */
	this.fallOffDistance = 200;
	
	/**
	 * @description The light type
	 * @type Number
	 * @private
	 */
	this.type = A3.Constants.LIGHT_TYPES.POINT;
};

A3.Core.Objects.Lights.PointLight.prototype = new A3.Core.Objects.Lights.Light();

// shortcut
A3.PointLight = A3.Core.Objects.Lights.PointLight;
/**
 * @class Represents a cube primitive
 * 
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 * 
 * @param {Number} size The size of the cube in all three dimensions
 */
A3.Core.Objects.Primitives.Cube = function(size) {

	size *= 0.5;
	
	var vertices  = null,
		faces       = null,
		colors      = [],
		c           = 0,
		
		fBL	= new A3.Vertex(-size, -size,  size), // 0
		fBR	= new A3.Vertex( size, -size,  size), // 1
		fTR	= new A3.Vertex( size,  size,  size), // 2
		fTL	= new A3.Vertex(-size,  size,  size), // 3
		
		bBR	= new A3.Vertex( size, -size, -size), // 4
		bBL	= new A3.Vertex(-size, -size, -size), // 5
		bTL	= new A3.Vertex(-size,  size, -size), // 6
		bTR	= new A3.Vertex( size,  size, -size); // 7
		
	vertices = [
		fBL,							fBR,							fTR,							fTL,
		bBR,							bBL,							bTL,							bTR,
		(new A3.Vertex()).copy(bBL),	(new A3.Vertex()).copy(fBL),	(new A3.Vertex()).copy(fTL),	(new A3.Vertex()).copy(bTL),
		(new A3.Vertex()).copy(fBR),	(new A3.Vertex()).copy(bBR),	(new A3.Vertex()).copy(bTR),	(new A3.Vertex()).copy(fTR),
		(new A3.Vertex()).copy(fTR),	(new A3.Vertex()).copy(bTR),	(new A3.Vertex()).copy(bTL),	(new A3.Vertex()).copy(fTL),
		(new A3.Vertex()).copy(fBR),	(new A3.Vertex()).copy(fBL),	(new A3.Vertex()).copy(bBL),	(new A3.Vertex()).copy(bBR)
	];
	
	faces = [
		// front
		new A3.Face4(0, 1, 2, 3),
		
		// back
		new A3.Face4(4, 5, 6, 7),
		
		// left
		new A3.Face4(8, 9, 10,11),
		
		// right
		new A3.Face4(12,13,14,15),
		
		// top
		new A3.Face4(16,17,18,19),
		
		// bottom
		new A3.Face4(20,21,22,23)
	];
	
	for(c = 0; c < vertices.length; c++) {
	  colors.push(new A3.V3(1,1,1));
	}
	
	// convert to a geometry object
	return new A3.Geometry({
	  vertices: vertices,
	  faces: faces,
	  colors: colors});
};

A3.Core.Objects.Primitives.Cube.prototype = new A3.Core.Objects.Mesh();

// shortcut
A3.Cube = A3.Core.Objects.Primitives.Cube;
/**
 * @class Represents a sphere primitive
 * 
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 * 
 * @param {Number} radius The radius of the sphere
 * @param {Number} segments The number of vertical slices, analagous to latitude
 * @param {Number} rings The number of horizontal slices, analagous to longitude
 */
A3.Core.Objects.Primitives.Sphere = function(radius, segments, rings) {

	var MIN_THETA	  = Math.PI * -0.5,
		MAX_THETA	    = Math.PI * 0.5,
		RANGE_THETA	  = Math.PI,
		MIN_PHI		    = 0,
		MAX_PHI		    = Math.PI * 2,
		
		vertices	    = [],
		faces		      = [],
    uvs           = [],
		colors		    = [],
		
		ring		      = 0,
		segment		    = 0,
		theta		      = MIN_THETA,
		phi			      = MIN_PHI,
		nextTheta	    = 0,
		nextPhi	      = 0,
		face          = null,
		v1            = null,
		v2            = null,
		v3            = null,
		v4            = null;
		
	rings          = Math.max(rings, 3);
	segments       = Math.max(segments, 3);
		
	function createData(theta, phi) {
		var cosTheta = Math.cos(theta),
			sinTheta	 = Math.sin(theta),
			cosPhi		 = Math.cos(phi),
			sinPhi		 = Math.sin(phi);
			
			x = cosTheta * cosPhi * radius;
			y = -sinTheta * radius;
			z = -cosTheta * sinPhi * radius;
			
		return compareToExisting({
			vertex: new A3.Vertex(Math.round(x), Math.round(y), Math.round(z)),
			color: new A3.V3(1.0,1.0,1.0)
		});
	}
	
	function compareToExisting(data) {
		
		var vertexPosToCompare = null,
			  exists             = false,
			  index              = 0,
			  v                  = 0;
		
		for(v = 0; v < vertices.length; v++) {
			vertexPosToCompare = vertices[v].position;
			exists = ((vertexPosToCompare.x === data.vertex.position.x) && 
						    (vertexPosToCompare.y === data.vertex.position.y) && 
						    (vertexPosToCompare.z === data.vertex.position.z) );
						
			if(exists) {
				index = v;
				break;
			}
		}
		
		if(!exists) {
			vertices.push(data.vertex);
			colors.push(data.color);
			
			index = vertices.length-1;
		}
		
		return index;
	}
	
	function toFaceUV(theta, phi) {
		return new A3.V2(phi / MAX_PHI, 1-((theta / MAX_THETA) + 1) * 0.5);
	}

	// run through
	while(ring < rings) {
		
		phi		   = (ring / rings) * MAX_PHI;
		nextPhi  = ((ring+1) / rings) * MAX_PHI;
		segment  = 0;
		
		while(segment < segments) {
			
			theta		  = MIN_THETA + (segment / segments) * RANGE_THETA;
			nextTheta	= MIN_THETA + ((segment+1) / segments) * RANGE_THETA;
			
			v1 = createData(theta, phi);
			v2 = createData(nextTheta, phi);
			v3 = createData(nextTheta, nextPhi);
			v4 = createData(theta, nextPhi);
			
			// now check for a triangle rather than a quad
			if(v1 === v2 || v2 === v3 || v3 === v4 || v4 === v1) {
			  
				if(v1 === v2) {
				  
					face = new A3.Face3(v1, v3, v4);
					uvs.push(toFaceUV(theta, phi));			     // v1
					uvs.push(toFaceUV(nextTheta, nextPhi));  // v3
					uvs.push(toFaceUV(theta, nextPhi));      // v4
					
				} else if(v2 === v3) {
				  
					face = new A3.Face3(v1, v2, v4);
					uvs.push(toFaceUV(theta, phi));          // v1
					uvs.push(toFaceUV(nextTheta, phi));      // v2
					uvs.push(toFaceUV(theta, nextPhi));      // v4
					
				} else if(v3 === v4) {
				  
					face = new A3.Face3(v1, v2, v4);
					uvs.push(toFaceUV(theta, phi));          // v1
					uvs.push(toFaceUV(nextTheta, phi));      // v2
					uvs.push(toFaceUV(theta, nextPhi));      // v4
					
				} else if(v4 === v1) {
				  
					face = new A3.Face3(v1, v2, v3);
					uvs.push(toFaceUV(theta, phi));          // v1
					uvs.push(toFaceUV(nextTheta, phi));      // v2
					uvs.push(toFaceUV(nextTheta, nextPhi));  // v3
					
				}
			} else {
			  
				face = new A3.Face4(v1, v2, v3, v4);
				uvs.push(toFaceUV(theta, phi));            // v1
				uvs.push(toFaceUV(nextTheta, phi));        // v2
				uvs.push(toFaceUV(nextTheta, nextPhi));    // v3
				uvs.push(toFaceUV(theta, nextPhi));        // v4
				
			}
			
			faces.push(face);
			segment++;
		}
		ring++;
	}
	
	// convert to a geometry object
	return new A3.Geometry({
		vertices: vertices,
		faces: faces,
		colors: colors,
		faceUVs: uvs
	});
};

A3.Core.Objects.Primitives.Sphere.prototype = new A3.Core.Objects.Mesh();

// shortcut
A3.Sphere = A3.Core.Objects.Primitives.Sphere;
/**
 * @class Represents a plane primitive
 * 
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 * 
 * @param {Number} width The width of the plane
 * @param {Number} height The height of the plane
 * @param {Number} horizontalSegments The number of horizontal segments that make up the plane (default 1)
 * @param {Number} verticalSegments The number of vertical segments that make up the plane (default 1)
 */
A3.Core.Objects.Primitives.Plane = function(width, height, horizontalSegments, verticalSegments) {
	
	var vertices		    = [],
		faces             = [],
		colors            = [],
    uvs	              = [],
    faceWidth         = width,
    faceHeight        = height,
    halfWidth         = width * 0.5,
    halfHeight        = height * 0.5,
    h                 = 0,
    v	                = 0;
		
	horizontalSegments	= horizontalSegments || 1;
	verticalSegments	  = verticalSegments || 1;
	
	faceWidth			      = width / horizontalSegments;
	faceHeight			    = height / verticalSegments;
	
	function createData(h, v) {
		return compareToExisting({
			vertex: new A3.Vertex((h * faceWidth) - halfWidth, (v * faceHeight) - halfHeight, 0),
			color: new A3.V3(1.0,1.0,1.0)
		});
	}
	
	function compareToExisting(data) {
		
		var vertexPosToCompare  = null,
			  exists              = false,
			  index               = 0,
			  v                   = 0;
		
		for(v = 0; v < vertices.length; v++) {
			vertexPosToCompare = vertices[v].position;
			exists = ((vertexPosToCompare.x === data.vertex.position.x) && 
						    (vertexPosToCompare.y === data.vertex.position.y) && 
						    (vertexPosToCompare.z === data.vertex.position.z) );
						
			if(exists) {
				index = v;
				break;
			}
		}
		
		if(!exists) {
			vertices.push(data.vertex);
			colors.push(data.color);
			
			index = vertices.length-1;
		}
		
		return index;
	}
	
	for(h = 0; h < horizontalSegments; h++) {
		for(v = 0; v < verticalSegments; v++) {
			uvs.push(new A3.V2(h / horizontalSegments, v / verticalSegments));
			uvs.push(new A3.V2((h+1) / horizontalSegments, v / verticalSegments));
			uvs.push(new A3.V2((h+1) / horizontalSegments, (v+1) / verticalSegments));
			uvs.push(new A3.V2(h / horizontalSegments, (v+1) / verticalSegments));
			
			faces.push(
				new A3.Face4(
					createData(h,v),
					createData(h+1,v),
					createData(h+1,v+1),
					createData(h,v+1)
				)
			);
		}
	}
	
	// convert to a geometry object
	return new A3.Geometry({
		vertices: vertices,
		faces: faces,
		colors: colors,
		faceUVs: uvs,
		flatShaded: false
	});
};

A3.Core.Objects.Primitives.Plane.prototype = new A3.Core.Objects.Mesh();

// shortcut
A3.Plane = A3.Core.Objects.Primitives.Plane;
/**
 * @class Loads in a resource file over AJAX <strong>[A3.MeshLoader]</strong>.
 * Handy for the loading of mesh data files
 * 
 * @author Paul Lewis
 * 
 * @param {String} url The URL to load
 * @param {Function} callback The callback to which the geometry should be passed
 */
A3.Core.Remote.MeshLoader = function(url, callback) {
	
	var request			= new XMLHttpRequest(),
		geometry      = null,
		data          = null,
		vertexArray   = null,
		vertices      = [],
		faces         = [],
		colors        = [],
		faceArray     = null,
		faceData      = null,
		face          = null,
		uvs           = [],
		uvArray	      = null,
		uvDataBlock		= null,
		v             = 0,
		f             = 0,
		uv            = 0;
		
	request.onreadystatechange = function() {
		if(request.readyState === 4) {
			data = JSON.parse(request.responseText);
			
			vertexArray    = data.vertices;
			faceArray      = data.faces;
			uvArray        = data.uv;
			
			// go through the vertices
			for(v = 0; v < vertexArray.length; v++) {
				vertexData = vertexArray[v];
				vertices.push(
					new A3.Vertex(vertexData[0], vertexData[1], vertexData[2])
				);
			}
			
			// now go through the faces
			for(f = 0; f < faceArray.length; f++) {
				faceData = faceArray[f];
				
				if(faceData.length === 3) {
					face = new A3.Face3(faceData[0], faceData[1], faceData[2]);
				} else if(faceData.length === 4) {
					face = new A3.Face4(faceData[0], faceData[1], faceData[2], faceData[3]);
				}
				faces.push(face);
			}
			
			// and the uv data
			if(!!uvArray && !!uvArray.length) {
				for(uv = 0; uv < uvArray.length; uv++) {
					uvDataBlock = uvArray[uv];
					uvs.push(
						new A3.V2(uvDataBlock[0], uvDataBlock[1])
					);
				}
			}
			
			// push into a geometry
			geometry = new A3.Geometry({
				vertices: vertices,
				faces: faces,
				colors: colors,
				faceUVs: uvs
			});
			
			// call the callback
			if(!!callback) {
				callback(geometry);
			}
		}
	};
	
	/**
	 * Dispatches the request for the data
	 */
	this.load = function() {
		request.open("GET", url, true);
		request.send(null);
	};
};

// shortcut
A3.MeshLoader = A3.Core.Remote.MeshLoader;
A3.Core.Render.Shaders.ShaderLibrary.Chunks = {"Lighting":"/**\n * Adds the diffuse component of the light\n */\nvoid addLight( inout vec3 aDiffuseColor,\n inout vec3 aSpecularColor,\n sLight light,\n vec4 aWorldVertexPosition,\n vec3 aVertEyeNormal,\n vec3 uEyeDirection,\n float diffuseReflection,\n float specularReflection,\n float specularShininess, \n vec3 specularColor) {\n // if it has no type, discard it\n if(light.type == 0) {\n return;\n } else if(light.type >= 2) {\n vec3 lightLocation = light.location;\n vec3 reflectLightDirection = reflect(lightLocation, aVertEyeNormal);\n float attenuation = 1.0;\n float specularPower = 1.0;\n if(light.type == 4) {\n vec3 lightToVertex = light.location - aWorldVertexPosition.xyz;\n float distance = length(lightToVertex);\n attenuation = max(1.0 - (distance / light.falloff), 0.0);\n lightLocation = normalize(lightToVertex);\n reflectLightDirection = reflect(lightLocation, aVertEyeNormal);\n }\n specularPower = pow(max(dot(uEyeDirection, reflectLightDirection), 0.0), specularShininess);\n // diffuse\n aDiffuseColor += max(dot(aVertEyeNormal, lightLocation), 0.0) * diffuseReflection * light.color * attenuation;\n aSpecularColor += specularColor * specularPower * specularReflection * attenuation;\n }\n}"};
A3.Core.Render.Shaders.ShaderLibrary.Shaders = {"Basic": {"vertexShader": "varying vec3 vVertexColor;\n#ifdef USE_TEXTURE \n varying vec2 vVertexUV;\n#endif \nvoid main() {\n #ifdef USE_TEXTURE \n vVertexUV = aVertUV;\n #endif \n vVertexColor = aVertColor;\n gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertPosition, 1.0);\n}","fragmentShader": "varying vec3 vVertexColor;\n#ifdef USE_TEXTURE\n varying vec2 vVertexUV;\n#endif\nvoid main() {\n vec4 vertexFinalColor = vec4(vVertexColor, 1.0);\n #ifdef USE_TEXTURE\n vertexFinalColor *= texture2D(uTexture, vVertexUV);\n #endif\n vertexFinalColor.a *= uAlpha;\n gl_FragColor = vertexFinalColor;\n}"},"Pink": {"vertexShader": "void main() {\n gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertPosition, 1.0);\n}","fragmentShader": "void main() {\n gl_FragColor = vec4(0.996078, 0.341176, 0.631372, 1.0);\n}"},"Particle": {"vertexShader": "varying vec3 vVertexColor;\nvoid main() {\n vec4 particlePosition = uModelViewMatrix * vec4(aVertPosition, 1.0);\n vVertexColor = aVertColor;\n gl_Position = uProjectionMatrix * particlePosition;\n gl_PointSize = CHUNK[ParticleSize] / (CHUNK[ParticleScale] * length(uEyePosition.xyz - particlePosition.xyz));\n}","fragmentShader": "varying vec3 vVertexColor;\n#ifdef USE_TEXTURE\n varying vec2 vVertexUV;\n#endif\nvoid main() {\n vec4 vertexFinalColor = vec4(vVertexColor, uAlpha);\n #ifdef USE_TEXTURE\n vertexFinalColor *= texture2D(uTexture, gl_PointCoord);\n #endif\n gl_FragColor = vertexFinalColor;\n}"},"Normals": {"vertexShader": "varying vec3 aVertexColor;\nvoid main() {\n vec3 aVertEyeNormal = normalize(uNormalMatrix * aVertNormal);\n aVertexColor = vec3(\n (aVertEyeNormal.x + 1.0) * 0.5,\n (aVertEyeNormal.y + 1.0) * 0.5,\n max(0.0, aVertEyeNormal.z));\n gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertPosition, 1.0);\n}","fragmentShader": "varying vec3 aVertexColor;\nvoid main() {\n gl_FragColor = vec4(aVertexColor, 1.0);\n}"},"PhongLambert": {"vertexShader": "varying vec3 vVertexColor;\n#ifdef USE_TEXTURE \n varying vec2 vVertexUV;\n#endif\n#ifdef USE_ENVMAP\n varying vec3 vVertexRef;\n#endif\nCHUNK[Lighting]\nvoid main() {\n vec3 aVertEyeNormal = normalize(uNormalMatrix * aVertNormal);\n vec3 lightDiffuseColor = uAmbientLightColor;\n vec3 lightSpecularColor = vec3(0.0);\n vec4 aWorldVertexPosition = uModelViewMatrix * vec4(aVertPosition, 1.0);\n #ifdef USE_TEXTURE \n vVertexUV = aVertUV;\n #endif \n #ifdef USE_ENVMAP\n vVertexRef = reflect(normalize(aWorldVertexPosition.xyz - uEyePosition), aVertEyeNormal);\n #endif\n CHUNK[LightingCalls]\n vVertexColor = lightSpecularColor + (aVertColor * lightDiffuseColor);\n gl_Position = uProjectionMatrix * aWorldVertexPosition;\n}","fragmentShader": "varying vec3 vVertexColor;\n#ifdef USE_TEXTURE \n varying vec2 vVertexUV;\n#endif\n#ifdef USE_ENVMAP\n varying vec3 vVertexRef;\n#endif\nvoid main() {\n vec4 vertexFinalColor = vec4(vVertexColor, 1.0);\n #ifdef USE_TEXTURE \n vertexFinalColor *= texture2D(uTexture, vVertexUV);\n #endif\n #ifdef USE_ENVMAP\n vertexFinalColor *= textureCube(uEnvironment, vVertexRef);\n #endif\n vertexFinalColor.a *= uAlpha;\n gl_FragColor = vertexFinalColor;\n}"}};
