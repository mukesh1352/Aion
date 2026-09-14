import { animate } from "animejs";
import * as THREE from "three";

import {
  getTimeline,
  type TimelineEra,
} from "../../lib/timeline";

type AtmosphereState =
  | "ancient-india"
  | "classical-india"
  | "medieval-india"
  | "early-modern-india"
  | "modern-india";

interface TimelineChangeDetail {
  worldId: string;
  eraId: string;
  era: TimelineEra;
  year: number;
}

export class IndiaAtmosphere {
  private root: HTMLElement;
  private threeContainer: HTMLElement;

  private states: Map<
    AtmosphereState,
    HTMLElement
  > = new Map();

  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;

  private particles: THREE.Points<
    THREE.BufferGeometry,
    THREE.PointsMaterial
  >;

  private animationFrame = 0;

  private width = 1;
  private height = 1;

  private currentState: AtmosphereState =
    "ancient-india";

  private destroyed = false;

  constructor(root: HTMLElement) {
    this.root = root;

    /*
     * ==================================================
     * ROOT LAYER
     * ==================================================
     *
     * IndiaAtmosphere is an overlay only.
     *
     * It must NEVER paint the page background.
     *
     * HistoricalMaterial owns the actual material:
     * parchment / stone / paper / archival.
     */

    this.root.style.position = "fixed";
    this.root.style.inset = "0";
    this.root.style.pointerEvents = "none";
    this.root.style.background = "transparent";

    /*
     * Keep atmosphere above HistoricalMaterial
     * but below the actual historical content.
     */

    this.root.style.zIndex = "1";

    /*
     * ==================================================
     * ATMOSPHERE STATES
     * ==================================================
     */

    const stateElements =
      root.querySelectorAll<HTMLElement>(
        "[data-atmosphere-state]",
      );

    stateElements.forEach((element) => {
      const state =
        element.dataset.atmosphereState;

      if (!this.isAtmosphereState(state)) {
        return;
      }

      /*
       * Atmosphere states are overlays.
       * They must never create an opaque page background.
       */

      element.style.pointerEvents = "none";

      this.states.set(
        state,
        element,
      );
    });

    /*
     * ==================================================
     * THREE.JS CONTAINER
     * ==================================================
     */

    const threeContainer =
      root.querySelector<HTMLElement>(
        "[data-india-atmosphere-three]",
      );

    if (!threeContainer) {
      throw new Error(
        "AION: India atmosphere Three.js container not found.",
      );
    }

    this.threeContainer =
      threeContainer;

    /*
     * The Three.js layer is transparent and
     * positioned inside the atmosphere overlay.
     */

    this.threeContainer.style.position =
      "absolute";

    this.threeContainer.style.inset =
      "0";

    this.threeContainer.style.pointerEvents =
      "none";

    this.threeContainer.style.background =
      "transparent";

    /*
     * ==================================================
     * SIZE
     * ==================================================
     */

    this.width =
      threeContainer.clientWidth ||
      window.innerWidth;

    this.height =
      threeContainer.clientHeight ||
      window.innerHeight;

    /*
     * ==================================================
     * THREE.JS SCENE
     * ==================================================
     */

    this.scene =
      new THREE.Scene();

    this.camera =
      new THREE.OrthographicCamera(
        -this.width / 2,
        this.width / 2,
        this.height / 2,
        -this.height / 2,
        0.1,
        100,
      );

    this.camera.position.z = 10;

    /*
     * ==================================================
     * RENDERER
     * ==================================================
     */

    this.renderer =
      new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference:
          "high-performance",
      });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2,
      ),
    );

    this.renderer.setSize(
      this.width,
      this.height,
    );

    /*
     * Absolutely transparent.
     *
     * This is critical.
     */

    this.renderer.setClearColor(
      0x000000,
      0,
    );

    this.renderer.domElement.style.position =
      "absolute";

    this.renderer.domElement.style.inset =
      "0";

    this.renderer.domElement.style.width =
      "100%";

    this.renderer.domElement.style.height =
      "100%";

    this.renderer.domElement.style.pointerEvents =
      "none";

    this.renderer.domElement.style.background =
      "transparent";

    this.threeContainer.appendChild(
      this.renderer.domElement,
    );

    /*
     * ==================================================
     * PARTICLES
     * ==================================================
     */

    this.particles =
      this.createParticles();

    this.scene.add(
      this.particles,
    );

    /*
     * ==================================================
     * INITIAL SIZE
     * ==================================================
     */

    this.resize();

    window.addEventListener(
      "resize",
      this.resize,
    );

    /*
     * ==================================================
     * INITIAL ATMOSPHERE
     * ==================================================
     */

    this.initializeState();

    /*
     * ==================================================
     * TIMELINE
     * ==================================================
     */

    document.addEventListener(
      "aion:timeline-change",
      this.handleTimelineChange,
    );

    /*
     * ==================================================
     * RENDER LOOP
     * ==================================================
     */

    this.animate();
  }

  /*
   * ==================================================
   * TYPE GUARD
   * ==================================================
   */

  private isAtmosphereState(
    value: string | undefined,
  ): value is AtmosphereState {
    return (
      value === "ancient-india" ||
      value === "classical-india" ||
      value === "medieval-india" ||
      value === "early-modern-india" ||
      value === "modern-india"
    );
  }

  /*
   * ==================================================
   * INITIAL STATE
   * ==================================================
   */

  private initializeState(): void {
    const timelineRoot =
      document.querySelector<HTMLElement>(
        "[data-historical-timeline]",
      );

    if (!timelineRoot) {
      this.setState(
        "ancient-india",
        false,
      );

      return;
    }

    const worldId =
      timelineRoot.dataset.worldId;

    if (!worldId) {
      this.setState(
        "ancient-india",
        false,
      );

      return;
    }

    const timeline =
      getTimeline(worldId);

    /*
     * Prefer the timeline's current year.
     * Fall back to its configured default year.
     */

    const yearValue =
      timelineRoot.dataset.year ??
      timelineRoot.dataset.defaultYear;

    const currentYear =
      Number(yearValue);

    if (
      !Number.isFinite(
        currentYear,
      )
    ) {
      this.setState(
        "ancient-india",
        false,
      );

      return;
    }

    const era =
      timeline.eras.find(
        (item) =>
          currentYear >= item.start &&
          currentYear <= item.end,
      );

    if (era) {
      this.setState(
        this.eraToState(era),
        false,
      );

      return;
    }

    this.setState(
      "ancient-india",
      false,
    );
  }

  /*
   * ==================================================
   * TIMELINE EVENT
   * ==================================================
   */

  private handleTimelineChange = (
    event: Event,
  ): void => {
    const customEvent =
      event as CustomEvent<TimelineChangeDetail>;

    const era =
      customEvent.detail?.era;

    if (!era) {
      return;
    }

    const state =
      this.eraToState(era);

    this.setState(
      state,
      true,
    );
  };

  /*
   * ==================================================
   * ERA → ATMOSPHERE
   * ==================================================
   */

  private eraToState(
    era: TimelineEra,
  ): AtmosphereState {
    switch (era.id) {
      case "ancient-india":
        return "ancient-india";

      case "classical-india":
        return "classical-india";

      case "medieval-india":
        return "medieval-india";

      case "early-modern-india":
        return "early-modern-india";

      case "modern-india":
        return "modern-india";

      default:
        return "ancient-india";
    }
  }

  /*
   * ==================================================
   * CHANGE ATMOSPHERE
   * ==================================================
   */

  private setState(
    state: AtmosphereState,
    transition: boolean,
  ): void {
    const next =
      this.states.get(state);

    if (!next) {
      console.warn(
        `AION: Atmosphere state "${state}" was not found.`,
      );

      return;
    }

    const previous =
      this.states.get(
        this.currentState,
      );

    if (
      state === this.currentState &&
      transition
    ) {
      return;
    }

    /*
     * ==================================================
     * INITIAL STATE
     * ==================================================
     */

    if (!transition) {
      this.states.forEach(
        (element) => {
          element.style.opacity =
            element === next
              ? "1"
              : "0";
        },
      );

      this.currentState =
        state;

      return;
    }

    /*
     * ==================================================
     * CANCEL PREVIOUS ANIMATIONS
     * ==================================================
     *
     * Prevent multiple timeline changes from
     * stacking animations on the same elements.
     */

    this.states.forEach(
      (element) => {
        element.getAnimations().forEach(
          (animation) =>
            animation.cancel(),
        );
      },
    );

    /*
     * ==================================================
     * CROSSFADE
     * ==================================================
     */

    next.style.opacity = "0";

    this.currentState =
      state;

    animate(next, {
      opacity: [0, 1],
      duration: 1200,
      ease: "inOut(2)",
    });

    if (
      previous &&
      previous !== next
    ) {
      animate(previous, {
        opacity: [1, 0],
        duration: 1200,
        ease: "inOut(2)",
      });
    }

    /*
     * ==================================================
     * HAZE
     * ==================================================
     */

    const haze =
      this.root.querySelector<HTMLElement>(
        "[data-atmosphere-haze]",
      );

    if (haze) {
      animate(haze, {
        opacity: [
          0.20,
          0.42,
          0.30,
        ],
        duration: 1400,
        ease: "inOut(2)",
      });
    }
  }

  /*
   * ==================================================
   * THREE.JS PARTICLES
   * ==================================================
   */

  private createParticles(): THREE.Points<
    THREE.BufferGeometry,
    THREE.PointsMaterial
  > {
    const count = 420;

    const geometry =
      new THREE.BufferGeometry();

    const positions =
      new Float32Array(
        count * 3,
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const i3 =
        i * 3;

      positions[i3] =
        (Math.random() - 0.5) *
        this.width;

      positions[i3 + 1] =
        (Math.random() - 0.5) *
        this.height;

      positions[i3 + 2] =
        (Math.random() - 0.5) *
        8;
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    );

    const material =
      new THREE.PointsMaterial({
        color: 0xc8a15a,

        transparent: true,

        /*
         * Keep this subtle.
         */

        opacity: 0.14,

        size: 1.25,

        sizeAttenuation: false,

        depthWrite: false,

        blending:
          THREE.AdditiveBlending,
      });

    return new THREE.Points(
      geometry,
      material,
    );
  }

  /*
   * ==================================================
   * RESIZE
   * ==================================================
   */

  private resize = (): void => {
    if (this.destroyed) {
      return;
    }

    this.width =
      this.threeContainer.clientWidth ||
      window.innerWidth;

    this.height =
      this.threeContainer.clientHeight ||
      window.innerHeight;

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
      this.height,
    );
  };

  /*
   * ==================================================
   * RENDER LOOP
   * ==================================================
   */

  private animate = (): void => {
    if (this.destroyed) {
      return;
    }

    this.animationFrame =
      requestAnimationFrame(
        this.animate,
      );

    const positionAttribute =
      this.particles.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;

    const positions =
      positionAttribute.array as Float32Array;

    for (
      let i = 0;
      i < positions.length;
      i += 3
    ) {
      /*
       * Horizontal drift.
       */

      positions[i] += 0.007;

      /*
       * Vertical drift.
       */

      positions[i + 1] += 0.002;

      /*
       * Horizontal wrap.
       */

      if (
        positions[i] >
        this.width / 2
      ) {
        positions[i] =
          -this.width / 2;
      }

      /*
       * Vertical wrap.
       */

      if (
        positions[i + 1] >
        this.height / 2
      ) {
        positions[i + 1] =
          -this.height / 2;
      }
    }

    positionAttribute.needsUpdate =
      true;

    /*
     * Almost imperceptible movement.
     */

    this.particles.rotation.z +=
      0.00002;

    this.renderer.render(
      this.scene,
      this.camera,
    );
  };

  /*
   * ==================================================
   * DESTROY
   * ==================================================
   */

  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    cancelAnimationFrame(
      this.animationFrame,
    );

    window.removeEventListener(
      "resize",
      this.resize,
    );

    document.removeEventListener(
      "aion:timeline-change",
      this.handleTimelineChange,
    );

    /*
     * Dispose geometry.
     */

    this.particles.geometry.dispose();

    /*
     * Dispose material.
     */

    this.particles.material.dispose();

    /*
     * Dispose renderer.
     */

    this.renderer.dispose();

    this.renderer.forceContextLoss();

    /*
     * Remove canvas.
     */

    this.renderer.domElement.remove();
  }
}