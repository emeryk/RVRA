var canvas, context, imageData, imageDst;

var renderer;

var Menu = function() {
  this.threshold = false;
  this.target = [0, 0, 0];
  this.tolerance = 15;
};

var menu, stats;

function init() {

  canvas = document.getElementById("canvas");
  canvas.width = parseInt(canvas.style.width);
  canvas.height = parseInt(canvas.style.height);

  context = canvas.getContext("2d");

  imageDst = new ImageData( canvas.width, canvas.height)

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(canvas.width, canvas.height);
  renderer.setClearColor(0xffffff, 1);
  document.getElementById("container").appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5);
  scene.add(camera);
  texture = createTexture();
  scene.add(texture);

  // GUI
  menu = new Menu();
  var gui = new dat.GUI();
  gui.add(menu, 'threshold');
  gui.addColor(menu, 'target').listen();
  gui.add(menu, 'tolerance').min(0).max(255).listen();

  // stats
  stats = new Stats();
  document.getElementById("container").appendChild( stats.dom );

  animate();
}

function createTexture() {
  var texture = new THREE.Texture(imageDst),
      object = new THREE.Object3D(),
      geometry = new THREE.PlaneGeometry(1.0, 1.0, 0.0),
      material = new THREE.MeshBasicMaterial( {map: texture, depthTest: false, depthWrite: false} ),
      mesh = new THREE.Mesh(geometry, material);

  texture.minFilter = THREE.NearestFilter;

  object.position.z = -1;

  object.add(mesh);

  return object;
}

function animate() {

  requestAnimationFrame( animate );

  if (video.readyState === video.HAVE_ENOUGH_DATA){
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    var tmp = new CV.Image(canvas.width, canvas.height)

    if(menu.threshold){
      //CV.grayscale(imageData, imageDst);

      var color;
      var seuil = new CV.Image(canvas.width, canvas.height);

      for (var i = 0; i < imageData.data.length; i+=4)
      {
        if (Math.abs(imageData.data[i] - menu.target[0] <= menu.tolerance) && Math.abs(imageData.data[i+1] - menu.target[1] <= menu.tolerance) && Math.abs(imageData.data[i+2] - menu.target[2] <= menu.tolerance))
          color = 255;
        else
          color = 0;

        seuil.data[i] = color;
        imageDst.data[i] = color;
        imageDst.data[i+1] = color;
        imageDst.data[i+2] = color;
      }

      contours = CV.findContours(imageData, seuil);

      for (var i = 0; i < contours.length; i++)
      {
        var maxX = 0;
        var maxY = 0;
        var minX = canvas.width;
        var minY = canvas.height;

        for (var j = 0; j < contours[i].length; j++)
        {
          if (contours[i][j].x < minX)
            minX = contours[i][j].x;
          if (contours[i][j].x > maxX)
            maxX = contours[i][j].x;
          if (contours[i][j].y < minY)
            minY = contours[i][j].y;
          if (contours[i][j].y > maxY)
            maxY = contours[i][j].y;
        }

        radius = Math.sqrt((minX - maxX) * (minX - maxX) + (minY - maxY) * (minY - maxY));

        centerX = Math.floor((maxX - minX) / 2);
        centerY = Math.floor((maxY - minY) / 2);

        var contex = canvas.getContext("2d");
        contex.beginPath();
        contex.strokeStyle = "#FF0000";
        contex.arc(centerX, centerY, radius, 0, 1.5 * Math.PI);
        contex.stroke();
      }

    }


    else
      imageDst.data.set(imageData.data);

    texture.children[0].material.map.needsUpdate = true;
    render();
  }
}

function render() {

  renderer.clear();
  renderer.render(scene, camera);

  stats.update();

}
