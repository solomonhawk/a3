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
