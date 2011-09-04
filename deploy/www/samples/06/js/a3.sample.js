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
      world         = null,
      callbacks     = null,
      mouseDown     = false,
      lastMouseX    = null,
      lastMouseY    = null,
      explode       = false,
  
  // set some constants
      DEPTH         = 500,
      WIDTH         = $container.width(),
      HEIGHT        = $container.height(),
      ASPECT        = WIDTH / HEIGHT,
      NEAR          = 0.1,
      FAR           = 3000,
      VIEW_ANGLE    = 45;
  
  /**
   * Initialize the scene
   */
  this.init = function() {
    
    setup();
    createObjects();
    addEventListeners();
    render();
    
  };
  
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
    
    var ambientLight      = new A3.AmbientLight(new A3.V3(1,1,1), 0.04),
        directionalLight  = new A3.DirectionalLight(new A3.V3(1,1,1), 1),
        directionalLight2 = new A3.DirectionalLight(new A3.V3(1,1,1), 0.4),
        sphereGeom        = new A3.Sphere(150, 40, 40);
    
    directionalLight.position   = new A3.V3(100, 100, 130);
    directionalLight2.position  = new A3.V3(-45, -30, 10);
        
    world = new A3.Mesh({
      geometry: sphereGeom,
      shader: A3.ShaderLibrary.get({
        type:"Particle",
        particleSize:32,
        texture: new A3.Texture("../textures/particle.png")
      }),
      renderType: "Particle",
      depthTest: false,
      blendType: "additive"
    });
    
    // update the sphere colours
    for(var c = 0; c < sphereGeom.vertices.length; c++) {
      sphereGeom.vertices[c].originalPosition  = sphereGeom.vertices[c].position;
      sphereGeom.vertices[c].randFactor        = 0.5 + Math.random();
      sphereGeom.vertices[c].targetPosition    = new A3.V3(0,0,0);
      sphereGeom.vertices[c].targetPosition.x  = Math.sin(c) * (c%2==0 ? -.5 : .5) * (2 + c * 2);
      sphereGeom.vertices[c].targetPosition.y  = Math.cos(c) * (c%2==0 ? -.5 : .5) * (2 + c * 2);
      sphereGeom.vertices[c].targetPosition.z  = Math.sin(c) * Math.cos(c) * (c%2==0 ? -.5 : .5) * (2 + c * 2);
    }
    
    world.position.y = 20;
    
    scene.add(world);
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(directionalLight2);
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
      
          world.rotation.x += (thisMouseY - lastMouseY) * 0.01;
          world.rotation.y += (thisMouseX - lastMouseX) * 0.01;
          
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
    
    for(var c = 0; c < world.geometry.vertices.length; c++) {
      var vertex = world.geometry.vertices[c];
      if(explode) {
        vertex.position.x += (vertex.targetPosition.x - vertex.position.x) * .05 * vertex.randFactor;
        vertex.position.y += (vertex.targetPosition.y - vertex.position.y) * .07 * vertex.randFactor;
        vertex.position.z += (vertex.targetPosition.z - vertex.position.z) * .09 * vertex.randFactor;
      } else {
        vertex.position.x -= (vertex.position.x) * .35 * vertex.randFactor;
        vertex.position.y -= (vertex.position.y) * .39 * vertex.randFactor;
        vertex.position.z -= (vertex.position.z) * .32 * vertex.randFactor;
      }
    }
    
    time++;
    if(time % 130 === 0) {
      explode = !explode;
    }
    
    world.geometry.updateVertexPositionArray();
    
    requestAnimFrame(render);
    renderer.render(scene, camera);
  
  }
};

AEROTWIST.A3.Sample.init();
