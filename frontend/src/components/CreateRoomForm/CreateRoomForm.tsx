import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRoomStore } from '../../stores/useRoomStore'

const createRoomSchema = z.object({
  name: z.string().trim().min(1, 'Room name is required'),
  location: z.string().trim().optional(),
  widthM: z.number({ error: 'Width is required' }).positive('Width must be a positive number'),
  depthM: z.number({ error: 'Depth is required' }).positive('Depth must be a positive number'),
  heightM: z.number().positive('Height must be a positive number').optional().or(z.nan().transform(() => undefined)),
})

type CreateRoomFormInputs = z.infer<typeof createRoomSchema>;

interface CreateRoomFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

function CreateRoomForm({ onSuccess, onCancel }: CreateRoomFormProps) {
  const createRoom = useRoomStore((s) => s.createRoom)
  const creating = useRoomStore((s) => s.creating)
  const createError = useRoomStore((s) => s.createError)

  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoomFormInputs>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '',
      location: '',
      widthM: undefined,
      depthM: undefined,
      heightM: undefined,
    },
  })

  const onSubmit = async (values: CreateRoomFormInputs) => {
    setSubmitError(null)

    try {
      await createRoom({
        name: values.name,
        location: values.location?.trim() || undefined,
        widthM: values.widthM,
        depthM: values.depthM,
        heightM: values.heightM,
      })
      onSuccess()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create room'
      setSubmitError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-text-primary" id="create-room-form">
      {/* Global Server/Submission Error */}
      {(submitError || createError) && (
        <div className="p-3 text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg" id="form-error-summary">
          {submitError || createError}
        </div>
      )}

      {/* Room Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="room-name" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Room Name <span className="text-danger">*</span>
        </label>
        <input
          id="room-name"
          type="text"
          placeholder="e.g. Server Room A"
          disabled={creating}
          {...register('name')}
          className={`w-full px-3.5 py-2 text-sm bg-canvas border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 ${
            errors.name ? 'border-danger' : 'border-border'
          }`}
        />
        {errors.name && (
          <span className="text-xs text-danger mt-1">{errors.name.message}</span>
        )}
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="room-location" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Location
        </label>
        <input
          id="room-location"
          type="text"
          placeholder="e.g. Basement Floor 1"
          disabled={creating}
          {...register('location')}
          className="w-full px-3.5 py-2 text-sm bg-canvas border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
        />
      </div>

      {/* Dimensions (Grid) */}
      <div className="grid grid-cols-3 gap-4">
        {/* Width */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="room-width" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Width (m) <span className="text-danger">*</span>
          </label>
          <input
            id="room-width"
            type="number"
            step="any"
            placeholder="10"
            disabled={creating}
            {...register('widthM', { valueAsNumber: true })}
            className={`w-full px-3.5 py-2 text-sm bg-canvas border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 ${
              errors.widthM ? 'border-danger' : 'border-border'
            }`}
          />
          {errors.widthM && (
            <span className="text-xs text-danger mt-1">{errors.widthM.message}</span>
          )}
        </div>

        {/* Depth */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="room-depth" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Depth (m) <span className="text-danger">*</span>
          </label>
          <input
            id="room-depth"
            type="number"
            step="any"
            placeholder="8"
            disabled={creating}
            {...register('depthM', { valueAsNumber: true })}
            className={`w-full px-3.5 py-2 text-sm bg-canvas border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 ${
              errors.depthM ? 'border-danger' : 'border-border'
            }`}
          />
          {errors.depthM && (
            <span className="text-xs text-danger mt-1">{errors.depthM.message}</span>
          )}
        </div>

        {/* Height */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="room-height" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Height (m)
          </label>
          <input
            id="room-height"
            type="number"
            step="any"
            placeholder="3"
            disabled={creating}
            {...register('heightM', { valueAsNumber: true })}
            className={`w-full px-3.5 py-2 text-sm bg-canvas border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 ${
              errors.heightM ? 'border-danger' : 'border-border'
            }`}
          />
          {errors.heightM && (
            <span className="text-xs text-danger mt-1">{errors.heightM.message}</span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={creating}
          className="px-4 py-2 text-sm font-medium border border-border hover:bg-surface-hover rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={creating}
          className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-text-primary rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {creating ? (
            <>
              <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <span>Create Room</span>
          )}
        </button>
      </div>
    </form>
  )
}

export default CreateRoomForm
