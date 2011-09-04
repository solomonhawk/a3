/**
 * @class Represents a plane primitive
 * 
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 * 
 * @param {Number} width The width of the plane
 * @param {Number} height The height of the plane
 * @param {Number} horizontalSegments The number of horizontal segments that make up the plane (default 1)
 * @param {Number} verticalSegments The number of vertical segments that make up the plane (default 1)
 */
A3.Core.Objects.Primitives.Plane = function(width, height, horizontalSegments, verticalSegments) {
	
	var vertices		    = [],
		faces             = [],
		colors            = [],
    uvs	              = [],
    faceWidth         = width,
    faceHeight        = height,
    halfWidth         = width * 0.5,
    halfHeight        = height * 0.5,
    h                 = 0,
    v	                = 0;
		
	horizontalSegments	= horizontalSegments || 1;
	verticalSegments	  = verticalSegments || 1;
	
	faceWidth			      = width / horizontalSegments;
	faceHeight			    = height / verticalSegments;
	
	function createData(h, v) {
		return compareToExisting({
			vertex: new A3.Vertex((h * faceWidth) - halfWidth, (v * faceHeight) - halfHeight, 0),
			color: new A3.V3(1.0,1.0,1.0)
		});
	}
	
	function compareToExisting(data) {
		
		var vertexPosToCompare  = null,
			  exists              = false,
			  index               = 0,
			  v                   = 0;
		
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
	
	for(h = 0; h < horizontalSegments; h++) {
		for(v = 0; v < verticalSegments; v++) {
			uvs.push(new A3.V2(h / horizontalSegments, v / verticalSegments));
			uvs.push(new A3.V2((h+1) / horizontalSegments, v / verticalSegments));
			uvs.push(new A3.V2((h+1) / horizontalSegments, (v+1) / verticalSegments));
			uvs.push(new A3.V2(h / horizontalSegments, (v+1) / verticalSegments));
			
			faces.push(
				new A3.Face4(
					createData(h,v),
					createData(h+1,v),
					createData(h+1,v+1),
					createData(h,v+1)
				)
			);
		}
	}
	
	// convert to a geometry object
	return new A3.Geometry({
		vertices: vertices,
		faces: faces,
		colors: colors,
		faceUVs: uvs,
		flatShaded: false
	});
};

A3.Core.Objects.Primitives.Plane.prototype = new A3.Core.Objects.Mesh();

// shortcut
A3.Plane = A3.Core.Objects.Primitives.Plane;
