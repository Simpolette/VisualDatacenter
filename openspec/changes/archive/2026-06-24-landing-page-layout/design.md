## Context

The frontend is a React + Vite SPA scaffolded with TypeScript. Currently `App.tsx` renders nothing and both CSS files are empty. No routing library has been added. The backend already exposes `GET /api/v1/rooms` returning a list of room objects. This design establishes the foundational UI shell before any feature pages are built.

## Goals / Non-Goals

**Goals:**
- Define the global design token system via Tailwind v4 `@theme` directive (colors, typography, spacing) targeting dark mode first
- Establish the two-section sidebar layout (Brand header + Nav panel)
- Define three page routes: `/` (Dashboard), `/rooms` (Room List), and `/settings` (Settings), managed by React Router
- Implement `RoomListPage` as a card grid consuming `GET /api/v1/rooms`
- Make sidebar navigation highlight the active tab with `--color-primary` (Electric Violet)

**Non-Goals:**
- Nested routes (e.g. `/rooms/:id`) — deferred to room detail/visualizer change
- Light mode activation (token system prepared but theme toggle is wired only in CSS; no user-facing switch yet)
- Room create/edit/delete flows (covered in a future change)
- 2D/3D visualization (separate future changes)
- Auth or multi-user support (out of MVP scope)

## Decisions

### D1: React Router for navigation
**Decision**: Use `react-router-dom` v7 with `BrowserRouter`, `Routes`, and `Route` for URL-based page navigation. The sidebar uses `NavLink` for active-state styling.  
**Rationale**: Provides shareable URLs from day one, built-in active link styling via `NavLink`, and naturally extends to parameterized routes (`/rooms/:id`) when the room detail page is added. The app will need routing imminently for 2D/3D visualizer views, so adding it now avoids a refactor.  
**Alternative considered**: Zustand navigation store — rejected; would need to be replaced by React Router in the very next change, and provides no URL support.

### D2: Tailwind CSS v4 as the design system
**Decision**: All design tokens are defined via Tailwind v4's `@theme` directive in `index.css`, generating utility classes automatically (e.g. `bg-canvas`, `text-primary`, `border-border`). Components use Tailwind utility classes inline in JSX — no separate `.css` files per component.  
**Rationale**: Eliminates CSS file proliferation, provides utility-first consistency across all components, and the `@theme` block makes custom tokens first-class Tailwind citizens. Tailwind v4's CSS-first config requires no `tailwind.config.js`.  
**Alternative considered**: Vanilla CSS custom properties — used initially but replaced; scaling to many components creates maintenance overhead and global class name collision risk.

### D3: Three primary accent colors
| Tailwind Token | HSL (dark mode) | Utility Classes | Role |
|---|---|---|---|
| `--color-primary` | `hsl(262, 80%, 65%)` | `bg-primary`, `text-primary`, `border-primary` | Active nav, CTA buttons, selection |
| `--color-success` | `hsl(174, 90%, 50%)` | `bg-success`, `text-success` | Healthy room status, connected devices |
| `--color-danger`  | `hsl(342, 90%, 55%)` | `bg-danger`, `text-danger` | Alert room status, warnings |

Neutrals use a slate-blue base (`hsl(222, 20-25%, L%)`) defined as `--color-canvas`, `--color-surface`, `--color-border` etc. in the `@theme` block.

### D4: Sidebar divided into exactly two visual sections
- **Section 1 — Brand**: Logo mark + application name. Fixed height, non-scrollable.
- **Section 2 — Nav**: Flex-column with `justify-content: space-between`. Top group holds Dashboard + Rooms; bottom group holds Settings + (future) theme toggle. Scrollable if nav grows.

### D5: RoomListPage data fetching via `useRoomStore`
A `useRoomStore` Zustand store holds `rooms[]`, `loading`, and `error` state with a `fetchRooms()` action that calls `GET /api/v1/rooms`. `RoomListPage` calls `fetchRooms()` on mount via `useEffect` and subscribes to the store slices it needs. This keeps room data accessible to future pages (e.g. room detail) without re-fetching or lifting state.

### D7: Zustand for shared data stores (not navigation)
**Decision**: Use Zustand for cross-component data state (room data, future theme preferences). Navigation is handled by React Router, not Zustand.  
**Rationale**: Near-zero boilerplate (no providers, no reducers), tiny bundle (~1KB), and the `stores/` directory was already scaffolded in the project. Scales naturally from room data to future theme/preferences without architectural changes.  
**Alternative considered**: React Context — rejected because it re-renders all consumers on any state change and requires provider wrapping. Redux — rejected as excessive for MVP scope.

### D6: Room card content — name and dimensions only
Room cards display the room name and physical dimensions (width × depth). No status indicator dot — the backend `Room` entity has no `status` field, so any indicator would be purely decorative. Status monitoring can be added when telemetry data exists.

## Risks / Trade-offs

- **`fetch` in `useEffect` causes double-call in React Strict Mode (dev only)** → No real risk; backend is idempotent GET. Zustand store deduplicates by checking `loading` flag before fetching.
- **Three new dependencies (`react-router-dom`, `zustand`, `tailwindcss` + `@tailwindcss/vite`)** → All lightweight, well-maintained, and standard choices for React SPAs. Minimal risk.
- **Tailwind utility classes in JSX increase line length** → Accepted trade-off; eliminates CSS file proliferation and class name collision risk. Extract to shared variables for repeated patterns.
- **No loading skeleton on `RoomListPage`** → A spinner suffices for MVP; skeleton screens deferred.
