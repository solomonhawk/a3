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
