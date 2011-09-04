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
