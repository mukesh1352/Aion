import {
  Map,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
} from "maplibre-gl";

import {
  AION_MAP_CONFIG,
} from "./config";

setWorkerUrl(
  "/maplibre/maplibre-gl-worker.mjs"
);

/*
 * =========================================================
 * MAPLIBRE WORKER
 * =========================================================
 *
 * Astro / SSR setup.
 *
 * MapLibre v6 recommends resolving the worker through
 * import.meta.url for SSR frameworks such as Astro.
 */

setWorkerUrl(
  "/maplibre/maplibre-gl-worker.mjs"
);


/*
 * =========================================================
 * CREATE AION MAP
 * =========================================================
 */

export function createAionMap(
  container: HTMLElement
): Map {

  const map =
    new Map({

      container,

      style:
        AION_MAP_CONFIG.style,

      center:
        AION_MAP_CONFIG.center,

      zoom:
        AION_MAP_CONFIG.zoom,

      minZoom:
        AION_MAP_CONFIG.minZoom,

      maxZoom:
        AION_MAP_CONFIG.maxZoom,

      renderWorldCopies:
        AION_MAP_CONFIG.renderWorldCopies,

      attributionControl:
        AION_MAP_CONFIG.attributionControl,

      dragRotate:
        AION_MAP_CONFIG.dragRotate,

      pitchWithRotate:
        AION_MAP_CONFIG.pitchWithRotate,

      touchPitch:
        AION_MAP_CONFIG.touchPitch,

      maxPitch:
        AION_MAP_CONFIG.maxPitch,

    });


  /*
   * =======================================================
   * FLAT MERCATOR PROJECTION
   * =======================================================
   */

  map.on(
    "style.load",
    () => {

      map.setProjection({
        type: "mercator",
      });

    }
  );


  /*
   * =======================================================
   * NAVIGATION CONTROL
   * =======================================================
   */

  map.addControl(
    new NavigationControl(
      AION_MAP_CONFIG.navigation
    ),
    "bottom-right"
  );


  /*
   * =======================================================
   * SCALE CONTROL
   * =======================================================
   */

  map.addControl(
    new ScaleControl(
      AION_MAP_CONFIG.scale
    ),
    "bottom-left"
  );


  return map;
}


/*
 * =========================================================
 * HIDE BASEMAP LABELS
 * =========================================================
 */

export function hideMapLabels(
  map: Map
): void {

  const layers =
    map.getStyle().layers ?? [];


  for (
    const layer of layers
  ) {

    if (
      layer.type !== "symbol"
    ) {
      continue;
    }


    try {

      map.setLayoutProperty(
        layer.id,
        "visibility",
        "none"
      );

    } catch {

      /*
       * Some style layers may not support
       * changing visibility.
       */

    }

  }

}