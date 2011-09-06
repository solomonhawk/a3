/**
 * @class Represents a sphere primitive
 *
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 *
 * @param {Number} radius The radius of the sphere
 * @param {Number} segments The number of vertical slices, analagous to latitude
 * @param {Number} rings The number of horizontal slices, analagous to longitude
 */
A3.Core.Objects.Primitives.Sphere = function(radius, segments, rings) {

	var MIN_THETA			= Math.PI * -0.5,
		MAX_THETA		= Math.PI * 0.5,
		RANGE_THETA		= Math.PI,
		MIN_PHI			= 0,
		MAX_PHI			= Math.PI * 2,

		vertices				= [],
		faces				= [],
		uvs					= [],
		colors				= [],

		ring				= 0,
		segment			= 0,
		theta				= MIN_THETA,
		phi					= MIN_PHI,
		nextTheta			= 0,
		nextPhi				= 0,
		face				= null,
		v1					= null,
		v2					= null,
		v3					= null,
		v4					= null;

	rings					= Math.max(rings, 3);
	segments				= Math.max(segments, 3);

	function createData(theta, phi) {
		var cosTheta		= Math.cos(theta),
			sinTheta		= Math.sin(theta),
			cosPhi			= Math.cos(phi),
			sinPhi			= Math.sin(phi);

			x = cosTheta * cosPhi * radius;
			y = -sinTheta * radius;
			z = -cosTheta * sinPhi * radius;

		return compareToExisting({
			vertex: new A3.Vertex(Math.round(x), Math.round(y), Math.round(z)),
			color: new A3.V3(1.0,1.0,1.0)
		});
	}

	function compareToExisting(data) {

		var vertexPosToCompare	= null,
			exists					= false,
			index					= 0,
			v						= 0;

		for(v = 0; v < vertices.length; v++) {
			vertexPosToCompare = vertices[v].position;
			exists = ((vertexPosToCompare.x === data.vertex.position.x) &&
						    (vertexPosToCompare.y === data.vertex.position.y) &&
						    (vertexPosToCompare.z === data.vertex.position.z) );

			if(exists) {
				index = v;
				break;
			}
		}

		if(!exists) {
			vertices.push(data.vertex);
			colors.push(data.color);

			index = vertices.length-1;
		}

		return index;
	}

	function toFaceUV(theta, phi) {
		return new A3.V2(phi / MAX_PHI, 1-((theta / MAX_THETA) + 1) * 0.5);
	}

	// run through
	while(ring < rings) {

		phi			= (ring / rings) * MAX_PHI;
		nextPhi		= ((ring+1) / rings) * MAX_PHI;
		segment	= 0;

		while(segment < segments) {

			theta		= MIN_THETA + (segment / segments) * RANGE_THETA;
			nextTheta	= MIN_THETA + ((segment+1) / segments) * RANGE_THETA;

			v1 = createData(theta, phi);
			v2 = createData(nextTheta, phi);
			v3 = createData(nextTheta, nextPhi);
			v4 = createData(theta, nextPhi);

			// now check for a triangle rather than a quad
			if(v1 === v2 || v2 === v3 || v3 === v4 || v4 === v1) {

				if(v1 === v2) {

					face = new A3.Face3(v1, v3, v4);
					uvs.push(toFaceUV(theta, phi));			// v1
					uvs.push(toFaceUV(nextTheta, nextPhi));	// v3
					uvs.push(toFaceUV(theta, nextPhi));		// v4

				} else if(v2 === v3) {

					face = new A3.Face3(v1, v2, v4);
					uvs.push(toFaceUV(theta, phi));			// v1
					uvs.push(toFaceUV(nextTheta, phi));		// v2
					uvs.push(toFaceUV(theta, nextPhi));		// v4

				} else if(v3 === v4) {

					face = new A3.Face3(v1, v2, v4);
					uvs.push(toFaceUV(theta, phi));			// v1
					uvs.push(toFaceUV(nextTheta, phi));		// v2
					uvs.push(toFaceUV(theta, nextPhi));		// v4

				} else if(v4 === v1) {

					face = new A3.Face3(v1, v2, v3);
					uvs.push(toFaceUV(theta, phi));			// v1
					uvs.push(toFaceUV(nextTheta, phi));		// v2
					uvs.push(toFaceUV(nextTheta, nextPhi));	// v3

				}
			} else {

				face = new A3.Face4(v1, v2, v3, v4);
				uvs.push(toFaceUV(theta, phi));				// v1
				uvs.push(toFaceUV(nextTheta, phi));			// v2
				uvs.push(toFaceUV(nextTheta, nextPhi));		// v3
				uvs.push(toFaceUV(theta, nextPhi));			// v4

			}

			faces.push(face);
			segment++;
		}
		ring++;
	}

	// convert to a geometry object
	return new A3.Geometry({
		vertices: vertices,
		faces: faces,
		colors: colors,
		faceUVs: uvs
	});
};

A3.Core.Objects.Primitives.Sphere.prototype = new A3.Core.Objects.Mesh();

// shortcut
A3.Sphere = A3.Core.Objects.Primitives.Sphere;
