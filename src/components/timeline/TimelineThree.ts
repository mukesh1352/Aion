import * as THREE from "three";

export class TimelineThree {
  private container: HTMLElement;

  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  private orb: THREE.Mesh;
  private ring: THREE.Mesh;

  private animationFrame = 0;

  private width = 1;
  private height = 1;

  private targetProgress = 0.5;
  private currentProgress = 0.5;

  constructor(container: HTMLElement) {
    this.container = container;

    this.width =
      container.clientWidth || 1000;

    this.height =
      container.clientHeight || 200;

    this.scene = new THREE.Scene();

    this.camera =
      new THREE.OrthographicCamera(
        -this.width / 2,
        this.width / 2,
        this.height / 2,
        -this.height / 2,
        0.1,
        100
      );

    this.camera.position.z = 10;

    this.renderer =
      new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    this.renderer.setSize(
      this.width,
      this.height
    );

    this.renderer.setClearColor(
      0x000000,
      0
    );

    container.appendChild(
      this.renderer.domElement
    );

    this.orb = this.createOrb();
    this.ring = this.createRing();

    this.scene.add(this.orb);
    this.scene.add(this.ring);

    this.resize();

    window.addEventListener(
      "resize",
      this.resize
    );

    this.animate();
  }

  private createOrb() {
    const geometry =
      new THREE.SphereGeometry(
        6,
        32,
        32
      );

    const material =
      new THREE.MeshBasicMaterial({
        color: 0xc8a15a,
        transparent: true,
        opacity: 0.95,
      });

    return new THREE.Mesh(
      geometry,
      material
    );
  }

  private createRing() {
    const geometry =
      new THREE.TorusGeometry(
        13,
        1,
        8,
        64
      );

    const material =
      new THREE.MeshBasicMaterial({
        color: 0xc8a15a,
        transparent: true,
        opacity: 0.3,
      });

    return new THREE.Mesh(
      geometry,
      material
    );
  }

  public setProgress(
    progress: number,
    immediate = false
  ) {
    this.targetProgress =
      Math.max(
        0,
        Math.min(1, progress)
      );

    if (immediate) {
      this.currentProgress =
        this.targetProgress;

      this.updatePosition();
    }
  }

  private updatePosition() {
    const x =
      -this.width / 2 +
      this.currentProgress *
        this.width;

    this.orb.position.x = x;
    this.ring.position.x = x;
  }

  private resize = () => {
    this.width =
      this.container.clientWidth ||
      1000;

    this.height =
      this.container.clientHeight ||
      200;

    this.camera.left =
      -this.width / 2;

    this.camera.right =
      this.width / 2;

    this.camera.top =
      this.height / 2;

    this.camera.bottom =
      -this.height / 2;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      this.width,
      this.height
    );

    this.updatePosition();
  };

  private animate = () => {
    this.animationFrame =
      requestAnimationFrame(
        this.animate
      );

    /*
     * Smoothly follow the pointer.
     */
    this.currentProgress +=
      (
        this.targetProgress -
        this.currentProgress
      ) * 0.14;

    this.updatePosition();

    this.ring.rotation.z +=
      0.003;

    this.ring.rotation.x +=
      0.0015;

    this.renderer.render(
      this.scene,
      this.camera
    );
  };

  public destroy() {
    cancelAnimationFrame(
      this.animationFrame
    );

    window.removeEventListener(
      "resize",
      this.resize
    );

    this.orb.geometry.dispose();

    (
      this.orb.material as THREE.Material
    ).dispose();

    this.ring.geometry.dispose();

    (
      this.ring.material as THREE.Material
    ).dispose();

    this.renderer.dispose();

    this.renderer.domElement.remove();
  }
}