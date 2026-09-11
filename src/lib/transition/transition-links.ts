import {
  preloadTransition,
  runTransition,
} from "./transition-loader";

import type {
  TransitionType,
} from "./transition-types";


let initialized = false;


export function initializeTransitionLinks(): void {

  if (initialized) {
    return;
  }

  initialized = true;


  // ==========================================================
  // PRELOAD ON HOVER / FOCUS
  // ==========================================================

  document.addEventListener(
    "pointerover",
    (event) => {

      const target =
        event.target;


      if (
        !(target instanceof Element)
      ) {
        return;
      }


      const link =
        target.closest(
          "a[data-aion-transition]"
        );


      if (
        !(link instanceof
          HTMLAnchorElement)
      ) {
        return;
      }


      preloadTransition();
    },
    {
      passive: true,
    }
  );


  document.addEventListener(
    "focusin",
    (event) => {

      const target =
        event.target;


      if (
        !(target instanceof Element)
      ) {
        return;
      }


      const link =
        target.closest(
          "a[data-aion-transition]"
        );


      if (
        !(link instanceof
          HTMLAnchorElement)
      ) {
        return;
      }


      preloadTransition();
    }
  );


  // ==========================================================
  // CLICK
  // ==========================================================

  document.addEventListener(
    "click",
    async (event) => {

      if (
        event.defaultPrevented
      ) {
        return;
      }


      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }


      const target =
        event.target;


      if (
        !(target instanceof Element)
      ) {
        return;
      }


      const link =
        target.closest(
          "a[data-aion-transition]"
        );


      if (
        !(link instanceof
          HTMLAnchorElement)
      ) {
        return;
      }


      const href =
        link.getAttribute(
          "href"
        );


      if (
        !href ||
        href.startsWith("#")
      ) {
        return;
      }


      event.preventDefault();


      const type =
        link.dataset
          .aionTransition as
          | TransitionType
          | undefined;


      try {

        await runTransition({

          path:
            href,

          type,

          longitude:
            link.dataset.longitude
              ? Number(
                  link.dataset.longitude
                )
              : undefined,

          latitude:
            link.dataset.latitude
              ? Number(
                  link.dataset.latitude
                )
              : undefined,

          zoom:
            link.dataset.zoom
              ? Number(
                  link.dataset.zoom
                )
              : undefined,
        });

      } catch (error) {

        console.error(
          "[AION] Transition failed:",
          error
        );


        /*
         * If WebGL or the transition module
         * fails, navigation should still work.
         */

        sessionStorage.removeItem(
          "aion-transition"
        );

        window.location.assign(
          href
        );
      }
    }
  );
}