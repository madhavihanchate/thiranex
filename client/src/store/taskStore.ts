import { create } from 'zustand';
import { apiFetch } from '../hooks/useApi';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TaskFilters {
  status?: string;
  priority?: string;
  sortBy: string;
  sortOrder: string;
}

interface PendingDelete {
  timeout: ReturnType<typeof setTimeout>;
  task: Task;
}

interface TaskState {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;
  pendingDeletes: Map<string, PendingDelete>;
  fetchTasks: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => void;
  undoDelete: (id: string) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setPage: (page: number) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 0,
  filters: { sortBy: 'created_at', sortOrder: 'desc' },
  isLoading: false,
  error: null,
  pendingDeletes: new Map(),

  fetchTasks: async () => {
    const { page, limit, filters } = get();
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);

      const result = await apiFetch<{
        data: Task[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/tasks?${params}`);

      set({
        tasks: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createTask: async (data) => {
    const task = await apiFetch<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await get().fetchTasks();
    return task;
  },

  updateTask: async (id, data) => {
    const task = await apiFetch<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    await get().fetchTasks();
    return task;
  },

  deleteTask: (id) => {
    const { tasks, pendingDeletes } = get();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    set({ tasks: tasks.filter((t) => t.id !== id) });

    const timeout = setTimeout(async () => {
      try {
        await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
      } catch {
        // Ignore
      }
      const curr = get().pendingDeletes;
      const next = new Map(curr);
      next.delete(id);
      set({ pendingDeletes: next });
    }, 30000);

    const next = new Map(pendingDeletes);
    next.set(id, { timeout, task });
    set({ pendingDeletes: next });
  },

  undoDelete: (id) => {
    const { pendingDeletes, tasks } = get();
    const pending = pendingDeletes.get(id);
    if (!pending) return;

    clearTimeout(pending.timeout);
    const next = new Map(pendingDeletes);
    next.delete(id);
    set({ tasks: [pending.task, ...tasks], pendingDeletes: next });
  },

  setFilters: (newFilters) => {
    set((s) => ({ filters: { ...s.filters, ...newFilters }, page: 1 }));
    get().fetchTasks();
  },

  setPage: (page) => {
    set({ page });
    get().fetchTasks();
  },
}));
