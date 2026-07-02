import { useEffect, useState } from 'react'
import { ShieldAlert, Cpu, HardDrive, Wifi, Plus, Trash2, Loader2 } from 'lucide-react'
import { useRackStore, type DeviceSummary } from '../../stores/useRackStore'
import RightSidebar from '../../components/Sidebar/RightSidebar'
import InstallDeviceForm from './InstallDeviceForm'

interface RackSidebar2DProps {
  rackId: number | null;
  onClose: () => void;
}

export default function RackSidebar2D({ rackId, onClose }: RackSidebar2DProps) {
  const {
    selectedRackDetails: rack,
    detailsLoading: loading,
    detailsError: error,
    fetchRackDetails,
    clearSelectedRack,
    deleteDevice,
    moduleTypes,
    fetchModuleTypes,
    installModule,
    uninstallModule
  } = useRackStore()

  const [selectedDevice, setSelectedDevice] = useState<DeviceSummary | null>(null)
  const [showInstallForm, setShowInstallForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [installingBayId, setInstallingBayId] = useState<number | null>(null)
  const [selectedModuleTypeId, setSelectedModuleTypeId] = useState<number | string>('')
  const [installLoading, setInstallLoading] = useState(false)
  const [uninstallLoadingId, setUninstallLoadingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (rackId) {
      fetchRackDetails(rackId)
    } else {
      clearSelectedRack()
    }
  }, [rackId, fetchRackDetails, clearSelectedRack])

  // Fetch module types on mount/open
  useEffect(() => {
    if (moduleTypes.length === 0) {
      fetchModuleTypes()
    }
  }, [fetchModuleTypes, moduleTypes.length])

  // Reset install form, delete state, and selected device when sidebar closes or rack changes
  useEffect(() => {
    setShowInstallForm(false)
    setConfirmDeleteId(null)
    setDeleteError(null)
    setSelectedDevice(null)
    setInstallingBayId(null)
    setSelectedModuleTypeId('')
    setActionError(null)
  }, [rackId])

  // Look up current device state from updated rack details to keep details view fresh
  const activeDevice = selectedDevice && rack?.devices
    ? rack.devices.find((d: any) => d.id === selectedDevice.id) || null
    : null;

  const isOpen = rackId !== null

  // Calculate utilization percentages & colors
  const totalUnits = rack?.totalUnits || 42
  const occupiedUnits = rack?.occupiedUnits || 0
  const utilizationRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

  let utilizationColor = 'bg-emerald-500'
  let utilizationText = 'text-emerald-400'
  if (utilizationRate >= 80) {
    utilizationColor = 'bg-rose-500'
    utilizationText = 'text-rose-400'
  } else if (utilizationRate >= 50) {
    utilizationColor = 'bg-amber-500'
    utilizationText = 'text-amber-400'
  }

  // Helper to render icon based on device type name
  const getDeviceIcon = (deviceTypeName: string) => {
    const name = deviceTypeName.toLowerCase()
    if (name.includes('storage') || name.includes('disk') || name.includes('msa') || name.includes('san')) {
      return <HardDrive className="w-4 h-4 text-blue-400" />
    }
    if (name.includes('switch') || name.includes('catalyst') || name.includes('network') || name.includes('router') || name.includes('wifi')) {
      return <Wifi className="w-4 h-4 text-cyan-400" />
    }
    return <Cpu className="w-4 h-4 text-primary" /> // Default compute server
  }

  // Helper to render device status dots
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        )
      case 'MAINTENANCE':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            Maint
          </span>
        )
      case 'OFFLINE':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
            <span className="w-1 h-1 rounded-full bg-rose-400" />
            Offline
          </span>
        )
      default:
        return null
    }
  }

  // Handle device delete
  const handleDeleteConfirm = async (deviceId: number) => {
    if (!rackId) return
    setDeleteLoading(true)
    setDeleteError(null)

    try {
      await deleteDevice(deviceId, rackId)
      setConfirmDeleteId(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete device'
      setDeleteError(message)
      setConfirmDeleteId(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleInstallModule = async (deviceId: number, bayId: number) => {
    if (!selectedModuleTypeId || !rackId) return
    setInstallLoading(true)
    setActionError(null)
    try {
      await installModule(deviceId, bayId, Number(selectedModuleTypeId), rackId)
      setInstallingBayId(null)
      setSelectedModuleTypeId('')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to install module'
      setActionError(msg)
    } finally {
      setInstallLoading(false)
    }
  }

  const handleUninstallModule = async (deviceId: number, moduleId: number) => {
    if (!rackId) return
    setUninstallLoadingId(moduleId)
    setActionError(null)
    try {
      await uninstallModule(deviceId, moduleId, rackId)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to uninstall module'
      setActionError(msg)
    } finally {
      setUninstallLoadingId(null)
    }
  }

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={loading ? 'Loading...' : rack?.name || 'Select a Rack'}
      subtitle="Rack Inspector"
      id="rack-sidebar"
    >
        {loading && (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Fetching rack structure...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-950/20 border border-rose-800/30 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-400">Failed to load details</h4>
              <p className="text-xs text-rose-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && rack && (
          activeDevice ? (
            /* --- Device Inspector View --- */
            <div className="space-y-5">
              {/* Back button and title */}
              <div className="flex items-center gap-2 pb-1">
                <button
                  onClick={() => {
                    setSelectedDevice(null)
                    setActionError(null)
                  }}
                  className="px-2.5 py-1 text-xs border border-slate-700 bg-slate-905/90 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  ← Back to Rack
                </button>
              </div>

              {/* Device Header Detail */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
                    {activeDevice.deviceTypeName}
                  </span>
                  {getStatusBadge(activeDevice.status)}
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {activeDevice.name}
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 text-xs border-t border-slate-800/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Position</span>
                    <span className="font-semibold text-slate-300">U{activeDevice.startU}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Height</span>
                    <span className="font-semibold text-slate-300">{activeDevice.heightU} U</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-slate-500">Orientation</span>
                    <span className="font-semibold text-slate-300 capitalize">{activeDevice.face.toLowerCase()} face</span>
                  </div>
                </div>
              </div>

              {/* Action Error Banner */}
              {actionError && (
                <div className="p-3 text-xs text-rose-300 bg-rose-950/20 border border-rose-800/40 rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-450 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* Module Bays Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Module Bays</h4>
                {activeDevice.moduleBays && activeDevice.moduleBays.length > 0 ? (
                  <div className="space-y-3">
                    {activeDevice.moduleBays.map((bay: any) => {
                      const isInstalling = installingBayId === bay.id
                      const isOccupied = bay.installedModule !== null

                      return (
                        <div
                          key={bay.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isOccupied
                              ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80'
                              : 'border-dashed border-slate-800 bg-slate-950/20 hover:border-slate-700/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                                {bay.name} {bay.label ? `(${bay.label})` : ''}
                              </p>
                              {isOccupied ? (
                                <p className="text-sm font-semibold text-white mt-1">
                                  {bay.installedModule.manufacturer} {bay.installedModule.model}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-600 italic mt-0.5">Empty Bay</p>
                              )}
                            </div>

                            {/* Actions */}
                            {isOccupied ? (
                              <button
                                type="button"
                                onClick={() => handleUninstallModule(activeDevice.id, bay.installedModule!.id)}
                                disabled={uninstallLoadingId === bay.installedModule!.id}
                                className="p-1.5 rounded text-slate-500 hover:text-rose-405 hover:bg-rose-950/30 transition-all cursor-pointer"
                                title="Uninstall module"
                              >
                                {uninstallLoadingId === bay.installedModule!.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            ) : (
                              !isInstalling && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInstallingBayId(bay.id)
                                    setSelectedModuleTypeId('')
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 rounded transition-all cursor-pointer"
                                >
                                  Install Module
                                </button>
                              )
                            )}
                          </div>

                          {/* Install Dropdown Inline */}
                          {isInstalling && (
                            <div className="mt-3 pt-3 border-t border-slate-900 flex flex-col gap-2">
                              <select
                                value={selectedModuleTypeId}
                                onChange={(e) => setSelectedModuleTypeId(e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary"
                              >
                                <option value="">Select Module Type...</option>
                                {moduleTypes.map((mt) => (
                                  <option key={mt.id} value={mt.id}>
                                    {mt.manufacturer} {mt.model}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleInstallModule(activeDevice.id, bay.id)}
                                  disabled={!selectedModuleTypeId || installLoading}
                                  className="px-2 py-1 text-[10px] font-bold bg-primary hover:bg-primary/95 text-white rounded transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  {installLoading ? 'Installing...' : 'Confirm'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInstallingBayId(null)
                                    setSelectedModuleTypeId('')
                                  }}
                                  disabled={installLoading}
                                  className="px-2 py-1 text-[10px] font-bold border border-slate-700 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 italic">No module bays available for this device type.</p>
                )}
              </div>

              {/* Physical Ports Section */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Physical Components</h4>
                
                {/* Console Ports */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Console Ports</h5>
                  {activeDevice.consolePorts && activeDevice.consolePorts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {activeDevice.consolePorts.map((cp: any) => (
                        <div key={cp.id} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/60">
                          <span className="text-xs font-mono font-bold text-white truncate">{cp.name}</span>
                          <span className="text-[9px] font-bold text-slate-450 bg-slate-950 px-1 py-0.5 rounded border border-slate-800 uppercase tracking-wide">
                            {cp.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-650 italic">No console ports.</p>
                  )}
                </div>

                {/* Power Ports */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Power Ports</h5>
                  {activeDevice.powerPorts && activeDevice.powerPorts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {activeDevice.powerPorts.map((pp: any) => (
                        <div key={pp.id} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/60">
                          <span className="text-xs font-mono font-bold text-white truncate">{pp.name}</span>
                          <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/20 uppercase tracking-wide">
                            {pp.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-650 italic">No power ports.</p>
                  )}
                </div>

                {/* Interfaces */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Interfaces</h5>
                  {activeDevice.interfaces && activeDevice.interfaces.length > 0 ? (
                    <div className="space-y-1.5">
                      {activeDevice.interfaces.map((i: any) => (
                        <div key={i.id} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/60">
                          <div className="flex items-center gap-2 overflow-hidden mr-2">
                            <span className="text-xs font-mono font-bold text-white truncate">{i.name}</span>
                            {i.moduleId && (
                              <span className="text-[8px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-1 py-0.5 rounded-sm shrink-0 uppercase tracking-wider">
                                Slot {activeDevice.moduleBays?.find((mb: any) => mb.installedModule?.id === i.moduleId)?.name || 'Module'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {i.macAddress && (
                              <span className="text-[9px] font-mono text-slate-500">
                                {i.macAddress}
                              </span>
                            )}
                            <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase tracking-wide">
                              {i.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-650 italic">No network interfaces.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* --- Rack Overview View --- */
            <div className="space-y-6">
              {/* Stats Panel + Add Device Button */}
              <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Capacity</span>
                  <span className="font-semibold text-white">{totalUnits} U</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Utilization</span>
                  <span className={`font-semibold ${utilizationText}`}>
                    {occupiedUnits} U used ({utilizationRate.toFixed(1)}%)
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${utilizationColor} transition-all duration-500`}
                    style={{ width: `${utilizationRate}%` }}
                  />
                </div>

                {/* Add Device Button */}
                <button
                  type="button"
                  id="add-device-btn"
                  onClick={() => setShowInstallForm((prev) => !prev)}
                  className={`w-full mt-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    showInstallForm
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                  }`}
                >
                  <Plus className={`w-3.5 h-3.5 transition-transform ${showInstallForm ? 'rotate-45' : ''}`} />
                  {showInstallForm ? 'Close Form' : 'Add Device'}
                </button>
              </div>

              {/* Collapsible Install Device Form */}
              {showInstallForm && rackId && (
                <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Install New Device</h3>
                  <InstallDeviceForm
                    rackId={rackId}
                    rack={rack}
                    onSuccess={() => setShowInstallForm(false)}
                    onCancel={() => setShowInstallForm(false)}
                  />
                </div>
              )}

              {/* Delete Error Toast */}
              {deleteError && (
                <div className="p-3 text-sm text-rose-300 bg-rose-950/30 border border-rose-800/40 rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}

              {/* U-Slot Grid Visualization */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">U-Slot Allocation</h3>
                <div
                  className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-1 relative"
                  style={{
                    gridTemplateRows: `repeat(${totalUnits}, minmax(2.25rem, auto))`
                  }}
                >
                  {/* Background Empty Slots */}
                  {Array.from({ length: totalUnits }, (_, idx) => {
                    const u = totalUnits - idx
                    return (
                      <div
                        key={u}
                        className="col-start-1 col-end-3 grid grid-cols-[3.5rem_1fr] gap-x-3 items-center group/row"
                        style={{ gridRow: `${idx + 1} / ${idx + 2}` }}
                      >
                        {/* U Label */}
                        <span className="text-right font-mono text-xs text-slate-500 group-hover/row:text-slate-400 transition-colors">
                          U{u}
                        </span>
                        {/* Empty slot placeholder */}
                        <div className="h-9 border border-dashed border-slate-800/60 hover:border-slate-700/60 rounded bg-slate-950/40 group-hover/row:bg-slate-900/30 transition-all flex items-center px-3">
                          <span className="text-[10px] text-slate-650 font-medium select-none uppercase tracking-wider">Empty</span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Foreground Device Overlays */}
                  {rack.devices?.map((device) => {
                    // Standard Grid starts at line 1 (top of U_totalUnits)
                    // Grid ends at line totalUnits + 1 (bottom of U_1)
                    const gridStart = totalUnits - device.startU - device.heightU + 2
                    const gridEnd = totalUnits - device.startU + 2

                    const isConfirmingDelete = confirmDeleteId === device.id

                    return (
                      <div
                        key={device.id}
                        onClick={() => setSelectedDevice(device)}
                        className="col-start-2 border border-slate-800 bg-slate-950 shadow-md hover:shadow-lg rounded flex items-center justify-between select-none transition-all hover:border-primary/50 group/device z-10 relative overflow-hidden cursor-pointer"
                        style={{
                          gridRowStart: gridStart,
                          gridRowEnd: gridEnd,
                          margin: '2px 0' // small spacing between devices
                        }}
                      >
                        {isConfirmingDelete ? (
                          /* Inline Delete Confirmation Overlay */
                          <div className="flex items-center justify-between w-full h-full px-3.5 py-2 bg-rose-950/90 backdrop-blur-sm z-20" onClick={(e) => e.stopPropagation()}>
                            <span className="text-xs text-rose-300 font-semibold truncate">
                              Delete {device.name}?
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteConfirm(device.id)
                                }}
                                disabled={deleteLoading}
                                className="px-2.5 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-sm"
                              >
                                {deleteLoading ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  'Confirm'
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setConfirmDeleteId(null)
                                }}
                                disabled={deleteLoading}
                                className="px-2.5 py-1 text-[10px] font-bold border border-slate-700 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Bezel Faceplate rendering (Image or Text/CSS Fallback) */
                          <>
                            {device.imagePath ? (
                              /* Pure Image Bezel Faceplate (No overlapping text) */
                              <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
                                <img
                                  src={device.imagePath}
                                  className="w-full h-full object-fill pointer-events-none select-none"
                                  alt={device.name}
                                />
                                {/* Hover Delete Action */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/device:opacity-100 transition-all z-20">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setConfirmDeleteId(device.id)
                                    }}
                                    className="p-1 rounded bg-slate-950/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-rose-950/80 transition-all cursor-pointer shadow-md"
                                    title={`Delete ${device.name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Fallback CSS Chassis Faceplate with Text Details */
                              <>
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center pointer-events-none select-none">
                                  {/* Vents in the middle */}
                                  <div className="hidden md:flex flex-col gap-1 w-24 opacity-25 select-none shrink-0">
                                    {Array.from({ length: Math.min(6, device.heightU * 2 - 1) }).map((_, i) => (
                                      <div key={i} className="h-[2px] bg-slate-500 rounded-full" />
                                    ))}
                                  </div>
                                </div>

                                {/* Left Mounting Ear & Screw Details */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-800/80 border-r border-slate-700/30 flex flex-col justify-between py-1 opacity-50 select-none z-10">
                                  <div className="w-1 h-1 rounded-full bg-slate-600 border border-slate-950 mx-auto" />
                                  {device.heightU > 1 && (
                                    <div className="w-1 h-1 rounded-full bg-slate-600 border border-slate-950 mx-auto" />
                                  )}
                                </div>

                                {/* Right Mounting Ear & Screw Details */}
                                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-slate-800/80 border-l border-slate-700/30 flex flex-col justify-between py-1 opacity-50 select-none z-10">
                                  <div className="w-1 h-1 rounded-full bg-slate-600 border border-slate-950 mx-auto" />
                                  {device.heightU > 1 && (
                                    <div className="w-1 h-1 rounded-full bg-slate-600 border border-slate-950 mx-auto" />
                                  )}
                                </div>

                                {/* Main Content overlay */}
                                <div className={`relative z-10 flex items-center justify-between w-full h-full pl-3.5 pr-3.5 select-none ${device.heightU === 1 ? 'py-1.5' : 'py-2.5'}`}>
                                  <div className="flex items-center gap-2.5 overflow-hidden">
                                    {/* Small category indicator */}
                                    <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 shrink-0 text-slate-400 group-hover/device:border-primary/20 transition-all select-none">
                                      {getDeviceIcon(device.deviceTypeName)}
                                    </div>
                                    <div className="overflow-hidden">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest font-mono truncate">
                                          {device.deviceTypeName}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 bg-slate-800 border border-slate-700/60 px-1 rounded-sm">
                                          {device.heightU}U
                                        </span>
                                      </div>
                                      <p className="text-xs font-bold text-white truncate leading-snug tracking-wide mt-0.5">
                                        {device.name}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Status LED Bulb & Delete Action */}
                                  <div className="flex items-center gap-2.5 shrink-0 pl-1">
                                    {/* Physical status LED light */}
                                    <div className="flex items-center gap-1.5">
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full animate-pulse`}
                                        style={{
                                          backgroundColor: device.status === 'ACTIVE' ? '#10b981' : device.status === 'MAINTENANCE' ? '#f59e0b' : '#ef4444',
                                          boxShadow: device.status === 'ACTIVE' ? '0 0 6px #10b981' : device.status === 'MAINTENANCE' ? '0 0 6px #f59e0b' : '0 0 6px #ef4444'
                                        }}
                                      />
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono hidden xs:inline">
                                        {device.status}
                                      </span>
                                    </div>

                                    {/* Hover Delete Action */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setConfirmDeleteId(device.id)
                                      }}
                                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-0 group-hover/device:opacity-100 transition-all cursor-pointer z-20"
                                      title={`Delete ${device.name}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        )}
    </RightSidebar>
  )
}
