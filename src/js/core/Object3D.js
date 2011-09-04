/**
 * @class Contains properties common to
 * all 3D objects in the engine, like the camera,
 * primitives, the scene <strong>[A3.O3D]</strong>.
 * 
 * @author Paul Lewis
 */
A3.Core.Object3D = function() {
	
	/**
	 * @description The name of the object
	 * @type String
	 */
	this.name = null;
	
	/**
	 * @description The array of the children Object3Ds
	 * 
	 * @type A3.Core.Object3D[]
	 */
	this.children = [];
	
	/**
	 * @description The reference to the parent Object3D
	 * 
	 * @type A3.Core.Object3D
	 */
	this.parent = null;
	
	/**
	 * @description The matrix of object affine transforms
	 * such as translation, rotation and scaling. These are
	 * in the object space, so around the object's origin.
	 * 
	 * @type A3.Core.Math.Matrix4
	 */
	this.matrix = new A3.Core.Math.Matrix4();
	
	/**
	 * @description The matrix that we use to
	 * position, rotate and scale the object relative to its parent,
	 * which ultimately positions the object in world space.
	 * 
	 * @type A3.Core.Math.Matrix4
	 */
	this.matrixWorld = new A3.Core.Math.Matrix4();
	
	/**
	 * @description The position that this object occupies <em>relative</em>
	 * to its parent. Ultimately the only object without a parent should be
	 * the scene itself. The object matrix's position values will be set
	 * from this vector when we update
	 * 
	 * @type A3.Core.Math.Vector3
	 */
	this.position = new A3.Core.Math.Vector3(0,0,0);
	
	/**
	 * @description The rotation that this object has. The rotations
	 * are applied to the object's matrix using Euler XYZ order.
	 * 
	 * @type A3.Core.Math.Vector3
	 */
	this.rotation = new A3.Core.Math.Vector3(0,0,0);
	
	/**
	 * @description The scale that this object has
	 * 
	 * @type A3.Core.Math.Vector3
	 */
	this.scale = new A3.Core.Math.Vector3(1,1,1);
	
	/**
	 * @description The object's up vector. Used for lookAt calculations
	 * 
	 * @type A3.Core.Math.Vector3
	 * @private
	 */
	this.up = new A3.Core.Math.Vector3(0,1,0);
	
	/**
	 * @description The target for this object, i.e. what it &quot;looks at&quot; which
	 * will be nothing by default, unless it's the basic camera.
	 * 
	 * @type A3.Core.Math.Vector3
	 */
	this.target = null;
	
	/**
	 * @description Whether or not this object is dirty. Is automatically set
	 * to true if the position, rotation or scale values have been changed. If
	 * this is true then all matrices for this object and its children will be
	 * recalculated
	 * 
	 * @type Boolean
	 */
	this.dirty = true;
	
	/**
	 * @description The object's visibility.
	 * 
	 * @type Boolean
	 */
	this.visible = true;

};

A3.Core.Object3D.prototype = {
	
	/**
	 * Adds a child to this object
	 * 
	 * @param {Object3D} child The child object to be added
	 * @throws An error if the child does not extend the Object3D prototype
	 */
	add: function(child) {
	
		if(child instanceof A3.Core.Object3D) {
			
			// if this is already the child of
			// another object we should remove
			// it first
			if(!!child.parent) {
				child.parent.remove(child);
			}
			
			// set the new parent, push it to
			// the child array and then ensure
			// that we update the render
			child.parent = this;
			this.children.push(child);
			this.dirty = true;
		} else {
			throw("Child object must have a prototype of Object3D");
		}
		
	},
	
	/**
	 * Removes a child from the array of children
	 * 
	 * @param {Object3D} child The child object to be removed
	 */
	remove: function(child) {
		var position = this.children.indexOf(child);
		
		// ooh, use of tilde
		if(~position) {
			this.children.splice(position, 1);
			this.dirty = true;
		}
	},
	
	/**
	 * Updates an object's internal matrix.
	 * 
	 * @param {Matrix4} parentMatrixWorld The world matrix of the parent object
	 * @param {Boolean} parentIsDirty Whether or not the parent's dirty flag is set
	 */
	update: function(parentMatrixWorld, parentIsDirty) {
		
		var childCount		= this.children.length;
		
		// if the dirty value has already been
		// set, the parent is dirty or any of
		// the vectors have changed this is dirty
		this.dirty		= parentIsDirty           ||
						        this.dirty              || 
						        this.position.isDirty() || 
						        this.rotation.isDirty() || 
						        this.scale.isDirty();
						
		// if it has changed in any way we
		// need to update the object's matrix
		if(this.dirty) {
			
			// reset it then we update it with the
			// specifics of our object
			this.matrix.identity();
			this.matrix.setTranslationFromVector(this.position);
			
			if(!this.target) {
				this.matrix.setRotationFromVector(this.rotation);
			} else {
				// TODO This assumes they're both in the same coordinate space - need to fix
				this.matrix.lookAt(this.position, this.target, this.up);	
			}
			
			this.matrix.scaleByVector(this.scale);
		
			/**
			 * if no parent world matrix
			 * exists, i.e. this is the root
			 * then create one and set it to the
			 * identity matrix
			 */
			if(!parentMatrixWorld) {
				this.matrixWorld.copy(this.matrix);
			} else {
				// copies the parent's world matrix
				this.matrixWorld.copy(parentMatrixWorld);
				
				// multiply the world matrix with the object matrix
				this.matrixWorld.multiply(this.matrix);
			}
			
			/**
			 * If this Object3D has a normals matrix
			 * then we calculate that here
			 * 
			 * @see http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/
			 */
			if(!!this.matrixNormals) {
				this.matrixNormals
					.copyMatrix4(this.matrixWorld)
					.invert()
					.transpose();
			}
		
			/**
			 * If this Object3D has an inverse matrix
			 * property, like the camera does, calculate it
			 */
			if(!!this.inverseMatrix) {
				// start with the world matrix
				// and then invert it
				this.inverseMatrix.copy(this.matrixWorld);
				this.inverseMatrix.invert();
			}
		}
			
		// pass through to the children
		while(childCount--) {
			this.children[childCount].update(this.matrixWorld, this.dirty);
		}
		
		// reset the dirty values to false
		this.position.resetDirty();
		this.rotation.resetDirty();
		this.scale.resetDirty();
		this.dirty = false;
	},
	
	/**
	 * Modifies the object's matrix to look at the vector passed in
	 * 
	 * @param {Vector3} vector The position to look at
	 */
	lookAt: function(vector) {
		this.target = vector;
	}
};

// shortcut
A3.O3D = A3.Core.Object3D;
