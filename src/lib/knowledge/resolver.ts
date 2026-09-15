import type { EntityIndex } from "./entities";
import type { EntityReference } from "./references";

export interface ResolvedReference {
  entityId: string;
  title: string;
  type: "overview" | "person" | "event" | "place" | "story" | "fact";
  mention: string;
  href: string | null;
  resolved: boolean;
}

export function resolveReferences(
  references: EntityReference[],
  index: EntityIndex,
): ResolvedReference[] {
  return references.map((reference) => {
    const entity =
      index.byId.get(reference.entityId);

    /*
     * The entity was detected in the content,
     * but could not be resolved in the index.
     */
    if (!entity) {
      return {
        entityId: reference.entityId,
        title: reference.mention,
        type: "fact",
        mention: reference.mention,
        href: null,
        resolved: false,
      };
    }

    return {
      entityId: entity.id,
      title: entity.title,
      type: entity.type,
      mention: reference.mention,
      href: `/india/${entity.slug}`,
      resolved: entity.exists,
    };
  });
}