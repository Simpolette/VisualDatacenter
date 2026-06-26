import { useEffect, useState } from 'react'
import { useRoomStore } from '../../stores/useRoomStore'
import RoomCard from '../../components/RoomCard/RoomCard'
import Modal from '../../components/Modal/Modal'
import CreateRoomForm from '../../components/CreateRoomForm/CreateRoomForm'

function RoomListPage() {
  const rooms = useRoomStore((s) => s.rooms)
  const loading = useRoomStore((s) => s.loading)
  const error = useRoomStore((s) => s.error)
  const fetchRooms = useRoomStore((s) => s.fetchRooms)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  return (
    <div className="max-w-[1200px]" id="page-rooms">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary leading-tight mb-2">Rooms</h1>
          <p className="text-sm text-text-secondary leading-normal">
            Manage your datacenter rooms. Each room contains racks and devices.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-text-primary text-sm font-medium rounded-lg transition-colors cursor-pointer shrink-0"
          id="btn-new-room"
        >
          + New Room
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center" id="rooms-loading">
          <div className="w-9 h-9 border-3 border-border border-t-primary rounded-full animate-spin" />
          <p className="text-base text-text-secondary font-medium">Loading rooms...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center" id="rooms-error">
          <svg className="opacity-80" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="var(--color-danger)" strokeWidth="2" />
            <line x1="16" y1="9" x2="16" y2="18" stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="23" r="1.5" fill="var(--color-danger)" />
          </svg>
          <p className="text-base text-text-secondary font-medium">{error}</p>
          <button
            className="px-6 py-2 text-sm font-medium text-primary border border-primary rounded-lg bg-transparent transition-colors duration-150 hover:bg-primary-alpha-10 cursor-pointer"
            onClick={fetchRooms}
            id="rooms-retry"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center" id="rooms-empty">
          <svg className="opacity-80" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="10" width="36" height="28" rx="4" stroke="var(--color-text-muted)" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="18" y1="22" x2="30" y2="22" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="28" x2="26" y2="28" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-base text-text-secondary font-medium">No rooms yet</p>
          <p className="text-[13px] text-text-muted mb-2">Create your first datacenter room to get started.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-text-primary text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Create Room
          </button>
        </div>
      )}

      {/* Room Grid */}
      {!loading && !error && rooms.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6" id="rooms-grid">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}

      {/* Reusable Modal & Form */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Room"
      >
        <CreateRoomForm
          onSuccess={() => setIsCreateModalOpen(false)}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default RoomListPage
