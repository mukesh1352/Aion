import type {
  TransitionDestination,
} from "./transition-types";


let engineModulePromise:
  Promise<
    typeof import("./TransitionEngine")
  > | null = null;


function loadEngine() {

  if (!engineModulePromise) {

    engineModulePromise =
      import("./TransitionEngine");
  }

  return engineModulePromise;
}


// ============================================================
// CREATE TRANSITION DOM
// ============================================================

function createTransitionLayer() {

  const existing =
    document.getElementById(
      "aion-transition"
    );

  if (existing) {
    return existing;
  }


  const layer =
    document.createElement(
      "div"
    );


  layer.id =
    "aion-transition";

  layer.className =
    "aion-transition";

  layer.setAttribute(
    "aria-hidden",
    "true"
  );


  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.id =
    "aion-transition-canvas";


  const grain =
    document.createElement(
      "div"
    );


  grain.className =
    "aion-transition-grain";


  layer.appendChild(canvas);

  layer.appendChild(grain);

  document.body.appendChild(
    layer
  );


  return layer;
}


// ============================================================
// PRELOAD
// ============================================================

export function preloadTransition(): void {

  void loadEngine();
}


// ============================================================
// RUN TRANSITION
// ============================================================

export async function runTransition(
  destination: TransitionDestination
): Promise<void> {

  const { TransitionEngine } =
    await loadEngine();


  const layer =
    createTransitionLayer();


  const canvas =
    layer.querySelector(
      "#aion-transition-canvas"
    );


  if (
    !(canvas instanceof
      HTMLCanvasElement)
  ) {

    throw new Error(
      "AION transition canvas could not be created."
    );
  }


  const engine =
    new TransitionEngine(
      canvas,
      layer
    );


  engine.enter(
    destination
  );
}


// ============================================================
// DESTINATION REVEAL
// ============================================================

export async function initializeTransition(): Promise<void> {

  if (
    !sessionStorage.getItem(
      "aion-transition"
    )
  ) {
    return;
  }


  const { TransitionEngine } =
    await loadEngine();


  const layer =
    createTransitionLayer();


  const canvas =
    layer.querySelector(
      "#aion-transition-canvas"
    );


  if (
    !(canvas instanceof
      HTMLCanvasElement)
  ) {

    throw new Error(
      "AION transition canvas could not be created."
    );
  }


  const engine =
    new TransitionEngine(
      canvas,
      layer
    );


  engine.initialize();
}