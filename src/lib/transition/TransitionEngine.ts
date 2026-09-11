import * as THREE from "three";

import {
  transitionVertexShader,
  transitionFragmentShader,
} from "./transition-shader";

import type {
  TransitionDestination,
} from "./transition-types";


const TRANSITION_STORAGE_KEY =
  "aion-transition";

const ENTER_DURATION = 1900;
const REVEAL_DURATION = 1900;


interface TransitionState {
  path: string;
  type?: TransitionDestination["type"];
  longitude?: number;
  latitude?: number;
  zoom?: number;
}


export class TransitionEngine {

  private canvas: HTMLCanvasElement;
  private layer: HTMLElement;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  private camera:
    THREE.OrthographicCamera;

  private material:
    THREE.ShaderMaterial;

  private mesh: THREE.Mesh;

  private animationFrame:
    number | null = null;

  private startTime = 0;

  private fromProgress = 0;
  private toProgress = 0;

  private duration = 0;

  private running = false;


  constructor(
    canvas: HTMLCanvasElement,
    layer: HTMLElement
  ) {

    this.canvas = canvas;
    this.layer = layer;


    // ==========================================================
    // RENDERER
    // ==========================================================

    this.renderer =
      new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference:
          "high-performance",
      });


    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        1
      )
    );


    this.renderer.setClearColor(
      0x000000,
      0
    );


    // ==========================================================
    // SCENE
    // ==========================================================

    this.scene =
      new THREE.Scene();


    // ==========================================================
    // CAMERA
    // ==========================================================

    this.camera =
      new THREE.OrthographicCamera(
        -1,
        1,
        1,
        -1,
        0,
        1
      );


    // ==========================================================
    // MATERIAL
    // ==========================================================

    this.material =
      new THREE.ShaderMaterial({

        vertexShader:
          transitionVertexShader,

        fragmentShader:
          transitionFragmentShader,

        transparent: true,

        depthWrite: false,

        uniforms: {

          uTime: {
            value: 0,
          },

          uProgress: {
            value: 0,
          },

          uOpacity: {
            value: 1,
          },

          uResolution: {
            value:
              new THREE.Vector2(
                window.innerWidth,
                window.innerHeight
              ),
          },

          uSeed: {
            value:
              Math.random() * 100,
          },
        },
      });


    // ==========================================================
    // FULLSCREEN PLANE
    // ==========================================================

    const geometry =
      new THREE.PlaneGeometry(
        2,
        2
      );


    this.mesh =
      new THREE.Mesh(
        geometry,
        this.material
      );


    this.scene.add(
      this.mesh
    );


    // ==========================================================
    // RESIZE
    // ==========================================================

    this.resize();

    window.addEventListener(
      "resize",
      this.resize
    );
  }


  // ============================================================
  // INITIALIZE DESTINATION REVEAL
  // ============================================================

  initialize(): void {

    const stored =
      sessionStorage.getItem(
        TRANSITION_STORAGE_KEY
      );


    /*
     * Nothing to reveal.
     *
     * This is a completely normal page load.
     */
    if (!stored) {
      return;
    }


    let state:
      TransitionState;


    try {

      state =
        JSON.parse(
          stored
        ) as TransitionState;

    } catch {

      sessionStorage.removeItem(
        TRANSITION_STORAGE_KEY
      );

      return;
    }


    /*
     * Remove immediately.
     *
     * Refreshing the page must NOT replay
     * the transition.
     */
    sessionStorage.removeItem(
      TRANSITION_STORAGE_KEY
    );


    console.log(
      "[AION] Revealing:",
      state.path
    );


    this.layer.classList.add(
      "is-active"
    );


    /*
     * Start completely inside the cloud.
     */
    this.setProgress(1);

    this.setOpacity(1);


    this.startAnimation(
      1,
      0,
      REVEAL_DURATION,
      () => {

        this.setProgress(0);

        this.stop();

        this.layer.classList.remove(
          "is-active"
        );

        this.destroy();
      }
    );
  }


  // ============================================================
  // ENTER TRANSITION
  // ============================================================

  enter(
    destination: TransitionDestination
  ): void {

    if (this.running) {
      return;
    }


    console.log(
      "[AION] Transition →",
      destination.path
    );


    const state:
      TransitionState = {

      path:
        destination.path,

      type:
        destination.type,

      longitude:
        destination.longitude,

      latitude:
        destination.latitude,

      zoom:
        destination.zoom,
    };


    /*
     * Store destination information so the
     * destination page knows it must reveal.
     */
    sessionStorage.setItem(
      TRANSITION_STORAGE_KEY,
      JSON.stringify(state)
    );


    this.layer.classList.add(
      "is-active"
    );


    this.setProgress(0);

    this.setOpacity(1);


    this.startAnimation(
      0,
      1,
      ENTER_DURATION,
      () => {

        window.location.assign(
          destination.path
        );
      }
    );
  }


  // ============================================================
  // ANIMATION
  // ============================================================

  private startAnimation(
    from: number,
    to: number,
    duration: number,
    onComplete: () => void
  ): void {

    this.fromProgress =
      from;

    this.toProgress =
      to;

    this.duration =
      duration;

    this.startTime =
      performance.now();

    this.running =
      true;


    this.renderLoop(
      onComplete
    );
  }


  // ============================================================
  // RENDER LOOP
  // ============================================================

  private renderLoop(
    onComplete: () => void
  ): void {

    if (
      this.animationFrame !== null
    ) {

      cancelAnimationFrame(
        this.animationFrame
      );
    }


    const render =
      (time: number) => {

        if (!this.running) {
          return;
        }


        const elapsed =
          time -
          this.startTime;


        const rawProgress =
          Math.min(
            elapsed /
              this.duration,
            1
          );


        /*
         * Quintic easing.
         */
        const eased =
          rawProgress *
          rawProgress *
          rawProgress *
          (
            rawProgress *
            (
              rawProgress *
              6 -
              15
            ) +
            10
          );


        const progress =
          THREE.MathUtils.lerp(
            this.fromProgress,
            this.toProgress,
            eased
          );


        this.material.uniforms
          .uProgress.value =
          progress;


        this.material.uniforms
          .uTime.value =
          time * 0.001;


        this.material.uniforms
          .uOpacity.value =
          1;


        this.renderer.render(
          this.scene,
          this.camera
        );


        if (
          rawProgress >= 1
        ) {

          this.running =
            false;

          this.animationFrame =
            null;


          onComplete();

          return;
        }


        this.animationFrame =
          requestAnimationFrame(
            render
          );
      };


    this.animationFrame =
      requestAnimationFrame(
        render
      );
  }


  // ============================================================
  // PROGRESS
  // ============================================================

  private setProgress(
    value: number
  ): void {

    this.material.uniforms
      .uProgress.value =
      value;
  }


  // ============================================================
  // OPACITY
  // ============================================================

  private setOpacity(
    value: number
  ): void {

    this.material.uniforms
      .uOpacity.value =
      value;
  }


  // ============================================================
  // RESIZE
  // ============================================================

  private resize =
    (): void => {

      const width =
        window.innerWidth;

      const height =
        window.innerHeight;


      this.renderer.setSize(
        width,
        height,
        false
      );


      this.material.uniforms
        .uResolution.value.set(
          width,
          height
        );
    };


  // ============================================================
  // DESTROY
  // ============================================================

  destroy(): void {

    this.running =
      false;


    if (
      this.animationFrame !== null
    ) {

      cancelAnimationFrame(
        this.animationFrame
      );

      this.animationFrame =
        null;
    }


    window.removeEventListener(
      "resize",
      this.resize
    );


    this.mesh.geometry.dispose();

    this.material.dispose();

    this.renderer.dispose();


    this.canvas.remove();

    this.layer.remove();
  }
}