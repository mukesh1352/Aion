import {
  getCollection,
  type CollectionEntry,
} from "astro:content";

export type HistoricalContent =
  CollectionEntry<"historicalContent">;

export async function getHistoricalContent(): Promise<
  HistoricalContent[]
> {
  return getCollection("historicalContent");
}

export async function getWorldContent(
  worldId: string
): Promise<HistoricalContent[]> {
  const content =
    await getHistoricalContent();

  return content.filter(
    (item: HistoricalContent) =>
      item.data.world === worldId
  );
}

export async function getEraContent(
  worldId: string,
  eraId: string
): Promise<HistoricalContent[]> {
  const content =
    await getHistoricalContent();

  return content.filter(
    (item: HistoricalContent) =>
      item.data.world === worldId &&
      item.data.era === eraId
  );
}

export async function getContentByType(
  worldId: string,
  eraId: string,
  type: HistoricalContent["data"]["type"]
): Promise<HistoricalContent[]> {
  const content =
    await getEraContent(
      worldId,
      eraId
    );

  return content.filter(
    (item: HistoricalContent) =>
      item.data.type === type
  );
}