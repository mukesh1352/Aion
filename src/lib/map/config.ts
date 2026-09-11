export const AION_MAP_CONFIG = {

  style:
    "https://tiles.openfreemap.org/styles/dark",

  center:
    [20, 20] as [number, number],

  zoom:
    1.25,

  minZoom:
    1.15,

  maxZoom:
    7,

  renderWorldCopies:
    false,

  attributionControl:
    false,

  dragRotate:
    false,

  pitchWithRotate:
    false,

  touchPitch:
    false,

  maxPitch:
    0,

  navigation: {

    showZoom:
      true,

    showCompass:
      false,

    visualizePitch:
      false,

  },

  scale: {

    maxWidth:
      120,

    unit:
      "metric" as const,

  },

} as const;