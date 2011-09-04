/**
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
