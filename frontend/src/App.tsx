import { Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import StandardLayout from './layout/StandardLayout'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import RoomListPage from './pages/RoomListPage/RoomListPage'
import RoomDetailsPage from './pages/RoomDetailsPage/RoomDetailsPage'
import SettingsPage from './pages/SettingsPage/SettingsPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<StandardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/rooms" element={<RoomListPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/rooms/:id" element={<RoomDetailsPage />} />
      </Route>
    </Routes>
  )
}

export default App
