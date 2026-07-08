import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Loader2 } from 'lucide-react'
import { useRoomStore, type Room } from '../../stores/useRoomStore'
import Modal from '../Modal/Modal'

interface RoomCardProps {
  room: Room;
}

function RoomCard({ room }: RoomCardProps) {
  const deleteRoom = useRoomStore((s) => s.deleteRoom)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDeleteModalOpen(true)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteRoom(room.id)
      setIsDeleteModalOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete room'
      setDeleteError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleModalClose = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false)
    }
  }

  return (
    <>
      <Link to={`/rooms/${room.id}`} className="block">
        <article
          className="relative bg-surface border border-border rounded-xl p-6 shadow-sm cursor-pointer transition-all duration-250 hover:border-primary hover:shadow-[var(--shadow-glow-primary)] hover:-translate-y-0.5 group"
          id={`room-card-${room.id}`}
        >
          {/* Delete Button */}
          <button
            onClick={handleDeleteClick}
            className="absolute top-4 right-4 p-1.5 rounded-lg border border-border bg-canvas text-text-muted hover:text-danger hover:border-danger/30 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 cursor-pointer"
            title={`Delete ${room.name}`}
            id={`btn-delete-room-card-${room.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="mb-4 pr-8">
            <h3 className="text-lg font-semibold text-text-primary leading-tight">{room.name}</h3>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[13px] text-text-secondary">
              <svg className="shrink-0 text-text-muted" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
              </svg>
              <span>{room.widthM}m × {room.lengthM}m</span>
            </div>
            {room.location && (
              <div className="flex items-center gap-2 text-[13px] text-text-secondary">
                <svg className="shrink-0 text-text-muted" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.2" />
                  <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <span>{room.location}</span>
              </div>
            )}
          </div>
        </article>
      </Link>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        title="Delete Room"
      >
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm text-text-secondary leading-relaxed">
            Are you sure you want to delete room <strong className="text-text-primary">{room.name}</strong>?
          </p>
          <div className="p-3 bg-danger-alpha-10 border border-danger-alpha-20 rounded-lg text-xs text-danger-light leading-normal">
            This will permanently delete the room, all of its racks, and all devices/PDUs installed in those racks. This action cannot be undone.
          </div>

          {deleteError && (
            <p className="text-xs text-danger font-medium">{deleteError}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleModalClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-border bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-danger hover:bg-danger-hover text-text-primary rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              id={`confirm-delete-room-${room.id}`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Room</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default RoomCard
