export type HistoricalMaterial =
  | "stone"
  | "paper"
  | "parchment"
  | "clay"
  | "scroll"
  | "archival";


export type HistoricalTypography =
  | "inscription"
  | "manuscript"
  | "historical-display"
  | "archival"
  | "plain";


export type HistoricalTitleMotion =
  | "engrave"
  | "ink"
  | "dust"
  | "print"
  | "plain";


export type HistoricalInteraction =
  | "relief"
  | "ink"
  | "paper"
  | "none";


export type HistoricalAtmosphere =
  | "mineral"
  | "paper"
  | "dust"
  | "archive"
  | "none";


export interface HistoricalExperienceProfile {

  material: HistoricalMaterial;

  texture: string;

  intensity: number;

  typography: HistoricalTypography;

  titleMotion: HistoricalTitleMotion;

  interaction: HistoricalInteraction;

  atmosphere: HistoricalAtmosphere;

}


/* =====================================================
   HOW TO ADD A NEW ERA / CONTENT TYPE
   =====================================================

   Keys are resolved by the resolver in this order:

     "<world>:<era>:<contentType>"   (most specific)
     "<world>:<era>"                 (era fallback)

   So to add a brand-new era, you only need ONE new
   fallback entry (the "world:era" key). Content-type
   overrides (":person", ":manuscript", ":artifact", etc.)
   are optional refinements on top of that — the
   components themselves never need to change.
   ===================================================== */

export const experienceCombinations:
  Record<
    string,
    HistoricalExperienceProfile
  > = {


  /* =====================================================
     ANCIENT INDIA
     Indus Valley Civilization / early Vedic period —
     baked clay seals, terracotta, half-buried inscriptions.
     ===================================================== */

  "india:ancient-india:artifact": {

    material: "clay",

    texture: "seal-impression",

    intensity: 0.34,

    typography: "inscription",

    titleMotion: "dust",

    interaction: "relief",

    atmosphere: "dust",

  },


  "india:ancient-india:person": {

    material: "clay",

    texture: "seal-impression",

    intensity: 0.32,

    typography: "inscription",

    titleMotion: "dust",

    interaction: "relief",

    atmosphere: "dust",

  },


  /*
   * Ancient India fallback.
   */

  "india:ancient-india": {

    material: "clay",

    texture: "seal-impression",

    intensity: 0.28,

    typography: "inscription",

    titleMotion: "dust",

    interaction: "relief",

    atmosphere: "dust",

  },


  /* =====================================================
     CLASSICAL INDIA
     ===================================================== */

  "india:classical-india:person": {

    material: "stone",

    texture: "inscription",

    intensity: 0.35,

    typography: "inscription",

    titleMotion: "engrave",

    interaction: "relief",

    atmosphere: "mineral",

  },


  /*
   * Palm-leaf / ola manuscripts belonging to the
   * classical period (Sanskrit sutras, treatises) —
   * distinct enough from stone inscriptions that
   * they get their own material.
   */

  "india:classical-india:manuscript": {

    material: "scroll",

    texture: "palm-leaf",

    intensity: 0.26,

    typography: "manuscript",

    titleMotion: "ink",

    interaction: "ink",

    atmosphere: "paper",

  },


  /*
   * Classical India fallback.
   *
   * Used by events, places, stories, facts, etc.
   * when a more specific combination does not exist.
   */

  "india:classical-india": {

    material: "stone",

    texture: "inscription",

    intensity: 0.30,

    typography: "inscription",

    titleMotion: "engrave",

    interaction: "relief",

    atmosphere: "mineral",

  },


  /* =====================================================
     MEDIEVAL INDIA
     ===================================================== */

  "india:medieval-india:person": {

    material: "parchment",

    texture: "manuscript",

    intensity: 0.30,

    typography: "manuscript",

    titleMotion: "ink",

    interaction: "ink",

    atmosphere: "dust",

  },


  /*
   * Medieval scrolls (court chronicles, farmans) —
   * rolled documents rather than bound parchment.
   */

  "india:medieval-india:manuscript": {

    material: "scroll",

    texture: "palm-leaf",

    intensity: 0.28,

    typography: "manuscript",

    titleMotion: "ink",

    interaction: "ink",

    atmosphere: "dust",

  },


  /*
   * Medieval India fallback.
   */

  "india:medieval-india": {

    material: "parchment",

    texture: "manuscript",

    intensity: 0.26,

    typography: "manuscript",

    titleMotion: "ink",

    interaction: "ink",

    atmosphere: "dust",

  },


  /* =====================================================
     EARLY MODERN INDIA
     ===================================================== */

  "india:early-modern-india:person": {

    material: "paper",

    texture: "manuscript",

    intensity: 0.25,

    typography: "historical-display",

    titleMotion: "ink",

    interaction: "paper",

    atmosphere: "paper",

  },


  /*
   * Early Modern India fallback.
   */

  "india:early-modern-india": {

    material: "paper",

    texture: "manuscript",

    intensity: 0.22,

    typography: "historical-display",

    titleMotion: "ink",

    interaction: "paper",

    atmosphere: "paper",

  },


  /* =====================================================
     MODERN / INDEPENDENCE INDIA
     ===================================================== */

  "india:modern-india:person": {

    material: "archival",

    texture: "document",

    intensity: 0.28,

    typography: "archival",

    titleMotion: "print",

    interaction: "paper",

    atmosphere: "archive",

  },


  /*
   * Modern India fallback.
   */

  "india:modern-india": {

    material: "archival",

    texture: "document",

    intensity: 0.22,

    typography: "archival",

    titleMotion: "print",

    interaction: "paper",

    atmosphere: "archive",

  },

};