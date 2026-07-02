import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { useRackStore, type RackDetails } from '../../stores/useRackStore'
import axios from 'axios'

// --- Zod validation schema ---
const installDeviceSchema = z.object({
  deviceTypeId: z.number({ error: 'Device type is required' }).positive('Device type is required'),
  name: z.string().trim().optional(),
  startU: z.number({ error: 'Start U is required' }).int().min(1, 'Start U must be at least 1'),
  face: z.enum(['FRONT', 'REAR']),
})

type InstallDeviceInputs = z.infer<typeof installDeviceSchema>

// --- Component props ---
interface InstallDeviceFormProps {
  rackId: number;
  rack: RackDetails;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function InstallDeviceForm({ rackId, rack, onSuccess, onCancel }: InstallDeviceFormProps) {
  const {
    deviceTypes,
    deviceTypesLoading,
    deviceTypesError,
    fetchDeviceTypes,
    installDevice,
  } = useRackStore()

  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InstallDeviceInputs>({
    resolver: zodResolver(installDeviceSchema),
    defaultValues: {
      deviceTypeId: undefined,
      name: '',
      startU: undefined,
      face: 'FRONT',
    },
  })

  // Fetch device types on mount
  useEffect(() => {
    if (deviceTypes.length === 0 && !deviceTypesLoading) {
      fetchDeviceTypes()
    }
  }, [deviceTypes.length, deviceTypesLoading, fetchDeviceTypes])

  // Auto-generate device name when device type changes
  const selectedDeviceTypeId = watch('deviceTypeId')
  useEffect(() => {
    if (!selectedDeviceTypeId) return
    const selectedType = deviceTypes.find((dt) => dt.id === selectedDeviceTypeId)
    if (!selectedType) return

    // Count existing devices of this type in the rack
    const existingCount = rack.devices?.filter(
      (d) => d.deviceTypeName === selectedType.name
    ).length || 0

    setValue('name', `${selectedType.name} #${existingCount + 1}`)
  }, [selectedDeviceTypeId, deviceTypes, rack.devices, setValue])

  // Form submission
  const onSubmit = async (values: InstallDeviceInputs) => {
    setSubmitting(true)
    setServerError(null)

    try {
      await installDevice(rackId, {
        deviceTypeId: values.deviceTypeId,
        name: values.name?.trim() || undefined,
        startU: values.startU,
        face: values.face,
      })
      onSuccess()
    } catch (err) {
      // Extract server-side error message
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data
        const message = typeof data === 'string'
          ? data
          : data.message || data.error || JSON.stringify(data)
        setServerError(message)
      } else {
        setServerError(err instanceof Error ? err.message : 'Failed to install device')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const hasDeviceTypes = deviceTypes.length > 0

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 text-text-primary"
      id="install-device-form"
    >
      {/* Server Error Banner */}
      {serverError && (
        <div className="flex items-start gap-2.5 p-3 text-sm text-rose-300 bg-rose-950/30 border border-rose-800/40 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Device Types Loading / Error */}
      {deviceTypesLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading device types...</span>
        </div>
      )}

      {deviceTypesError && !deviceTypesLoading && (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-sm text-rose-400">{deviceTypesError}</p>
          <button
            type="button"
            onClick={() => fetchDeviceTypes()}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Empty Catalog Warning */}
      {!deviceTypesLoading && !deviceTypesError && !hasDeviceTypes && (
        <div className="p-3 text-sm text-amber-300 bg-amber-950/20 border border-amber-800/30 rounded-lg">
          No device types available. Create device types first.
        </div>
      )}

      {/* Form Fields (only show when device types are loaded) */}
      {!deviceTypesLoading && !deviceTypesError && hasDeviceTypes && (
        <>
          {/* Device Type Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="device-type" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Device Type <span className="text-danger">*</span>
            </label>
            <select
              id="device-type"
              disabled={submitting}
              {...register('deviceTypeId', { valueAsNumber: true })}
              className={`w-full px-3.5 py-2 text-sm bg-canvas border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 appearance-none cursor-pointer ${
                errors.deviceTypeId ? 'border-danger' : 'border-border'
              }`}
            >
              <option value="">Select a device type...</option>
              {deviceTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name} ({dt.category}, {dt.heightU}U)
                </option>
              ))}
            </select>
            {errors.deviceTypeId && (
              <span className="text-xs text-danger mt-0.5">{errors.deviceTypeId.message}</span>
            )}
          </div>

          {/* Device Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="device-name" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Name
            </label>
            <input
              id="device-name"
              type="text"
              placeholder="e.g. Web Server 01"
              disabled={submitting}
              {...register('name')}
              className="w-full px-3.5 py-2 text-sm bg-canvas border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50"
            />
          </div>

          {/* Start U and Face (2-column grid) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Start U */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="device-start-u" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Start U <span className="text-danger">*</span>
              </label>
              <input
                id="device-start-u"
                type="number"
                min={1}
                max={rack.totalUnits}
                placeholder="1"
                disabled={submitting}
                {...register('startU', { valueAsNumber: true })}
                className={`w-full px-3.5 py-2 text-sm bg-canvas border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 ${
                  errors.startU ? 'border-danger' : 'border-border'
                }`}
              />
              {errors.startU && (
                <span className="text-xs text-danger mt-0.5">{errors.startU.message}</span>
              )}
            </div>

            {/* Face */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="device-face" className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Face
              </label>
              <select
                id="device-face"
                disabled={submitting}
                {...register('face')}
                className="w-full px-3.5 py-2 text-sm bg-canvas border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="FRONT">Front</option>
                <option value="REAR">Rear</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-border/50">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-medium border border-border hover:bg-surface-hover rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-medium bg-primary hover:bg-primary/90 text-text-primary rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Installing...</span>
                </>
              ) : (
                <span>Install Device</span>
              )}
            </button>
          </div>
        </>
      )}
    </form>
  )
}
