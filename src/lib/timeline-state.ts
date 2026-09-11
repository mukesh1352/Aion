const STORAGE_PREFIX = "aion:timeline:";

export function getStoredEra(
  worldId: string
): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(
      `${STORAGE_PREFIX}${worldId}`
    );
  } catch {
    return null;
  }
}

export function setStoredEra(
  worldId: string,
  eraId: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${worldId}`,
      eraId
    );
  } catch {
    // Ignore storage failures.
  }
}