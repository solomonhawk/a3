/**
 * @class Represents a ray to cast into a scene <strong>[A3.Ray]</strong>.
 *
 * @author Paul Lewis
 *
 * @param {A3.Core.Math.Vector3} origin The ray's origin in 3D space
 * @param {A3.Core.Math.Vector3} direction The ray's normalised direction in 3D space
 */
A3.Addon.Intersection.Ray = function(origin, direction) {

  this.origin = origin;
  this.direction = direction;

};

A3.Ray = A3.Addon.Intersection.Ray;
