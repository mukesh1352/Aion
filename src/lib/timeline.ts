export interface TimelineEra {
  id: string;
  label: string;
  start: number;
  end: number;
  description?: string;
}

export interface WorldTimeline {
  id: string;
  name: string;
  start: number;
  end: number;
  defaultYear: number;
  eras: TimelineEra[];
}

export const timelines = {
  india: {
    id: "india",

    name: "India",

    start: -2500,

    end: 2026,

    defaultYear: 1947,

    eras: [
      {
        id: "ancient-india",

        label: "Ancient India",

        start: -2500,

        end: -600,

        description:
          "Early civilizations, Vedic traditions and the rise of major kingdoms.",
      },

      {
        id: "classical-india",

        label: "Classical India",

        start: -600,

        end: 750,

        description:
          "The Mauryan, post-Mauryan and Gupta worlds.",
      },

      {
        id: "medieval-india",

        label: "Medieval India",

        start: 750,

        end: 1526,

        description:
          "Regional kingdoms, the Delhi Sultanate and the Vijayanagara world.",
      },

      {
        id: "early-modern-india",

        label: "Early Modern India",

        start: 1526,

        end: 1858,

        description:
          "The Mughal, Maratha and expanding European worlds.",
      },

      {
        id: "modern-india",

        label: "Modern India",

        start: 1858,

        end: 2026,

        description:
          "The British Raj, independence and modern India.",
      },
    ],
  },
} satisfies Record<
  string,
  WorldTimeline
>;

export type WorldTimelineId =
  keyof typeof timelines;


/*
 * Get the timeline for a specific world.
 */
export function getTimeline(
  worldId: string
): WorldTimeline {
  const timeline =
    timelines[
      worldId as WorldTimelineId
    ];

  if (!timeline) {
    throw new Error(
      `AION: Timeline "${worldId}" does not exist.`
    );
  }

  return timeline;
}


/*
 * Get the center year of an era.
 *
 * Example:
 *
 * -2500 → -600
 *
 * returns -1550
 */
export function getEraCenter(
  era: TimelineEra
): number {
  return (
    era.start +
    (era.end - era.start) / 2
  );
}


/*
 * Format historical years.
 */
export function formatHistoricalYear(
  year: number
): string {
  if (year < 0) {
    return `${Math.abs(year)} BCE`;
  }

  return `${year} CE`;
}