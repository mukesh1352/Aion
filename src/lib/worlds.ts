export interface HistoricalWorld {
  id: string;

  name: string;

  latitude: number;

  longitude: number;

  description: string;

  path: string;
}

export const historicalWorlds: HistoricalWorld[] = [

  {
    id: "india",

    name: "India",

    latitude: 22.5,

    longitude: 79,

    description:
      "Explore the civilizations, history, mythology, epics, people, places and stories of India.",

    path: "/india",
  },

  {
    id: "egypt",

    name: "Egypt",

    latitude: 26.8,

    longitude: 30.8,

    description:
      "Explore the civilizations, history, mythology and stories of Egypt.",

    path: "/egypt",
  },

  {
    id: "greece",

    name: "Greece",

    latitude: 39,

    longitude: 22,

    description:
      "Explore the history, mythology and civilizations of Greece.",

    path: "/greece",
  },

  {
    id: "mesopotamia",

    name: "Mesopotamia",

    latitude: 33,

    longitude: 44,

    description:
      "Explore the civilizations and stories of ancient Mesopotamia.",

    path: "/mesopotamia",
  },

  {
    id: "china",

    name: "China",

    latitude: 35,

    longitude: 103,

    description:
      "Explore the history and civilizations of China.",

    path: "/china",
  },

];