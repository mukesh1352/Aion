import type { CollectionEntry } from "astro:content";

export type HistoricalEntity =
  CollectionEntry<"historicalContent">;

export interface EntityIndexEntry {
  id: string;
  title: string;
  type: HistoricalEntity["data"]["type"];
  slug: string;
  aliases: string[];
  exists: boolean;
}

/**
 * The AION entity index.
 *
 * byName:
 *   Used when detecting entity mentions in Markdown.
 *
 * byId:
 *   Used when resolving a detected reference to an entity.
 */
export interface EntityIndex {
  byName: Map<string, EntityIndexEntry>;
  byId: Map<string, EntityIndexEntry>;
}

/**
 * Normalize text before comparing entity names.
 */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build the AION entity index from the historical
 * content collection.
 */
export function buildEntityIndex(
  entries: HistoricalEntity[],
): EntityIndex {
  const byName = new Map<string, EntityIndexEntry>();
  const byId = new Map<string, EntityIndexEntry>();

  for (const entry of entries) {
    const aliases = entry.data.aliases ?? [];

    const entity: EntityIndexEntry = {
      /*
       * The frontmatter ID is the stable AION entity ID.
       */
      id: entry.data.id,

      title: entry.data.title,

      type: entry.data.type,

      /*
       * IMPORTANT:
       *
       * entry.id is the canonical Astro collection path.
       *
       * Example:
       *
       * entry.data.id
       *   → "taxila"
       *
       * entry.id
       *   → "ancient-india/places/taxila"
       *
       * Therefore the generated URL becomes:
       *
       * /india/ancient-india/places/taxila
       */
      slug: entry.id,

      aliases,

      exists: true,
    };

    /*
     * Store the canonical entity by ID.
     *
     * O(1) lookup.
     */
    byId.set(entity.id, entity);

    /*
     * Store the canonical title for name-based detection.
     */
    const normalizedTitle = normalize(entity.title);

    if (
      normalizedTitle &&
      !byName.has(normalizedTitle)
    ) {
      byName.set(
        normalizedTitle,
        entity,
      );
    }

    /*
     * Store aliases for automatic entity detection.
     */
    for (const alias of aliases) {
      const normalizedAlias =
        normalize(alias);

      if (!normalizedAlias) {
        continue;
      }

      /*
       * Do not overwrite an existing entity.
       *
       * If two entities have the same alias,
       * the first indexed entity wins for now.
       *
       * A proper ambiguity-resolution system
       * can be added later.
       */
      if (!byName.has(normalizedAlias)) {
        byName.set(
          normalizedAlias,
          entity,
        );
      }
    }
  }

  return {
    byName,
    byId,
  };
}

/**
 * Find an entity using its canonical title or alias.
 */
export function findEntity(
  value: string,
  index: EntityIndex,
): EntityIndexEntry | undefined {
  return index.byName.get(
    normalize(value),
  );
}