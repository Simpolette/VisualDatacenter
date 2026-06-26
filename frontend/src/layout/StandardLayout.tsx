import { Outlet } from 'react-router-dom'

export default function StandardLayout() {
  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-screen">
      <Outlet />
    </div>
  )
}
