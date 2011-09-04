/**
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
A3.Scene = A3.Core.Scene.BasicScene;