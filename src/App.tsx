import { useState } from 'react';
import { useTasks } from './hooks/useTasks';
import { useMembers } from './hooks/useMembers';
import { useAuth } from './hooks/useAuth';
import { useDecompose } from './hooks/useDecompose';
import { useAssignmentProposal } from './hooks/useAssignmentProposal';
import { Dashboard } from './components/Dashboard';
import { FilterBar } from './components/FilterBar';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { MemberPanel } from './components/MemberPanel';
import { LoginScreen } from './components/LoginScreen';
import { InboxBar } from './components/InboxBar';
import { DecomposePreview } from './components/DecomposePreview';
import { PurposeDialog } from './components/PurposeDialog';
import { AssignmentProposal } from './components/AssignmentProposal';
import { filterAndSort, getAllTags } from './utils/taskUtils';
import type { FilterState, Task } from './types/task';
import { Plus, LogOut, Shield, Loader2, Sparkles } from 'lucide-react';
import './index.css';

const DEFAULT_FILTER: FilterState = {
  search: '',
  status: 'all',
  priority: 'all',
  tag: '',
  assigneeId: '',
  showArchived: false,
  sortKey: 'createdAt',
  sortAsc: false,
};

export default function App() {
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, archiveTask, unarchiveTask } = useTasks();
  const { members, loading: membersLoading, addMember, deleteMember, updateMember, getMember } = useMembers();
  const { currentMemberId, login, logout } = useAuth();
  const decompose = useDecompose();
  const assignment = useAssignmentProposal(tasks, members, updateTask);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [proposalOpen, setProposalOpen] = useState(false);

  // Supabase からのデータ読み込み中
  if (membersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-violet-500">
          <Loader2 size={36} className="animate-spin" />
          <p className="text-sm font-medium">読み込み中...</p>
        </div>
      </div>
    );
  }

  const currentMember = currentMemberId ? getMember(currentMemberId) : null;

  // 未ログイン or ログイン中のメンバーが DB に存在しない
  if (!currentMemberId || !currentMember) {
    return (
      <LoginScreen
        members={members}
        onLogin={login}
        onAddMember={addMember}
      />
    );
  }

  const isAdmin = currentMember.isAdmin;
  const baseTasks = isAdmin
    ? tasks
    : tasks.filter((t) => t.assigneeId === currentMemberId);

  const allTags = getAllTags(tasks);
  const effectiveFilter: FilterState = isAdmin
    ? filter
    : { ...filter, assigneeId: currentMemberId };
  const visible = filterAndSort(baseTasks, effectiveFilter);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (task: Task) => { setEditing(task); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };

  const handleInboxText = (text: string) => decompose.startText(text, allTags);
  const handleInboxImage = (base64: string, mediaType: string) => decompose.startImage(base64, mediaType, allTags);

  const handlePurposeConfirm = async (purpose: string | undefined) => {
    for (const action of decompose.actions) {
      await addTask({
        title: action.title,
        status: 'todo',
        priority: action.priority,
        tags: action.tags,
        assigneeId: isAdmin ? undefined : currentMemberId ?? undefined,
        purpose,
        estimatedMinutes: action.estimatedMinutes,
      });
    }
    decompose.reset();
  };

  const handleSubmit = async (data: Parameters<typeof addTask>[0]) => {
    if (editing) {
      await updateTask(editing.id, data);
    } else {
      await addTask(isAdmin ? data : { ...data, assigneeId: currentMemberId });
    }
    closeForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8 pb-40">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              タスク管理
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {baseTasks.filter((t) => !t.archived && t.status !== 'done').length} 件の未完了タスク
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: currentMember.color }}
              >
                {currentMember.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700 leading-none">{currentMember.name}</p>
                {isAdmin && (
                  <p className="text-xs text-amber-600 flex items-center gap-0.5 mt-0.5">
                    <Shield size={10} /> 管理者
                  </p>
                )}
              </div>
              <button onClick={logout} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="ログアウト">
                <LogOut size={14} />
              </button>
            </div>

            {isAdmin && (
              <MemberPanel
                members={members}
                currentMember={currentMember}
                onAdd={addMember}
                onDelete={deleteMember}
                onUpdate={updateMember}
              />
            )}

            {isAdmin && (
              <button
                onClick={() => { setProposalOpen(true); assignment.generate(); }}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-100 text-violet-600 rounded-2xl text-sm font-medium shadow-sm hover:bg-violet-50 hover:border-violet-200 transition-all"
                title="AI 振り分け提案"
              >
                <Sparkles size={15} />
                <span className="hidden sm:inline">振り分け提案</span>
              </button>
            )}

            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-2xl text-sm font-medium shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:from-violet-600 hover:to-indigo-600 transition-all"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">新しいタスク</span>
            </button>
          </div>
        </header>

        <Dashboard tasks={tasks} members={members} isAdmin={isAdmin} />
        <FilterBar filter={filter} onChange={setFilter} allTags={allTags} members={isAdmin ? members : []} />

        {tasksLoading ? (
          <div className="flex justify-center py-20 text-gray-400">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : (
          <TaskList
            tasks={visible}
            members={members}
            onEdit={openEdit}
            onDelete={deleteTask}
            onArchive={archiveTask}
            onUnarchive={unarchiveTask}
            onStatusChange={(id, status) => updateTask(id, { status })}
          />
        )}
      </div>

      {formOpen && (
        <TaskForm
          initial={editing}
          members={isAdmin ? members : []}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      <InboxBar
        onSubmitText={handleInboxText}
        onSubmitImage={handleInboxImage}
        processing={decompose.step === 'processing'}
      />

      {decompose.step === 'preview' && decompose.result && (
        <DecomposePreview
          actions={decompose.actions}
          tagSuggestions={decompose.result.tagSuggestions}
          onUpdate={decompose.updateAction}
          onAdd={decompose.addAction}
          onRemove={decompose.removeAction}
          onConfirm={decompose.proceedToPurpose}
          onRetry={decompose.reset}
        />
      )}

      {decompose.step === 'purpose' && decompose.result && (
        <PurposeDialog
          suggestions={decompose.result.purposeSuggestions}
          onConfirm={handlePurposeConfirm}
        />
      )}

      {proposalOpen && (assignment.step === 'loading' || assignment.step === 'ready' || assignment.step === 'error') && (
        <AssignmentProposal
          step={assignment.step}
          proposals={assignment.proposals}
          members={members}
          errorMessage={assignment.errorMessage}
          onApprove={assignment.approve}
          onClose={() => { setProposalOpen(false); assignment.reset(); }}
        />
      )}

      {decompose.step === 'error' && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 z-50">
          <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center justify-between text-sm text-red-600">
            <span>{decompose.errorMessage}</span>
            <button onClick={decompose.reset} className="text-red-400 hover:text-red-600 font-medium ml-4">閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}
