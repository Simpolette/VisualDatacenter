import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  id?: string;
}

export default function RightSidebar({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  id
}: RightSidebarProps) {
  // Escape key handler to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className={`absolute top-0 right-0 h-full w-[450px] bg-surface border-l border-border shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-out transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      id={id}
    >
      {/* Header Panel */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          {subtitle && (
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
              {subtitle}
            </span>
          )}
          <h2 className="text-xl font-bold text-text-primary mt-0.5" id={id ? `${id}-title` : undefined}>
            {title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-canvas border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:border-border-hover transition-all cursor-pointer"
          id={id ? `btn-close-${id}` : 'btn-close-sidebar'}
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {children}
      </div>
    </div>
  )
}
