import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShieldAlert, Plus, Trash2, Loader2 } from 'lucide-react'
import axios from 'axios'
import {
  useRackStore,
  type ModuleBay,
  type ConsolePort,
  type PowerPort,
  type Interface,
} from '../../stores/useRackStore'
import RightSidebar from '../../components/Sidebar/RightSidebar'
import InstallDeviceForm from './InstallDeviceForm'
import { RackTelemetryCard } from '../../components/RoomDetails/RackTelemetryCard'
import { RackSlotGrid2D } from '../../components/RoomDetails/RackSlotGrid2D'

interface RackSidebar2DProps {
  rackId: number | null
  onClose: () => void
}

export default function RackSidebar2D({ rackId, onClose }: RackSidebar2DProps) {
  const {
    selectedRackDetails: rack,
    detailsLoading: loading,
    detailsError: error,
    fetchRackDetails,
    clearSelectedRack,
    selectedDeviceDetails,
    deviceDetailsLoading,
    deviceDetailsError,
    deleteDevice,
    deleteRack,
    moduleTypes,
    fetchModuleTypes,
    installModule,
    uninstallModule,
    createPdu,
    deletePdu,
    selectedDeviceId,
    selectDevice,
  } = useRackStore()

  const { id } = useParams<{ id: string }>()
  const roomId = Number(id)

  const selectedDevice = rack?.devices?.find((d) => d.id === selectedDeviceId) || null
  const [showInstallForm, setShowInstallForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [confirmDeleteRack, setConfirmDeleteRack] = useState(false)
  const [deleteRackLoading, setDeleteRackLoading] = useState(false)
  const [deleteRackError, setDeleteRackError] = useState<string | null>(null)

  const handleDeleteRackConfirm = async () => {
    if (!rackId || !roomId) return
    setDeleteRackLoading(true)
    setDeleteRackError(null)
    try {
      await deleteRack(roomId, rackId)
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete rack'
      setDeleteRackError(message)
    } finally {
      setDeleteRackLoading(false)
    }
  }

  const [showAddPduForm, setShowAddPduForm] = useState(false)
  const [pduName, setPduName] = useState('PDU A')
  const [pduPosition, setPduPosition] = useState<'LEFT' | 'RIGHT' | 'REAR'>('LEFT')
  const [pduOutletCount, setPduOutletCount] = useState<number>(8)
  const [pduLoading, setPduLoading] = useState(false)
  const [pduError, setPduError] = useState<string | null>(null)
  const [deletingPduId, setDeletingPduId] = useState<number | null>(null)

  const [installingBayId, setInstallingBayId] = useState<number | null>(null)
  const [selectedModuleTypeId, setSelectedModuleTypeId] = useState<number | string>('')
  const [installLoading, setInstallLoading] = useState(false)
  const [uninstallLoadingId, setUninstallLoadingId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [prevRackId, setPrevRackId] = useState<number | null>(rackId)
  if (rackId !== prevRackId) {
    setPrevRackId(rackId)
    setShowInstallForm(false)
    setConfirmDeleteId(null)
    setDeleteError(null)
    selectDevice(null)
    setInstallingBayId(null)
    setSelectedModuleTypeId('')
    setActionError(null)
  }

  useEffect(() => {
    if (rackId) {
      fetchRackDetails(rackId)
    } else {
      clearSelectedRack()
    }
  }, [rackId, fetchRackDetails, clearSelectedRack])

  useEffect(() => {
    if (moduleTypes.length === 0) {
      fetchModuleTypes()
    }
  }, [fetchModuleTypes, moduleTypes.length])

  const activeDevice = selectedDevice ? selectedDeviceDetails : null

  const isOpen = rackId !== null

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
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : err.response.data.message || 'Failed to install module')
        : (err instanceof Error ? err.message : 'Failed to install module')
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
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : err.response.data.message || 'Failed to uninstall module')
        : (err instanceof Error ? err.message : 'Failed to uninstall module')
      setActionError(msg)
    } finally {
      setUninstallLoadingId(null)
    }
  }

  const handleCreatePdu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rackId) return
    setPduLoading(true)
    setPduError(null)
    try {
      await createPdu(rackId, {
        name: pduName.trim() || 'PDU',
        position: pduPosition,
        outletCount: pduOutletCount,
      })
      setShowAddPduForm(false)
      setPduName('PDU B')
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : err.response.data.message || 'Failed to create PDU')
        : (err instanceof Error ? err.message : 'Failed to create PDU')
      setPduError(msg)
    } finally {
      setPduLoading(false)
    }
  }

  const handleDeletePdu = async (pduId: number) => {
    if (!rackId) return
    setDeletingPduId(pduId)
    setPduError(null)
    try {
      await deletePdu(pduId, rackId)
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data
        ? (typeof err.response.data === 'string' ? err.response.data : err.response.data.message || 'Failed to delete PDU')
        : (err instanceof Error ? err.message : 'Failed to delete PDU')
      setPduError(msg)
    } finally {
      setDeletingPduId(null)
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
        selectedDevice ? (
          deviceDetailsLoading ? (
            <div className="space-y-4">
              <button
                onClick={() => {
                  selectDevice(null)
                  setActionError(null)
                }}
                className="px-2.5 py-1 text-xs border border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                ← Back to Rack
              </button>
              <div className="h-48 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
                <p className="text-xs text-slate-400">Loading device components...</p>
              </div>
            </div>
          ) : deviceDetailsError ? (
            <div className="space-y-4">
              <button
                onClick={() => {
                  selectDevice(null)
                  setActionError(null)
                }}
                className="px-2.5 py-1 text-xs border border-slate-700 bg-slate-900 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                ← Back to Rack
              </button>
              <div className="p-4 bg-rose-950/20 border border-rose-800/30 rounded-xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-rose-400">Failed to load device details</h4>
                  <p className="text-xs text-rose-300/80 mt-1">{deviceDetailsError}</p>
                </div>
              </div>
            </div>
          ) : activeDevice ? (
            <div className="space-y-5">
            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={() => {
                  selectDevice(null)
                  setActionError(null)
                }}
                className="px-2.5 py-1 text-xs border border-slate-700 bg-slate-905/90 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                ← Back to Rack
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-mono">
                  {activeDevice.deviceTypeName}
                </span>
                {getStatusBadge(activeDevice.status || 'ACTIVE')}
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
              </div>
            </div>

            <RackTelemetryCard deviceId={activeDevice.id} />

            {actionError && (
              <div className="p-3 text-xs text-rose-300 bg-rose-950/20 border border-rose-800/40 rounded-lg flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-450 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Module Bays</h4>
              {activeDevice.moduleBays && activeDevice.moduleBays.length > 0 ? (
                <div className="space-y-3">
                  {activeDevice.moduleBays.map((bay: ModuleBay) => {
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
                            {isOccupied && bay.installedModule ? (
                              <p className="text-sm font-semibold text-white mt-1">
                                {bay.installedModule.moduleType?.manufacturer || ''} {bay.installedModule.moduleType?.model || ''}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-600 italic mt-0.5">Empty Bay</p>
                            )}
                          </div>

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
                                className="px-2 py-1 text-[10px] font-bold border border-slate-700 bg-slate-900 hover:bg-slate-850 text-slate-355 rounded transition-colors cursor-pointer"
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

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Physical Components</h4>
              
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Console Ports</h5>
                {activeDevice.consolePorts && activeDevice.consolePorts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {activeDevice.consolePorts.map((cp: ConsolePort) => (
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

              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Power Ports</h5>
                {activeDevice.powerPorts && activeDevice.powerPorts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {activeDevice.powerPorts.map((pp: PowerPort) => (
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

              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Network Interfaces</h5>
                {activeDevice.interfaces && activeDevice.interfaces.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeDevice.interfaces.map((i: Interface & { moduleId?: number }) => (
                      <div key={i.id} className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/60">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <span className="text-xs font-mono font-bold text-white truncate">{i.name}</span>
                          {i.moduleId && (
                            <span className="text-[8px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-1 py-0.5 rounded-sm shrink-0 uppercase tracking-wider">
                              Slot {activeDevice.moduleBays?.find((mb: ModuleBay) => mb.installedModule?.id === i.moduleId)?.name || 'Module'}
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
        ) : null) : (
          <div className="space-y-6">
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
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full ${utilizationColor} transition-all duration-500`}
                  style={{ width: `${utilizationRate}%` }}
                />
              </div>

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

              {confirmDeleteRack ? (
                <div className="pt-3 border-t border-slate-800/60 space-y-2">
                  <p className="text-[11px] text-rose-300 leading-normal font-semibold">
                    Are you sure you want to delete this rack? This will also delete all devices and PDUs installed in it.
                  </p>
                  {deleteRackError && (
                    <p className="text-[10px] text-rose-400 font-medium">{deleteRackError}</p>
                  )}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteRack(false)}
                      disabled={deleteRackLoading}
                      className="px-2.5 py-1.5 text-[10px] font-bold border border-slate-700 bg-slate-950 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteRackConfirm}
                      disabled={deleteRackLoading}
                      className="px-2.5 py-1.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                      id="confirm-delete-rack-btn"
                    >
                      {deleteRackLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Confirm Delete'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  id="delete-rack-btn"
                  onClick={() => setConfirmDeleteRack(true)}
                  className="w-full mt-1.5 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-450 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Rack
                </button>
              )}
            </div>

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

            {deleteError && (
              <div className="p-3 text-sm text-rose-300 bg-rose-950/30 border border-rose-800/40 rounded-lg flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            {/* PDU Management Section */}
            <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Power Distribution Units (PDUs)
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {rack.pdus && rack.pdus.length > 0
                      ? `${rack.pdus.length} / 2 PDUs attached`
                      : 'No PDUs attached'}
                  </p>
                </div>
                {(rack.pdus?.length || 0) < 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAddPduForm((prev) => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add PDU</span>
                  </button>
                )}
              </div>

              {pduError && (
                <div className="p-2.5 text-xs text-rose-300 bg-rose-950/30 border border-rose-800/40 rounded-lg flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{pduError}</span>
                </div>
              )}

              {/* Installed PDUs List */}
              {rack.pdus && rack.pdus.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {rack.pdus.map((pdu) => (
                    <div
                      key={pdu.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">{pdu.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {pdu.outletCount} Outlets
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700/60 uppercase tracking-wide">
                          {pdu.position}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeletePdu(pdu.id)}
                          disabled={deletingPduId === pdu.id}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
                          title="Remove PDU"
                        >
                          {deletingPduId === pdu.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !showAddPduForm && (
                  <p className="text-xs text-slate-500 italic">No vertical or rear PDUs installed.</p>
                )
              )}

              {/* Add PDU Form */}
              {showAddPduForm && (
                <form onSubmit={handleCreatePdu} className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      PDU Name
                    </label>
                    <input
                      type="text"
                      value={pduName}
                      onChange={(e) => setPduName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                      placeholder="e.g. Primary PDU"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Position
                      </label>
                      <select
                        value={pduPosition}
                        onChange={(e) => setPduPosition(e.target.value as 'LEFT' | 'RIGHT' | 'REAR')}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="LEFT" disabled={rack.pdus?.some((p) => p.position === 'LEFT')}>LEFT</option>
                        <option value="RIGHT" disabled={rack.pdus?.some((p) => p.position === 'RIGHT')}>RIGHT</option>
                        <option value="REAR" disabled={rack.pdus?.some((p) => p.position === 'REAR')}>REAR</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Outlets
                      </label>
                      <select
                        value={pduOutletCount}
                        onChange={(e) => setPduOutletCount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value={8}>8 Outlets</option>
                        <option value={12}>12 Outlets</option>
                        <option value={16}>16 Outlets</option>
                        <option value={24}>24 Outlets</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddPduForm(false)}
                      disabled={pduLoading}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={pduLoading}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {pduLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Attach PDU</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <RackSlotGrid2D
              totalUnits={totalUnits}
              devices={rack.devices || []}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
              deleteLoading={deleteLoading}
              handleDeleteConfirm={handleDeleteConfirm}
              onSelectDevice={(device) => selectDevice(device.id)}
            />
          </div>
        )
      )}
    </RightSidebar>
  )
}
