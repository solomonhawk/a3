/**
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
