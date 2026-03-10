import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchWorkspaces, createWorkspace, setActiveWorkspace } from '../features/workspaces/workspaceSlice';
import {
  createBoard,
  fetchBoards,
  pushRecentBoard,
  toggleFavoriteBoard,
} from '../features/boards/boardSlice';
import { selectFavoriteBoardIds, selectRecentBoards } from '../features/boards/selectors';
import { setCreateBoardOpen } from '../features/cards/uiSlice';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Skeleton from '../components/common/Skeleton';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import AppShell from '../layouts/AppShell';

const boardBackgroundOptions = [
  'linear-gradient(130deg, #0f766e, #06b6d4)',
  'linear-gradient(130deg, #075985, #0e7490)',
  'linear-gradient(130deg, #166534, #14b8a6)',
  'linear-gradient(130deg, #1d4ed8, #0ea5e9)',
  'linear-gradient(130deg, #111827, #1f2937)',
];

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: workspaces, status: workspaceStatus, meta: workspaceMeta, activeWorkspaceId } = useSelector(
    (state) => state.workspaces,
  );
  const { boards, boardsMeta, status: boardsStatus } = useSelector((state) => state.boards);
  const favoriteBoardIds = useSelector(selectFavoriteBoardIds);
  const recentBoards = useSelector(selectRecentBoards);
  const { createBoardOpen } = useSelector((state) => state.ui);

  const [boardForm, setBoardForm] = useState({
    title: '',
    backgroundType: 'gradient',
    backgroundValue: boardBackgroundOptions[0],
  });
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    dispatch(fetchWorkspaces({ page: 1, limit: 10 }));
  }, [dispatch]);

  useEffect(() => {
    if (!activeWorkspaceId && workspaces.length > 0) {
      dispatch(setActiveWorkspace(workspaces[0]._id));
    }
  }, [dispatch, activeWorkspaceId, workspaces]);

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchBoards({ workspaceId: activeWorkspaceId, page: 1, limit: 12 }));
    }
  }, [dispatch, activeWorkspaceId]);

  const hasMoreBoards = useMemo(() => {
    if (!boardsMeta) return false;
    return boardsMeta.page < boardsMeta.totalPages;
  }, [boardsMeta]);

  const sentinelRef = useInfiniteScroll(
    () => {
      if (activeWorkspaceId && hasMoreBoards) {
        dispatch(
          fetchBoards({
            workspaceId: activeWorkspaceId,
            page: boardsMeta.page + 1,
            limit: boardsMeta.limit,
          }),
        );
      }
    },
    hasMoreBoards,
  );

  const onCreateBoard = async () => {
    if (!boardForm.title.trim() || !activeWorkspaceId) return;

    const result = await dispatch(
      createBoard({
        workspaceId: activeWorkspaceId,
        title: boardForm.title.trim(),
        background: {
          type: boardForm.backgroundType,
          value: boardForm.backgroundValue,
        },
      }),
    );

    if (createBoard.fulfilled.match(result)) {
      toast.success('Board created');
      dispatch(setCreateBoardOpen(false));
      setBoardForm({
        title: '',
        backgroundType: 'gradient',
        backgroundValue: boardBackgroundOptions[0],
      });
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
    <AppShell
      workspaceId={activeWorkspaceId}
      onWorkspaceChange={(nextWorkspaceId) => dispatch(setActiveWorkspace(nextWorkspaceId))}
      title="Dashboard"
    >
      <div className="space-y-6 rise-in">
        <header className="app-card overflow-hidden p-5 md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-app bg-panel-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
                <span className="app-dot" />
                Workspace overview
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Welcome back, {user?.name || 'Member'}</h1>
              <p className="mt-2 max-w-2xl text-sm text-app-muted md:text-base">
                Keep momentum with realtime boards, focused execution, and one place for project context.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[18rem]">
              <div className="rounded-xl border border-app bg-panel-soft p-3">
                <p className="text-xs text-app-muted">Boards</p>
                <p className="mt-1 text-2xl font-black">{boards.length}</p>
              </div>
              <div className="rounded-xl border border-app bg-panel-soft p-3">
                <p className="text-xs text-app-muted">Favorites</p>
                <p className="mt-1 text-2xl font-black">{favoriteBoardIds.length}</p>
              </div>
              <div className="rounded-xl border border-app bg-panel-soft p-3">
                <p className="text-xs text-app-muted">Recent</p>
                <p className="mt-1 text-2xl font-black">{recentBoards.length}</p>
              </div>
              <div className="rounded-xl border border-app bg-panel-soft p-3">
                <p className="text-xs text-app-muted">Workspaces</p>
                <p className="mt-1 text-2xl font-black">{workspaceMeta?.total || workspaces.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => dispatch(setCreateBoardOpen(true))}>Create board</Button>
            <Button variant="secondary" onClick={() => navigate('/settings/profile')}>
              Open profile
            </Button>
          </div>
        </header>

        <section className="app-card p-4 md:p-5">
          <h2 className="text-lg font-black tracking-tight">Workspace tools</h2>
          <p className="mt-1 text-sm text-app-muted">Spin up a workspace and invite your team into focused execution.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              placeholder="Create workspace"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
            />
            <Button className="w-full md:w-auto" onClick={onCreateWorkspace}>
              Add workspace
            </Button>
          </div>
        </section>

        {recentBoards.length > 0 ? (
          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-xl font-black tracking-tight">Pick up where you left off</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-app-muted">Recent boards</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {recentBoards.map((board) => (
                <button
                  key={`recent-${board._id}`}
                  className="group relative min-h-32 overflow-hidden rounded-2xl border border-white/15 p-4 text-left text-white shadow-soft"
                  style={{ background: board.background?.value || boardBackgroundOptions[0] }}
                  onClick={() => openBoard(board._id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/15 to-black/55" />
                  <div className="relative z-10">
                    <h3 className="line-clamp-2 text-lg font-black tracking-tight">{board.title}</h3>
                    <p className="mt-7 text-xs font-semibold uppercase tracking-[0.15em] opacity-90">Open board</p>
                  </div>
                  <span className="absolute right-3 top-3 rounded-full border border-white/40 bg-black/25 px-2 py-0.5 text-[10px] font-semibold opacity-0 transition group-hover:opacity-100">
                    Continue
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-xl font-black tracking-tight">Boards</h2>
            {workspaceStatus === 'loading' || boardsStatus === 'loading' ? (
              <span className="text-xs uppercase tracking-[0.15em] text-app-muted">Loading</span>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {workspaceStatus === 'loading' && boards.length === 0
              ? Array.from({ length: 6 }).map((_, idx) => <Skeleton key={`board-skeleton-${idx}`} className="h-32" />)
              : boards.map((board) => {
                  const isFavorite = favoriteBoardIds.includes(board._id);
                  return (
                    <article key={board._id} className="group relative overflow-hidden rounded-2xl border border-white/20 shadow-soft">
                      <button
                        className="relative min-h-32 w-full p-4 text-left text-white transition group-hover:translate-y-[-2px]"
                        style={{ background: board.background?.value || boardBackgroundOptions[0] }}
                        onClick={() => openBoard(board._id)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/65" />
                        <div className="relative z-10">
                          <h3 className="line-clamp-2 text-lg font-black tracking-tight">{board.title}</h3>
                          <p className="mt-6 text-xs opacity-90">
                            Updated {new Date(board.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                      <button
                        className="absolute right-2 top-2 rounded-full border border-white/45 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
                        onClick={() => dispatch(toggleFavoriteBoard(board._id))}
                        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {isFavorite ? 'Saved' : 'Save'}
                      </button>
                    </article>
                  );
                })}
          </div>

          <div ref={sentinelRef} className="h-8" />
        </section>
      </div>

      <Modal open={createBoardOpen} onClose={() => dispatch(setCreateBoardOpen(false))} title="Create Board">
        <div className="space-y-4">
          <Input
            label="Board title"
            value={boardForm.title}
            onChange={(event) => setBoardForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Product Launch"
          />

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-app-muted">Background Type</span>
            <select
              className="rounded-xl border border-app bg-panel px-3 py-2.5 text-app"
              value={boardForm.backgroundType}
              onChange={(event) => setBoardForm((prev) => ({ ...prev, backgroundType: event.target.value }))}
            >
              <option value="gradient">Gradient</option>
              <option value="color">Color</option>
              <option value="image">Image URL</option>
            </select>
          </label>

          {boardForm.backgroundType === 'gradient' ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-app-muted">Choose gradient</p>
              <div className="grid grid-cols-5 gap-2">
                {boardBackgroundOptions.map((gradient) => (
                  <button
                    key={gradient}
                    className={`h-10 rounded-lg border ${
                      boardForm.backgroundValue === gradient ? 'border-white' : 'border-app'
                    }`}
                    style={{ background: gradient }}
                    onClick={() => setBoardForm((prev) => ({ ...prev, backgroundValue: gradient }))}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {boardForm.backgroundType === 'color' ? (
            <label className="flex items-center gap-2 text-sm text-app-muted">
              <span>Color</span>
              <input
                type="color"
                value={boardForm.backgroundValue.startsWith('#') ? boardForm.backgroundValue : '#0f766e'}
                onChange={(event) => setBoardForm((prev) => ({ ...prev, backgroundValue: event.target.value }))}
              />
            </label>
          ) : null}

          {boardForm.backgroundType === 'image' ? (
            <Input
              label="Image URL"
              value={boardForm.backgroundValue}
              onChange={(event) => setBoardForm((prev) => ({ ...prev, backgroundValue: event.target.value }))}
            />
          ) : null}

          <Button className="w-full" onClick={onCreateBoard}>
            Create board
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

export default DashboardPage;
