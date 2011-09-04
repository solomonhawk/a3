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
 * The only way is up.
 */
var AEROTWIST       = AEROTWIST || {};
AEROTWIST.A3        = AEROTWIST.A3 || {};
AEROTWIST.A3.Sample = new function() {
  
  // internal vars
  var $container          = $('#container'),
  
      renderer            = null,
      scene               = null,
      camera              = null,
      width               = $container.width(),
      height              = $container.height(),
      aspect              = width / height,
      ambientLight        = null,
      pointLight1         = null,
      pointLight2         = null,
      pointLight3         = null,
      head                = null,
      floor               = null,
      ballPoint1          = null,
      ballPoint2          = null,
      ballPoint3          = null,
      
      callbacks           = null,
      mouseDown           = false,
      lastMouseX          = null,
      lastMouseY          = null,
      angle               = 0,
  
  // set some constants
      RADIUS              = 200,
      SCALE               = 550,
      DEPTH               = 500,
      WIDTH               = $container.width(),
      HEIGHT              = $container.height(),
      ASPECT              = WIDTH / HEIGHT,
      NEAR                = 0.1,
      FAR                 = 3000,
      VIEW_ANGLE          = 45;
  
  /**
   * Initialize the scene
   */
  this.init = function() {
    
    var loader = new A3.MeshLoader("../models/lps.a3", function(geometry) {
      
        geometry.colors = [];
        
        for(var v = 0; v < geometry.vertices.length; v++) {
          geometry.colors.push(new A3.V3(1,1,1));
          geometry.vertices[v].position.x *= SCALE;
          geometry.vertices[v].position.y *= SCALE;
          geometry.vertices[v].position.z *= SCALE;
        }
        
        geometry.updateVertexPositionArray();
        geometry.updateVertexColorArray();
        
        $("#loading").addClass('hidden');
        
        // wait for the loading message to hide :)
        setTimeout(function() {
          
          $("#loading").hide();
          
          setup();
          createObjects(geometry);
          addEventListeners();
          render();
        }, 500);
    });
    
    loader.load();
    
  };
  
  /**
   * Sets up the scene, renderer and camera.
   */
  function setup() {
    renderer  = new A3.R(width, height),
    scene     = new A3.Scene(),
    camera    = new A3.Camera(VIEW_ANGLE, aspect, NEAR, FAR);
    
    camera.position.z = DEPTH;
    
    $container.append(renderer.domElement);
    $container.bind('selectstart', false);
  }
  
  /**
   * Seriously, read the function name. Take a guess.
   */
  function createObjects(headGeometry) {
    
    ambientLight      = new A3.AmbientLight(new A3.V3(1,1,1), 0.04),
    pointLight1       = new A3.PointLight(new A3.V3(1,1,1), 1),
    pointLight2       = new A3.PointLight(new A3.V3(1,1,1), 1),
    pointLight3       = new A3.PointLight(new A3.V3(1,1,1), 1);
    
    pointLight1.fallOffDistance = pointLight2.fallOffDistance = pointLight3.fallOffDistance = 400;
        
    head = new A3.Mesh({
      geometry: headGeometry,
      shader: A3.ShaderLibrary.get({
        type:"Phong",
        specularShininess: 10,
        specularReflection: 0.1,
        texture: new A3.Texture("../textures/lps-col.jpg", 0)
      })
    });
    
    ballPoint1 = new A3.Mesh({
      geometry: new A3.Sphere(4,5,5),
      shader: A3.ShaderLibrary.get({type:"Pink"})
    });
    
    ballPoint2 = new A3.Mesh({
      geometry: new A3.Sphere(4,5,5),
      shader: A3.ShaderLibrary.get({type:"Pink"})
    });
    
    ballPoint3 = new A3.Mesh({
      geometry: new A3.Sphere(4,5,5),
      shader: A3.ShaderLibrary.get({type:"Pink"})
    });
    
    floor = new A3.Mesh({
      geometry: new A3.Plane(400,400,2,2),
      transparent: true,
      shader: A3.ShaderLibrary.get({
        name:"Floor",
        type:"Basic",
        texture: new A3.Texture("../textures/floor.png", 1)
      })
    });
    
    head.position.y   = -40;
    head.rotation.y   = -0.4;
    
    floor.scale       = new A3.V3(1.3,1.3,1.3);
    floor.rotation.x  = -Math.PI * .5;
    floor.position.y  = -120;
    
    ballPoint1.position = pointLight1.position;
    ballPoint2.position = pointLight2.position;
    ballPoint3.position = pointLight3.position;
    
    scene.add(head);
    scene.add(floor);
    scene.add(ballPoint1);
    scene.add(ballPoint2);
    scene.add(ballPoint3);
    scene.add(ambientLight);
    scene.add(pointLight1);
    scene.add(pointLight2);
    scene.add(pointLight3);
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
      
          head.rotation.y += (thisMouseX - lastMouseX) * 0.01;
          floor.position.x = Math.sin(head.rotation.y) * -10;
          floor.position.z = Math.cos(head.rotation.y) * -10;
          
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
    
    pointLight1.position  = new A3.V3(Math.sin(angle*2.0) * RADIUS, 50, Math.cos(angle*2.0) * RADIUS);
    pointLight2.position  = new A3.V3(Math.cos(angle*1.5) * RADIUS, 0, Math.sin(angle*1.5) * RADIUS);
    pointLight3.position  = new A3.V3(Math.cos(angle*1.5) * Math.sin(angle*1.5) * RADIUS, Math.sin(angle) * RADIUS, Math.cos(angle) * RADIUS);
    
    ballPoint1.position = pointLight1.position;
    ballPoint2.position = pointLight2.position;
    ballPoint3.position = pointLight3.position;
    
    ballPoint1.dirty = true;
    ballPoint2.dirty = true;
    ballPoint3.dirty = true;
    
    angle += 0.01;
    
    renderer.render(scene, camera);
  
  }
};

AEROTWIST.A3.Sample.init();
