# World History Explorer

> Explore humanity through space and time.

World History Explorer is an interactive platform designed to make the history, mythology, epics, civilizations, people, places, events, and cultures of the world easier and more engaging to explore.

Instead of treating history as a collection of disconnected articles, the platform connects **geography, time, people, places, events, civilizations, mythology, and stories** into a single interactive experience.

---

## Vision

History is often learned through textbooks, articles, videos, and isolated timelines.

But history is not isolated.

A civilization existed in a particular place, during a particular period, alongside other civilizations, people, cultures, events, traditions, and stories.

World History Explorer aims to represent this interconnected nature of history through an interactive geographical and temporal experience.

The goal is simple:

> **Make users feel like they are exploring history rather than studying it.**

---

## Core Experience

The primary experience begins with an interactive world map.

```text
WORLD
   │
   ▼
 WORLD MAP
   │
   ▼
HOVER REGION
   │
   ▼
REGION PREVIEW
   │
   ▼
ENTER WORLD
   │
   ▼
INDIA
   │
   ├── History
   ├── Mythology
   ├── Epics
   ├── Civilizations
   ├── People
   ├── Places
   ├── Events
   └── Stories
   │
   ▼
 TIMELINE
   │
   ▼
250 BCE
   │
   ├── Mauryan Empire
   ├── Ashoka
   ├── Kalinga War
   └── Pataliputra
   │
   ▼
EXPLORE
   │
   ▼
← RETURN TO WORLD
````

The user should be able to freely move between places, periods, people, civilizations, events, and stories.

---

## Time Changes the World

The timeline is one of the core concepts of the platform.

The timeline should not simply change a date or paragraph.

When the user moves through time, the historical context of the map changes.

For example:

```text
500 BCE
   ↓
Mahajanapadas
Magadha
Kosala
Buddhism
Jainism

        ↓

250 BCE
   ↓
Mauryan Empire
Ashoka
Kalinga War
Pataliputra
```

Eventually, the map should visually transform as the timeline changes:

```text
500 BCE
   ↓
Historical boundaries change
   ↓
Cities change
   ↓
Civilizations change
   ↓
Events change
   ↓
Context changes
   ↓
250 BCE
```

This allows users to visually understand historical change rather than simply read about it.

---

## History in Global Context

History should not be presented as isolated national stories.

When exploring a particular period, users should eventually be able to see what was happening elsewhere in the world at the same time.

For example:

```text
250 BCE

INDIA
Mauryan Empire
Ashoka

CHINA
Han Dynasty

EGYPT
Ptolemaic Kingdom

MEDITERRANEAN
Hellenistic Kingdoms
```

This creates a global understanding of historical periods.

---

## Connected Knowledge

The platform is intended to represent history as a network of interconnected entities.

For example:

```text
                  Ashoka
                 /  |   \
                /   |    \
               ▼    ▼     ▼
         Mauryan  Kalinga Buddhism
          Empire     War
             |
             ▼
        Pataliputra
             |
             ▼
           India
```

A user exploring one entity should naturally be able to discover related entities.

For example:

```text
Person
  ↓
Event
  ↓
Place
  ↓
Civilization
  ↓
Historical Period
  ↓
Story
```

This will eventually form the foundation of a temporal and geographical knowledge graph.

---

## History & Mythology

The platform will cover both historical and cultural traditions.

However, an important principle is to clearly distinguish between different types of information.

Information may be categorized as:

* Historical evidence
* Archaeological evidence
* Scholarly interpretation
* Traditional account
* Mythological narrative
* Epic/literary tradition
* Folklore
* Legend
* Debated
* Uncertain

The goal is to respect cultural and mythological traditions without presenting every traditional narrative as historically verified fact.

---

## Storytelling

Not every subject should be presented as an encyclopedia article.

Important events, people, myths, and cultural traditions can eventually be presented as immersive stories.

For example:

```text
Ashoka After Kalinga

Historical Context
       ↓
Kalinga War
       ↓
Ashoka
       ↓
Transformation
       ↓
Dhamma
       ↓
Legacy
```

Future storytelling experiences may include:

* Animated maps
* Interactive timelines
* Scroll-based storytelling
* Illustrations
* Audio
* Geographic transitions
* Historical context

---

## Visual Experience

The platform is intended to make extensive use of interactive visualization and animation.

### Planned technologies

* **Anime.js** — UI animation and transitions
* **Three.js** — advanced 3D and spatial visualization
* **MapLibre** — geographic and historical map experiences

Animation will not be used only for decoration.

The goal is to use animation to **communicate historical change**.

For example:

```text
500 BCE
   ↓
Borders transform
   ↓
Cities appear/disappear
   ↓
Historical context changes
   ↓
250 BCE
```

---

## Technology Stack

## Web

* [Astro](https://astro.build/)
* Astro SSR
* TypeScript

## Interactive UI

* React

## Styling

* Tailwind CSS

## Animation

* Anime.js

## 3D / Visualization

* Three.js

## Maps

* MapLibre
* GeoJSON
* Vector data

## Database

* PostgreSQL
* Drizzle ORM

## Future AI

* OpenAI API
* Embeddings
* RAG
* Semantic search

## Future Mobile

* React Native
* Expo

---

## Initial Architecture

The initial architecture is intentionally simple.

```text
                    USER
                      │
                      ▼
                 ASTRO SSR
                      │
              ┌───────┴───────┐
              │               │
           React          Server Logic
              │               │
       ┌──────┼──────┐        │
       ▼      ▼      ▼        ▼
      Map  Timeline Search  PostgreSQL
```

The underlying data architecture will be designed so that a future mobile application can consume the same data and services.

---

## Core Data

The platform will eventually represent entities such as:

* Countries
* Regions
* Civilizations
* Historical periods
* People
* Places
* Events
* Myths
* Epics
* Stories
* Cultures
* Archaeological sites
* Sources

Relationships between these entities will be an important part of the system.

---

## Search

The platform will eventually provide global search across the knowledge base.

Users should be able to search for:

* People
* Places
* Civilizations
* Events
* Myths
* Epics
* Countries
* Historical periods
* Stories

Future natural-language queries may include:

> What was happening in India around 250 BCE?
> What civilizations existed around 500 BCE?
> What was happening elsewhere when Ashoka ruled?
> Which ancient cultures have flood traditions?

---

## AI Exploration

AI is planned as a layer on top of the platform's structured knowledge and sources.

The intended architecture is:

```text
USER QUESTION
      ↓
SEARCH / RETRIEVAL
      ↓
STRUCTURED DATA
      +
SOURCES
      ↓
RELEVANT INFORMATION
      ↓
AI
      ↓
GROUNDED ANSWER
      ↓
SOURCES
```

AI should not become the source of truth.

The underlying knowledge base and sources should remain the foundation.

---

## Roadmap

## Phase 1 — Product Foundation

* [ ] Define product vision
* [ ] Research existing platforms
* [ ] Define user journey
* [ ] Design core screens
* [ ] Define MVP
* [ ] Design data model

## Phase 2 — Web Foundation

* [ ] Astro SSR setup
* [ ] React integration
* [ ] TypeScript
* [ ] Tailwind CSS
* [ ] PostgreSQL
* [ ] Drizzle ORM
* [ ] Project architecture

## Phase 3 — Core Experience

* [ ] Home dashboard
* [ ] Interactive world map
* [ ] Region hover
* [ ] Region preview
* [ ] Region experience
* [ ] Historical timeline
* [ ] Historical map
* [ ] People
* [ ] Places
* [ ] Events
* [ ] Civilizations
* [ ] Mythology
* [ ] Epics
* [ ] Sources

## Phase 4 — Exploration

* [ ] Search
* [ ] Entity relationships
* [ ] Related entities
* [ ] Historical map layers
* [ ] Global context
* [ ] Civilization comparison

## Phase 5 — Visual Experience

* [ ] Anime.js integration
* [ ] Advanced page transitions
* [ ] Animated timeline
* [ ] Animated historical boundaries
* [ ] Three.js experiments
* [ ] 3D globe

## Phase 6 — Intelligence

* [ ] Semantic search
* [ ] Embeddings
* [ ] RAG
* [ ] AI exploration
* [ ] Source-grounded answers

## Phase 7 — Mobile

* [ ] React Native
* [ ] Expo
* [ ] Mobile-specific UX
* [ ] Shared backend/data
* [ ] Mobile exploration

---

## MVP

The first version should focus on one compelling experience rather than trying to represent the entire world.

### Core MVP

```text
World Map
   ↓
India
   ↓
India Historical Map
   ↓
Timeline
   ↓
Historical Period
   ↓
People / Places / Events
   ↓
Explore
```

The initial goal is to make this experience excellent before expanding to many civilizations and regions.

---

## Initial Geographic Scope

The initial content scope will be deliberately limited.

Potential starting regions:

* India
* Greece
* Egypt
* Mesopotamia

The architecture should be designed to allow additional regions and civilizations to be added later.

---

## Long-Term Possibilities

Future versions may include:

* Animated historical borders
* Historical trade routes
* Ancient cities
* Archaeological sites
* Battle visualization
* Migration routes
* Cultural evolution
* Language evolution
* Mythology layers
* Civilization comparison
* Mythology comparison
* Epic comparison
* 3D globe
* Historical terrain
* Personalized historical journeys
* "What was happening around the world?"
* "What existed here before?"
* "What replaced this civilization?"
* AI-powered exploration
* Mobile application

---

## Project Focus

This project is not intended to be simply a history website.

The technical goal is to explore how a **temporal, geographical and interconnected knowledge system** can be represented through an interactive web experience.

The project combines:

```text
Geospatial Visualization
        +
Temporal Data
        +
Knowledge Representation
        +
Interactive UI
        +
Data Modeling
        +
Information Retrieval
        +
AI
```

---

## Current Status

> **Early Development / Product Design**

The project is currently in the planning and architecture stage.

The immediate focus is:

1. Finalize the product experience.
2. Define the MVP.
3. Design the data model.
4. Research existing platforms.
5. Design the core UI.
6. Begin implementation with Astro SSR + React.

---

## Future Contributions

The project is currently being developed as an independent project.

More information about contribution guidelines will be added as the project matures.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
