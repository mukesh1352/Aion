// src/lib/transition/transition-types.ts

export type TransitionType =
  | "world"
  | "regional"
  | "historical";

export interface TransitionDestination {
  path: string;

  type?: TransitionType;

  longitude?: number;

  latitude?: number;

  zoom?: number;
}