/**
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

A3.EnvironmentMap = A3.Core.Render.Textures.EnvironmentMap;