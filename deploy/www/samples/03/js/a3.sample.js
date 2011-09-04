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
      floorTexture  = null,
      callbacks     = null,
      mouseDown     = false,
      lastMouseX    = null,
      lastMouseY    = null,
      phase         = 0,
  
  // set some constants
      RADIUS        = 400,
      DEPTH         = 1200,
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
    renderer  = new A3.R(width, height),
    scene     = new A3.Scene(),
    camera    = new A3.Camera(VIEW_ANGLE, aspect, NEAR, FAR);
    
    camera.position.z = DEPTH;
    camera.position.y = 200;
    
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
    
        floorTexture      = new A3.Texture("../textures/floor.png", 1),
        
        angle             = Math.PI / 3;
        
        // balls
        ballBasic         = new A3.Mesh({
                                  geometry: new A3.Sphere(100, 20, 20),
                                  shader: A3.ShaderLibrary.get({type:"Basic"})
                                }),
        ballNormals       = new A3.Mesh({
                                  geometry: new A3.Sphere(100, 20, 20),
                                  shader: A3.ShaderLibrary.get({type:"Normals"})
                                }),
        ballLambert       = new A3.Mesh({
                                  geometry: new A3.Sphere(100, 20, 20),
                                  shader: A3.ShaderLibrary.get({
                                    type: "Lambert",
                                    texture: new A3.Texture("../textures/earth.jpg")
                                  })
                                }),
        ballPhong         = new A3.Mesh({
                                  geometry: new A3.Sphere(100, 20, 20),
                                  shader: A3.ShaderLibrary.get({
                                    type: "Phong"
                                  })
                                }),
        ballPhongEnv      = new A3.Mesh({
                                  geometry: new A3.Sphere(100, 20, 20),
                                  shader: A3.ShaderLibrary.get({
                                    type: "Phong",
                                    environmentMap: new A3.EnvironmentMap({
                                      px: "../environments/interstellar/pos-x.jpg",
                                      nx: "../environments/interstellar/neg-x.jpg",
                                      py: "../environments/interstellar/pos-y.jpg",
                                      ny: "../environments/interstellar/neg-y.jpg",
                                      pz: "../environments/interstellar/pos-z.jpg",
                                      nz: "../environments/interstellar/neg-z.jpg"
                                    }, 0)
                                  })
                                }),
        ballParticles     = new A3.Mesh({
                                  geometry: new A3.Sphere(100, 20, 20),
                                  shader: A3.ShaderLibrary.get({
                                    type: "Particle",
                                    texture: new A3.Texture("../textures/particle.png"),
                                    particleSize: 64
                                  }),
                                  transparent: true,
                                  renderType: "particle"
                                }),
        floorBasic        = new A3.Mesh({
                                  geometry: new A3.Plane(400,400),
                                  transparent: true,
                                  shader: A3.ShaderLibrary.get({type:"Basic", texture:floorTexture})
                                }),
        floorNormals      = new A3.Mesh({
                                  geometry: new A3.Plane(400,400),
                                  transparent: true,
                                  shader: A3.ShaderLibrary.get({type:"Basic", texture:floorTexture})
                                }),
        floorLambert      = new A3.Mesh({
                                  geometry: new A3.Plane(400,400),
                                  transparent: true,
                                  shader: A3.ShaderLibrary.get({type:"Basic", texture:floorTexture})
                                }),
        floorPhong        = new A3.Mesh({
                                  geometry: new A3.Plane(400,400),
                                  transparent: true,
                                  shader: A3.ShaderLibrary.get({type:"Basic", texture:floorTexture})
                                }),
        floorPhongEnv     = new A3.Mesh({
                                  geometry: new A3.Plane(400,400),
                                  transparent: true,
                                  shader: A3.ShaderLibrary.get({type:"Basic", texture:floorTexture})
                                }),
        floorParticles    = new A3.Mesh({
                                  geometry: new A3.Plane(400,400),
                                  transparent: true,
                                  shader: A3.ShaderLibrary.get({type:"Basic", texture:floorTexture})
                                });
    
    directionalLight.position   = new A3.V3(100, 100, 130);
    directionalLight2.position  = new A3.V3(-45, -30, 10);
    
    ballBasic.position.x = floorBasic.position.x = Math.cos(0 * angle) * RADIUS;
    ballBasic.position.z      = floorBasic.position.z = Math.sin(0 * angle) * RADIUS;
    ballNormals.position.x    = floorNormals.position.x = Math.cos(1 * angle) * RADIUS;
    ballNormals.position.z    = floorNormals.position.z = Math.sin(1 * angle) * RADIUS;
    ballLambert.position.x    = floorLambert.position.x = Math.cos(2 * angle) * RADIUS;
    ballLambert.position.z    = floorLambert.position.z = Math.sin(2 * angle) * RADIUS;
    ballPhong.position.x      = floorPhong.position.x = Math.cos(3 * angle) * RADIUS;
    ballPhong.position.z      = floorPhong.position.z = Math.sin(3 * angle) * RADIUS;
    ballParticles.position.x  = floorParticles.position.x = Math.cos(4 * angle) * RADIUS;
    ballParticles.position.z  = floorParticles.position.z = Math.sin(4 * angle) * RADIUS;
    ballPhongEnv.position.x   = floorPhongEnv.position.x = Math.cos(5 * angle) * RADIUS;
    ballPhongEnv.position.z   = floorPhongEnv.position.z = Math.sin(5 * angle) * RADIUS;
    
    floorBasic.position.y     = floorNormals.position.y = floorLambert.position.y = 
    floorPhong.position.y     = floorPhongEnv.position.y = floorParticles.position.y = -110;
    
    floorBasic.rotation.x     = floorNormals.rotation.x = floorLambert.rotation.x = 
    floorPhong.rotation.x     = floorPhongEnv.rotation.x = floorParticles.rotation.x = -Math.PI * .5;
    
    scene.add(ballBasic);
    scene.add(floorBasic);
    scene.add(ballNormals);
    scene.add(floorNormals);
    scene.add(ballLambert);
    scene.add(floorLambert);
    scene.add(ballPhong);
    scene.add(floorPhong);
    scene.add(ballPhongEnv);
    scene.add(floorPhongEnv);
    scene.add(ballParticles);
    scene.add(floorParticles);
    
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
           
      onWindowResize: function() {
        
        width         = $container.width();
        height        = $container.height();
        aspect        = width / height;
        
        renderer.resize(width, height);
        camera.projectionMatrix.perspective(VIEW_ANGLE, aspect, NEAR, FAR);
        
      }
    }

    $(window).resize(callbacks.onWindowResize);
    
  }
  
  /**
   * Do a render
   */
  function render() {
    
    requestAnimFrame(render);
    
    camera.position.x = Math.sin(phase) * DEPTH;
    camera.position.z = Math.cos(phase) * DEPTH;
    
    phase += 0.01;
    
    renderer.render(scene, camera);
  
  }
};

AEROTWIST.A3.Sample.init();
