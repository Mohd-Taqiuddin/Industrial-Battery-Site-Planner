# Tesla Energy Site Layout Planner

A full-stack tool to design, validate, and visualize industrial battery sites. Built with **React + TypeScript** and a **Go** backend.

##  Features
- **Smart Configuration:** Add/remove Megapacks and PowerPacks with real-time validation.
- **Auto-Constraint Enforcement:** Automatically ensures **1 Transformer per 2 Batteries**.
- **Blueprint Visualization:** Interactive, grid-aligned site map that adheres to a **100ft max width**.
- **Real-time Analytics:** Calculates Cost, Energy (MWh), Footprint (sq ft), and Energy Density (MWh/acre).
- **Session Persistence:** Save/Load designs via server-side storage (survives cache clears).
- **Export Tools:** CSV Export for CAD integration and Print-ready reports.

## 🛠 Tech Stack
- **Frontend:** React, TypeScript, Vite, CSS Grid (No external UI libraries)
- **Backend:** Go (Standard Library only - `net/http`)
- **Containerization:** Docker & Docker Compose

##  Quick Start

Run the entire stack with a single command:

```bash
docker compose up --build
```

Then open `http://localhost:8000`.


## Project Structure
├── client/
│   ├── src/
│   │   ├── components/  # LayoutPreview, ConfigPanel, StatsPanel
│   │   ├── hooks/       # useSiteLayout (State & API logic)
│   │   └── types.ts     # Shared interfaces
├── server/
│   ├── main.go          # HTTP Server & Handlers
│   ├── service.go       # Layout Algorithm & Constraints
│   └── data/            # JSON persistence storage
└── docker-compose.yml

## API

- `POST /api/calculate` -> Validates config and returns optimal layout coordinates
- `POST /api/save` -> Persists current session to disk; returns unique ID
- `GET /api/load?id={id}` -> Restores a configuration from a Session ID

Sessions persist to `backend/data/sessions.json`.

## Notes on calculations
- Land dimensions are derived from the auto-generated layout bounding box (width <= 100 ft).
- Energy density is provided in MWh per sq ft and MWh per acre.

