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
      directionalLightR   = null,
      directionalLightG   = null,
      directionalLightB   = null,
      world               = null,
      floor               = null,
      
      callbacks           = null,
      mouseDown           = false,
      lastMouseX          = null,
      lastMouseY          = null,
      angle               = 0,
  
  // set some constants
      SCALE               = 3,
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
    
    var loader = new A3.MeshLoader("../models/walt.a3", function(geometry) {
      
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
    directionalLightR = new A3.DirectionalLight(new A3.V3(1,0,0), 0.33),
    directionalLightG = new A3.DirectionalLight(new A3.V3(0,1,0), 0.33),
    directionalLightB = new A3.DirectionalLight(new A3.V3(0,0,1), 0.33);
    
    directionalLightR.position   = new A3.V3(0, 1, 0);
    directionalLightG.position  = new A3.V3(1, 0, 0);
    directionalLightB.position  = new A3.V3(0, 0, 1);
        
    head = new A3.Mesh({
      geometry: headGeometry,
      shader: A3.ShaderLibrary.get({
        type:"Phong",
        specularReflection: 0.6,
        specularShininess: 15
      })
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
    
    head.position.y   = -60;
    
    floor.scale       = new A3.V3(0.8,0.8,0.8);
    floor.rotation.x  = -Math.PI * .5;
    floor.position.y  = -120;
    
    scene.add(head);
    scene.add(floor);
    scene.add(ambientLight);
    scene.add(directionalLightR);
    scene.add(directionalLightG);
    scene.add(directionalLightB);
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
          floor.position.x = Math.sin(head.rotation.y) * -20;
          floor.position.z = Math.cos(head.rotation.y) * -20;
          
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
    
    directionalLightR.position  = new A3.V3(Math.sin(angle*2.0) * 100, Math.cos(angle*2.0) * 200, 0);
    directionalLightG.position  = new A3.V3(Math.cos(angle*1.5) * 300, Math.sin(angle*1.5) * 100, 0);
    directionalLightB.position  = new A3.V3(0,                         Math.sin(angle) * 100, Math.cos(angle) * 100);
    
    angle += 0.03;
    
    renderer.render(scene, camera);
  
  }
};

AEROTWIST.A3.Sample.init();
