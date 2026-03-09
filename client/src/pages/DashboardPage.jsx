import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchWorkspaces, createWorkspace } from '../features/workspaces/workspaceSlice';
import { createBoard, fetchBoards, pushRecentBoard } from '../features/boards/boardSlice';
import { logoutUser } from '../features/auth/authSlice';
import { setCreateBoardOpen } from '../features/cards/uiSlice';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Skeleton from '../components/common/Skeleton';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: workspaces, status: workspaceStatus, meta: workspaceMeta } = useSelector(
    (state) => state.workspaces,
  );
  const { boards, boardsMeta, recentBoardIds } = useSelector((state) => state.boards);
  const { createBoardOpen } = useSelector((state) => state.ui);

  const [workspaceId, setWorkspaceId] = useState('');
  const [boardForm, setBoardForm] = useState({ title: '', backgroundValue: '#0b78de' });
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    dispatch(fetchWorkspaces({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (!workspaceId && workspaces.length > 0) {
      setWorkspaceId(workspaces[0]._id);
    }
  }, [workspaceId, workspaces]);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchBoards({ workspaceId, page: 1, limit: 12 }));
    }
  }, [dispatch, workspaceId]);

  const hasMoreBoards = useMemo(() => {
    if (!boardsMeta) return false;
    return boardsMeta.page < boardsMeta.totalPages;
  }, [boardsMeta]);

  const sentinelRef = useInfiniteScroll(
    () => {
      if (workspaceId && hasMoreBoards) {
        dispatch(fetchBoards({ workspaceId, page: boardsMeta.page + 1, limit: boardsMeta.limit }));
      }
    },
    hasMoreBoards,
  );

  const recentBoards = boards.filter((board) => recentBoardIds.includes(board._id));

  const onCreateBoard = async () => {
    if (!boardForm.title.trim() || !workspaceId) return;

    const result = await dispatch(
      createBoard({
        workspaceId,
        title: boardForm.title.trim(),
        background: { type: 'color', value: boardForm.backgroundValue },
      }),
    );

    if (createBoard.fulfilled.match(result)) {
      toast.success('Board created');
      dispatch(setCreateBoardOpen(false));
      setBoardForm({ title: '', backgroundValue: '#0b78de' });
    } else {
      toast.error(result.payload || 'Unable to create board');
    }
  };

  const onCreateWorkspace = async () => {
    if (!workspaceName.trim()) return;
    const result = await dispatch(createWorkspace({ name: workspaceName.trim(), description: '' }));
    if (createWorkspace.fulfilled.match(result)) {
      toast.success('Workspace created');
      setWorkspaceName('');
    } else {
      toast.error(result.payload || 'Failed to create workspace');
    }
  };

  const openBoard = (boardId) => {
    dispatch(pushRecentBoard(boardId));
    navigate(`/board/${boardId}`);
  };

  return (
    <main className="mx-auto max-w-7xl p-4 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/85 p-4 shadow-soft">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => dispatch(setCreateBoardOpen(true))}>
            + New Board
          </Button>
          <Button variant="danger" onClick={() => dispatch(logoutUser())}>
            Logout
          </Button>
        </div>
      </header>

      <section className="mb-6 rounded-2xl bg-white/85 p-4 shadow-soft">
        <h2 className="mb-3 text-lg font-semibold">Workspace Switcher</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
            value={workspaceId}
            onChange={(event) => setWorkspaceId(event.target.value)}
          >
            {workspaces.map((workspace) => (
              <option key={workspace._id} value={workspace._id}>
                {workspace.name}
              </option>
            ))}
          </select>

          <Input
            placeholder="Create workspace"
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
          />
          <Button onClick={onCreateWorkspace}>Add Workspace</Button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {workspaceMeta?.total || 0} workspaces available
        </p>
      </section>

      {recentBoards.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Recent Boards</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recentBoards.map((board) => (
              <button
                key={`recent-${board._id}`}
                className="rounded-2xl p-4 text-left text-white shadow-soft"
                style={{ background: board.background?.value || '#0b78de' }}
                onClick={() => openBoard(board._id)}
              >
                <h3 className="text-lg font-semibold">{board.title}</h3>
                <p className="mt-3 text-xs opacity-90">Open board</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Boards</h2>
          {workspaceStatus === 'loading' ? <span className="text-xs text-slate-500">Loading...</span> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {workspaceStatus === 'loading' && boards.length === 0
            ? Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={`board-skeleton-${idx}`} className="h-28" />
              ))
            : boards.map((board) => (
                <button
                  key={board._id}
                  className="rounded-2xl p-4 text-left text-white shadow-soft transition hover:translate-y-[-2px]"
                  style={{ background: board.background?.value || '#0b78de' }}
                  onClick={() => openBoard(board._id)}
                >
                  <h3 className="text-lg font-semibold">{board.title}</h3>
                  <p className="mt-3 text-xs opacity-90">{new Date(board.updatedAt).toLocaleDateString()}</p>
                </button>
              ))}
        </div>

        <div ref={sentinelRef} className="h-8" />
      </section>

      <Modal open={createBoardOpen} onClose={() => dispatch(setCreateBoardOpen(false))} title="Create Board">
        <div className="space-y-4">
          <Input
            label="Board title"
            value={boardForm.title}
            onChange={(event) => setBoardForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Roadmap"
          />

          <label className="flex items-center gap-2 text-sm">
            <span>Background color</span>
            <input
              type="color"
              value={boardForm.backgroundValue}
              onChange={(event) =>
                setBoardForm((prev) => ({ ...prev, backgroundValue: event.target.value }))
              }
            />
          </label>

          <Button className="w-full" onClick={onCreateBoard}>
            Create Board
          </Button>
        </div>
      </Modal>

      
    </main>
  );
}

export default DashboardPage;



