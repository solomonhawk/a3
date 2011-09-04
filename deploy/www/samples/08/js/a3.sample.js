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
  var $container            = $('#container'),
  
      renderer              = null,
      scene                 = null,
      camera                = null,
      width                 = $container.width(),
      height                = $container.height(),
      aspect                = width / height,
      head                  = null,
      floor                 = null,
      environmentMap        = null,
      environmentMapLoaded  = false,
      modelLoaded           = false,
      
      callbacks             = null,
      mouseDown             = false,
      lastMouseX            = null,
      lastMouseY            = null,
      angle                 = 0,
  
  // set some constants
      RADIUS                = 200,
      SCALE                 = 550,
      DEPTH                 = 500,
      WIDTH                 = $container.width(),
      HEIGHT                = $container.height(),
      ASPECT                = WIDTH / HEIGHT,
      NEAR                  = 0.1,
      FAR                   = 3000,
      VIEW_ANGLE            = 45;
  
  function checkForLoad() {
    
    if(environmentMapLoaded && modelLoaded) {
      
      $("#loading").addClass('hidden');
          
      // wait for the loading message to hide :)
      setTimeout(function() {
        
        $("#loading").hide();
        
        addEventListeners();
        render();
      }, 500);
    }
  }
  
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
        
        setup();
        createObjects(geometry);
        
        modelLoaded = true;
        checkForLoad();
    });
    
    loader.load();
    
    environmentMap = new A3.EnvironmentMap({
      px: "../environments/miramar/pos-x.jpg",
      nx: "../environments/miramar/neg-x.jpg",
      py: "../environments/miramar/pos-y.jpg",
      ny: "../environments/miramar/neg-y.jpg",
      pz: "../environments/miramar/pos-z.jpg",
      nz: "../environments/miramar/neg-z.jpg",
      callback: function() {
        environmentMapLoaded = true;
        checkForLoad();
      }
    }, 0);
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
    
    var ambientLight      = new A3.AmbientLight(new A3.V3(1,1,1), 0.04),
        directionalLight  = new A3.DirectionalLight(new A3.V3(1,1,1), 1),
        directionalLight2 = new A3.DirectionalLight(new A3.V3(1,1,1), 0.4);
    
    directionalLight.position   = new A3.V3(100, 100, 130);
    directionalLight2.position  = new A3.V3(-45, -30, 10);
    
    head = new A3.Mesh({
      geometry: headGeometry,
      shader: A3.ShaderLibrary.get({
        type:"Phong",
        specularShininess: 10,
        specularReflection: 0.1,
        environmentMap: environmentMap
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
    
    head.position.y   = -40;
    head.rotation.y   = -0.4;
    
    floor.scale       = new A3.V3(1.3,1.3,1.3);
    floor.rotation.x  = -Math.PI * .5;
    floor.position.y  = -120;
    
    scene.add(head);
    scene.add(floor);
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
    
    renderer.render(scene, camera);
  
  }
};

AEROTWIST.A3.Sample.init();
