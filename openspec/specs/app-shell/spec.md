## Purpose
Provide a persistent global application shell with sidebar navigation and design token definitions.

## Requirements

### Requirement: Global layout shell
The application SHALL render a persistent two-column layout consisting of a fixed-width sidebar and a flex-fill main content area on all pages.
- Standard content pages (Dashboard, Rooms list, Settings) SHALL render inside a wrapper layout (`StandardLayout.tsx`) containing standard padding (`p-8`) and scrollable viewports.
- Interactive workspace pages (Room Details) SHALL render full-bleed without padding (`p-0`) and borders to maximize the 3D viewport canvas.
The layouts SHALL be nested under a root shell (`AppLayout.tsx`) that mounts the Sidebar, keeping `App.tsx` clean and focused strictly on routing configuration.

#### Scenario: Layout renders on load for standard pages
- **WHEN** the user opens a standard page (e.g. Dashboard)
- **THEN** the sidebar is visible on the left and the content area renders with standard layout padding

#### Scenario: Layout renders on load for workspace pages
- **WHEN** the user opens a room details workspace
- **THEN** the sidebar is visible on the left and the room details canvas occupies the remaining width and height full-bleed without padding or borders

#### Scenario: Sidebar does not scroll with content
- **WHEN** the main content area is taller than the viewport
- **THEN** the sidebar remains fixed and only the main area scrolls

---

### Requirement: Sidebar Brand section
The sidebar SHALL display a Brand/Logo header as its first visual section, visually separated from the navigation panel below it.

#### Scenario: Brand section is always visible
- **WHEN** the user is on any page
- **THEN** the application name and logo mark are visible at the top of the sidebar

---

### Requirement: Sidebar navigation panel
The sidebar SHALL contain a single navigation panel (Section 2) below the brand header with three navigation targets: Dashboard (`/`), Rooms (`/rooms`), and Settings (`/settings`). Navigation SHALL use React Router `NavLink` components for URL-based routing and automatic active-state styling.

#### Scenario: Navigating to Dashboard
- **WHEN** the user clicks the Dashboard item
- **THEN** the main content area renders the Dashboard page and the Dashboard item is styled as active

#### Scenario: Navigating to Rooms
- **WHEN** the user clicks the Rooms item
- **THEN** the main content area renders the Room List page and the Rooms item is styled as active

#### Scenario: Navigating to Settings
- **WHEN** the user clicks the Settings item
- **THEN** the main content area renders the Settings page and the Settings item is styled as active

#### Scenario: Active tab indicator
- **WHEN** a navigation item is active
- **THEN** it is highlighted using the primary accent color (`--color-primary`) with a left-border indicator

---

### Requirement: Design token system via Tailwind v4
The application SHALL define all design tokens (colors, typography, spacing, shadows) in a Tailwind v4 `@theme` block in `index.css`, generating utility classes automatically. Components SHALL use Tailwind utility classes inline in JSX.

#### Scenario: Dark mode is the default
- **WHEN** the application loads
- **THEN** the application renders in dark mode using the defined dark neutral tokens

#### Scenario: Three accent colors are accessible as Tailwind utilities
- **WHEN** any component uses `bg-primary`, `text-success`, or `border-danger`
- **THEN** the correct HSL color value is applied from the `@theme` block
