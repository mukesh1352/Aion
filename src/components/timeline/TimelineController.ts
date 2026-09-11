import { animate } from "animejs";

import {
  getTimeline,
  formatHistoricalYear,
  getEraCenter,
  type TimelineEra,
  type WorldTimeline,
} from "../../lib/timeline";

import { TimelineThree } from "./TimelineThree";

export class TimelineController {
  private root: HTMLElement;

  private timeline: WorldTimeline;

  private three: TimelineThree;

  private yearElement: HTMLElement;

  private currentLabelElement: HTMLElement;

  private levelElement: HTMLElement;

  private nodesContainer: HTMLElement;

  private currentEra: TimelineEra | undefined;

  private selectedYear: number;

  private isDragging = false;

  private dragPointerId: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;

    const worldId =
      root.dataset.worldId;

    if (!worldId) {
      throw new Error(
        "AION: Timeline is missing worldId."
      );
    }

    this.timeline =
      getTimeline(worldId);

    this.selectedYear =
      this.timeline.defaultYear;

    const yearElement =
      root.querySelector<HTMLElement>(
        "[data-timeline-year]"
      );

    const labelElement =
      root.querySelector<HTMLElement>(
        "[data-timeline-current-label]"
      );

    const levelElement =
      root.querySelector<HTMLElement>(
        "[data-timeline-level]"
      );

    const nodesContainer =
      root.querySelector<HTMLElement>(
        ".timeline-nodes"
      );

    const threeContainer =
      root.querySelector<HTMLElement>(
        "[data-timeline-three]"
      );

    if (!yearElement) {
      throw new Error(
        "AION: Timeline year element not found."
      );
    }

    if (!labelElement) {
      throw new Error(
        "AION: Timeline label element not found."
      );
    }

    if (!levelElement) {
      throw new Error(
        "AION: Timeline level element not found."
      );
    }

    if (!nodesContainer) {
      throw new Error(
        "AION: Timeline nodes container not found."
      );
    }

    if (!threeContainer) {
      throw new Error(
        "AION: Timeline Three.js container not found."
      );
    }

    this.yearElement =
      yearElement;

    this.currentLabelElement =
      labelElement;

    this.levelElement =
      levelElement;

    this.nodesContainer =
      nodesContainer;

    this.three =
      new TimelineThree(
        threeContainer
      );

    this.render();

    this.bindEvents();

    /*
     * Initial state.
     */
    this.updateFromYear(
      this.selectedYear,
      false
    );

    /*
     * Put Three.js marker at the
     * initial year immediately.
     */
    this.three.setProgress(
      this.getYearProgress(
        this.selectedYear
      ),
      true
    );
  }

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  private render() {
    const eras =
      this.timeline.eras;

    this.levelElement.textContent =
      "ERA";

    this.nodesContainer.innerHTML =
      "";

    this.nodesContainer.style.setProperty(
      "--node-count",
      String(eras.length)
    );

    eras.forEach(
      (era, index) => {
        const element =
          this.createEraElement(
            era,
            index
          );

        this.nodesContainer.appendChild(
          element
        );
      }
    );
  }

  private createEraElement(
    era: TimelineEra,
    index: number
  ) {
    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.className =
      "timeline-node";

    button.dataset.timelineNode =
      "true";

    button.dataset.nodeId =
      era.id;

    button.dataset.year =
      String(
        getEraCenter(era)
      );

    button.style.setProperty(
      "--node-index",
      String(index)
    );

    /*
     * Point
     */
    const point =
      document.createElement(
        "span"
      );

    point.className =
      "timeline-node-point";

    /*
     * Label
     */
    const label =
      document.createElement(
        "span"
      );

    label.className =
      "timeline-node-label";

    label.textContent =
      era.label;

    /*
     * Years
     */
    const years =
      document.createElement(
        "span"
      );

    years.className =
      "timeline-node-years";

    years.textContent =
      `${formatHistoricalYear(
        era.start
      )} — ${formatHistoricalYear(
        era.end
      )}`;

    button.append(
      point,
      label,
      years
    );

    /*
     * Small entrance animation.
     */
    animate(
      button,
      {
        opacity: [0, 1],
        translateY: [10, 0],
        delay: index * 70,
        duration: 500,
        ease: "out(3)",
      }
    );

    return button;
  }

  /*
   * --------------------------------------------------
   * EVENTS
   * --------------------------------------------------
   */

  private bindEvents() {
    /*
     * Clicking an era selects that era.
     */
    this.nodesContainer.addEventListener(
      "click",
      (event) => {
        if (this.isDragging) {
          return;
        }

        const target =
          event.target as HTMLElement;

        const element =
          target.closest<HTMLElement>(
            "[data-timeline-node]"
          );

        if (!element) {
          return;
        }

        const eraId =
          element.dataset.nodeId;

        if (!eraId) {
          return;
        }

        const era =
          this.timeline.eras.find(
            (item) =>
              item.id === eraId
          );

        if (!era) {
          return;
        }

        this.selectEra(era);
      }
    );

    /*
     * Timeline dragging.
     */
    this.root.addEventListener(
      "pointerdown",
      this.handlePointerDown
    );

    window.addEventListener(
      "pointermove",
      this.handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      this.handlePointerUp
    );

    window.addEventListener(
      "pointercancel",
      this.handlePointerCancel
    );
  }

  /*
   * --------------------------------------------------
   * DRAG
   * --------------------------------------------------
   */

  private handlePointerDown = (
    event: PointerEvent
  ) => {
    const target =
      event.target as HTMLElement;

    /*
     * Clicking an era is a click,
     * not a drag.
     */
    if (
      target.closest(
        "[data-timeline-node]"
      )
    ) {
      return;
    }

    const viewport =
      target.closest(
        ".timeline-viewport"
      );

    if (!viewport) {
      return;
    }

    this.isDragging = true;

    this.dragPointerId =
      event.pointerId;

    document.body.style.cursor =
      "grabbing";

    this.updateFromPointer(
      event.clientX
    );

    event.preventDefault();
  };

  private handlePointerMove = (
    event: PointerEvent
  ) => {
    if (!this.isDragging) {
      return;
    }

    if (
      this.dragPointerId !== null &&
      event.pointerId !==
        this.dragPointerId
    ) {
      return;
    }

    this.updateFromPointer(
      event.clientX
    );
  };

  private handlePointerUp = (
    event: PointerEvent
  ) => {
    if (!this.isDragging) {
      return;
    }

    if (
      this.dragPointerId !== null &&
      event.pointerId !==
        this.dragPointerId
    ) {
      return;
    }

    this.finishDrag();
  };

  private handlePointerCancel = (
    event: PointerEvent
  ) => {
    if (!this.isDragging) {
      return;
    }

    if (
      this.dragPointerId !== null &&
      event.pointerId !==
        this.dragPointerId
    ) {
      return;
    }

    this.finishDrag();
  };

  private finishDrag() {
    this.isDragging = false;

    this.dragPointerId = null;

    document.body.style.cursor =
      "";

    /*
     * Snap to the era containing the
     * selected year.
     */
    const era =
      this.findEraAtYear(
        this.selectedYear
      );

    if (!era) {
      return;
    }

    const center =
      getEraCenter(era);

    this.selectedYear =
      center;

    this.updateFromYear(
      center,
      true
    );
  }
private updateFromPointer(
  clientX: number
) {
  const axis =
    this.root.querySelector<HTMLElement>(
      ".timeline-axis"
    );

  if (!axis) {
    return;
  }

  const rect =
    axis.getBoundingClientRect();

  if (rect.width <= 0) {
    return;
  }

  /*
   * Convert pointer position into
   * visual timeline progress.
   *
   * 0 = Ancient
   * 1 = Modern
   */
  let progress =
    (clientX - rect.left) /
    rect.width;

  progress = Math.max(
    0,
    Math.min(1, progress)
  );

  /*
   * Find the closest of the five
   * visual era positions.
   */
  const lastIndex =
    this.timeline.eras.length - 1;

  const index =
    Math.round(
      progress * lastIndex
    );

  const era =
    this.timeline.eras[index];

  if (!era) {
    return;
  }

  /*
   * The selected year is the center
   * of the selected era.
   */
  const year =
    getEraCenter(era);

  this.selectedYear =
    year;

  this.currentEra =
    era;

  /*
   * Move Three.js to the SAME visual
   * position as the selected era.
   */
  this.three.setProgress(
    lastIndex === 0
      ? 0.5
      : index / lastIndex
  );

  this.yearElement.textContent =
    formatHistoricalYear(year);

  this.currentLabelElement.textContent =
    era.label;

  this.updateActiveEra(
    era
  );

  /*
   * Don't dispatch repeatedly unless
   * the selected era actually changes.
   */
  if (
    this.currentEra?.id === era.id
  ) {
    this.dispatchTimelineEvent(
      era,
      year
    );
  }
}
  /*
   * --------------------------------------------------
   * ERA SELECTION
   * --------------------------------------------------
   */

  private selectEra(
    era: TimelineEra
  ) {
    const year =
      getEraCenter(era);

    this.selectedYear =
      year;

    this.updateFromYear(
      year,
      true
    );
  }

  /*
   * --------------------------------------------------
   * UPDATE STATE
   * --------------------------------------------------
   */

  private updateFromYear(
    year: number,
    dispatch: boolean
  ) {
    const era =
      this.findEraAtYear(
        year
      );

    this.currentEra =
      era;

    this.yearElement.textContent =
      formatHistoricalYear(
        year
      );

    this.currentLabelElement.textContent =
      era?.label ??
      this.timeline.name;

    this.updateActiveEra(
      era
    );

    this.three.setProgress(
      this.getYearProgress(
        year
      )
    );

    if (
      dispatch &&
      era
    ) {
      this.dispatchTimelineEvent(
        era,
        year
      );
    }
  }

  /*
   * --------------------------------------------------
   * ACTIVE ERA
   * --------------------------------------------------
   */

  private updateActiveEra(
    selectedEra?: TimelineEra
  ) {
    const elements =
      this.nodesContainer.querySelectorAll<HTMLElement>(
        "[data-timeline-node]"
      );

    elements.forEach(
      (element) => {
        element.classList.toggle(
          "is-active",
          element.dataset.nodeId ===
            selectedEra?.id
        );
      }
    );
  }

  /*
   * --------------------------------------------------
   * YEAR / POSITION
   * --------------------------------------------------
   */

  private getYearProgress(
    year: number
  ) {
    const range =
      this.timeline.end -
      this.timeline.start;

    if (range === 0) {
      return 0.5;
    }

    return Math.max(
      0,
      Math.min(
        1,
        (
          year -
          this.timeline.start
        ) / range
      )
    );
  }

  /*
   * --------------------------------------------------
   * FIND ERA
   * --------------------------------------------------
   */

  private findEraAtYear(
    year: number
  ) {
    /*
     * First find the era whose
     * historical range contains
     * the selected year.
     */
    const containing =
      this.timeline.eras.find(
        (era) =>
          year >= era.start &&
          year <= era.end
      );

    if (containing) {
      return containing;
    }

    /*
     * Otherwise use the closest
     * era center.
     */
    return this.timeline.eras.reduce(
      (
        nearest,
        era
      ) => {
        const nearestDistance =
          Math.abs(
            getEraCenter(
              nearest
            ) - year
          );

        const eraDistance =
          Math.abs(
            getEraCenter(
              era
            ) - year
          );

        return eraDistance <
          nearestDistance
          ? era
          : nearest;
      }
    );
  }

  /*
   * --------------------------------------------------
   * EVENT
   * --------------------------------------------------
   */

  private dispatchTimelineEvent(
    era: TimelineEra,
    year: number
  ) {
    this.root.dispatchEvent(
      new CustomEvent(
        "aion:timeline-change",
        {
          bubbles: true,

          detail: {
            worldId:
              this.timeline.id,

            eraId:
              era.id,

            era,

            year,
          },
        }
      )
    );
  }

  /*
   * --------------------------------------------------
   * PUBLIC API
   * --------------------------------------------------
   */

  public getSelectedYear() {
    return this.selectedYear;
  }

  public getSelectedEra() {
    return this.currentEra;
  }

  /*
   * --------------------------------------------------
   * CLEANUP
   * --------------------------------------------------
   */

  public destroy() {
    this.root.removeEventListener(
      "pointerdown",
      this.handlePointerDown
    );

    window.removeEventListener(
      "pointermove",
      this.handlePointerMove
    );

    window.removeEventListener(
      "pointerup",
      this.handlePointerUp
    );

    window.removeEventListener(
      "pointercancel",
      this.handlePointerCancel
    );

    this.three.destroy();
  }
}