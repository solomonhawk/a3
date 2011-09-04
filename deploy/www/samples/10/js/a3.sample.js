/**
 * Copyright (C) 2011 by Paul Lewis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Smiiiile, like you meeeean iiiiit! :)
 */
var AEROTWIST       = AEROTWIST || {};
AEROTWIST.A3        = AEROTWIST.A3 || {};
AEROTWIST.A3.Sample = new function() {
  
  // internal vars
  var $container    = $('#container'),
  
      renderer      = null,
      scene         = null,
      camera        = null,
      width         = $container.width(),
      height        = $container.height(),
      aspect        = width / height,
      time          = 100,
      attractor     = null,
      callbacks     = null,
      mouseDown     = false,
      lastMouseX    = null,
      lastMouseY    = null,
      explode       = false,
      me            = this,
  
  // set some constants
      DEPTH         = 900,
      WIDTH         = $container.width(),
      HEIGHT        = $container.height(),
      ASPECT        = WIDTH / HEIGHT,
      NEAR          = 0.1,
      FAR           = 3000,
      VIEW_ANGLE    = 45,
      LORENZ        = 1;
      
  this.iterations   = 100000;
  this.a            = 5;
  this.b            = 15;
  this.c            = 1;
  this.interval     = 0.005;
  this.fn           = 1;
  
  /**
   * Initialize the scene
   */
  this.init = function() {
    
    setup();
    createObjects();
    createGUI();
    addEventListeners();
    render();
    
  };
  
  this.update = function() {
    createObjects();
  }
  
  function createGUI() {
    var gui = new DAT.GUI({height:191}),
    $gui  = $('#guidat');

    $gui.css({
      right: 'auto',
      left: 10
    });

    gui.add(AEROTWIST.A3.Sample, 'iterations').name('Iterations').min(1000).max(1000000).step(1);
    gui.add(AEROTWIST.A3.Sample, 'interval').name('Interval').min(0.001).max(0.01);
    gui.add(AEROTWIST.A3.Sample, 'a').name('Sigma').min(1).max(30).step(1);
    gui.add(AEROTWIST.A3.Sample, 'b').name('Rho').min(1).max(100).step(1);
    gui.add(AEROTWIST.A3.Sample, 'c').name('Beta').min(0.01).max(3);
    gui.add(AEROTWIST.A3.Sample, 'update').name('Go!');
  }
  
  /**
   * Sets up the scene, renderer and camera.
   */
  function setup() {
    renderer  = new A3.R(width, height, {clearColor: new A3.V4(0,0,0,1)}),
    scene     = new A3.Scene(),
    camera    = new A3.Camera(VIEW_ANGLE, aspect, NEAR, FAR);
    
    camera.position.z = DEPTH;
    
    $container.append(renderer.domElement);
    $container.bind('selectstart', false);
  }
  
  /**
   * Seriously, read the function name. Take a guess.
   */
  function createObjects() {
    
    var iterations        = me.iterations,
        vertices          = [],
        colors            = [];
    
    var x        = 0.1, y = 0.1, z = 0.1,
        a        = me.a, b = me.b, c = me.c,
        newX     = x, newY = y, newZ = z,
        interval = me.interval,
        minX     = minY = minZ = Number.POSITIVE_INFINITY,
        maxX     = maxY = maxZ = Number.NEGATIVE_INFINITY;
        
    while(iterations--) {
      
      switch(me.fn) {
      
        case LORENZ:
          newX = x - (a * x) * interval + (a * y) * interval;
          newY = y + (b * x) * interval - y * interval - (z * x) * interval;
          newZ = z - (c * z) * interval + (x * y) * interval;
          break;
        
      }
      
      minX = Math.min(minX, newX);
      minY = Math.min(minY, newY);
      minZ = Math.min(minZ, newZ);
      
      maxX = Math.max(maxX, newX);
      maxY = Math.max(maxY, newY);
      maxZ = Math.max(maxZ, newZ);
      
      vertices.push(new A3.Vertex(newX, newY, newZ - b));
      x = newX, y = newY, z = newZ;
    }
    
    var rangeX = (maxX - minX) * .45;
    var rangeY = (maxY - minY) * .5;
    var rangeZ = (maxZ - minZ);
    
    for(var v = 0; v < me.iterations; v++) {
      colors.push(
        new A3.V3(Math.pow(0.07, Math.abs(vertices[v].position.x / rangeX)) * .3,
                  Math.pow(0.003, Math.abs(vertices[v].position.y / rangeY)) * .3,
                  Math.pow(0.007, Math.abs((vertices[v].position.z - a)/ rangeZ)) * .3)
      );
    }
    
    if(!attractor) {
      attractor = new A3.Mesh({
        geometry: new A3.Geometry({
          vertices: vertices,
          colors: colors}),
        shader: A3.ShaderLibrary.get({
          type:"Particle",
          particleSize:16
        }),
        renderType: "Particle",
        depthTest: false,
        blendType: "additive"
      });
      
      scene.add(attractor);
    } else {
      
      attractor.geometry.vertices = vertices;
      attractor.geometry.colors = colors;
      
      attractor.geometry.updateVertexPositionArray();
      attractor.geometry.updateVertexColorArray();
      
      // now we have to actually get our hands dirty
      // and update the mesh's buffer size
      attractor.buffers.vertices.size = me.iterations;
      attractor.buffers.colors.size = me.iterations;
    }
    
    attractor.scale = new A3.V3(30,30,30);
  }
  
  /**
   * Sets up the event listeners so we
   * can click and drag the cube around
   */
  function addEventListeners() {
    
    /*
     * Set up the callbacks
     */
    callbacks = {
      
      /**
       * When the mouse is depressed
       */
      onMouseDown: function(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
      },
      
      /**
       * When the mouse has cheered up
       */  
      onMouseUp: function(event) {
        mouseDown = false;
      },
  
      /**
       * When the mouse gets his boogie on
       */
      onMouseMove: function(event) {
        
        if(mouseDown) {
          var thisMouseX = event.clientX;
          var thisMouseY = event.clientY;
      
          attractor.rotation.x += (thisMouseY - lastMouseY) * 0.01;
          attractor.rotation.y += (thisMouseX - lastMouseX) * 0.01;
          
          lastMouseY = thisMouseY;
          lastMouseX = thisMouseX;
        }
      },
      
      onWindowResize: function() {
        
        width         = $container.width();
        height        = $container.height();
        aspect        = width / height;
        
        renderer.resize(width, height);
        camera.projectionMatrix.perspective(VIEW_ANGLE, aspect, NEAR, FAR);
        
      }
    }

    $container.mousedown(callbacks.onMouseDown);
    $container.mouseup(callbacks.onMouseUp);
    $container.mousemove(callbacks.onMouseMove);
    $(window).resize(callbacks.onWindowResize);
    
  }
  
  /**
   * Do a render
   */
  function render() {
    
    requestAnimFrame(render);
    renderer.render(scene, camera);
  
  }
};

AEROTWIST.A3.Sample.init();
