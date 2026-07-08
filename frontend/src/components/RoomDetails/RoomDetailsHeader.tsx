import { useState, useEffect } from 'react'
import { ArrowLeft, RotateCcw, Plus, Focus, Search, X, Loader2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useRoomStore, type Room } from '../../stores/useRoomStore'
import { useRackStore } from '../../stores/useRackStore'
import Modal from '../Modal/Modal'

export interface RoomDetailsHeaderProps {
  room: Room
  workspaceMode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW'
  setWorkspaceMode: (mode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW') => void
  setSelectedRackId: (id: number | null) => void
  setIsolatedRackIds: (ids: number[]) => void
  handleCancelPlacement: () => void
  handleResetCamera: () => void
  handleAddRackClick: () => void
  showGrid: boolean
  setShowGrid: (val: boolean) => void
  showLabels: boolean
  setShowLabels: (val: boolean) => void
}

export function RoomDetailsHeader({
  room,
  workspaceMode,
  setWorkspaceMode,
  setSelectedRackId,
  setIsolatedRackIds,
  handleCancelPlacement,
  handleResetCamera,
  handleAddRackClick,
  showGrid,
  setShowGrid,
  showLabels,
  setShowLabels,
}: RoomDetailsHeaderProps) {
  const navigate = useNavigate()
  const { searchQuery, searchRacks, clearSearch, searchLoading, searchMatchedRackIds } = useRackStore()
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const deleteRoom = useRoomStore((s) => s.deleteRoom)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteRoom(room.id)
      setIsDeleteModalOpen(false)
      navigate('/rooms')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete room'
      setDeleteError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        searchRacks(room.id, localQuery)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localQuery, room.id, searchRacks, searchQuery])

  if (workspaceMode === 'PLACEMENT_PENDING' || workspaceMode === 'PLACEMENT_DRAGGING' || workspaceMode === 'CREATION_FORM') {
    return (
      <div className="flex items-center justify-between px-6 py-3.5 bg-placement-surface border-b border-placement-border shrink-0 z-20 transition-all">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-placement-highlight opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-placement-accent"></span>
          </span>
          <div>
            <span className="text-[10px] font-semibold text-placement-highlight uppercase tracking-wider block">Add Rack Mode</span>
            <p className="text-[11px] text-text-secondary mt-0.5" id="placement-instructions">
              {workspaceMode === 'CREATION_FORM'
                ? 'Complete the rack details form in the sidebar'
                : 'Click and drag on the floor grid to place and rotate a new rack'}
            </p>
          </div>
        </div>
        <button
          onClick={handleCancelPlacement}
          className="px-3 py-1.5 bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          id="btn-cancel-placement"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (workspaceMode === 'ISOLATION_SELECT') {
    return (
      <div className="flex items-center justify-between px-6 py-3.5 bg-sky-surface border-b border-sky-border shrink-0 z-20 transition-all">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-light opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-accent"></span>
          </span>
          <div>
            <span className="text-[10px] font-semibold text-sky-light uppercase tracking-wider block">Isolation Select Mode</span>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Click and drag a box on the floor grid to select the racks you want to isolate
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsolatedRackIds([])
            setWorkspaceMode('NORMAL')
          }}
          className="px-3 py-1.5 bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between px-6 py-3.5 bg-surface border-b border-border/85 shrink-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/rooms')}
          className="p-2 bg-canvas hover:bg-surface-hover text-text-secondary hover:text-text-primary rounded-lg border border-border transition-all cursor-pointer"
          id="btn-back-to-rooms-header"
          title="Back to Room List"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        
        <div className="h-6 w-px bg-border hidden sm:block" />
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-text-primary tracking-tight leading-none" id="room-details-title">
              {room.name}
            </h1>
            {room.location && (
              <span className="text-[10px] font-semibold text-primary bg-primary-alpha-10 px-1.5 py-0.5 rounded border border-primary-alpha-20">
                {room.location}
              </span>
            )}
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger-alpha-10 transition-all cursor-pointer"
              title="Delete Room"
              id="btn-delete-room-header"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-text-secondary mt-1">
            {room.widthM}m × {room.lengthM}m Floor
          </p>
        </div>

        {/* Debounced Search Bar */}
        <div className="relative flex items-center ml-2">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Search racks or devices..."
            className="pl-8 pr-7 py-1.5 bg-canvas border border-border focus:border-cyan-bright rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none w-44 md:w-56 transition-all"
          />
          {localQuery ? (
            <button
              onClick={() => {
                setLocalQuery('')
                clearSearch()
              }}
              className="absolute right-2 text-text-muted hover:text-text-primary cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : searchLoading ? (
            <Loader2 className="w-3.5 h-3.5 absolute right-2 text-cyan-bright animate-spin" />
          ) : null}
          {searchMatchedRackIds !== null && localQuery && (
            <span className="ml-2 text-[10px] font-bold text-cyan-bright bg-cyan-surface border border-cyan-mid/40 px-2 py-0.5 rounded-full">
              {searchMatchedRackIds.length} found
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleResetCamera}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-canvas border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:border-border-hover transition-all cursor-pointer"
          title="Reset camera view to overview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset View</span>
        </button>

        <button
          onClick={() => {
            if (workspaceMode === 'NORMAL') {
              setSelectedRackId(null)
              setIsolatedRackIds([])
              setWorkspaceMode('ISOLATION_SELECT')
            } else if (workspaceMode === 'ISOLATION_VIEW') {
              setIsolatedRackIds([])
              setWorkspaceMode('NORMAL')
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
            workspaceMode === 'ISOLATION_VIEW'
              ? 'bg-sky-surface border-sky-border text-sky-light'
              : 'bg-canvas border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:border-border-hover'
          }`}
          title="Isolate a subset of racks"
        >
          <Focus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {workspaceMode === 'ISOLATION_VIEW' ? 'Exit Isolate' : 'Isolate'}
          </span>
        </button>

        <div className="h-5 w-px bg-border" />

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-surface-active rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full relative border border-border" />
          <span className="text-xs text-text-secondary hidden md:inline">Grid</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-surface-active rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-text-muted peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full relative border border-border" />
          <span className="text-xs text-text-secondary hidden md:inline">Labels</span>
        </label>
      </div>

      <div>
        <button
          onClick={handleAddRackClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer"
          id="btn-add-rack-header"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rack</span>
        </button>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
        title="Delete Room"
      >
        <div className="space-y-4">
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
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
              className="px-4 py-2 border border-border bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-danger hover:bg-danger-hover text-text-primary rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              id="confirm-delete-room-header"
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
    </div>
  )
}
