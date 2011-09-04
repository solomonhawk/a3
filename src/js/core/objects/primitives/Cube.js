/**
 * @class Represents a cube primitive
 * 
 * @augments A3.Core.Object3D
 * @author Paul Lewis
 * 
 * @param {Number} size The size of the cube in all three dimensions
 */
A3.Core.Objects.Primitives.Cube = function(size) {

	size *= 0.5;
	
	var vertices  = null,
		faces       = null,
		colors      = [],
		c           = 0,
		
		fBL	= new A3.Vertex(-size, -size,  size), // 0
		fBR	= new A3.Vertex( size, -size,  size), // 1
		fTR	= new A3.Vertex( size,  size,  size), // 2
		fTL	= new A3.Vertex(-size,  size,  size), // 3
		
		bBR	= new A3.Vertex( size, -size, -size), // 4
		bBL	= new A3.Vertex(-size, -size, -size), // 5
		bTL	= new A3.Vertex(-size,  size, -size), // 6
		bTR	= new A3.Vertex( size,  size, -size); // 7
		
	vertices = [
		fBL,							fBR,							fTR,							fTL,
		bBR,							bBL,							bTL,							bTR,
		(new A3.Vertex()).copy(bBL),	(new A3.Vertex()).copy(fBL),	(new A3.Vertex()).copy(fTL),	(new A3.Vertex()).copy(bTL),
		(new A3.Vertex()).copy(fBR),	(new A3.Vertex()).copy(bBR),	(new A3.Vertex()).copy(bTR),	(new A3.Vertex()).copy(fTR),
		(new A3.Vertex()).copy(fTR),	(new A3.Vertex()).copy(bTR),	(new A3.Vertex()).copy(bTL),	(new A3.Vertex()).copy(fTL),
		(new A3.Vertex()).copy(fBR),	(new A3.Vertex()).copy(fBL),	(new A3.Vertex()).copy(bBL),	(new A3.Vertex()).copy(bBR)
	];
	
	faces = [
		// front
		new A3.Face4(0, 1, 2, 3),
		
		// back
		new A3.Face4(4, 5, 6, 7),
		
		// left
		new A3.Face4(8, 9, 10,11),
		
		// right
		new A3.Face4(12,13,14,15),
		
		// top
		new A3.Face4(16,17,18,19),
		
		// bottom
		new A3.Face4(20,21,22,23)
	];
	
	for(c = 0; c < vertices.length; c++) {
	  colors.push(new A3.V3(1,1,1));
	}
	
	// convert to a geometry object
	return new A3.Geometry({
	  vertices: vertices,
	  faces: faces,
	  colors: colors});
};

A3.Core.Objects.Primitives.Cube.prototype = new A3.Core.Objects.Mesh();

// shortcut
A3.Cube = A3.Core.Objects.Primitives.Cube;
