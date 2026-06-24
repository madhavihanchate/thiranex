interface TaskFiltersProps {
  filters: { status?: string; priority?: string; sortBy: string; sortOrder: string };
  onFilterChange: (filters: any) => void;
  total: number;
}

export default function TaskFilters({ filters, onFilterChange, total }: TaskFiltersProps) {
  const statusOptions = [
    { value: undefined, label: 'All' },
    { value: 'todo', label: 'Todo' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: undefined, label: 'All' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  const sortOptions = [
    { value: 'created_at-desc', label: 'Newest first' },
    { value: 'created_at-asc', label: 'Oldest first' },
    { value: 'due_date-asc', label: 'Due date ↑' },
    { value: 'due_date-desc', label: 'Due date ↓' },
  ];

  const currentSort = `${filters.sortBy}-${filters.sortOrder}`;

  return (
    <div className="space-y-4 mb-6 animate-slide-down">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          <span className="text-text-primary font-semibold">{total}</span> task{total !== 1 ? 's' : ''}
        </p>
        <select
          value={currentSort}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            onFilterChange({ sortBy, sortOrder });
          }}
          className="input-field !w-auto !py-1.5 !px-3 text-xs !bg-surface-secondary"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-text-muted font-medium self-center mr-1">Status:</span>
        {statusOptions.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onFilterChange({ status: opt.value })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.status === opt.value || (!filters.status && !opt.value)
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-md shadow-accent-primary/20'
                : 'bg-surface-secondary text-text-muted hover:text-text-secondary border border-border hover:border-border-strong'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Priority pills */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-text-muted font-medium self-center mr-1">Priority:</span>
        {priorityOptions.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onFilterChange({ priority: opt.value })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.priority === opt.value || (!filters.priority && !opt.value)
                ? 'bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-md shadow-accent-primary/20'
                : 'bg-surface-secondary text-text-muted hover:text-text-secondary border border-border hover:border-border-strong'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
