/**
 * @class Small utility to unproject a vector back to the screen<strong>[A3.Ray]</strong>.
 *
 * @author Paul Lewis
 *
 * @param {A3.Core.Math.Vector3} vector The vector to unproject
 * @param {A3.Core.Camera.BasicCamera} camera The camera to use for the unprojection
 */
A3.Addon.Intersection.Projector = function(camera) {

  /**
   * @description The camera to use for unprojections
   * @type {A3.Core.Camera.BasicCamera}
   */
  this.camera = camera;

};

A3.Addon.Intersection.Projector.prototype = {

  /**
   * Takes a vector and unprojects it from the screen space out into the world space
   *
   * @param {A3.Core.Math.Vector2} vector The vector to unproject
   * @see <a href="http://msdn.microsoft.com/en-us/library/microsoft.xna.framework.graphics.viewport.unproject.aspx">MSDN Unproject Vector</a> has a good breakdown
   */
  unproject: function(vector) {

    var cameraMatrixWorld = new A3.Core.Math.Matrix4(),
          cameraProjectionInverse = new A3.Core.Math.Matrix4(),
          start = new A3.Core.Math.Vector3(0, 0, 0),
          end = new A3.Core.Math.Vector3(vector.x, vector.y, 1);

    cameraProjectionInverse
      .copy(this.camera.projectionMatrix)
      .invert();

    // this is fun, we need to do the reverse of projecting
    // which involves using the camera's inverse world matrix,
    // i.e. we use the inverse of the inverse so the 'standard'
    // matrix world.
    cameraMatrixWorld
      .copy(this.camera.matrixWorld)
      .multiply(cameraProjectionInverse)
      .multiplyVector3(start);

    cameraMatrixWorld
      .multiplyVector3(end);

    return end.subtract(start);
  }
}

A3.Projector = A3.Addon.Intersection.Projector;
