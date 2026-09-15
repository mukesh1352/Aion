import type {
  EntityIndex,
  EntityIndexEntry,
} from "./entities";

export interface EntityReference {
  entityId: string;
  mention: string;
  start: number;
  end: number;
  resolved: boolean;
}

interface EntityMatch {
  entity: EntityIndexEntry;
  mention: string;
}

/* =========================================================
   NORMALIZATION
   ========================================================= */

function normalizeMention(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}


/* =========================================================
   REGEX ESCAPING
   ========================================================= */

function escapeRegExp(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}


/* =========================================================
   MARKDOWN PROTECTION
   =========================================================

   We don't want automatic entity detection inside:

   - fenced code blocks
   - inline code
   - Markdown URLs
   - image URLs
   - HTML tags

   The visible Markdown text itself remains searchable.
   ========================================================= */

function buildProtectedRanges(
  text: string,
): Array<{
  start: number;
  end: number;
}> {
  const ranges: Array<{
    start: number;
    end: number;
  }> = [];


  /* -------------------------------------------------------
     FENCED CODE BLOCKS
     ------------------------------------------------------- */

  const fencedCodePattern =
    /```[\s\S]*?```|~~~[\s\S]*?~~~/g;

  let match: RegExpExecArray | null;

  while (
    (match =
      fencedCodePattern.exec(text)) !== null
  ) {
    ranges.push({
      start: match.index,
      end:
        match.index +
        match[0].length,
    });
  }


  /* -------------------------------------------------------
     INLINE CODE
     ------------------------------------------------------- */

  const inlineCodePattern =
    /`[^`\n]+`/g;

  while (
    (match =
      inlineCodePattern.exec(text)) !== null
  ) {
    ranges.push({
      start: match.index,
      end:
        match.index +
        match[0].length,
    });
  }


  /* -------------------------------------------------------
     HTML TAGS
     ------------------------------------------------------- */

  const htmlPattern =
    /<[^>\n]+>/g;

  while (
    (match =
      htmlPattern.exec(text)) !== null
  ) {
    ranges.push({
      start: match.index,
      end:
        match.index +
        match[0].length,
    });
  }


  /* -------------------------------------------------------
     MARKDOWN LINK DESTINATIONS
     -------------------------------------------------------

     Example:

     [Chanakya](/india/chanakya)

     We still allow "Chanakya" to be detected,
     but don't detect entity names inside:

     /india/chanakya
     ------------------------------------------------------- */

  const linkDestinationPattern =
    /\]\((?:[^()\\]|\\.)*\)/g;

  while (
    (match =
      linkDestinationPattern.exec(text)) !== null
  ) {
    const destinationStart =
      match.index + 1;

    ranges.push({
      start: destinationStart,
      end:
        match.index +
        match[0].length,
    });
  }


  /* -------------------------------------------------------
     IMAGE DESTINATIONS
     ------------------------------------------------------- */

  const imageDestinationPattern =
    /!\[[^\]]*\]\((?:[^()\\]|\\.)*\)/g;

  while (
    (match =
      imageDestinationPattern.exec(text)) !== null
  ) {
    ranges.push({
      start: match.index,
      end:
        match.index +
        match[0].length,
    });
  }


  return mergeRanges(ranges);
}


/* =========================================================
   MERGE OVERLAPPING PROTECTED RANGES
   ========================================================= */

function mergeRanges(
  ranges: Array<{
    start: number;
    end: number;
  }>,
): Array<{
  start: number;
  end: number;
}> {
  if (ranges.length === 0) {
    return [];
  }


  const sorted =
    [...ranges].sort(
      (a, b) => {
        if (a.start !== b.start) {
          return a.start - b.start;
        }

        return a.end - b.end;
      },
    );


  const merged: Array<{
    start: number;
    end: number;
  }> = [];


  for (const range of sorted) {

    const previous =
      merged[merged.length - 1];

    if (!previous) {
      merged.push({
        ...range,
      });

      continue;
    }


    if (
      range.start <=
      previous.end
    ) {
      previous.end =
        Math.max(
          previous.end,
          range.end,
        );

      continue;
    }


    merged.push({
      ...range,
    });
  }


  return merged;
}


/* =========================================================
   RANGE CHECK
   ========================================================= */

function isInsideProtectedRange(
  start: number,
  end: number,
  ranges: Array<{
    start: number;
    end: number;
  }>,
): boolean {
  for (const range of ranges) {

    if (
      start < range.end &&
      end > range.start
    ) {
      return true;
    }

    if (
      range.start > end
    ) {
      break;
    }
  }

  return false;
}


/* =========================================================
   ENTITY DETECTION
   ========================================================= */

export function detectEntityReferences(
  text: string,
  index: EntityIndex,
): EntityReference[] {

  if (!text.trim()) {
    return [];
  }


  /* -------------------------------------------------------
     Build candidate names
     ------------------------------------------------------- */

  const candidates =
    new Map<string, EntityMatch>();


  for (
    const entity of index.byId.values()
  ) {

    const names = [
      entity.title,
      ...entity.aliases,
    ];


    for (
      const name of names
    ) {

      const mention =
        name.trim();


      if (!mention) {
        continue;
      }


      const key =
        normalizeMention(mention);


      if (!key) {
        continue;
      }


      /*
       * If two entities happen to use the same
       * title/alias, keep the first indexed entity.
       *
       * Explicit IDs remain the authoritative identity.
       */

      if (
        !candidates.has(key)
      ) {
        candidates.set(
          key,
          {
            entity,
            mention,
          },
        );
      }
    }
  }


  /* -------------------------------------------------------
     Longest names first
     -------------------------------------------------------

     This matters for cases such as:

     "Muhammad bin Tughluq"

     vs.

     "Muhammad"

     We want the more specific entity to win.
     ------------------------------------------------------- */

  const sortedCandidates =
    [...candidates.values()]
      .sort(
        (a, b) =>
          b.mention.length -
          a.mention.length,
      );


  if (
    sortedCandidates.length === 0
  ) {
    return [];
  }


  /* -------------------------------------------------------
     Markdown protection
     ------------------------------------------------------- */

  const protectedRanges =
    buildProtectedRanges(text);


  const references:
    EntityReference[] = [];


  /* -------------------------------------------------------
     Search candidates
     ------------------------------------------------------- */

  for (
    const candidate of sortedCandidates
  ) {

    const escapedMention =
      escapeRegExp(
        candidate.mention,
      );


    /*
     * Unicode-aware word boundaries.
     *
     * We don't use \b because it behaves poorly
     * with many Unicode names.
     */

    const pattern =
      new RegExp(
        `(?<![\\p{L}\\p{N}_])` +
        `${escapedMention}` +
        `(?![\\p{L}\\p{N}_])`,
        "giu",
      );


    let match:
      RegExpExecArray | null;


    while (
      (match =
        pattern.exec(text)) !== null
    ) {

      const start =
        match.index;

      const end =
        start +
        match[0].length;


      /*
       * Don't detect things inside protected
       * Markdown regions.
       */

      if (
        isInsideProtectedRange(
          start,
          end,
          protectedRanges,
        )
      ) {
        continue;
      }


      references.push({
        entityId:
          candidate.entity.id,

        mention:
          match[0],

        start,

        end,

        resolved:
          candidate.entity.exists,
      });
    }
  }


  return removeOverlappingReferences(
    references,
  );
}


/* =========================================================
   OVERLAPPING REFERENCES
   =========================================================

   Example:

   "Muhammad bin Tughluq"

   Candidate 1:
     Muhammad bin Tughluq

   Candidate 2:
     Muhammad

   Candidate 1 wins because it is longer.
   ========================================================= */

function removeOverlappingReferences(
  references: EntityReference[],
): EntityReference[] {

  const sorted =
    [...references].sort(
      (a, b) => {

        if (
          a.start !== b.start
        ) {
          return (
            a.start -
            b.start
          );
        }


        const aLength =
          a.end - a.start;

        const bLength =
          b.end - b.start;


        return (
          bLength -
          aLength
        );
      },
    );


  const result:
    EntityReference[] = [];


  let lastEnd = -1;


  for (
    const reference of sorted
  ) {

    if (
      reference.start <
      lastEnd
    ) {
      continue;
    }


    result.push(
      reference,
    );

    lastEnd =
      reference.end;
  }


  return result.sort(
    (a, b) =>
      a.start -
      b.start,
  );
}