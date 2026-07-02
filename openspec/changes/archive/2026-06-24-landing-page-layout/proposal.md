## Why

The frontend application currently has no UI scaffolding — `App.tsx` is empty and both CSS files are blank. Before implementing any features (room editor, 3D visualization), the app needs a stable shell: a persistent sidebar for navigation and a main content area where pages render.

## What Changes

- Introduce a global CSS design system with HSL-based color tokens for dark mode (light mode–ready variables included but inactive)
- Create a two-section sidebar layout: Brand/Logo header and a main navigation panel
- Add three top-level page stubs: Dashboard, Room List, and Settings
- Sidebar navigation links to `Dashboard` and `Settings` as single-destination items; `Rooms` tab navigates to a dedicated `RoomListPage`
- `RoomListPage` renders a card grid of all rooms fetched from `GET /api/v1/rooms`, displaying room name and dimensions
- URL-based navigation via React Router; room data managed via a Zustand `useRoomStore` for cross-component access

## Capabilities

### New Capabilities
- `app-shell`: Global layout wrapper — sidebar + main content area, dark-mode CSS token system, theme-toggle plumbing
- `room-list-page`: Dedicated page that lists all rooms as cards showing name and dimensions, fetched from the backend API

### Modified Capabilities
*(none — no existing specs to update)*

## Impact

- **Frontend files changed**: `src/index.css`, `src/App.tsx`, new components under `src/components/`, new pages under `src/pages/`
- **Backend API consumed**: `GET /api/v1/rooms` (already implemented)
- **No backend changes** required
- **New npm dependencies**: `react-router-dom` for URL-based routing, `zustand` for shared data stores (room data)
