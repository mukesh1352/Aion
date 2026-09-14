import {
  experienceCombinations,
} from "./combinations";

import type {
  HistoricalExperienceProfile,
} from "./combinations";


/* =====================================================
   FALLBACK PROFILE
   =====================================================

   Used whenever a world:era or world:era:type
   combination hasn't been taught to `combinations.ts`
   yet. This lives here (not in combinations.ts) so
   every brand-new world/era is automatically safe —
   it just looks "plain" until someone gives it a
   real historical treatment.
   ===================================================== */

const DEFAULT_EXPERIENCE: HistoricalExperienceProfile = {

  material: "paper",

  texture: "plain",

  intensity: 0.16,

  typography: "plain",

  titleMotion: "plain",

  interaction: "none",

  atmosphere: "none",

};


/* =====================================================
   LOOKUP
   =====================================================

   Resolution order:

     1. "<world>:<era>:<contentType>"   most specific
     2. "<world>:<era>"                  era fallback
     3. DEFAULT_EXPERIENCE
   ===================================================== */

function lookupExperience(
  worldId: string,
  eraId: string,
  contentType?: string,
): HistoricalExperienceProfile {

  if (contentType) {

    const specific =
      experienceCombinations[
        `${worldId}:${eraId}:${contentType}`
      ];

    if (specific) {
      return specific;
    }

  }


  const eraFallback =
    experienceCombinations[
      `${worldId}:${eraId}`
    ];

  if (eraFallback) {
    return eraFallback;
  }


  return DEFAULT_EXPERIENCE;

}


/* =====================================================
   PUBLIC API
   =====================================================

   Both names are exported because the article page and
   the background layer were written against different
   names historically. They now resolve to the exact
   same lookup, so a new world/era/content type only
   ever needs to be taught to `combinations.ts` once —
   never to either component.
   ===================================================== */

export function resolveHistoricalExperience(
  worldId: string,
  eraId: string,
  contentType?: string,
): HistoricalExperienceProfile {

  return lookupExperience(
    worldId,
    eraId,
    contentType,
  );

}


export const resolveExperience =
  resolveHistoricalExperience;


export type {
  HistoricalExperienceProfile,
};