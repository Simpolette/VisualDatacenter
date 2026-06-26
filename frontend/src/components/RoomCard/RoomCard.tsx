import { Link } from 'react-router-dom'
import type { Room } from '../../stores/useRoomStore'

interface RoomCardProps {
  room: Room;
}

function RoomCard({ room }: RoomCardProps) {
  return (
    <Link to={`/rooms/${room.id}`} className="block">
      <article
        className="bg-surface border border-border rounded-xl p-6 shadow-sm cursor-pointer transition-all duration-250 hover:border-primary hover:shadow-[var(--shadow-glow-primary)] hover:-translate-y-0.5"
        id={`room-card-${room.id}`}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-text-primary leading-tight">{room.name}</h3>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[13px] text-text-secondary">
            <svg className="shrink-0 text-text-muted" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
            </svg>
            <span>{room.widthM}m × {room.depthM}m</span>
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
  )
}

export default RoomCard
