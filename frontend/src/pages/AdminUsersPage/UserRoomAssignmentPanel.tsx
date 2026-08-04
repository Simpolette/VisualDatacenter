import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface RoomItem {
  roomId: number;
  roomName: string;
}

interface UserRoomAssignmentPanelProps {
  userId: string;
  assignedRooms: RoomItem[];
  onAssignmentsUpdated: () => void;
}

export const UserRoomAssignmentPanel: React.FC<UserRoomAssignmentPanelProps> = ({
  userId,
  assignedRooms,
  onAssignmentsUpdated,
}) => {
  const [allRooms, setAllRooms] = useState<RoomItem[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const assignedIds = assignedRooms.map((r) => r.roomId);
    setSelectedRoomIds(assignedIds);
    fetchRooms();
  }, [userId, assignedRooms]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/v1/admin/rooms');
      setAllRooms(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch room list');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRoom = async (roomId: number) => {
    const newRoomIds = selectedRoomIds.includes(roomId)
      ? selectedRoomIds.filter((id) => id !== roomId)
      : [...selectedRoomIds, roomId];

    setSelectedRoomIds(newRoomIds);

    try {
      setSaving(true);
      await axios.put(`/api/v1/admin/users/${userId}/rooms`, { roomIds: newRoomIds });
      onAssignmentsUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update room assignments');
      // Revert on error
      setSelectedRoomIds(assignedRooms.map((r) => r.roomId));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-400 p-2">Loading available rooms...</div>;
  }

  if (allRooms.length === 0) {
    return <div className="text-xs text-slate-400 p-2">No rooms available in the system.</div>;
  }

  return (
    <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 my-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Room Visibility & Access Assignments
        </span>
        {saving && <span className="text-xs text-sky-400 animate-pulse">Saving...</span>}
      </div>

      {error && <div className="text-xs text-rose-400 mb-2">{error}</div>}

      <div className="flex flex-wrap gap-2">
        {allRooms.map((room) => {
          const isSelected = selectedRoomIds.includes(room.roomId);
          return (
            <button
              key={room.roomId}
              type="button"
              onClick={() => handleToggleRoom(room.roomId)}
              disabled={saving}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm shadow-sky-500/10'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSelected ? 'bg-sky-400' : 'bg-slate-600'
                }`}
              />
              {room.roomName}
            </button>
          );
        })}
      </div>
    </div>
  );
};
