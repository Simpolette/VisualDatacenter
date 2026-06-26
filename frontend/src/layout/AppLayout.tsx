import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-[var(--spacing-sidebar)] min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}
