import { useState, useEffect } from 'react';
import { Task } from '../store/taskStore';

interface TaskModalProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Task>) => Promise<void>;
}

export default function TaskModal({ task, isOpen, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
    }
    setError('');
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        due_date: dueDate || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const statusOptions = [
    { value: 'todo', label: 'Todo', icon: '○' },
    { value: 'in_progress', label: 'In Progress', icon: '◐' },
    { value: 'done', label: 'Done', icon: '●' },
  ] as const;

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-success' },
    { value: 'medium', label: 'Medium', color: 'bg-warning' },
    { value: 'high', label: 'High', color: 'bg-danger' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg glass-card p-6 md:p-8 animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-text-primary mb-6">
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              className={`input-field ${error && !title.trim() ? 'border-danger' : ''}`}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[100px] resize-y"
              placeholder="Add details..."
              rows={3}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
            <div className="flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                    status === opt.value
                      ? 'bg-accent-primary/15 border-accent-primary/40 text-accent-tertiary'
                      : 'border-border text-text-muted hover:border-border-strong hover:text-text-secondary'
                  }`}
                >
                  <span className="mr-1.5">{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
            <div className="flex gap-2">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${
                    priority === opt.value
                      ? 'bg-accent-primary/15 border-accent-primary/40 text-accent-tertiary'
                      : 'border-border text-text-muted hover:border-border-strong hover:text-text-secondary'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.color}`} /> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-danger animate-shake">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
