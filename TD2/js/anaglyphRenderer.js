function AnaglyphRenderer ( renderer ) {

  // left and right cameras
  this.cameraLeft  = new THREE.Camera();
  this.cameraLeft.matrixAutoUpdate = false;
  this.cameraRight = new THREE.Camera();
  this.cameraRight.matrixAutoUpdate = false;


	this.update = function ( camera ) {

    this.cameraRight.matrixWorld = camera.matrixWorld.clone();
    this.cameraLeft.matrixWorld = camera.matrixWorld.clone();

    var d = displayParameters.distanceScreenViewer;
    var w = displayParameters.screenSize().x;
    var h = displayParameters.screenSize().y;
    var ipd = displayParameters.ipd;

    var top = camera.near * (h / (2.0 * d));
    var bot = - top;

    var left1 = camera.near * ((w + ipd) / (2.0 * d));
    var left2 = - camera.near * ((w - ipd) / (2.0 * d));

    var translateLeft = new THREE.Matrix4();
    translateLeft.makeTranslation(- ipd / 2.0, 0, 0);
    this.cameraLeft.matrixWorld.multiplyMatrices(this.cameraLeft.matrixWorld, translateLeft);
    this.cameraLeft.projectionMatrix.makePerspective(left2, left1, top, bot, camera.near, camera.far);

    var translateRight = new THREE.Matrix4();
    translateRight.makeTranslation(ipd / 2.0, 0, 0);
    this.cameraRight.matrixWorld.multiplyMatrices(this.cameraRight.matrixWorld, translateRight);
    this.cameraRight.projectionMatrix.makePerspective(-left1, -left2, top, bot, camera.near, camera.far);
  }

  this.cameraMode = "anaglyphe";
  //this.cameraMode = "left";
  //this.cameraMode = "right";

  this.render = function ( scene, camera ) {

    this.update(camera);

    switch (this.cameraMode) {

      case 'anaglyphe':
        var gl = renderer.domElement.getContext('webgl');
        renderer.clearDepth();
        gl.colorMask(true, false, false, true);
        renderer.render(scene, this.cameraLeft);

        renderer.clearDepth();
        gl.colorMask(false, true, true, true);
        renderer.render(scene, this.cameraRight);

        gl.colorMask(true, true, true, true);
        break;

      case 'left':
        renderer.render(scene, this.cameraLeft);
        break;

      case 'right':
        renderer.render(scene, this.cameraRight);
        break;

      default:
        break;
    }
  }

}
