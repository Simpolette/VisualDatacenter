import { useState, useEffect } from 'react'
import RightSidebar from '../../components/Sidebar/RightSidebar'
import { useRackStore } from '../../stores/useRackStore'
import { Server, Database, Compass, AlertCircle } from 'lucide-react'
import type { Room } from '../../stores/useRoomStore'
import type { Rack } from '../../stores/useRackStore'

interface CreateRackSidebar2DProps {
  room: Room;
  racks: Rack[];
  coords: { posX: number; posY: number; rotationDeg: number; length: number };
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateRackSidebar2D({
  room,
  racks,
  coords,
  onClose,
  onSuccess
}: CreateRackSidebar2DProps) {
  const { createRack } = useRackStore()
  const [name, setName] = useState('')
  const [totalUnits, setTotalUnits] = useState<number>(42)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Generate default name: next letter in A-Z sequence
  useEffect(() => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lettersInUse = new Set<string>()
    racks.forEach((r) => {
      const match = r.name.match(/^Rack\s+([A-Z])$/i)
      if (match) {
        lettersInUse.add(match[1].toUpperCase())
      }
    })

    let defaultName = `Rack ${racks.length + 1}`
    for (let i = 0; i < alphabet.length; i++) {
      const char = alphabet[i]
      if (!lettersInUse.has(char)) {
        defaultName = `Rack ${char}`
        break
      }
    }
    setName(defaultName)
  }, [racks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError('Rack name cannot be empty.')
      return
    }

    // Client-side uniqueness check within the room
    const nameExists = racks.some(
      (r) => r.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (nameExists) {
      setFormError(`A rack named "${trimmedName}" already exists in this room.`)
      return
    }

    setSubmitting(true)
    try {
      await createRack(room.id, {
        name: trimmedName,
        totalUnits,
        posX: coords.posX,
        posY: coords.posY,
        rotationDeg: coords.rotationDeg,
        length: coords.length
      })
      onSuccess()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create rack. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <RightSidebar
      isOpen={true}
      onClose={onClose}
      title="Configure New Rack"
      subtitle="Rack Creator"
      id="create-rack-sidebar"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Placement Info summary cards */}
        <div className="grid grid-cols-2 gap-3 bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3 h-3 text-slate-400" /> Coords (X, Y)
            </span>
            <p className="text-sm font-semibold text-white">
              {coords.posX.toFixed(1)}m, {coords.posY.toFixed(1)}m
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-slate-400" /> Size & Rotation
            </span>
            <p className="text-sm font-semibold text-white">
              1x{coords.length} {coords.length === 1 ? 'cell' : 'cells'} @ {coords.rotationDeg}°
            </p>
          </div>
        </div>

        {/* Input Name */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Rack Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rack A"
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg focus:outline-none focus:border-primary px-3.5 py-2 text-sm transition-colors"
            required
            disabled={submitting}
            maxLength={50}
          />
        </div>

        {/* Select Capacity */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Height (U)
          </label>
          <select
            value={totalUnits}
            onChange={(e) => setTotalUnits(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg focus:outline-none focus:border-primary px-3 py-2 text-sm transition-colors cursor-pointer"
            disabled={submitting}
          >
            <option value={42}>42 U (Standard)</option>
            <option value={44}>44 U (Tall)</option>
          </select>
        </div>

        {/* Form Error Alert */}
        {formError && (
          <div className="p-3.5 bg-rose-950/20 border border-rose-800/30 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-snug">{formError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Rack...
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5" />
                Create Rack
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </RightSidebar>
  )
}
