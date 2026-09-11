import {
  Marker,
  type Map,
} from "maplibre-gl";

import type {
  HistoricalWorld,
} from "../worlds";


export function addWorldMarker(
  map: Map,

  world: HistoricalWorld,

  onSelect: (
    world: HistoricalWorld
  ) => void
): Marker {

  const element =
    document.createElement(
      "button"
    );


  element.type =
    "button";


  element.className =
    "aion-world-marker";


  element.setAttribute(
    "aria-label",
    `Explore ${world.name}`
  );


  element.innerHTML = `

    <span
      class="world-marker-ring"
    ></span>

    <span
      class="world-marker-dot"
    ></span>

    <span
      class="world-marker-label"
    >
      ${world.name}
    </span>

  `;


  element.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      event.stopPropagation();

      onSelect(world);

    }
  );


  return new Marker({
    element,

    anchor:
      "center",

  })

    .setLngLat([
      world.longitude,
      world.latitude,
    ])

    .addTo(map);

}