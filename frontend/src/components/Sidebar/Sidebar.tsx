import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

function Sidebar() {
  const { user, isAdmin, logout } = useAuthStore()

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
          <NavLink to="/rooms" className={navLinkClasses} id="nav-rooms">
            <svg className="shrink-0 w-5 h-5" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <line x1="7" y1="3" x2="7" y2="17" stroke="currentColor" strokeWidth="1.5" />
              <line x1="13" y1="3" x2="13" y2="17" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Rooms</span>
          </NavLink>

          {/* Administration Section */}
          {isAdmin() && (
            <div className="mt-4 pt-4 border-t border-border">
              <span className="px-4 text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-2">
                Administration
              </span>
              <NavLink to="/admin/users" className={navLinkClasses} id="nav-admin-users">
                <svg className="shrink-0 w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 10a4 4 0 100-8 4 4 0 000 8zM3 18e1a7 7 0 0114 0"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>User Management</span>
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      {/* Section 3: User Footer */}
      <div className="p-4 border-t border-border bg-surface shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="overflow-hidden">
            <div className="text-sm font-semibold text-text-primary truncate">
              {user?.username || 'Logged In'}
            </div>
            <div className="text-[11px] text-text-secondary capitalize truncate">
              {user?.roles?.[0] || 'User'}
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-2 rounded-lg bg-surface-hover hover:bg-rose-500/20 hover:text-rose-400 text-text-secondary transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
