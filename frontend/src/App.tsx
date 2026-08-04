import { Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import StandardLayout from './layout/StandardLayout'
import RoomListPage from './pages/RoomListPage/RoomListPage'
import RoomDetailsPage from './pages/RoomDetailsPage/RoomDetailsPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'
import AdminUsersPage from './pages/AdminUsersPage/AdminUsersPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<StandardLayout />}>
            <Route path="/" element={<RoomListPage />} />
            <Route path="/rooms" element={<RoomListPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route element={<ProtectedRoute requiredRole="platform_admin" />}>
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          <Route path="/rooms/:id" element={<RoomDetailsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
