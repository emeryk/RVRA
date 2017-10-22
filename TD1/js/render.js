var container, stats, scene, camera, renderer, geometry, material, mesh, controls, camera2, scene2, zoomP, zoomM;
var materials = [];
var pickingTexture, pickingMaterial, pickingGeometry, sp, obj, id;
var pickingData = [];

function init() {

  // RENDERER
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.autoClear = false;

  // SCENE
  scene = new THREE.Scene();
  scene2 = new THREE.Scene();

  //BUFFER
  pickingMaterial = new THREE.MeshBasicMaterial({vertexColors : THREE.FaceColors});
  pickingTexture = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  function applyFaceColor( geom, color ) {
     geom.faces.forEach( function( f ) {
         f.color.setHex(color);
        } );
  }

  //CAMERA
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2100);
  camera.position.set(0, 0, 1500);
  scene.add(camera);

  //CAMERA2
  camera2 = new THREE.OrthographicCamera( window.innerWidth / 2, - window.innerWidth / 2, window.innerHeight / 2, - window.innerHeight / 2 );
  camera2.position.set(0, 0, 10);
  scene2.add(camera2);

  //LINES
  var materialLine = new THREE.LineBasicMaterial({color : 0xffffff});
  var geometryLine = new THREE.Geometry();
  geometryLine.vertices.push(new THREE.Vector3(-20, 0, 0));
  geometryLine.vertices.push(new THREE.Vector3(20, 0, 0));
  geometryLine.vertices.push(new THREE.Vector3(0, 0, 0));
  geometryLine.vertices.push(new THREE.Vector3(0, 20, 0));
  geometryLine.vertices.push(new THREE.Vector3(0, -20, 0));
  var line = new THREE.Line(geometryLine, materialLine);
  scene2.add(line);

  //TEXTURES
  var t1 = new THREE.TextureLoader().load('textures/tnt1.png');
  var t2 = new THREE.TextureLoader().load('textures/tnt2.png');
  var tsand = new THREE.TextureLoader().load('textures/sand.png');
  var tstone1 = new THREE.TextureLoader().load('textures/stonebrick.png');
  var tstone2 = new THREE.TextureLoader().load('textures/stonebrick_mossy.png');

  //MATERIAL
  materials.push(new THREE.MeshBasicMaterial({map : t1}));
  materials.push(new THREE.MeshBasicMaterial({map : t1}));
  materials.push(new THREE.MeshBasicMaterial({map : t2}));
  materials.push(new THREE.MeshBasicMaterial({map : t2}));
  materials.push(new THREE.MeshBasicMaterial({map : t1}));
  materials.push(new THREE.MeshBasicMaterial({map : t1}));

  //CUBE
  geometry = new THREE.CubeGeometry(100, 100, 100);

  var color = new THREE.Color();

  //material = new THREE.MeshBasicMaterial( {map: t1});

  //material = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
  //mesh = new THREE.Mesh(geometry, material);

  mesh = new THREE.Mesh(geometry, materials);
  mesh.position.z = 200;
  applyFaceColor(geometry, mesh.id);
  scene.add(mesh);


  //CUBE SAND
  for (var i = - 3; i <= 3; i++)
  {
    for (var y = 0; y < 5; y++)
    {
      geometry = new THREE.CubeGeometry(100, 100, 100);
      material = new THREE.MeshBasicMaterial({map : tsand});

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = i * 100;
      mesh.position.y = - 200;
      mesh.position.z = y * 100;

      applyFaceColor(geometry, mesh.id);
      scene.add(mesh);
    }
  }

  //CUBE STONE
  for (var i = - 3; i <= 3; i++)
  {
    for (var y = 0; y < 5; y++)
    {
      geometry = new THREE.CubeGeometry(100, 100, 100);
      var rand = Math.floor(Math.random() * 2) + 1; //Random 1 - 2
      if (rand == 1) {
        material = new THREE.MeshBasicMaterial({map : tstone1});
      }
      else {
        material = new THREE.MeshBasicMaterial({map : tstone2});
      }

      mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = i * 100;
      mesh.position.y = - 100;
      mesh.position.z = y * 100;

      applyFaceColor(geometry, mesh.id);
      scene.add(mesh);
    }
  }

  //CONTROLS
  /*controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rorateSpeed = 2.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  controls.noZoom = false;
  controls.noPan = false;*/

  controls = new THREE.PointerLockControls(camera);
  controls.enabled = true;
  scene.add(controls.getObject());

  //EVENT
  var onKeyDown = function(event) {
    switch(event.keyCode) {
      case 40 :
        moveBackward = true;
        break;
      case 39 :
        moveRight = true;
        break;
      case 38 :
        moveForward = true;
        break;
      case 37 :
        moveLeft = true;
        break;
      case 107 : //+
        zoomP = true;
        break;
      case 109 : //-
        zoomM = true;
        break;
      case 32 :
        sp = true;
        break;
    }
  };

  var onKeyUp = function(event) {
    switch(event.keyCode) {
      case 40 :
        moveBackward = false;
        break;
      case 39 :
        moveRight = false;
        break;
      case 38 :
        moveForward = false;
        break;
      case 37 :
        moveLeft = false;
        break;
      case 107 :
        zoomP = false;
        break;
      case 109 :
        zoomM = false;
        break;
      case 32 :
        sp = false;
        break;
    }
  };

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', onKeyUp, false);

  //
  container = document.createElement( 'div' );
  document.body.appendChild( container );

  // stats

  stats = new Stats();
  container.appendChild( stats.dom );

}

var pick = function (event) {
  scene.overrideMaterial = pickingMaterial;
  renderer.render(scene, camera, pickingTexture);
  var pixelBuffer = new Uint8Array(4);
  renderer.readRenderTargetPixels(pickingTexture, innerWidth / 2, innerHeight / 2, 1, 1, pixelBuffer);
  id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
  obj = scene.getObjectById(id);
  console.log(id);
  scene.remove(obj);
  scene.overrideMaterial = null;
}

document.addEventListener('click', pick);

function animate() {

  requestAnimationFrame(animate);

  if (moveForward)
    controls.getObject().translateY(-5);
	if (moveBackward)
    controls.getObject().translateY(5);
	if (moveLeft)
    controls.getObject().translateX(-5);
	if (moveRight)
    controls.getObject().translateX(5);
  if (zoomP)
    controls.getObject().translateZ(-5);
  if (zoomM)
    controls.getObject().translateZ(5);
  if (sp){
    if(scene.overrideMaterial == null)
      scene.overrideMaterial = pickingMaterial;
    else
      scene.overrideMaterial = null;
  }

  //controls.update();
  //mesh.rotation.x += 0.01;
  //mesh.rotation.y += 0.01;
  renderer.clear();
  renderer.render(scene, camera);
  renderer.clearDepth();
  renderer.render(scene2, camera2);

  stats.update();


}
