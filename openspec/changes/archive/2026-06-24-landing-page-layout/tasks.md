## 1. Design System Foundation

- [x] 1.1 Populate `src/index.css` with CSS custom properties: dark-mode neutral palette (canvas, surface, surface-hover, border), three accent color tokens (`--color-primary`, `--color-success`, `--color-danger`), typography scale, spacing scale, border-radius values, and shadow tokens
- [x] 1.2 Add `[data-theme="light"]` overrides block in `index.css` with adjusted lightness values for all accent and neutral tokens
- [x] 1.3 Import a Google Font (e.g. Inter or Outfit) in `index.html` and apply it as `font-family` on `body` in `index.css`
- [x] 1.4 Add global resets and base body styles (background, color, box-sizing, margin/padding) using the design tokens

## 2. Dependencies & Store Setup

- [x] 2.1 Install `react-router-dom` and `zustand` as dependencies
- [x] 2.2 Create `src/stores/useRoomStore.ts` with `rooms[]`, `loading`, `error` state and a `fetchRooms()` action that calls `GET /api/v1/rooms`

## 3. Routing & App Shell Layout

- [x] 3.1 Wrap `<App />` in `<BrowserRouter>` in `main.tsx`
- [x] 3.2 Update `App.tsx` to render the two-column shell: `<Sidebar>` + `<main>` containing an `<Outlet>` or `<Routes>` block; add `src/App.css` layout rules
- [x] 3.3 Define routes: `/` → `DashboardPage`, `/rooms` → `RoomListPage`, `/settings` → `SettingsPage`
- [x] 3.4 Create `src/components/Sidebar/Sidebar.tsx` and `Sidebar.css` — two-section layout: Brand header on top, Nav panel below
- [x] 3.5 Style the Sidebar Brand section: application logo mark + "Visual Datacenter" label; fixed height; bottom border using `--border-color`
- [x] 3.6 Style the Sidebar Nav panel: flex-column with top group (Dashboard, Rooms) and bottom group (Settings); fills remaining sidebar height
- [x] 3.7 Use React Router `NavLink` for nav items; apply active-state styling with `--color-primary` text + 3px left border indicator
- [x] 3.8 Add hover state to nav items using `--bg-surface-hover` and a smooth `transition` on background and border-color

## 4. Page Stubs

- [x] 4.1 Create `src/pages/DashboardPage/DashboardPage.tsx` — placeholder page with a heading ("Dashboard") and a brief description
- [x] 4.2 Create `src/pages/SettingsPage/SettingsPage.tsx` — placeholder page with a heading ("Settings") and a brief description
- [x] 4.3 Add basic page-level CSS for both stubs: padding, `--text-primary` color, heading styles

## 5. Room List Page

- [x] 5.1 Create `src/pages/RoomListPage/RoomListPage.tsx` — calls `useRoomStore.fetchRooms()` on mount via `useEffect`, subscribes to `rooms`, `loading`, `error` from the store
- [x] 5.2 Implement the loading state: centered spinner using a CSS `@keyframes` animation in `--color-primary`
- [x] 5.3 Implement the error state: error message text + a "Retry" button that re-triggers `fetchRooms()`
- [x] 5.4 Implement the empty state: friendly message indicating no rooms exist yet
- [x] 5.5 Create `src/components/RoomCard/RoomCard.tsx` and `RoomCard.css` — card component displaying room name and dimensions (width × depth)
- [x] 5.6 Style the Room Card: dark surface (`--bg-surface`), border, border-radius, box-shadow; display room name prominently with dimensions below
- [x] 5.7 Add hover effect to Room Card: subtle `--color-primary` border glow using `box-shadow` transition
- [x] 5.8 Lay out `RoomListPage` with a CSS Grid card grid (auto-fill columns, responsive min-width)
