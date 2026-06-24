import { useRef } from 'react';
import { Task } from '../store/taskStore';

const STATUS_CONFIG = {
  todo: { label: 'Todo', color: 'bg-info/20 text-info', dot: 'bg-info' },
  in_progress: { label: 'In Progress', color: 'bg-warning/20 text-warning', dot: 'bg-warning' },
  done: { label: 'Done', color: 'bg-success/20 text-success', dot: 'bg-success' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-success', bar: 'from-success to-emerald-400' },
  medium: { label: 'Medium', color: 'bg-warning', bar: 'from-warning to-amber-400' },
  high: { label: 'High', color: 'bg-danger', bar: 'from-danger to-rose-400' },
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  index: number;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, index }: TaskCardProps) {
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const statusCfg = STATUS_CONFIG[task.status];
  const priorityCfg = PRIORITY_CONFIG[task.priority];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { text: `${Math.abs(days)}d overdue`, className: 'text-danger' };
    if (days === 0) return { text: 'Due today', className: 'text-warning' };
    if (days === 1) return { text: 'Due tomorrow', className: 'text-warning' };
    if (days <= 7) return { text: `${days}d left`, className: 'text-text-secondary' };
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), className: 'text-text-muted' };
  };

  const dueInfo = formatDate(task.due_date);

  // Swipe-to-complete (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (cardRef.current && touchDeltaX.current > 0) {
      cardRef.current.style.transform = `translateX(${Math.min(touchDeltaX.current, 100)}px)`;
      cardRef.current.style.opacity = `${1 - Math.min(touchDeltaX.current / 200, 0.5)}`;
    }
  };

  const handleTouchEnd = () => {
    if (cardRef.current) {
      if (touchDeltaX.current > 80 && task.status !== 'done') {
        onStatusChange(task.id, 'done');
      }
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '';
    }
    touchDeltaX.current = 0;
  };

  return (
    <div
      ref={cardRef}
      className="glass-card glass-card-hover p-5 group cursor-pointer relative overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
      onClick={() => onEdit(task)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Priority bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${priorityCfg.bar}`} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-text-primary truncate ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-text-secondary mt-1.5 line-clamp-2">{task.description}</p>
          )}
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-muted hover:text-text-primary transition-all"
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all"
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
          {statusCfg.label}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-text-muted">
          <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.color}`} />
          {priorityCfg.label}
        </span>
        {dueInfo && (
          <span className={`text-[11px] ml-auto ${dueInfo.className}`}>
            <svg className="inline w-3 h-3 mr-0.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {dueInfo.text}
          </span>
        )}
      </div>
    </div>
  );
}
