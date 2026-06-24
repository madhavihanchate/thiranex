import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskFilters from '../components/TaskFilters';
import UndoToast from '../components/UndoToast';
import { useTaskStore, Task } from '../store/taskStore';

export default function DashboardPage() {
  const {
    tasks, total, page, totalPages, filters, isLoading,
    fetchTasks, createTask, updateTask, deleteTask, undoDelete,
    setFilters, setPage, pendingDeletes,
  } = useTaskStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleNewTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
  };

  const handleStatusChange = async (id: string, status: Task['status']) => {
    await updateTask(id, { status });
  };

  const undoItems = useMemo(
    () => Array.from(pendingDeletes.entries()).map(([id, { task }]) => ({
      id,
      message: `"${task.title}" deleted`,
    })),
    [pendingDeletes]
  );

  // Skeleton loader
  const SkeletonCard = () => (
    <div className="glass-card p-5 space-y-3 animate-pulse">
      <div className="h-4 bg-surface-tertiary rounded w-3/4" />
      <div className="h-3 bg-surface-tertiary rounded w-full" />
      <div className="h-3 bg-surface-tertiary rounded w-1/2" />
      <div className="flex gap-2 mt-4">
        <div className="h-5 w-16 bg-surface-tertiary rounded-full" />
        <div className="h-5 w-12 bg-surface-tertiary rounded-full" />
      </div>
    </div>
  );

  return (
    <Layout onNewTask={handleNewTask}>
      <TaskFilters filters={filters} onFilterChange={setFilters} total={total} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-surface-secondary flex items-center justify-center mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="9" y1="12" x2="15" y2="12" strokeLinecap="round" /><line x1="9" y1="16" x2="13" y2="16" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No tasks yet</h3>
          <p className="text-sm text-text-muted mb-6 text-center max-w-xs">
            Create your first task to start organizing your work and boosting productivity.
          </p>
          <button onClick={handleNewTask} className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Task
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onEdit={handleEditTask}
                onDelete={deleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="btn-ghost !py-2 !px-3 disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-text-muted px-1">…</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                        p === page
                          ? 'bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-md'
                          : 'text-text-muted hover:text-text-primary hover:bg-surface-tertiary'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="btn-ghost !py-2 !px-3 disabled:opacity-30"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          )}
        </>
      )}

      {/* Task Modal */}
      <TaskModal
        task={editingTask}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
      />

      {/* Undo Toast */}
      <UndoToast
        items={undoItems}
        onUndo={undoDelete}
        onExpire={() => {}}
      />
    </Layout>
  );
}
