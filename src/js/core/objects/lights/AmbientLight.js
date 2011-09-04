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
