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
import { logoutUser } from '../features/auth/authSlice';
import { setCreateBoardOpen } from '../features/cards/uiSlice';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Skeleton from '../components/common/Skeleton';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import AppShell from '../layouts/AppShell';

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items: workspaces, status: workspaceStatus, meta: workspaceMeta, activeWorkspaceId } = useSelector(
    (state) => state.workspaces,
  );
  const { boards, boardsMeta } = useSelector((state) => state.boards);
  const favoriteBoardIds = useSelector(selectFavoriteBoardIds);
  const recentBoards = useSelector(selectRecentBoards);
  const { createBoardOpen } = useSelector((state) => state.ui);

  const [boardForm, setBoardForm] = useState({
    title: '',
    backgroundType: 'gradient',
    backgroundValue: 'linear-gradient(120deg, #0b78de, #14b8a6)',
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
        backgroundValue: 'linear-gradient(120deg, #0b78de, #14b8a6)',
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
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-app bg-panel p-4 shadow-soft">
        <div>
          <p className="text-sm text-app-muted">Welcome back</p>
          <h1 className="text-2xl font-bold text-app">{user?.name}</h1>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button className="w-full sm:w-auto" variant="secondary" onClick={() => dispatch(setCreateBoardOpen(true))}>
            + New Board
          </Button>
          <Button className="w-full sm:w-auto" variant="danger" onClick={() => dispatch(logoutUser())}>
            Logout
          </Button>
        </div>
      </header>

      <section className="mb-6 rounded-2xl border border-app bg-panel p-4 shadow-soft">
        <h2 className="mb-3 text-lg font-semibold text-app">Workspace Tools</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input
            placeholder="Create workspace"
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
          />
          <Button className="w-full md:w-auto" onClick={onCreateWorkspace}>
            Add Workspace
          </Button>
        </div>
        <p className="mt-2 text-xs text-app-muted">{workspaceMeta?.total || 0} workspaces available</p>
      </section>

      {recentBoards.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-app">Recent Boards</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recentBoards.map((board) => (
              <button
                key={`recent-${board._id}`}
                className="min-h-28 rounded-2xl p-4 text-left text-white shadow-soft"
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
          <h2 className="text-lg font-semibold text-app">Boards</h2>
          {workspaceStatus === 'loading' ? <span className="text-xs text-app-muted">Loading...</span> : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workspaceStatus === 'loading' && boards.length === 0
            ? Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={`board-skeleton-${idx}`} className="h-28" />
              ))
            : boards.map((board) => {
                const isFavorite = favoriteBoardIds.includes(board._id);
                return (
                  <div key={board._id} className="group relative rounded-2xl shadow-soft">
                    <button
                      className="min-h-28 w-full rounded-2xl p-4 text-left text-white transition group-hover:translate-y-[-2px]"
                      style={{ background: board.background?.value || '#0b78de' }}
                      onClick={() => openBoard(board._id)}
                    >
                      <h3 className="text-lg font-semibold">{board.title}</h3>
                      <p className="mt-3 text-xs opacity-90">{new Date(board.updatedAt).toLocaleDateString()}</p>
                    </button>
                    <button
                      className="absolute right-2 top-2 rounded-full bg-slate-950/35 px-2 py-1 text-xs font-semibold text-white"
                      onClick={() => dispatch(toggleFavoriteBoard(board._id))}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite ? 'Unfav' : 'Fav'}
                    </button>
                  </div>
                );
              })}
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

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-app">Background Type</span>
            <select
              className="rounded-xl border border-app bg-panel px-3 py-2"
              value={boardForm.backgroundType}
              onChange={(event) => setBoardForm((prev) => ({ ...prev, backgroundType: event.target.value }))}
            >
              <option value="gradient">Gradient</option>
              <option value="color">Color</option>
              <option value="image">Image URL</option>
            </select>
          </label>

          {boardForm.backgroundType === 'color' ? (
            <label className="flex items-center gap-2 text-sm text-app">
              <span>Color</span>
              <input
                type="color"
                value={boardForm.backgroundValue.startsWith('#') ? boardForm.backgroundValue : '#0b78de'}
                onChange={(event) =>
                  setBoardForm((prev) => ({ ...prev, backgroundValue: event.target.value }))
                }
              />
            </label>
          ) : (
            <Input
              label={boardForm.backgroundType === 'image' ? 'Image URL' : 'Gradient CSS'}
              value={boardForm.backgroundValue}
              onChange={(event) =>
                setBoardForm((prev) => ({ ...prev, backgroundValue: event.target.value }))
              }
            />
          )}

          <Button className="w-full" onClick={onCreateBoard}>
            Create Board
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}

export default DashboardPage;
