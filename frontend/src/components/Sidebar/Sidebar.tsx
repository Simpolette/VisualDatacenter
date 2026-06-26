import { NavLink } from 'react-router-dom'

function Sidebar() {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border-l-3 transition-all duration-150 cursor-pointer ${
      isActive
        ? 'text-primary bg-primary-alpha-10 border-l-primary'
        : 'text-text-secondary border-l-transparent hover:bg-surface-hover hover:text-text-primary hover:border-l-border-hover'
    }`

  return (
    <aside
      className="fixed top-0 left-0 w-[var(--spacing-sidebar)] h-screen bg-surface border-r border-border flex flex-col z-50"
      id="sidebar"
    >
      {/* Section 1: Brand */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-border shrink-0">
        <div className="text-primary flex items-center justify-center shrink-0">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="2" y="4" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
            <rect x="6" y="8" width="6" height="4" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="6" y="14" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="16" y="8" width="6" height="4" rx="1" fill="currentColor" opacity="0.7" />
            <rect x="16" y="14" width="6" height="4" rx="1" fill="currentColor" opacity="0.5" />
            <circle cx="21" cy="21" r="2" fill="var(--color-success)" />
          </svg>
        </div>
        <span className="text-base font-bold text-text-primary tracking-tight whitespace-nowrap">
          Visual Datacenter
        </span>
      </div>

      {/* Section 2: Navigation */}
      <nav className="flex-1 flex flex-col justify-between py-3 overflow-y-auto">
        <div className="flex flex-col gap-1 px-3">
          <NavLink to="/" end className={navLinkClasses} id="nav-dashboard">
            <svg className="shrink-0 w-5 h-5" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/rooms" className={navLinkClasses} id="nav-rooms">
            <svg className="shrink-0 w-5 h-5" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="7" y1="3" x2="7" y2="17" stroke="currentColor" strokeWidth="1.5" />
              <line x1="13" y1="3" x2="13" y2="17" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Rooms</span>
          </NavLink>
        </div>

        <div className="flex flex-col gap-1 px-3">
          <NavLink to="/settings" className={navLinkClasses} id="nav-settings">
            <svg className="shrink-0 w-5 h-5" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 1v2M10 17v2M1 10h2M17 10h2M3.5 3.5l1.4 1.4M15.1 15.1l1.4 1.4M16.5 3.5l-1.4 1.4M4.9 15.1l-1.4 1.4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  )
}

export default Sidebar
