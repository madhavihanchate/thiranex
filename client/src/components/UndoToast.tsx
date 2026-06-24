import { useEffect, useState } from 'react';

interface UndoToastProps {
  id: string;
  message: string;
  onUndo: (id: string) => void;
  onExpire: (id: string) => void;
  duration?: number;
}

function UndoToastItem({ id, message, onUndo, onExpire, duration = 30000 }: UndoToastProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          onExpire(id);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [id, onExpire, duration]);

  const progress = (remaining / duration) * 100;

  return (
    <div className="glass-card p-4 pr-3 flex items-center gap-3 animate-slide-up min-w-[300px] max-w-md shadow-2xl shadow-black/30">
      <div className="flex-1">
        <p className="text-sm text-text-primary font-medium">{message}</p>
        <p className="text-xs text-text-muted mt-0.5">{Math.ceil(remaining / 1000)}s to undo</p>
      </div>
      <button
        onClick={() => onUndo(id)}
        className="px-3 py-1.5 text-sm font-semibold text-accent-tertiary hover:text-accent-primary transition-colors rounded-lg hover:bg-accent-primary/10"
      >
        Undo
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-surface-tertiary rounded-b-2xl overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface UndoToastContainerProps {
  items: Array<{ id: string; message: string }>;
  onUndo: (id: string) => void;
  onExpire: (id: string) => void;
}

export default function UndoToast({ items, onUndo, onExpire }: UndoToastContainerProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {items.map((item) => (
        <UndoToastItem key={item.id} {...item} onUndo={onUndo} onExpire={onExpire} />
      ))}
    </div>
  );
}
