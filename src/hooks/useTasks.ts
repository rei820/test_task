import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Task, TaskStatus, TaskPriority } from '../types/task';

function toTask(row: {
  id: string; title: string; description: string | null; status: string;
  priority: string; tags: string[]; due_date: string | null; archived: boolean;
  assignee_id: string | null; created_at: string; updated_at: string;
}): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    tags: row.tags ?? [],
    dueDate: row.due_date ?? undefined,
    archived: row.archived,
    assigneeId: row.assignee_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初回フェッチ
    supabase.from('tasks').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setTasks(data.map(toTask));
      setLoading(false);
    });

    // リアルタイム購読
    const channel = supabase
      .channel('tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) setTasks(data.map(toTask));
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addTask = async (data: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    tags: string[];
    dueDate?: string;
    assigneeId?: string;
  }): Promise<Task> => {
    const { data: row, error } = await supabase.from('tasks').insert({
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      tags: data.tags,
      due_date: data.dueDate ?? null,
      archived: false,
      assignee_id: data.assigneeId ?? null,
    }).select().single();
    if (error || !row) throw error;
    return toTask(row);
  };

  const updateTask = async (id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    await supabase.from('tasks').update({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description ?? null }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.dueDate !== undefined && { due_date: data.dueDate ?? null }),
      ...(data.archived !== undefined && { archived: data.archived }),
      ...(data.assigneeId !== undefined && { assignee_id: data.assigneeId ?? null }),
    }).eq('id', id);
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
  };

  const archiveTask = (id: string) => updateTask(id, { archived: true, status: 'done' });
  const unarchiveTask = (id: string) => updateTask(id, { archived: false });

  return { tasks, loading, addTask, updateTask, deleteTask, archiveTask, unarchiveTask };
}
